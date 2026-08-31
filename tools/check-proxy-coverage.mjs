/**
 * 代理白名单覆盖率检查
 * ---------------------------------------------------------------------------
 * 从统一数据源 shared/proxyTargets.mjs 出发，验证三套消费方是否完整覆盖。
 *
 * 用法（项目根目录）：
 *   node tools/check-proxy-coverage.mjs <插件.js|插件目录> [...]
 *
 * 无参数时仅做一致性自检（三套消费方是否与统一源对齐）。
 */

import fs from 'node:fs'
import path from 'node:path'
import { PROXY_TARGETS, LEGACY_PROXY_MAP } from '../shared/proxyTargets.js'

const ROOT = process.cwd()
const HOST_TS = path.join(ROOT, 'src/lib/pluginHost.ts')
const PROXY_JS = path.join(ROOT, 'netlify/functions/proxy.js')
const VITE_TS = path.join(ROOT, 'vite.config.ts')

// ── 一致性自检：三套消费方是否引用统一源 ──
function selfCheck() {
  const errors = []

  // 1) 三套消费方都应引用统一源
  const proxySrc = fs.readFileSync(PROXY_JS, 'utf8')
  if (!proxySrc.includes('shared/proxyTargets')) {
    errors.push('Netlify proxy.js 未引用 shared/proxyTargets.js')
  }

  const viteSrc = fs.readFileSync(VITE_TS, 'utf8')
  if (!viteSrc.includes('shared/proxyTargets')) {
    errors.push('vite.config.ts 未引用 shared/proxyTargets.js')
  }

  const hostSrc = fs.readFileSync(HOST_TS, 'utf8')
  if (!hostSrc.includes('shared/proxyTargets')) {
    errors.push('pluginHost.ts 未引用 shared/proxyTargets.js')
  }

  // 2) LEGACY_PROXY_MAP 中的 key 都应存在于 PROXY_TARGETS
  for (const [legacyPath, canonicalKey] of Object.entries(LEGACY_PROXY_MAP)) {
    if (!PROXY_TARGETS[canonicalKey]) {
      errors.push(`LEGACY_PROXY_MAP: ${legacyPath} → ${canonicalKey} 不存在于 PROXY_TARGETS`)
    }
  }

  return errors
}

// ── isMediaUrl（从统一源构建） ──
function makeIsMediaUrl() {
  const MEDIA_EXT = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|mp3|wav|ogg|m4a|aac|flac|wma|opus|ape|m4s|mp4|m4v|webm|mkv|avi|mov|flv|m3u8)$/i
  const mediaPathPatterns = [
    /\/image[s]?\//i, /\/audio\//i, /\/video\//i, /\/media\//i, /\/cover[s]?\//i,
    /\/artwork\//i, /\/photo[s]?\//i, /\/pic[s]?\//i, /\/thumb[s]?\//i, /\/album[s]?\//i,
  ]
  return (url) => {
    let pathname = url
    try { pathname = new URL(url, 'https://x.invalid').pathname } catch { /* 保持原串 */ }
    if (MEDIA_EXT.test(pathname)) return true
    for (const p of mediaPathPatterns) if (p.test(pathname)) return true
    return false
  }
}

// ── 从统一源构建前端重写规则 ──
function buildRewriteRules() {
  const rules = []
  for (const [key, cfg] of Object.entries(PROXY_TARGETS)) {
    if (cfg.devOnly) continue
    try {
      const host = new URL(cfg.target).host
      const escaped = host.replace(/\./g, '\\.')
      rules.push({ re: new RegExp(`^https?://${escaped}/`), replace: `/api/proxy/${key}/` })
    } catch { /* skip */ }
  }
  rules.sort((a, b) => {
    const ha = a.re.source.replace(/^.*https?:\\\/\\\//, '').replace(/\\\/.*$/, '')
    const hb = b.re.source.replace(/^.*https?:\\\/\\\//, '').replace(/\\\/.*$/, '')
    return hb.length - ha.length
  })
  return rules
}

const rewriteRules = buildRewriteRules()
const isMediaUrl = makeIsMediaUrl()
const targetHosts = new Set(
  Object.values(PROXY_TARGETS)
    .filter(cfg => !cfg.devOnly)
    .map(cfg => { try { return new URL(cfg.target).host } catch { return '' } })
    .filter(Boolean)
)

function classifyHost(host, sampleUrl) {
  let probe
  try {
    probe = new URL(sampleUrl.startsWith('http') ? sampleUrl : `https://${host}`).href
  } catch {
    probe = `https://${host}/`
  }
  if (isMediaUrl(probe)) return { status: 'media', note: '被 isMediaUrl 判定为媒体资源 → 直连' }
  const hit = rewriteRules.find(r => r.re.test(probe))
  if (hit) {
    const hostOk = targetHosts.has(host)
    return hostOk
      ? { status: 'ok', note: hit.replace }
      : { status: 'partial', note: `${hit.replace} —— 但统一源无对应 host` }
  }
  return { status: 'missing', note: '前端无重写规则 → 浏览器直连 → CORS 拦截' }
}

// ── 插件文件扫描 ──
function collectFiles(argv) {
  const files = []
  for (const a of argv) {
    const p = path.resolve(a)
    if (fs.statSync(p).isDirectory()) {
      for (const e of fs.readdirSync(p)) if (e.endsWith('.js')) files.push(path.join(p, e))
    } else files.push(p)
  }
  return files
}

// ── 主流程 ──
console.log('='.repeat(84))
console.log('代理白名单覆盖率检查（统一源模式）')
console.log(`统一源 ${Object.keys(PROXY_TARGETS).length} 条 |  canonical ${Object.keys(PROXY_TARGETS).filter(k => !PROXY_TARGETS[k].devOnly).length} |  devOnly ${Object.keys(PROXY_TARGETS).filter(k => PROXY_TARGETS[k].devOnly).length}`)
console.log(`前端重写规则 ${rewriteRules.length} 条`)
console.log('='.repeat(84))

// 一致性自检
const selfErrors = selfCheck()
if (selfErrors.length) {
  console.log('\n❌ 一致性自检失败：')
  for (const e of selfErrors) console.log(`  • ${e}`)
  process.exit(1)
} else {
  console.log('\n✅ 一致性自检通过：三套消费方均引用统一源')
}

const files = collectFiles(process.argv.slice(2))
if (!files.length) {
  console.log('\n提示：传入插件文件/目录可检查覆盖率。用法：node tools/check-proxy-coverage.mjs <插件.js|目录>')
  process.exit(0)
}

const allGaps = new Map()

for (const f of files) {
  const code = fs.readFileSync(f, 'utf8')
  const urls = [...new Set(code.match(/https?:\/\/[a-zA-Z0-9._\-]+[^\s'"`)]*/g) || [])]
  const byHost = new Map()
  for (const u of urls) {
    let host
    try { host = new URL(u).host } catch { continue }
    if (!host.includes('.')) continue
    if (!byHost.has(host)) byHost.set(host, u)
  }

  console.log(`\n【${path.basename(f)}】 发现 ${byHost.size} 个外域 host`)
  const rows = []
  for (const [host, sample] of byHost) {
    const c = classifyHost(host, sample)
    rows.push({ host, ...c, sample })
    if (c.status === 'missing' || c.status === 'partial') {
      if (!allGaps.has(host)) allGaps.set(host, { plugins: new Set(), sample, status: c.status, note: c.note })
      allGaps.get(host).plugins.add(path.basename(f))
    }
  }
  rows.sort((a, b) => a.status.localeCompare(b.status))
  for (const r of rows) {
    const icon = r.status === 'ok' ? '🟢' : r.status === 'partial' ? '🟡' : r.status === 'media' ? '🔵' : '🔴'
    console.log(`  ${icon} ${r.host.padEnd(34)} ${r.note}`)
  }
}

console.log('\n' + '='.repeat(84))
console.log('缺口汇总')
console.log('='.repeat(84))
if (!allGaps.size) {
  console.log('  无缺口。')
} else {
  for (const [host, g] of [...allGaps].sort((a, b) => a[1].status.localeCompare(b[1].status))) {
    console.log(`\n  ${g.status === 'missing' ? '🔴' : '🟡'} ${host}`)
    console.log(`     影响插件: ${[...g.plugins].join(', ')}`)
    console.log(`     示例 URL: ${g.sample.slice(0, 120)}`)
    console.log(`     说明    : ${g.note}`)
  }
  process.exit(1)
}
console.log('')
