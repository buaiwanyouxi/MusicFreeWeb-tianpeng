/**
 * 插件最小隔离守卫（P0-4 过渡方案）
 *
 * 背景：插件代码目前通过 new Function 与页面共享全局作用域，
 * 插件可直接读取 window.localStorage（播放历史/收藏/当前曲目 = 用户听歌画像）
 * 并可绕过注入的代理 fetch 直连任意域名。
 *
 * 本模块提供：
 * 1) runInPluginContext(fn) — 标记"插件上下文"区间（深度计数）
 * 2) installPluginGuards()  — 安装全局守卫（幂等，main.tsx 启动时调用）：
 *    - 插件活动期间 window.localStorage 替换为内存 shim（读返回空 + 审计日志）
 *    - 插件活动期间绕过代理的直连外网 fetch/XHR 写入调试日志（放行但可审计）
 *
 * 完整的进程级隔离（Web Worker + 真 cheerio 库）属于 M2 计划。
 */

type SandboxLogType = 'info' | 'error'
type SandboxLogFn = (type: SandboxLogType, message: string) => void

let logSink: SandboxLogFn | null = null
let installed = false

const g = (): Record<string, unknown> => globalThis as unknown as Record<string, unknown>

export const isPluginActive = (): boolean =>
  typeof g().__mfPluginDepth === 'number' && (g().__mfPluginDepth as number) > 0

/** 宿主接入调试日志系统（pluginHost 初始化时调用一次） */
export const setSandboxLogSink = (fn: SandboxLogFn | null): void => {
  logSink = fn
}

const log = (type: SandboxLogType, message: string): void => {
  try {
    logSink?.(type, message)
  } catch {
    // 日志失败不应影响主流程
  }
}

/**
 * 在"插件上下文"中执行 fn：
 * 期间插件无法读到页面 localStorage（获得内存 shim），
 * 期间插件绕过代理的直连外网请求会被审计记录。
 */
export const runInPluginContext = async <T>(fn: () => Promise<T> | T): Promise<T> => {
  const s = g()
  const prev = typeof s.__mfPluginDepth === 'number' ? (s.__mfPluginDepth as number) : 0
  s.__mfPluginDepth = prev + 1
  try {
    return await fn()
  } finally {
    s.__mfPluginDepth = Math.max(prev, 0)
  }
}

const createEmptyStorageShim = (): Storage => {
  const store = new Map<string, string>()
  return {
    getItem: (key: string) => {
      log('error', '[Sandbox] 拦截插件读取 localStorage: ' + key + '（已屏蔽，返回空值）')
      return store.has(key) ? (store.get(key) as string) : null
    },
    setItem: (key: string, value: string) => {
      store.set(key, String(value))
      log('info', '[Sandbox] 插件写入内存 shim localStorage: ' + key)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
    clear: () => {
      store.clear()
    },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size
    },
  } as unknown as Storage
}

/** 安装全局守卫（幂等）。必须在任何插件代码执行前调用。 */
export const installPluginGuards = (): void => {
  if (typeof window === 'undefined' || installed) return
  installed = true

  // 1) localStorage：插件活动期间替换为内存 shim
  let realStorage: Storage | null = null
  try {
    realStorage = window.localStorage
  } catch {
    return // 隐私模式等场景 localStorage 不可用，跳过
  }
  try {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      enumerable: true,
      get(): Storage {
        if (!isPluginActive()) return realStorage as Storage
        const w = window as unknown as { __mfSandboxStorage?: Storage }
        if (!w.__mfSandboxStorage) w.__mfSandboxStorage = createEmptyStorageShim()
        return w.__mfSandboxStorage
      },
    })
  } catch (e) {
    console.warn('[Sandbox] localStorage 守卫安装失败:', e)
  }

  // 2) fetch：审计插件绕过代理的直连外网请求（放行但记录）
  const realFetch = window.fetch.bind(window)
  window.fetch = ((input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    if (isPluginActive()) {
      try {
        const url =
          typeof input === 'string' ? input
            : input instanceof URL ? input.href
            : (input as Request).url
        if (!url.startsWith('/') && !url.startsWith('data:') && !url.startsWith('blob:')) {
          log('info', '[Sandbox] 插件绕过代理直连外网 (fetch): ' + url.slice(0, 160))
        }
      } catch {
        // 解析 URL 失败时不影响请求本身
      }
    }
    return realFetch(input, init)
  }) as typeof window.fetch

  // 3) XMLHttpRequest：同上
  const XHR = window.XMLHttpRequest
  if (XHR) {
    const realOpen = XHR.prototype.open
    XHR.prototype.open = function (this: XMLHttpRequest, ...args: unknown[]): void {
      if (isPluginActive()) {
        try {
          const url = String(args[1] ?? '')
          if (!url.startsWith('/') && !url.startsWith('data:') && !url.startsWith('blob:')) {
            log('info', '[Sandbox] 插件绕过代理直连外网 (XHR): ' + url.slice(0, 160))
          }
        } catch {
          // 同上
        }
      }
      return (realOpen as unknown as (...a: unknown[]) => void).apply(this, args)
    } as typeof XHR.prototype.open
  }
}
