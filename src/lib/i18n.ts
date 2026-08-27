export type Language = 'zh-CN' | 'zh-TW' | 'en'

const translations: Record<Language, Record<string, string>> = {
  'zh-CN': {
    // 导航
    'nav.search': '搜索',
    'nav.playlist': '列表',
    'nav.settings': '设置',

    // 设置页
    'settings.title': '设置',
    'settings.subtitle': '自定义你的音乐体验',
    'settings.basic': '基础设置',
    'settings.subscription': '订阅设置',
    'settings.other': '其它设置',
    'settings.about': '网站说明',

    // 基础设置
    'settings.theme': '主题',
    'settings.theme.light': '浅色',
    'settings.theme.dark': '深色',
    'settings.theme.system': '跟随系统',
    'settings.wallpaper': '壁纸',
    'settings.wallpaper.choose': '选择图片',
    'settings.wallpaper.reset': '重置',
    'settings.fontSize': '字体大小',
    'settings.fontSize.small': '小',
    'settings.fontSize.medium': '中',
    'settings.fontSize.large': '大',

    // 其它设置
    'settings.timer': '定时关闭',
    'settings.timer.off': '关闭',
    'settings.timer.minutes': '分钟',
    'settings.language': '语言',
    'settings.backup': '备份与恢复',
    'settings.backup.export': '导出配置',
    'settings.backup.import': '导入配置',
    'settings.backup.success': '配置导入成功，页面将刷新',
    'settings.backup.invalid': '无效的配置文件',
    'settings.backup.parseError': '配置文件解析失败',

    // 关于
    'about.description': 'MusicFreeWeb 是基于 MusicFree 开源项目的 Web 版本实现。',
    'about.description2': 'MusicFree 是一款插件化、定制化、无广告的免费音乐播放器，由猫头猫（maotoumao）开发并开源。',
    'about.description3': '本项目的插件协议与 MusicFree 保持一致，所有插件均可在 MusicFree 桌面端和移动端通用。',
    'about.official': 'MusicFree 官方项目',
    'about.source': '本项目源代码',
    'about.license': 'MusicFree 遵循 AGPL-3.0 协议开源',
    'about.pluginPlayer': '插件化音乐播放器',

    // 通用
    'common.confirm': '确定',
    'common.cancel': '取消',
    'common.delete': '删除',
    'common.loading': '加载中...',
    'common.noData': '暂无数据',
  },

  'zh-TW': {
    'nav.search': '搜尋',
    'nav.playlist': '列表',
    'nav.settings': '設定',

    'settings.title': '設定',
    'settings.subtitle': '自訂你的音樂體驗',
    'settings.basic': '基礎設定',
    'settings.subscription': '訂閱設定',
    'settings.other': '其它設定',
    'settings.about': '網站說明',

    'settings.theme': '主題',
    'settings.theme.light': '淺色',
    'settings.theme.dark': '深色',
    'settings.theme.system': '跟隨系統',
    'settings.wallpaper': '桌布',
    'settings.wallpaper.choose': '選擇圖片',
    'settings.wallpaper.reset': '重設',
    'settings.fontSize': '字型大小',
    'settings.fontSize.small': '小',
    'settings.fontSize.medium': '中',
    'settings.fontSize.large': '大',

    'settings.timer': '定時關閉',
    'settings.timer.off': '關閉',
    'settings.timer.minutes': '分鐘',
    'settings.language': '語言',
    'settings.backup': '備份與還原',
    'settings.backup.export': '匯出設定',
    'settings.backup.import': '匯入設定',
    'settings.backup.success': '設定匯入成功，頁面將重新整理',
    'settings.backup.invalid': '無效的設定檔案',
    'settings.backup.parseError': '設定檔案解析失敗',

    'about.description': 'MusicFreeWeb 是基於 MusicFree 開源專案的 Web 版本實現。',
    'about.description2': 'MusicFree 是一款插件化、客製化、無廣告的免費音樂播放器，由貓頭貓（maotoumao）開發並開源。',
    'about.description3': '本專案的插件協議與 MusicFree 保持一致，所有插件均可在 MusicFree 桌面端和行動端通用。',
    'about.official': 'MusicFree 官方專案',
    'about.source': '本專案原始碼',
    'about.license': 'MusicFree 遵循 AGPL-3.0 協議開源',
    'about.pluginPlayer': '插件化音樂播放器',

    'common.confirm': '確定',
    'common.cancel': '取消',
    'common.delete': '刪除',
    'common.loading': '載入中...',
    'common.noData': '暫無資料',
  },

  'en': {
    'nav.search': 'Search',
    'nav.playlist': 'Playlist',
    'nav.settings': 'Settings',

    'settings.title': 'Settings',
    'settings.subtitle': 'Customize your music experience',
    'settings.basic': 'Basic Settings',
    'settings.subscription': 'Subscription',
    'settings.other': 'Other Settings',
    'settings.about': 'About',

    'settings.theme': 'Theme',
    'settings.theme.light': 'Light',
    'settings.theme.dark': 'Dark',
    'settings.theme.system': 'System',
    'settings.wallpaper': 'Wallpaper',
    'settings.wallpaper.choose': 'Choose Image',
    'settings.wallpaper.reset': 'Reset',
    'settings.fontSize': 'Font Size',
    'settings.fontSize.small': 'Small',
    'settings.fontSize.medium': 'Medium',
    'settings.fontSize.large': 'Large',

    'settings.timer': 'Sleep Timer',
    'settings.timer.off': 'Off',
    'settings.timer.minutes': 'min',
    'settings.language': 'Language',
    'settings.backup': 'Backup & Restore',
    'settings.backup.export': 'Export Config',
    'settings.backup.import': 'Import Config',
    'settings.backup.success': 'Config imported successfully, page will refresh',
    'settings.backup.invalid': 'Invalid config file',
    'settings.backup.parseError': 'Failed to parse config file',

    'about.description': 'MusicFreeWeb is a web implementation based on the open-source MusicFree project.',
    'about.description2': 'MusicFree is a plugin-based, customizable, ad-free music player developed by maotoumao.',
    'about.description3': 'The plugin protocol is consistent with MusicFree, all plugins work on desktop and mobile.',
    'about.official': 'MusicFree Official',
    'about.source': 'Source Code',
    'about.license': 'MusicFree is open-sourced under AGPL-3.0 license',
    'about.pluginPlayer': 'Plugin-based Music Player',

    'common.confirm': 'Confirm',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.loading': 'Loading...',
    'common.noData': 'No data',
  },
}

let currentLanguage: Language = 'zh-CN'

export function setLanguage(lang: Language) {
  currentLanguage = lang
  localStorage.setItem('musicfree.language', lang)
}

export function getLanguage(): Language {
  return currentLanguage
}

export function t(key: string): string {
  return translations[currentLanguage]?.[key] || translations['zh-CN']?.[key] || key
}

export function initLanguage() {
  const saved = localStorage.getItem('musicfree.language') as Language | null
  if (saved && translations[saved]) {
    currentLanguage = saved
  }
}
