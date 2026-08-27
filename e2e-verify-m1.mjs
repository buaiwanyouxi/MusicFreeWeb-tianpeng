import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const feedFile = resolve(__dirname, 'e2e-feed.json')

if (!existsSync(feedFile)) {
  console.log('SKIP: e2e-feed.json not found. Create it with your subscription config to run e2e.')
  process.exit(0)
}

const feed = JSON.parse(readFileSync(feedFile, 'utf-8'))
const { subscriptions, pluginsCache, activePluginId, pluginName, searchKeyword, searchArtist } = feed

let chromium
try {
  chromium = (await import('playwright')).chromium
} catch {
  console.log('SKIP: playwright not installed. Run `npm i -D playwright` to enable e2e.')
  process.exit(0)
}

const log = []
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ locale: 'zh-CN' })
page.on('console', m => { const t = m.text(); log.push(t); if (log.length > 5000) log.splice(0, 500) })
page.on('pageerror', e => log.push('PAGEERROR: ' + e.message))
await page.addInitScript(() => {
  try {
    localStorage.setItem('musicfree.subscriptions', JSON.stringify(subscriptions))
    localStorage.setItem('musicfree.plugins.cache', JSON.stringify(pluginsCache))
    localStorage.setItem('musicfree.active.plugin', activePluginId)
  } catch (e) {}
})
try {
  await page.goto('http://127.0.0.1:8080/', { waitUntil: 'domcontentloaded', timeout: 30000 })
  const inputSel = 'input[placeholder="搜索歌曲、歌手、专辑..."]'
  await page.waitForFunction(
    (name) => document.body.innerText.includes(name) || document.body.innerText.includes('排行榜'),
    pluginName,
    { timeout: 120000 }
  )
  await page.waitForTimeout(3000)
  const activeName = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('[data-plugin-select] button'))
    const b = btns.find(b => b.offsetHeight > 0 && /选择源/.test(b.textContent) || b.textContent.includes(arguments[0]))
    return b ? b.textContent.trim() : 'UNKNOWN'
  })
  console.log('ACTIVE PLUGIN TRIGGER:', activeName)
  await page.locator('button.px-5:has-text("搜索")').first().click()
  await page.waitForSelector(inputSel, { timeout: 15000 })
  const probe = await page.evaluate(() => {
    const desc = Object.getOwnPropertyDescriptor(window, 'localStorage')
    if (!desc || typeof desc.get !== 'function') return { installed: false }
    const real = desc.get()
    globalThis.__mfPluginDepth = 1
    let shim = null
    try { shim = desc.get() } finally { globalThis.__mfPluginDepth = 0 }
    const isShim = !!(shim && real && shim !== real)
    let blockedRead = 'n/a'
    if (isShim) blockedRead = shim.getItem('musicfree.player.state') === null
    return { installed: true, shimDuringPlugin: isShim, blockedRead, realLen: real ? real.length : -1 }
  })
  console.log('SANDBOX PROBE:', JSON.stringify(probe))
  await page.fill(inputSel, searchKeyword)
  await page.press(inputSel, 'Enter')
  await page.waitForSelector('h4', { timeout: 60000 })
  await page.waitForTimeout(1500)
  const rows = await page.evaluate(() => {
    const out = []
    document.querySelectorAll('.glass').forEach(el => {
      const h4 = el.querySelector('h4')
      const p = el.querySelector('p')
      if (h4 && p && el.className.includes('cursor-pointer')) out.push({ title: h4.textContent, meta: p.textContent })
    })
    return out
  })
  console.log('ROWS(' + rows.length + '):')
  rows.forEach(r => console.log('  ' + r.title + ' | ' + r.meta))
  const target = rows.find(r => r.title.includes(searchKeyword) && r.meta.includes(searchArtist))
    || rows.find(r => r.title.includes(searchKeyword))
  if (!target) { console.log('FAIL: 未找到 ' + searchKeyword + '/' + searchArtist); process.exit(2) }
  console.log('TARGET:', target.title, '|', target.meta)
  const hasDurShown = /\d+:\d\d/.test(target.meta)
  console.log('DURATION SHOWN IN ROW:', hasDurShown)
  log.length = 0
  await page.evaluate((title) => {
    const h4s = Array.from(document.querySelectorAll('h4')).filter(h => h.textContent === title)
    const row = h4s[0]?.closest('.glass')
    row?.click()
  }, target.title)
  await page.waitForFunction(() => { const a = document.querySelector('audio'); return a && a.duration > 0 }, null, { timeout: 60000 }).catch(() => console.log('WARN: audio.duration 未就绪'))
  await page.waitForTimeout(5000)
  const audio = await page.evaluate(() => { const a = document.querySelector('audio'); return a ? { duration: a.duration, src: (a.currentSrc || a.src || '').slice(0, 100), paused: a.paused } : null })
  console.log('AUDIO:', JSON.stringify(audio))
  const gmsCount = log.filter(l => l.includes('[Stream] getMediaSource 返回')).length
  const lyricLines = log.find(l => l.includes('从 getLyric 解析后的歌词行数'))
  const lyricLineCount = lyricLines ? parseInt((lyricLines.match(/行数: (\d+)/) || [])[1] || '0', 10) : 0
  console.log('getMediaSource calls:', gmsCount)
  console.log('LYRIC LOG:', lyricLines || '(none)', '=> lines:', lyricLineCount)
  const sandboxHits = log.filter(l => l.includes('[Sandbox]')).map(l => l.slice(0, 120))
  console.log('SANDBOX LOGS:', sandboxHits.length ? JSON.stringify(sandboxHits.slice(0, 5)) : '(none)')
  const screenshotPath = resolve(__dirname, 'docs', 'e2e-m1-search.png')
  await page.screenshot({ path: screenshotPath })
  const summary = {
    target: target.title,
    audioOk: !!(audio && (audio.duration > 0 || (audio.src || '').startsWith('blob:'))),
    gmsCalls: gmsCount,
    lyricLineCount,
    lyricViaGetLyric: lyricLineCount > 0,
    durationShown: hasDurShown,
    sandbox: probe,
  }
  console.log('=== SUMMARY ===')
  console.log(JSON.stringify(summary, null, 1))
  const pass = summary.audioOk && summary.gmsCalls === 1 && summary.lyricViaGetLyric && probe.installed && probe.shimDuringPlugin
  console.log(pass ? 'E2E PASS' : 'E2E FAIL')
  process.exit(pass ? 0 : 1)
} catch (e) {
  console.log('E2E ERROR:', e.message)
  const key = log.filter(l => /getMediaSource|Lyrics|Sandbox|Error|错误|限流|无法/i.test(l)).slice(-40)
  console.log('KEY LOGS:'); key.forEach(l => console.log('  ' + l.slice(0, 200)))
  process.exit(3)
} finally {
  await browser.close()
}
