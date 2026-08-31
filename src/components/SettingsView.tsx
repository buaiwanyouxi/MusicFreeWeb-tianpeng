import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Sun,
  Moon,
  Monitor,
  Image,
  Type,
  Clock,
  Download,
  Upload,
  Info,
  ChevronRight,
  ExternalLink,
  RotateCcw,
  Palette,
  Music2,
  Pipette,
  Cloud,
  CloudUpload,
  CloudDownload,
  Bug,
} from 'lucide-react'
import { startTimer, clearTimer } from '../lib/sleepTimer'
import { usePlayerStore } from '../stores/playerStore'

type ThemeMode = 'light' | 'dark' | 'system'
type FontSize = 'small' | 'medium' | 'large'
type TimerOption = 'off' | '15' | '30' | '60' | 'custom'
type Language = 'zh-CN' | 'zh-TW' | 'en'
type SubTab = 'basic' | 'other' | 'about'

const APP_VERSION = 'v1.0.0'

const FONT_FAMILIES = [
  { value: 'system-ui, sans-serif', label: '系统默认' },
  { value: '"DM Sans", system-ui, sans-serif', label: 'DM Sans' },
  { value: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif', label: '思源黑体' },
  { value: '"Georgia", "Noto Serif SC", serif', label: '衬线体' },
  { value: '"JetBrains Mono", "Fira Code", monospace', label: '等宽体' },
]

interface SettingsViewProps {
  initialSubTab?: SubTab
}

export function SettingsView({ initialSubTab = 'basic' }: SettingsViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>(initialSubTab)

  useEffect(() => {
    setActiveSubTab(initialSubTab)
  }, [initialSubTab])

  const subTabs = [
    { id: 'basic' as const, label: '基础设置', icon: Palette },
    { id: 'other' as const, label: '其它设置', icon: Clock },
    { id: 'about' as const, label: '网站说明', icon: Info },
  ]

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <div className="px-4 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-3 py-4">
          <Music2 className="w-5 h-5 text-primary-400" />
          <h2 className="text-lg font-semibold text-surface-100">设置</h2>
        </div>

        {/* 子标签切换 */}
        <div className="flex gap-1 mb-4 p-1 glass rounded-xl">
          {subTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeSubTab === tab.id
                  ? 'bg-primary-500/15 text-primary-400'
                  : 'text-surface-400 hover:text-surface-200'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1">
        {activeSubTab === 'basic' && <BasicSettings />}
        {activeSubTab === 'other' && <OtherSettings />}
        {activeSubTab === 'about' && <AboutSection />}
      </div>
    </div>
  )
}

// 设置项标签
function SettingLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-surface-400 mb-2">{children}</p>
}

// 基础设置
function BasicSettings() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('musicfree.theme') as ThemeMode) || 'dark'
  })
  const [fontSize, setFontSize] = useState<FontSize>(() => {
    return (localStorage.getItem('musicfree.fontSize') as FontSize) || 'medium'
  })
  const [fontFamily, setFontFamily] = useState<string>(() => {
    return localStorage.getItem('musicfree.fontFamily') || FONT_FAMILIES[0].value
  })
  const [accentColor, setAccentColor] = useState<string>(() => {
    return localStorage.getItem('musicfree.accentColor') || '#ed741e'
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

  const applyFontFamily = (family: string) => {
    setFontFamily(family)
    localStorage.setItem('musicfree.fontFamily', family)
    document.body.style.fontFamily = family
  }

  const applyAccentColor = (color: string) => {
    setAccentColor(color)
    localStorage.setItem('musicfree.accentColor', color)
    document.documentElement.style.setProperty('--color-primary', color)
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 pb-6">
      <div className="max-w-2xl mx-auto w-full space-y-4">
        {/* 主题 */}
        <div className="glass rounded-xl p-4">
          <SettingLabel>主题</SettingLabel>
          <div className="grid grid-cols-3 gap-2">
            {([
              { value: 'light', icon: Sun, label: '浅色' },
              { value: 'dark', icon: Moon, label: '深色' },
              { value: 'system', icon: Monitor, label: '跟随系统' },
            ] as const).map((opt) => (
              <button
                key={opt.value}
                onClick={() => applyTheme(opt.value)}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all ${
                  theme === opt.value
                    ? 'bg-primary-500/15 text-primary-400 ring-1 ring-primary-500/30'
                    : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
                }`}
              >
                <opt.icon className="w-5 h-5" />
                <span className="text-xs">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 强调色 */}
        <div className="glass rounded-xl p-4">
          <SettingLabel>强调色</SettingLabel>
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              {['#ed741e', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b', '#ec4899', '#06b6d4'].map((color) => (
                <button
                  key={color}
                  onClick={() => applyAccentColor(color)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    accentColor === color ? 'ring-2 ring-offset-2 ring-offset-surface-900 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color, outlineColor: accentColor === color ? color : undefined }}
                />
              ))}
            </div>
            <label className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-surface-800 text-surface-400 text-xs cursor-pointer hover:bg-surface-700">
              <Pipette className="w-3.5 h-3.5" />
              <span>自定义</span>
              <input
                type="color"
                value={accentColor}
                onChange={(e) => applyAccentColor(e.target.value)}
                className="absolute opacity-0 w-0 h-0"
              />
            </label>
          </div>
        </div>

        {/* 字体 */}
        <div className="glass rounded-xl p-4">
          <SettingLabel>字体</SettingLabel>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {FONT_FAMILIES.map((f) => (
              <button
                key={f.value}
                onClick={() => applyFontFamily(f.value)}
                className={`p-2.5 rounded-lg text-xs transition-all text-left ${
                  fontFamily === f.value
                    ? 'bg-primary-500/15 text-primary-400 ring-1 ring-primary-500/30'
                    : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
                }`}
                style={{ fontFamily: f.value }}
              >
                {f.label}
                <span className="block text-[10px] text-surface-500 mt-0.5">AaBbCc</span>
              </button>
            ))}
          </div>
        </div>

        {/* 字体大小 */}
        <div className="glass rounded-xl p-4">
          <SettingLabel>字体大小</SettingLabel>
          <div className="grid grid-cols-3 gap-2">
            {([
              { value: 'small', label: '小', size: '14px' },
              { value: 'medium', label: '中', size: '16px' },
              { value: 'large', label: '大', size: '18px' },
            ] as const).map((opt) => (
              <button
                key={opt.value}
                onClick={() => applyFontSize(opt.value)}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${
                  fontSize === opt.value
                    ? 'bg-primary-500/15 text-primary-400 ring-1 ring-primary-500/30'
                    : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
                }`}
              >
                <Type className="w-5 h-5" />
                <span className="text-xs">{opt.label}</span>
                <span className="text-[10px] text-surface-500">{opt.size}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 壁纸 */}
        <div className="glass rounded-xl p-4">
          <SettingLabel>壁纸</SettingLabel>
          <div className="flex gap-2">
            <label className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-lg bg-surface-800 text-surface-300 text-sm hover:bg-surface-700 transition-colors cursor-pointer">
              <Image className="w-4 h-4" />
              <span>选择图片</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleWallpaperUpload} />
            </label>
            {wallpaperUrl && (
              <button
                onClick={resetWallpaper}
                className="flex items-center justify-center gap-2 px-4 p-2.5 rounded-lg bg-surface-800 text-surface-300 text-sm hover:bg-red-500/15 hover:text-red-400 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>重置</span>
              </button>
            )}
          </div>
          {wallpaperUrl && (
            <div className="relative h-24 mt-3 rounded-lg overflow-hidden">
              <img src={wallpaperUrl} alt="wallpaper" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// 其它设置
function OtherSettings() {
  const [timer, setTimer] = useState<TimerOption>(() => {
    return (localStorage.getItem('musicfree.timer') as TimerOption) || 'off'
  })
  const [customMinutes, setCustomMinutes] = useState<string>(() => {
    return localStorage.getItem('musicfree.timer.custom') || '45'
  })
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('musicfree.language') as Language) || 'zh-CN'
  })
  
  // WebDAV配置状态
  const [webdavUrl, setWebdavUrl] = useState<string>(() => {
    return localStorage.getItem('musicfree.webdav.url') || ''
  })
  const [webdavUser, setWebdavUser] = useState<string>(() => {
    return localStorage.getItem('musicfree.webdav.user') || ''
  })
  const [webdavPass, setWebdavPass] = useState<string>(() => {
    return localStorage.getItem('musicfree.webdav.pass') || ''
  })
  const [webdavLoading, setWebdavLoading] = useState<boolean>(false)

  const applyTimer = (value: TimerOption) => {
    setTimer(value)
    localStorage.setItem('musicfree.timer', value)
    
    // 实际启动或清除定时器
    if (value === 'off') {
      clearTimer()
    } else {
      const minutes = value === 'custom' 
        ? parseInt(customMinutes || '45', 10)
        : parseInt(value, 10)
      
      if (minutes > 0) {
        startTimer(minutes, () => {
          // 定时器到期回调：暂停播放
          usePlayerStore.getState().setIsPlaying(false)
        })
      }
    }
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
      fontFamily: localStorage.getItem('musicfree.fontFamily'),
      accentColor: localStorage.getItem('musicfree.accentColor'),
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
          fontFamily: 'musicfree.fontFamily',
          accentColor: 'musicfree.accentColor',
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

  // WebDAV备份功能
  const handleWebdavUpload = async () => {
    if (!webdavUrl) {
      alert('请填写WebDAV地址')
      return
    }
    
    setWebdavLoading(true)
    try {
      const config = {
        version: APP_VERSION,
        exportedAt: new Date().toISOString(),
        theme: localStorage.getItem('musicfree.theme'),
        fontSize: localStorage.getItem('musicfree.fontSize'),
        fontFamily: localStorage.getItem('musicfree.fontFamily'),
        accentColor: localStorage.getItem('musicfree.accentColor'),
        language: localStorage.getItem('musicfree.language'),
        subscriptions: localStorage.getItem('musicfree.subscriptions'),
        plugins: localStorage.getItem('musicfree.plugins.cache'),
        activePlugin: localStorage.getItem('musicfree.active.plugin'),
        userVariables: localStorage.getItem('musicfree.userVariables'),
        importedSheets: localStorage.getItem('musicfree.importedSheets'),
      }
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      
      // 如果有用户名和密码，添加Basic认证
      if (webdavUser && webdavPass) {
        headers['Authorization'] = 'Basic ' + btoa(`${webdavUser}:${webdavPass}`)
      }
      
      // 处理URL：如果以/结尾，添加文件名
      let uploadUrl = webdavUrl.trim()
      if (uploadUrl.endsWith('/')) {
        uploadUrl += 'musicfree-backup.json'
      } else if (!uploadUrl.toLowerCase().endsWith('.json')) {
        uploadUrl += '/musicfree-backup.json'
      }
      
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers,
        body: JSON.stringify(config, null, 2),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      alert('配置已备份到WebDAV')
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      if (errorMsg.includes('Failed to fetch')) {
        alert('WebDAV备份失败：网络连接失败或CORS限制\n\n可能原因：\n1. WebDAV服务器不支持跨域访问\n2. 网络无法访问该地址\n3. 请检查WebDAV地址是否正确')
      } else {
        alert(`WebDAV备份失败：${errorMsg}`)
      }
    } finally {
      setWebdavLoading(false)
    }
  }

  // WebDAV恢复功能
  const handleWebdavDownload = async () => {
    if (!webdavUrl) {
      alert('请填写WebDAV地址')
      return
    }
    
    setWebdavLoading(true)
    try {
      const headers: Record<string, string> = {}
      
      // 如果有用户名和密码，添加Basic认证
      if (webdavUser && webdavPass) {
        headers['Authorization'] = 'Basic ' + btoa(`${webdavUser}:${webdavPass}`)
      }
      
      const response = await fetch(webdavUrl, {
        method: 'GET',
        headers,
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const config = await response.json()
      if (!config.version) {
        alert('无效的配置文件')
        return
      }
      
      const mappings: Record<string, string> = {
        theme: 'musicfree.theme',
        fontSize: 'musicfree.fontSize',
        fontFamily: 'musicfree.fontFamily',
        accentColor: 'musicfree.accentColor',
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
      
      alert('配置已从WebDAV恢复，页面将刷新')
      window.location.reload()
    } catch (error) {
      alert(`WebDAV恢复失败：${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setWebdavLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 pb-6">
      <div className="max-w-2xl mx-auto w-full space-y-4">
        {/* 定时关闭 */}
        <div className="glass rounded-xl p-4">
          <SettingLabel>定时关闭</SettingLabel>
          <div className="grid grid-cols-5 gap-2">
            {([
              { value: 'off', label: '关闭' },
              { value: '15', label: '15分钟' },
              { value: '30', label: '30分钟' },
              { value: '60', label: '60分钟' },
              { value: 'custom', label: '自定义' },
            ] as const).map((opt) => (
              <button
                key={opt.value}
                onClick={() => applyTimer(opt.value)}
                className={`p-2.5 rounded-lg text-xs transition-all ${
                  timer === opt.value
                    ? 'bg-primary-500/15 text-primary-400 ring-1 ring-primary-500/30'
                    : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {timer === 'custom' && (
            <div className="flex items-center gap-2 mt-3">
              <input
                type="number"
                value={customMinutes}
                onChange={(e) => {
                  const value = e.target.value
                  setCustomMinutes(value)
                  localStorage.setItem('musicfree.timer.custom', value)
                  // 实时更新定时器
                  const minutes = parseInt(value, 10)
                  if (minutes > 0) {
                    startTimer(minutes, () => {
                      usePlayerStore.getState().setIsPlaying(false)
                    })
                  }
                }}
                className="w-20 bg-surface-800 rounded-lg py-2 px-3 text-sm text-surface-100"
                min="1"
                max="480"
              />
              <span className="text-xs text-surface-500">分钟（输入后自动应用）</span>
            </div>
          )}
        </div>

        {/* 播放设置 */}
        <div className="glass rounded-xl p-4">
          <SettingLabel>播放设置</SettingLabel>
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex-1">
                <p className="text-sm text-surface-200">边放边下</p>
                <p className="text-xs text-surface-500 mt-0.5">播放时自动缓存歌曲，下次播放更快</p>
              </div>
              <input
                type="checkbox"
                checked={localStorage.getItem('musicfree.downloadWhilePlaying') === 'true'}
                onChange={(e) => {
                  localStorage.setItem('musicfree.downloadWhilePlaying', e.target.checked ? 'true' : 'false')
                }}
                className="w-10 h-5 rounded-full bg-surface-700 appearance-none relative cursor-pointer transition-colors checked:bg-primary-500"
              />
            </label>
          </div>
        </div>

        {/* 语言 */}
        <div className="glass rounded-xl p-4">
          <SettingLabel>语言</SettingLabel>
          <div className="grid grid-cols-3 gap-2">
            {([
              { value: 'zh-CN', label: '简体中文' },
              { value: 'zh-TW', label: '繁體中文' },
              { value: 'en', label: 'English' },
            ] as const).map((opt) => (
              <button
                key={opt.value}
                onClick={() => applyLanguage(opt.value)}
                className={`p-2.5 rounded-lg text-xs transition-all ${
                  language === opt.value
                    ? 'bg-primary-500/15 text-primary-400 ring-1 ring-primary-500/30'
                    : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 备份与恢复 */}
        <div className="glass rounded-xl p-4">
          <SettingLabel>备份与恢复</SettingLabel>
          <div className="flex gap-2 mb-4">
            <button
              onClick={handleExport}
              className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-lg bg-surface-800 text-surface-300 text-sm hover:bg-surface-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>导出配置</span>
            </button>
            <label className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-lg bg-surface-800 text-surface-300 text-sm hover:bg-surface-700 transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>导入配置</span>
              <input type="file" accept=".json" className="hidden" onChange={handleImport} />
            </label>
          </div>
          
          {/* WebDAV配置 */}
          <div className="border-t border-surface-700 pt-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Cloud className="w-4 h-4 text-primary-400" />
              <span className="text-sm text-surface-200">WebDAV 云备份</span>
            </div>
            
            <div className="space-y-2 mb-3">
              <input
                type="text"
                value={webdavUrl}
                onChange={(e) => {
                  setWebdavUrl(e.target.value)
                  localStorage.setItem('musicfree.webdav.url', e.target.value)
                }}
                placeholder="WebDAV地址（如：https://dav.example.com/backup.json）"
                className="w-full bg-surface-800 rounded-lg py-2 px-3 text-sm text-surface-100 placeholder-surface-500"
              />
              <input
                type="text"
                value={webdavUser}
                onChange={(e) => {
                  setWebdavUser(e.target.value)
                  localStorage.setItem('musicfree.webdav.user', e.target.value)
                }}
                placeholder="用户名（可选）"
                className="w-full bg-surface-800 rounded-lg py-2 px-3 text-sm text-surface-100 placeholder-surface-500"
              />
              <input
                type="password"
                value={webdavPass}
                onChange={(e) => {
                  setWebdavPass(e.target.value)
                  localStorage.setItem('musicfree.webdav.pass', e.target.value)
                }}
                placeholder="密码（可选）"
                className="w-full bg-surface-800 rounded-lg py-2 px-3 text-sm text-surface-100 placeholder-surface-500"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleWebdavUpload}
                disabled={webdavLoading}
                className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-lg bg-surface-800 text-surface-300 text-sm hover:bg-surface-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CloudUpload className="w-4 h-4" />
                <span>{webdavLoading ? '备份中...' : 'WebDAV备份'}</span>
              </button>
              <button
                onClick={handleWebdavDownload}
                disabled={webdavLoading}
                className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-lg bg-surface-800 text-surface-300 text-sm hover:bg-surface-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CloudDownload className="w-4 h-4" />
                <span>{webdavLoading ? '恢复中...' : 'WebDAV恢复'}</span>
              </button>
            </div>
            
            <p className="text-xs text-surface-500 mt-2">
              配置信息已保存到本地，刷新页面不会丢失
            </p>
          </div>
        </div>

        {/* 插件调试日志 */}
        <DebugLogSection />
      </div>
    </motion.div>
  )
}

// 调试日志区
function DebugLogSection() {
  const [debugEnabled, setDebugEnabled] = useState(() => {
    return localStorage.getItem('musicfree.debugLogs') === 'true'
  })
  const [showPanel, setShowPanel] = useState(false)

  const toggleDebug = (enabled: boolean) => {
    setDebugEnabled(enabled)
    localStorage.setItem('musicfree.debugLogs', enabled ? 'true' : 'false')
    // 动态导入避免循环依赖
    import('../lib/pluginHost').then(({ enableDebugLogs }) => {
      enableDebugLogs(enabled)
    })
  }

  return (
    <>
      <div className="glass rounded-xl p-4">
        <SettingLabel>插件调试日志</SettingLabel>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-surface-200">启用调试日志</p>
            <p className="text-xs text-surface-500 mt-0.5">记录插件请求、URL 重写、代理命中等详细信息</p>
          </div>
          <input
            type="checkbox"
            checked={debugEnabled}
            onChange={(e) => toggleDebug(e.target.checked)}
            className="w-10 h-5 rounded-full bg-surface-700 appearance-none relative cursor-pointer transition-colors checked:bg-primary-500"
          />
        </div>
        {debugEnabled && (
          <button
            onClick={() => setShowPanel(true)}
            className="w-full mt-3 flex items-center justify-center gap-2 p-2.5 rounded-lg bg-surface-800 text-surface-300 text-sm hover:bg-surface-700 transition-colors"
          >
            <Bug className="w-4 h-4" />
            <span>查看调试面板</span>
          </button>
        )}
      </div>

      {showPanel && (
        <DebugPanelLazy onClose={() => setShowPanel(false)} />
      )}
    </>
  )
}

function DebugPanelLazy({ onClose }: { onClose: () => void }) {
  const [Comp, setComp] = useState<React.ComponentType<{ onClose: () => void }> | null>(null)

  useEffect(() => {
    import('./DebugPanel').then(mod => setComp(() => mod.DebugPanel))
  }, [])

  if (!Comp) return null
  return <Comp onClose={onClose} />
}

// 网站说明
function AboutSection() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 pb-6">
      <div className="max-w-2xl mx-auto w-full space-y-4">
        {/* Logo & 标题 */}
        <div className="glass rounded-xl p-6 flex flex-col items-center">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/20 flex items-center justify-center mb-3">
            <Music2 className="w-7 h-7 text-primary-400" />
          </div>
          <h3 className="text-base font-bold text-surface-100">MusicFreeWeb</h3>
          <p className="text-xs text-surface-500 mt-1">插件化音乐播放器</p>
          <span className="mt-2 px-2.5 py-0.5 rounded-full bg-surface-800 text-surface-500 text-[10px]">
            {APP_VERSION}
          </span>
        </div>

        {/* 关于 */}
        <div className="glass rounded-xl p-4 space-y-3">
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
        <div className="glass rounded-xl overflow-hidden">
          <a
            href="https://github.com/maotoumao/MusicFreeDesktop"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 hover:bg-surface-700/30 transition-colors border-b border-surface-800"
          >
            <ExternalLink className="w-4 h-4 text-primary-400 flex-shrink-0" />
            <span className="text-sm text-surface-300 flex-1">MusicFree 官方项目</span>
            <ChevronRight className="w-4 h-4 text-surface-600" />
          </a>
          <a
            href="https://github.com/your-repo/MusicFreeWeb"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 hover:bg-surface-700/30 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-primary-400 flex-shrink-0" />
            <span className="text-sm text-surface-300 flex-1">本项目源代码</span>
            <ChevronRight className="w-4 h-4 text-surface-600" />
          </a>
        </div>

        {/* 协议 */}
        <div className="glass rounded-xl p-4">
          <p className="text-xs text-surface-500 text-center">
            MusicFree 遵循 AGPL-3.0 协议开源
          </p>
        </div>
      </div>
    </motion.div>
  )
}
