/**
 * 插件加载诊断器
 * ---------------------------------------------------------------------------
 * 目的：在 Node 里 1:1 复刻 Web 端 pluginHost.executePluginCode() 的沙箱环境，
 *       逐个执行插件源码，定位「移动端/桌面端能跑、Web 端跑不动」的真实断点。
 *
 * 复刻内容：
 *   1) new Function 的形参清单（module/exports/require/MusicFreeH5/fetch/console/env）
 *   2) require shim 的模块白名单与「未实现模块静默返回 {}」行为
 *   3) axios shim 的请求拼装 + URL 重写 + 响应解析
 *   4) isMediaUrl() / urlRewriteRules —— 直接从 pluginHost.ts 源码解析，保持同步
 *
 * 用法（项目根目录执行）：
 *   node tools/diagnose-plugin-load.mjs <插件.js> [更多插件.js...]
 */

import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'

const HOST_TS = path.resolve('src/lib/pluginHost.ts')

// Web 端 executePluginCode 注入的形参（顺序与 pluginHost.ts 一致）
const WEB_FN_PARAMS = [
  'module', 'exports', 'require', 'MusicFreeH5', 'fetch', 'console', 'env',
]

// 移动端/桌面端沙箱额外注入到全局的常见变量（对比组用）
const NATIVE_GLOBALS = ['axios', 'cheerio', 'he', 'CryptoJS', 'bigInt', 'Buffer', 'process']

// ---------------------------------------------------------------------------
// 从 pluginHost.ts 源码解析 urlRewriteRules，保持与实现同步
// ---------------------------------------------------------------------------
function loadRewriteRules() {
  if (!fs.existsSync(HOST_TS)) {
    console.warn(`[warn] 未找到 ${HOST_TS}，URL 重写规则将为空`)
    return []
  }
  const src = fs.readFileSync(HOST_TS, 'utf8')
  const start = src.indexOf('const urlRewriteRules')
  if (start < 0) return []
  const end = src.indexOf('\n]', start)
  const block = src.slice(start, end + 2)
  const body = block.slice(block.indexOf('['))
  // eslint-disable-next-line no-new-func
  return new Function(`return ${body}`)()
}

// 与 pluginHost.ts 同构的 isMediaUrl
function makeIsMediaUrl() {
  const mediaExtensions = [
    /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i,
    /\.(mp3|wav|ogg|m4a|aac|flac|wma|mp4|m4v)$/i,
    /\.(mp4|webm|mkv|avi|mov|flv|m3u8)$/i,
  ]
  const mediaPathPatterns = [
    /\/image[s]?\//i, /\/audio\//i, /\/video\//i, /\/media\//i, /\/cover[s]?\//i,
    /\/artwork\//i, /\/photo[s]?\//i, /\/pic[s]?\//i, /\/thumb[s]?\//i, /\/album[s]?\//i,
  ]
  return (url) => {
    for (const p of mediaExtensions) if (p.test(url)) return true
    for (const p of mediaPathPatterns) if (p.test(url)) return true
    return false
  }
}

const REWRITE_RULES = loadRewriteRules()
const isMediaUrl = makeIsMediaUrl()

function rewriteUrl(url) {
  if (isMediaUrl(url)) return null
  for (const rule of REWRITE_RULES) {
    if (rule.pattern.test(url)) return url.replace(rule.pattern, rule.replace)
  }
  return null
}

// ---------------------------------------------------------------------------
// 网络出口记录
// ---------------------------------------------------------------------------
let NET_LOG = []
let MISSING_MODULES = new Set()

function makeFetchStub() {
  return async (input, init) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    const rewritten = rewriteUrl(url)
    const finalUrl = rewritten || url
    NET_LOG.push({ rawUrl: url, finalUrl, proxied: !!rewritten, method: init?.method || 'GET' })
    // 返回一个"看起来成功"的空 JSON 响应，观察插件是否能走完整条链路
    return {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Map([['content-type', 'application/json']]),
      text: async () => '{"code":200,"data":[]}',
      json: async () => ({ code: 200, data: [] }),
    }
  }
}

// ---------------------------------------------------------------------------
// 忠实复刻 pluginHost 的 require shim 能力面
// ---------------------------------------------------------------------------
const SHIM_MODULES = [
  'axios', 'cheerio', 'crypto-js', 'big-integer', 'qs', 'dayjs', 'he',
  'webdav', 'path', 'url',
]

function makeAxiosShim(proxiedFetch) {
  const processResponse = async (response, requestUrl) => {
    const text = await response.text()
    let data
    try { data = JSON.parse(text) } catch { data = text }
    return { data, status: response.status, statusText: response.statusText, headers: {}, config: { url: requestUrl } }
  }

  const request = async (config) => {
    let url = config.url || ''
    if (config.baseURL && !url.startsWith('http')) {
      url = config.baseURL.replace(/\/$/, '') + '/' + url.replace(/^\//, '')
    }
    if (config.params) {
      const params = new URLSearchParams(config.params).toString()
      url += (url.includes('?') ? '&' : '?') + params
    }
    const method = config.method?.toUpperCase() || 'GET'
    const finalUrl = rewriteUrl(url) || url
    const init = { method, headers: config.headers || {} }
    if (config.data && method !== 'GET') init.body = typeof config.data === 'string' ? config.data : JSON.stringify(config.data)
    const response = await proxiedFetch(finalUrl, init)
    return processResponse(response, finalUrl)
  }

  const axios = (urlOrConfig, config) =>
    typeof urlOrConfig === 'string' ? request({ ...config, url: urlOrConfig }) : request(urlOrConfig)
  axios.get = (url, config) => request({ ...config, url, method: 'GET' })
  axios.post = (url, data, config) => request({ ...config, url, method: 'POST', data })
  axios.put = (url, data, config) => request({ ...config, url, method: 'PUT', data })
  axios.delete = (url, config) => request({ ...config, url, method: 'DELETE' })
  axios.request = request
  // 注意：Web 端 axios.create() 返回的实例【没有 interceptors / request / put / delete】
  axios.create = (defaults) => {
    const instance = (urlOrConfig, config) =>
      typeof urlOrConfig === 'string' ? request({ ...defaults, ...config, url: urlOrConfig }) : request({ ...defaults, ...urlOrConfig })
    instance.get = (url, config) => request({ ...defaults, ...config, url, method: 'GET' })
    instance.post = (url, data, config) => request({ ...defaults, ...config, url, method: 'POST', data })
    instance.defaults = defaults || {}
    return instance
  }
  axios.defaults = { headers: { common: {} } }
  axios.default = axios
  return axios
}

function makeCheerioShim() {
  // Node 侧无 DOM：给出一个"形状正确"的 $ ，只用于验证调用链是否走通
  const wrapper = () => ({
    length: 0, find: wrapper, first: wrapper, last: wrapper, eq: wrapper,
    text: () => '', html: () => '', attr: () => '', data: () => '',
    each: () => wrapper(), map: () => ({ get: () => [], toArray: () => [] }),
    toArray: () => [], get: () => [], parent: wrapper, children: wrapper,
  })
  const load = () => wrapper()
  return { load, default: load }
}

function makeRequireShim(proxiedFetch) {
  const modules = {
    axios: makeAxiosShim(proxiedFetch),
    cheerio: makeCheerioShim(),
    'crypto-js': { MD5: (s) => ({ toString: () => s }), AES: { encrypt: () => ({}), decrypt: () => ({}) }, enc: { Utf8: {}, Base64: {}, Hex: {} } },
    'big-integer': (n) => ({ toString: () => String(n), valueOf: () => Number(n) }),
    qs: {
      stringify: (o) => new URLSearchParams(o).toString(),
      parse: (s) => Object.fromEntries(new URLSearchParams(s)),
    },
    dayjs: (d) => ({ format: () => String(d ?? ''), unix: () => 0, valueOf: () => 0 }),
    he: { decode: (s) => String(s), encode: (s) => String(s) },
    webdav: { createClient: () => ({}) },
    path: {
      join: (...a) => a.filter(Boolean).join('/'),
      basename: (p) => p.split('/').pop() || '',
      dirname: (p) => p.split('/').slice(0, -1).join('/'),
      extname: (p) => { const b = p.split('/').pop() || ''; const i = b.lastIndexOf('.'); return i > 0 ? b.slice(i) : '' },
    },
    url: { parse: (u) => { try { const o = new URL(u); return { href: o.href, host: o.host, pathname: o.pathname } } catch { return { href: u } } } },
  }
  return (moduleName) => {
    if (modules[moduleName]) return modules[moduleName]
    MISSING_MODULES.add(moduleName)
    return {} // ← 与 Web 端一致：未实现的模块静默返回空对象
  }
}

// ---------------------------------------------------------------------------
function executeLikeWeb(code, { injectGlobals }) {
  MISSING_MODULES = new Set()
  NET_LOG = []

  const proxiedFetch = makeFetchStub()
  const sandbox = {
    console: { log() {}, warn() {}, error() {}, debug() {}, info() {} },
    setTimeout, clearTimeout, setInterval, clearInterval,
    URL, URLSearchParams, TextEncoder, TextDecoder, Date, Math, JSON,
    fetch: proxiedFetch,
    document: undefined,
  }
  if (injectGlobals) {
    const req = makeRequireShim(proxiedFetch)
    for (const g of NATIVE_GLOBALS) {
      if (g === 'Buffer') sandbox.Buffer = Buffer
      else if (g === 'process') sandbox.process = { env: {}, platform: 'node', version: 'v20' }
      else sandbox[g] = req(g === 'CryptoJS' ? 'crypto-js' : g === 'bigInt' ? 'big-integer' : g)
    }
  }
  vm.createContext(sandbox)

  const moduleObj = { exports: {} }
  const requireShim = makeRequireShim(proxiedFetch)
  const env = { getUserVariables: () => ({}), os: 'h5', appVersion: '1.0.0' }
  const hostApi = {
    version: '1.0.0',
    registerPlugin: () => {},
    fetch: proxiedFetch,
    console: sandbox.console,
  }

  // 在 vm 上下文内重建函数，使其作用域链指向沙箱全局（等价于浏览器的 new Function）
  const build = vm.runInContext(
    `(function(${WEB_FN_PARAMS.join(',')}){ return function(){ return module.exports; } })`,
    sandbox,
  )

  try {
    const body = new Function(...WEB_FN_PARAMS, `${code}\nreturn module.exports;`)
    const inner = vm.runInContext(
      `(function(${WEB_FN_PARAMS.join(',')}){ return (${body.toString()})(${WEB_FN_PARAMS.join(',')}); })`,
      sandbox,
    )
    const out = inner(moduleObj, moduleObj.exports, requireShim, hostApi, proxiedFetch, sandbox.console, env)
    void build
    return { ok: true, error: null, exports: out ?? moduleObj.exports }
  } catch (e) {
    return { ok: false, error: e, exports: null }
  }
}

async function probeRuntime(code, { injectGlobals }) {
  const r = executeLikeWeb(code, { injectGlobals })
  if (!r.ok) return { loaded: false, error: `${r.error?.name}: ${r.error?.message}`, net: [] }
  const exp = r.exports
  const fn = exp?.search || exp?.searchSongs || exp?.getTopLists
  if (typeof fn !== 'function') {
    return { loaded: true, called: false, error: '未导出 search / searchSongs / getTopLists', net: [...NET_LOG] }
  }
  const before = NET_LOG.length
  let result
  try {
    result = await fn.call(exp, '周杰伦', 1, 'music')
  } catch (e) {
    return { loaded: true, called: true, threw: `${e?.name}: ${e?.message}`, net: NET_LOG.slice(before) }
  }
  const net = NET_LOG.slice(before)
  const count = Array.isArray(result?.data) ? result.data.length : 'n/a'
  return { loaded: true, called: true, threw: null, resultCount: count, net }
}

async function analyze(file) {
  const abs = path.resolve(file)
  const code = fs.readFileSync(abs, 'utf8')
  const bare = new Set()
  for (const g of NATIVE_GLOBALS) {
    if (new RegExp(`(?<![\\w.])${g}\\s*[.\\[]`).test(code)) bare.add(g)
  }

  const webLoad = executeLikeWeb(code, { injectGlobals: false })
  const missing = [...MISSING_MODULES]
  const web = await probeRuntime(code, { injectGlobals: false })
  const native = await probeRuntime(code, { injectGlobals: true })

  return {
    name: path.basename(abs),
    file: abs,
    loadOk: webLoad.ok,
    loadErr: webLoad.ok ? null : `${webLoad.error?.name}: ${webLoad.error?.message}`,
    keys: webLoad.ok && webLoad.exports && typeof webLoad.exports === 'object' ? Object.keys(webLoad.exports) : [],
    globals: [...bare],
    missing,
    web,
    native,
  }
}

// ---------------------------------------------------------------------------
const files = process.argv.slice(2).filter((a) => !a.startsWith('--'))
if (!files.length) {
  console.error('用法: node tools/diagnose-plugin-load.mjs <plugin.js> [更多...]')
  process.exit(1)
}

console.log('='.repeat(80))
console.log('插件加载诊断 —— 复刻 Web 端 executePluginCode 沙箱')
console.log(`URL 重写规则: ${REWRITE_RULES.length} 条（源自 src/lib/pluginHost.ts）`)
console.log('='.repeat(80))

for (const f of files) {
  const r = await analyze(f)
  console.log(`\n【${r.name}】`)
  console.log(`  加载: ${r.loadOk ? '✅ 成功' : '❌ 失败 ' + r.loadErr}`)
  if (r.loadOk) console.log(`  导出: ${r.keys.slice(0, 16).join(', ')}${r.keys.length > 16 ? ' …' : ''}`)
  if (r.globals.length) console.log(`  ⚠ 裸用全局符号: ${r.globals.join(', ')}`)
  if (r.missing.length) console.log(`  ⚠ require 未实现(静默返回{}): ${r.missing.join(', ')}`)

  const w = r.web
  console.log(`  search() → 发起网络请求 ${w.net?.length ?? 0} 次`)
  if (w.threw) console.log(`    ❌ 抛出异常: ${w.threw}`)
  if (w.error) console.log(`    ❌ ${w.error}`)
  for (const n of (w.net || []).slice(0, 6)) {
    console.log(`    ${n.proxied ? '🟢 走代理' : '🔴 直连'}  ${n.method}  ${n.finalUrl.slice(0, 110)}`)
  }
  if ((w.net || []).length > 6) console.log(`    … 还有 ${w.net.length - 6} 条`)

  const directOnly = (w.net || []).filter((n) => !n.proxied)
  if (directOnly.length) {
    const hosts = [...new Set(directOnly.map((n) => { try { return new URL(n.finalUrl).host } catch { return n.finalUrl } }))]
    console.log(`    ⚠ 直连域名（浏览器会受 CORS 限制）: ${hosts.join(', ')}`)
  }
}
console.log('\n' + '='.repeat(80))
