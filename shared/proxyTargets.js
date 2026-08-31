/**
 * 代理目标统一数据源 —— 唯一真相
 * ─────────────────────────────────────────────────────────
 * 所有代理配置（Vite dev proxy / Netlify Function / 前端 URL 重写）
 * 均从此文件生成，杜绝三套清单不一致。
 *
 * 字段说明：
 *   target   : 上游 URL（必填）
 *   headers  : 附加请求头（可选）
 *   allowHtml: true 表示该目标会返回 HTML（SSR 页面），Netlify 不应拒绝
 *   secure   : false 表示目标是 HTTP，Vite 需设 secure:false（可选，默认 true）
 *   devOnly  : true 表示仅本地开发使用，不进入 Netlify / 前端重写（可选）
 */

export const PROXY_TARGETS = {
  // ════════════ QQ 音乐 ════════════
  qqmusic_c: {
    target: 'https://c.y.qq.com',
    headers: { referer: 'https://y.qq.com/', origin: 'https://y.qq.com' },
  },
  qqmusic_u: {
    target: 'https://u.y.qq.com',
    headers: { referer: 'https://y.qq.com/', origin: 'https://y.qq.com' },
  },
  qqmusic_i: {
    target: 'http://i.y.qq.com',
    headers: { referer: 'https://y.qq.com/', origin: 'https://y.qq.com' },
    secure: false,
  },
  qq_html: {
    target: 'https://y.qq.com',
    headers: { referer: 'https://y.qq.com/' },
    allowHtml: true,
  },

  // ════════════ 网易云音乐 ════════════
  netease: {
    target: 'https://music.163.com',
    headers: { referer: 'https://music.163.com/', origin: 'https://music.163.com' },
  },
  netease_interface: {
    target: 'https://interface.music.163.com',
    headers: { referer: 'https://music.163.com/' },
  },
  netease_interface3: {
    target: 'https://interface3.music.163.com',
    headers: { referer: 'https://music.163.com/' },
  },
  netease_y: {
    target: 'https://y.music.163.com',
    headers: { referer: 'https://music.163.com/' },
  },

  // ════════════ 酷我音乐 ════════════
  kuwo_search: {
    target: 'https://search.kuwo.cn',
    headers: { referer: 'https://www.kuwo.cn/' },
    secure: false,
  },
  kuwo_m: {
    target: 'https://m.kuwo.cn',
    headers: { referer: 'https://www.kuwo.cn/' },
  },
  kuwo_wapi: {
    target: 'https://wapi.kuwo.cn',
    headers: { referer: 'https://www.kuwo.cn/' },
    secure: false,
  },
  kuwo_kbang: {
    target: 'https://kbangserver.kuwo.cn',
    headers: { referer: 'https://www.kuwo.cn/' },
  },
  kuwo_npl: {
    target: 'https://nplserver.kuwo.cn',
    headers: { referer: 'https://www.kuwo.cn/' },
  },
  kuwo_mobile: {
    target: 'https://mobileinterfaces.kuwo.cn',
    headers: { referer: 'https://www.kuwo.cn/' },
  },
  kuwo_nmobi: {
    target: 'https://nmobi.kuwo.cn',
    headers: { referer: 'https://www.kuwo.cn/' },
  },
  kuwo_www: {
    target: 'https://www.kuwo.cn',
    headers: { referer: 'https://www.kuwo.cn/' },
    allowHtml: true,
  },

  // ════════════ 酷狗音乐 ════════════
  kugou_search: {
    target: 'https://msearch.kugou.com',
    headers: { referer: 'https://www.kugou.com/' },
  },
  kugou_mobilecdn: {
    target: 'https://mobilecdn.kugou.com',
    headers: { referer: 'https://www.kugou.com/' },
  },
  kugou_mobilecdnbj: {
    target: 'https://mobilecdnbj.kugou.com',
    headers: { referer: 'https://www.kugou.com/' },
  },
  kugou_lyrics: {
    target: 'https://lyrics.kugou.com',
    headers: { referer: 'https://www.kugou.com/' },
  },
  kugou_t: {
    target: 'https://t.kugou.com',
    headers: { referer: 'https://www.kugou.com/' },
  },
  kugou_www2: {
    target: 'https://www2.kugou.kugou.com',
    headers: { referer: 'https://www.kugou.com/' },
  },
  kugou_gateway: {
    target: 'https://gateway.kugou.com',
    headers: { referer: 'https://www.kugou.com/' },
  },
  kugou_songsearch: {
    target: 'https://songsearch.kugou.com',
    headers: { referer: 'https://www.kugou.com/' },
  },
  kugou_www: {
    target: 'https://www.kugou.com',
    headers: { referer: 'https://www.kugou.com/' },
    allowHtml: true,
  },

  // ════════════ B站 ════════════
  bili: {
    target: 'https://www.bilibili.com',
    headers: { referer: 'https://www.bilibili.com/' },
    allowHtml: true,
  },
  biliapi: {
    target: 'https://api.bilibili.com',
    headers: { referer: 'https://www.bilibili.com/' },
  },

  // ════════════ 咪咕音乐 ════════════
  migu: {
    target: 'https://music.migu.cn',
    headers: { referer: 'https://music.migu.cn/' },
  },
  migu_m: {
    target: 'https://m.music.migu.cn',
    headers: { referer: 'https://music.migu.cn/' },
  },
  migu_cdn: {
    target: 'https://cdnmusic.migu.cn',
    headers: { referer: 'https://music.migu.cn/' },
  },
  migu_app_u: {
    target: 'https://app.u.nf.migu.cn',
    headers: { referer: 'https://music.migu.cn/' },
  },
  migu_app_c: {
    target: 'https://app.c.nf.migu.cn',
    headers: { referer: 'https://music.migu.cn/' },
  },

  // ════════════ 海棠音乐 ════════════
  haitang: {
    target: 'http://musicapi.haitangw.net',
    secure: false,
  },
  haitangm: {
    target: 'http://music.haitangw.net',
    secure: false,
  },
  haitangcc: {
    target: 'https://music.haitangw.cc',
    headers: { referer: 'https://music.haitangw.cc/' },
  },

  // ════════════ 其他音乐服务 ════════════
  lxmusic: {
    target: 'https://lxmusicapi.onrender.com',
  },
  ikun: {
    target: 'https://api.ikunshare.com',
  },
  duanx: {
    target: 'https://share.duanx.cn',
  },
  kstore: {
    target: 'https://13413.kstore.vip',
  },
  gequbao: {
    target: 'https://www.gequbao.com',
    headers: { referer: 'https://www.gequbao.com/', origin: 'https://www.gequbao.com' },
  },
  fangpi: {
    target: 'https://www.fangpi.com',
    headers: { referer: 'https://www.fangpi.com/', origin: 'https://www.fangpi.com' },
  },
  tonzhon: {
    target: 'https://tonzhon.com',
    headers: { referer: 'https://tonzhon.com/' },
  },
  buguomusic: {
    target: 'https://buguomusic.com',
    headers: { referer: 'https://buguomusic.com/' },
  },
  followlyrics: {
    target: 'https://zh.followlyrics.com',
    headers: { referer: 'https://zh.followlyrics.com/' },
  },
  buguyy: {
    target: 'https://www.buguyy.top',
    headers: { referer: 'https://www.buguyy.top/' },
  },

  // ════════════ 插件托管 ════════════
  gitee: {
    target: 'https://gitee.com',
    headers: { referer: 'https://gitee.com/' },
  },
  gitee_raw: {
    target: 'https://raw.giteeusercontent.com',
    headers: { referer: 'https://gitee.com/' },
  },
  github: {
    target: 'https://raw.githubusercontent.com',
  },
  jsdelivr: {
    target: 'https://fastly.jsdelivr.net',
  },

  // ════════════ 仅开发环境（Vite legacy /proxy/* 独有目标）════════════
  qianqian: {
    target: 'https://music.91q.com',
    headers: { referer: 'https://music.91q.com/' },
    devOnly: true,
  },
  xmly: {
    target: 'https://www.ximalaya.com',
    headers: { referer: 'https://www.ximalaya.com/' },
    devOnly: true,
  },
  xmlymobile: {
    target: 'https://mobile.ximalaya.com',
    devOnly: true,
  },
  lrts: {
    target: 'https://www.lrts.me',
    devOnly: true,
  },
  missevan: {
    target: 'https://www.missevan.com',
    headers: { referer: 'https://www.missevan.com/' },
    devOnly: true,
  },
  lizhi: {
    target: 'https://www.lizhi.fm',
    devOnly: true,
  },
  zz123: {
    target: 'https://zz123.com',
    headers: { referer: 'https://zz123.com/', origin: 'https://zz123.com' },
    devOnly: true,
  },
  suno: {
    target: 'https://studio-api.suno.ai',
    headers: { referer: 'https://suno.ai/', origin: 'https://suno.ai' },
    devOnly: true,
  },
  aggregator: {
    target: 'https://api.lolimi.cn',
    devOnly: true,
  },
  myfreemp3: {
    target: 'https://api.xingzhige.com',
    devOnly: true,
  },
  ghproxy: {
    target: 'https://ghproxy.com',
    devOnly: true,
  },
  netease163: {
    target: 'http://music.163.com',
    headers: { referer: 'https://music.163.com/' },
    secure: false,
    devOnly: true,
  },
}

/**
 * Vite legacy /proxy/* 路径 → 统一 key 映射
 * 用于 vite.config.ts 生成 /proxy/* 前缀的旧路由
 */
export const LEGACY_PROXY_MAP = {
  '/proxy/qqu':       'qqmusic_u',
  '/proxy/qqc':       'qqmusic_c',
  '/proxy/qqi':       'qqmusic_i',
  '/proxy/qqshc':     'qqmusic_c',       // shc.y.qq.com → 复用 qqmusic_c
  '/proxy/netease':   'netease',
  '/proxy/neteaseapi':'netease_interface',
  '/proxy/neteasem':  'netease_interface3',
  '/proxy/kugou':     'kugou_www',
  '/proxy/kugousearch':'kugou_songsearch',
  '/proxy/kugoucomplex':'kugou_search',
  '/proxy/kugouwww':  'kugou_gateway',
  '/proxy/kugougateway':'kugou_gateway',
  '/proxy/kugoutracker':'kugou_search',
  '/proxy/kugoumobile':'kugou_mobilecdn',
  '/proxy/kugouservice':'kugou_mobilecdn',
  '/proxy/kuwo':      'kuwo_www',
  '/proxy/kuwoapi':   'kuwo_m',
  '/proxy/kuwosearch':'kuwo_search',
  '/proxy/migu':      'migu',
  '/proxy/migum':     'migu_m',
  '/proxy/miguapp':   'migu_app_c',
  '/proxy/migucdn':   'migu_cdn',
  '/proxy/migupdms':  'migu_app_c',
  '/proxy/bili':      'bili',
  '/proxy/biliapi':   'biliapi',
  '/proxy/5sing':     'kugou_www',        // 5sing.kugou.com → 复用 kugou
  '/proxy/5singfc':   'kugou_www',
  '/proxy/qianqian':  'qianqian',
  '/proxy/xmly':      'xmly',
  '/proxy/xmlymobile':'xmlymobile',
  '/proxy/lrts':      'lrts',
  '/proxy/missevan':  'missevan',
  '/proxy/lizhi':     'lizhi',
  '/proxy/zz123':     'zz123',
  '/proxy/gequbao':   'gequbao',
  '/proxy/suno':      'suno',
  '/proxy/gitee':     'gitee',
  '/proxy/giteeraw':  'gitee_raw',
  '/proxy/github':    'github',
  '/proxy/ghproxy':   'ghproxy',
  '/proxy/haitang':   'haitang',
  '/proxy/haitangm':  'haitangm',
  '/proxy/haitangcc': 'haitangcc',
  '/proxy/duanx':     'duanx',
  '/proxy/lxmusic':   'lxmusic',
  '/proxy/netease163':'netease163',
  '/proxy/aggregator':'aggregator',
  '/proxy/myfreemp3': 'myfreemp3',
}

/**
 * 通用请求头（所有代理请求都会带上）
 */
export const COMMON_HEADERS = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
}
