import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { PROXY_TARGETS, LEGACY_PROXY_MAP, COMMON_HEADERS } from './shared/proxyTargets.js'

// ── 从统一数据源生成 /api/proxy/* 路由 ──
function buildApiProxyRules() {
  const rules = {}
  for (const [key, cfg] of Object.entries(PROXY_TARGETS)) {
    if (cfg.devOnly) continue
    const routePath = `/api/proxy/${key}`
    const headers = { ...COMMON_HEADERS, ...(cfg.headers || {}) }

    const entry = {
      target: cfg.target,
      changeOrigin: true,
      rewrite: (path) => path.replace(new RegExp(`^${routePath.replace(/\//g, '\\/')}`), ''),
      headers,
    }

    if (cfg.secure === false) {
      entry.secure = false
    }

    // 网易云：转发 x-forwarded-cookie
    if (key.startsWith('netease') && !cfg.devOnly) {
      entry.configure = (proxy) => {
        proxy.on('proxyReq', (proxyReq, req) => {
          const forwardCookie = req.headers['x-forwarded-cookie']
          if (forwardCookie) {
            proxyReq.setHeader('cookie', forwardCookie)
            delete req.headers['x-forwarded-cookie']
          }
        })
      }
    }

    // 酷我搜索：移除浏览器指纹头，使用客户端 UA
    if (key === 'kuwo_search') {
      entry.configure = (proxy) => {
        proxy.on('proxyReq', (proxyReq) => {
          proxyReq.removeHeader('origin')
          proxyReq.removeHeader('referer')
          proxyReq.removeHeader('sec-fetch-dest')
          proxyReq.removeHeader('sec-fetch-mode')
          proxyReq.removeHeader('sec-fetch-site')
          proxyReq.removeHeader('sec-ch-ua')
          proxyReq.removeHeader('sec-ch-ua-mobile')
          proxyReq.removeHeader('sec-ch-ua-platform')
          proxyReq.setHeader('User-Agent', 'kwplayer_ar_8.5.4.2')
        })
      }
    }

    rules[routePath] = entry
  }
  return rules
}

// ── 从统一数据源生成 legacy /proxy/* 路由 ──
function buildLegacyProxyRules() {
  const rules = {}
  for (const [legacyPath, canonicalKey] of Object.entries(LEGACY_PROXY_MAP)) {
    const cfg = PROXY_TARGETS[canonicalKey]
    if (!cfg) continue

    const headers = { ...COMMON_HEADERS, ...(cfg.headers || {}) }
    const entry = {
      target: cfg.target,
      changeOrigin: true,
      rewrite: (path) => path.replace(new RegExp(`^${legacyPath.replace(/\//g, '\\/')}`), ''),
      headers,
    }

    if (cfg.secure === false) {
      entry.secure = false
    }

    // 网易云 legacy 路由也需要 cookie 转发
    if (canonicalKey.startsWith('netease')) {
      entry.configure = (proxy) => {
        proxy.on('proxyReq', (proxyReq, req) => {
          const forwardCookie = req.headers['x-forwarded-cookie']
          if (forwardCookie) {
            proxyReq.setHeader('cookie', forwardCookie)
            delete req.headers['x-forwarded-cookie']
          }
        })
      }
    }

    // 酷我搜索 legacy 路由
    if (canonicalKey === 'kuwo_search') {
      entry.configure = (proxy) => {
        proxy.on('proxyReq', (proxyReq) => {
          proxyReq.removeHeader('origin')
          proxyReq.removeHeader('referer')
          proxyReq.removeHeader('sec-fetch-dest')
          proxyReq.removeHeader('sec-fetch-mode')
          proxyReq.removeHeader('sec-fetch-site')
          proxyReq.removeHeader('sec-ch-ua')
          proxyReq.removeHeader('sec-ch-ua-mobile')
          proxyReq.removeHeader('sec-ch-ua-platform')
          proxyReq.setHeader('User-Agent', 'kwplayer_ar_8.5.4.2')
        })
      }
    }

    rules[legacyPath] = entry
  }
  return rules
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      ...buildLegacyProxyRules(),
      ...buildApiProxyRules(),
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
