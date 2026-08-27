import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sun,
  Moon,
  Monitor,
  Image,
  Type,
  Clock,
  Download,
  Upload,
  Globe,
  Info,
  ChevronRight,
  ExternalLink,
  RotateCcw,
  Palette,
  Music2,
} from 'lucide-react'
import { PluginManager } from './PluginManager'

type ThemeMode = 'light' | 'dark' | 'system'
type FontSize = 'small' | 'medium' | 'large'
type TimerOption = 'off' | '15' | '30' | '60' | 'custom'
type Language = 'zh-CN' | 'zh-TW' | 'en'

const APP_VERSION = 'v1.0.0'

export function SettingsView() {
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const sections = [
    { id: 'basic', label: '基础设置', icon: Palette },
    { id: 'subscription', label: '订阅设置', icon: Globe },
    { id: 'other', label: '其它设置', icon: Clock },
    { id: 'about', label: '网站说明', icon: Info },
  ]

  if (activeSection === 'subscription') {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-800">
          <button
            onClick={() => setActiveSection(null)}
            className="p-1.5 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-800 transition-colors"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <h2 className="text-base font-semibold text-surface-100">订阅设置</h2>
        </div>
        <div className="flex-1 overflow-hidden">
          <PluginManager />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <div className="px-4 py-4">
        <h1 className="text-xl font-bold text-surface-100 mb-1">设置</h1>
        <p className="text-xs text-surface-500">自定义你的音乐体验</p>
      </div>

      <div className="px-4 pb-6 space-y-2">
        {sections.map((section) => (
          <motion.button
            key={section.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveSection(section.id)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-surface-800/50 border border-surface-700/50 hover:bg-surface-700/50 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center flex-shrink-0">
              <section.icon className="w-5 h-5 text-primary-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-surface-200">{section.label}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-surface-500" />
          </motion.button>
        ))}
      </div>

      {/* 各板块内容 */}
      <AnimatePresence mode="wait">
        {activeSection === 'basic' && <BasicSettings onClose={() => setActiveSection(null)} />}
        {activeSection === 'other' && <OtherSettings onClose={() => setActiveSection(null)} />}
        {activeSection === 'about' && <AboutSection onClose={() => setActiveSection(null)} />}
      </AnimatePresence>
    </div>
  )
}

// 基础设置
function BasicSettings({ onClose }: { onClose: () => void }) {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('musicfree.theme') as ThemeMode) || 'dark'
  })
  const [fontSize, setFontSize] = useState<FontSize>(() => {
    return (localStorage.getItem('musicfree.fontSize') as FontSize) || 'medium'
  })
  const [wallpaperUrl, setWallpaperUrl] = useState<string>(() => {
    return localStorage.getItem('musicfree.wallpaper') || ''
  })

  const applyTheme = (mode: ThemeMode) => {
    setTheme(mode)
    localStorage.setItem('musicfree.theme', mode)
    const root = document.documentElement
    if (mode === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('light-theme', !isDark)
    } else {
      root.classList.toggle('light-theme', mode === 'light')
    }
  }

  const applyFontSize = (size: FontSize) => {
    setFontSize(size)
    localStorage.setItem('musicfree.fontSize', size)
    const sizeMap = { small: '14px', medium: '16px', large: '18px' }
    document.documentElement.style.fontSize = sizeMap[size]
  }

  const handleWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const url = reader.result as string
      setWallpaperUrl(url)
      localStorage.setItem('musicfree.wallpaper', url)
      document.body.style.backgroundImage = `url(${url})`
      document.body.style.backgroundSize = 'cover'
      document.body.style.backgroundPosition = 'center'
      document.body.style.backgroundAttachment = 'fixed'
    }
    reader.readAsDataURL(file)
  }

  const resetWallpaper = () => {
    setWallpaperUrl('')
    localStorage.removeItem('musicfree.wallpaper')
    document.body.style.backgroundImage = ''
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="px-4 pb-6 space-y-6"
    >
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-800 transition-colors"
        >
          <ChevronRight className="w-5 h-5 rotate-180" />
        </button>
        <h2 className="text-base font-semibold text-surface-100">基础设置</h2>
      </div>

      {/* 主题 */}
      <div className="space-y-3">
        <label className="text-xs text-surface-400 font-medium uppercase tracking-wider">主题</label>
        <div className="grid grid-cols-3 gap-2">
          {([
            { value: 'light', icon: Sun, label: '浅色' },
            { value: 'dark', icon: Moon, label: '深色' },
            { value: 'system', icon: Monitor, label: '跟随系统' },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              onClick={() => applyTheme(opt.value)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                theme === opt.value
                  ? 'bg-primary-500/10 border-primary-500/30 text-primary-400'
                  : 'bg-surface-800/50 border-surface-700/50 text-surface-400 hover:border-surface-600'
              }`}
            >
              <opt.icon className="w-5 h-5" />
              <span className="text-xs">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 壁纸 */}
      <div className="space-y-3">
        <label className="text-xs text-surface-400 font-medium uppercase tracking-wider">壁纸</label>
        <div className="flex gap-2">
          <label className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-surface-800/50 border border-surface-700/50 text-surface-400 hover:border-surface-600 transition-colors cursor-pointer">
            <Image className="w-4 h-4" />
            <span className="text-xs">选择图片</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleWallpaperUpload} />
          </label>
          {wallpaperUrl && (
            <button
              onClick={resetWallpaper}
              className="flex items-center justify-center gap-2 px-4 p-3 rounded-xl bg-surface-800/50 border border-surface-700/50 text-surface-400 hover:border-red-500/30 hover:text-red-400 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="text-xs">重置</span>
            </button>
          )}
        </div>
        {wallpaperUrl && (
          <div className="relative h-24 rounded-xl overflow-hidden border border-surface-700/50">
            <img src={wallpaperUrl} alt="wallpaper" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* 字体大小 */}
      <div className="space-y-3">
        <label className="text-xs text-surface-400 font-medium uppercase tracking-wider">字体大小</label>
        <div className="grid grid-cols-3 gap-2">
          {([
            { value: 'small', label: '小', size: '14px' },
            { value: 'medium', label: '中', size: '16px' },
            { value: 'large', label: '大', size: '18px' },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              onClick={() => applyFontSize(opt.value)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                fontSize === opt.value
                  ? 'bg-primary-500/10 border-primary-500/30 text-primary-400'
                  : 'bg-surface-800/50 border-surface-700/50 text-surface-400 hover:border-surface-600'
              }`}
            >
              <Type className="w-5 h-5" />
              <span className="text-xs">{opt.label}</span>
              <span className="text-[10px] text-surface-500">{opt.size}</span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// 其它设置
function OtherSettings({ onClose }: { onClose: () => void }) {
  const [timer, setTimer] = useState<TimerOption>(() => {
    return (localStorage.getItem('musicfree.timer') as TimerOption) || 'off'
  })
  const [customMinutes, setCustomMinutes] = useState<string>(() => {
    return localStorage.getItem('musicfree.timer.custom') || '45'
  })
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('musicfree.language') as Language) || 'zh-CN'
  })

  const applyTimer = (value: TimerOption) => {
    setTimer(value)
    localStorage.setItem('musicfree.timer', value)
  }

  const applyLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('musicfree.language', lang)
  }

  const handleExport = () => {
    const config = {
      version: APP_VERSION,
      exportedAt: new Date().toISOString(),
      theme: localStorage.getItem('musicfree.theme'),
      fontSize: localStorage.getItem('musicfree.fontSize'),
      language: localStorage.getItem('musicfree.language'),
      subscriptions: localStorage.getItem('musicfree.subscriptions'),
      plugins: localStorage.getItem('musicfree.plugins.cache'),
      activePlugin: localStorage.getItem('musicfree.active.plugin'),
      userVariables: localStorage.getItem('musicfree.userVariables'),
      importedSheets: localStorage.getItem('musicfree.importedSheets'),
    }
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `musicfree-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const config = JSON.parse(reader.result as string)
        if (!config.version) {
          alert('无效的配置文件')
          return
        }
        const mappings: Record<string, string> = {
          theme: 'musicfree.theme',
          fontSize: 'musicfree.fontSize',
          language: 'musicfree.language',
          subscriptions: 'musicfree.subscriptions',
          plugins: 'musicfree.plugins.cache',
          activePlugin: 'musicfree.active.plugin',
          userVariables: 'musicfree.userVariables',
          importedSheets: 'musicfree.importedSheets',
        }
        for (const [key, storageKey] of Object.entries(mappings)) {
          if (config[key] !== undefined && config[key] !== null) {
            localStorage.setItem(storageKey, config[key])
          }
        }
        alert('配置导入成功，页面将刷新')
        window.location.reload()
      } catch {
        alert('配置文件解析失败')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="px-4 pb-6 space-y-6"
    >
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-800 transition-colors"
        >
          <ChevronRight className="w-5 h-5 rotate-180" />
        </button>
        <h2 className="text-base font-semibold text-surface-100">其它设置</h2>
      </div>

      {/* 定时关闭 */}
      <div className="space-y-3">
        <label className="text-xs text-surface-400 font-medium uppercase tracking-wider">定时关闭</label>
        <div className="grid grid-cols-4 gap-2">
          {([
            { value: 'off', label: '关闭' },
            { value: '15', label: '15分钟' },
            { value: '30', label: '30分钟' },
            { value: '60', label: '60分钟' },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              onClick={() => applyTimer(opt.value)}
              className={`p-2.5 rounded-xl border text-xs transition-all ${
                timer === opt.value
                  ? 'bg-primary-500/10 border-primary-500/30 text-primary-400'
                  : 'bg-surface-800/50 border-surface-700/50 text-surface-400 hover:border-surface-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {timer === 'custom' && (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={customMinutes}
              onChange={(e) => {
                setCustomMinutes(e.target.value)
                localStorage.setItem('musicfree.timer.custom', e.target.value)
              }}
              className="w-20 px-3 py-2 bg-surface-800 border border-surface-700 rounded-xl text-sm text-surface-200"
              min="1"
              max="480"
            />
            <span className="text-xs text-surface-500">分钟</span>
          </div>
        )}
      </div>

      {/* 语言 */}
      <div className="space-y-3">
        <label className="text-xs text-surface-400 font-medium uppercase tracking-wider">语言</label>
        <div className="grid grid-cols-3 gap-2">
          {([
            { value: 'zh-CN', label: '简体中文' },
            { value: 'zh-TW', label: '繁體中文' },
            { value: 'en', label: 'English' },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              onClick={() => applyLanguage(opt.value)}
              className={`p-2.5 rounded-xl border text-xs transition-all ${
                language === opt.value
                  ? 'bg-primary-500/10 border-primary-500/30 text-primary-400'
                  : 'bg-surface-800/50 border-surface-700/50 text-surface-400 hover:border-surface-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 备份与恢复 */}
      <div className="space-y-3">
        <label className="text-xs text-surface-400 font-medium uppercase tracking-wider">备份与恢复</label>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-surface-800/50 border border-surface-700/50 text-surface-400 hover:border-surface-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="text-xs">导出配置</span>
          </button>
          <label className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-surface-800/50 border border-surface-700/50 text-surface-400 hover:border-surface-600 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            <span className="text-xs">导入配置</span>
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
        </div>
      </div>
    </motion.div>
  )
}

// 网站说明
function AboutSection({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="px-4 pb-6 space-y-6"
    >
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-800 transition-colors"
        >
          <ChevronRight className="w-5 h-5 rotate-180" />
        </button>
        <h2 className="text-base font-semibold text-surface-100">网站说明</h2>
      </div>

      <div className="space-y-4">
        {/* Logo & 标题 */}
        <div className="flex flex-col items-center py-6">
          <div className="w-16 h-16 rounded-2xl bg-primary-500/20 flex items-center justify-center mb-3">
            <Music2 className="w-8 h-8 text-primary-400" />
          </div>
          <h3 className="text-lg font-bold text-surface-100">MusicFreeWeb</h3>
          <p className="text-xs text-surface-500 mt-1">插件化音乐播放器</p>
          <span className="mt-2 px-2 py-0.5 rounded-full bg-surface-800 text-surface-500 text-[10px]">
            {APP_VERSION}
          </span>
        </div>

        {/* 关于 */}
        <div className="p-4 rounded-2xl bg-surface-800/50 border border-surface-700/50 space-y-3">
          <p className="text-sm text-surface-300 leading-relaxed">
            MusicFreeWeb 是基于 MusicFree 开源项目的 Web 版本实现。
          </p>
          <p className="text-sm text-surface-300 leading-relaxed">
            MusicFree 是一款插件化、定制化、无广告的免费音乐播放器，由猫头猫（maotoumao）开发并开源。
          </p>
          <p className="text-sm text-surface-300 leading-relaxed">
            本项目的插件协议与 MusicFree 保持一致，所有插件均可在 MusicFree 桌面端和移动端通用。
          </p>
        </div>

        {/* 链接 */}
        <div className="space-y-2">
          <a
            href="https://github.com/maotoumao/MusicFreeDesktop"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl bg-surface-800/50 border border-surface-700/50 hover:bg-surface-700/50 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-primary-400 flex-shrink-0" />
            <span className="text-sm text-surface-300">MusicFree 官方项目</span>
          </a>
          <a
            href="https://gitee.com/koujiao/MusicFreeWeb-tianpeng"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl bg-surface-800/50 border border-surface-700/50 hover:bg-surface-700/50 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-primary-400 flex-shrink-0" />
            <span className="text-sm text-surface-300">本项目源代码</span>
          </a>
        </div>

        {/* 协议 */}
        <div className="p-4 rounded-2xl bg-surface-800/30 border border-surface-700/30">
          <p className="text-xs text-surface-500 text-center">
            MusicFree 遵循 AGPL-3.0 协议开源
          </p>
        </div>
      </div>
    </motion.div>
  )
}
