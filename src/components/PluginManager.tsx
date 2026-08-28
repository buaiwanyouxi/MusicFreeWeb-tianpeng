import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Trash2,
  RefreshCw,
  Loader2,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Radio,
  Link,
  Clock,
  Rss,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Download,
  Power,
  PowerOff,
  Settings,
  ListMusic,
} from 'lucide-react'
import { usePluginStore } from '../stores/pluginStore'
import { usePlayerStore } from '../stores/playerStore'

export function PluginManager() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        <SubscriptionsTab />
      </div>
    </div>
  )
}

// 订阅源管理 Tab
function SubscriptionsTab() {
  const {
    subscriptions,
    plugins,
    pluginsLoading,
    addSubscription,
    removeSubscription,
    refreshSubscription,
    refreshAllSubscriptions,
    importDefaultFeeds,
    clearAllSubscriptions,
    removePlugin,
    updatePlugin,
    togglePluginEnabled,
    pluginUserVariables,
    setUserVariable,
    removeUserVariable,
  } = usePluginStore()
  
  const [showAddForm, setShowAddForm] = useState(false)
  const [newUrl, setNewUrl] = useState('')
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [refreshingId, setRefreshingId] = useState<string | null>(null)
  const [refreshingAll, setRefreshingAll] = useState(false)
  const [expandedSubs, setExpandedSubs] = useState<Set<string>>(new Set())
  const [settingsPluginId, setSettingsPluginId] = useState<string | null>(null)
  const [newVarKey, setNewVarKey] = useState('')
  const [newVarValue, setNewVarValue] = useState('')
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  
  // 导入歌单相关状态
  const [importSheetPluginId, setImportSheetPluginId] = useState<string | null>(null)
  const [sheetUrl, setSheetUrl] = useState('')
  const [importingSheet, setImportingSheet] = useState(false)
  const [sheetImportError, setSheetImportError] = useState<string | null>(null)
  
  const { importMusicSheet } = usePluginStore()
  const { setPlaylist, setIsPlaying } = usePlayerStore()
  
  // 导入歌单
  const handleImportSheet = async () => {
    if (!importSheetPluginId || !sheetUrl.trim()) return
    
    setImportingSheet(true)
    setSheetImportError(null)
    
    try {
      const result = await importMusicSheet(importSheetPluginId, sheetUrl.trim())
      if (result && result.tracks && result.tracks.length > 0) {
        setPlaylist(result.tracks, result.title || '导入的歌单')
        setIsPlaying(false)
        setImportSheetPluginId(null)
        setSheetUrl('')
      } else {
        setSheetImportError('歌单为空或导入失败')
      }
    } catch (error) {
      setSheetImportError(error instanceof Error ? error.message : '导入失败')
    } finally {
      setImportingSheet(false)
    }
  }
  
  // 获取订阅源下的插件
  const getPluginsForSubscription = (subscriptionId: string) => {
    return plugins.filter(p => p.meta.id.startsWith(subscriptionId))
  }
  
  // 添加订阅源
  const handleAdd = async () => {
    if (!newUrl.trim()) return
    
    setAdding(true)
    setAddError(null)
    
    try {
      await addSubscription(newUrl.trim(), newName.trim() || undefined)
      setNewUrl('')
      setNewName('')
      setShowAddForm(false)
    } catch (error) {
      setAddError(error instanceof Error ? error.message : '添加失败')
    } finally {
      setAdding(false)
    }
  }
  
  // 刷新单个订阅源
  const handleRefresh = async (subscriptionId: string) => {
    setRefreshingId(subscriptionId)
    try {
      await refreshSubscription(subscriptionId)
    } catch (error) {
      console.error('刷新失败:', error)
    } finally {
      setRefreshingId(null)
    }
  }
  
  // 刷新所有订阅源
  const handleRefreshAll = async () => {
    setRefreshingAll(true)
    try {
      await refreshAllSubscriptions()
    } catch (error) {
      console.error('刷新失败:', error)
    } finally {
      setRefreshingAll(false)
    }
  }
  
  // 删除订阅源
  const handleRemove = (subscriptionId: string) => {
    if (confirm('确定要删除这个订阅源吗？')) {
      removeSubscription(subscriptionId)
    }
  }
  
  // 导入预设配置
  const handleImportDefault = async () => {
    setImporting(true)
    setImportError(null)
    try {
      await importDefaultFeeds()
    } catch (error) {
      setImportError(error instanceof Error ? error.message : '导入失败')
    } finally {
      setImporting(false)
    }
  }
  
  // 清空所有订阅源
  const handleClearAll = () => {
    if (confirm('确定要清空所有订阅源吗？此操作不可撤销。')) {
      clearAllSubscriptions()
    }
  }
  
  // 切换展开
  const toggleExpand = (subscriptionId: string) => {
    setExpandedSubs(prev => {
      const next = new Set(prev)
      if (next.has(subscriptionId)) {
        next.delete(subscriptionId)
      } else {
        next.add(subscriptionId)
      }
      return next
    })
  }
  
  // 格式化时间
  const formatTime = (timestamp: number) => {
    if (!timestamp) return '从未更新'
    const date = new Date(timestamp)
    return date.toLocaleString('zh-CN', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  
  // 统计插件状态
  const getPluginStats = (subscriptionId: string) => {
    const subPlugins = getPluginsForSubscription(subscriptionId)
    const ready = subPlugins.filter(p => p.status === 'ready').length
    const error = subPlugins.filter(p => p.status === 'error').length
    const loading = subPlugins.filter(p => p.status === 'loading').length
    return { total: subPlugins.length, ready, error, loading }
  }

  return (
    <div className="h-full flex flex-col px-4">
      <div className="max-w-2xl mx-auto w-full h-full flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Rss className="w-5 h-5 text-primary-400" />
            <h2 className="text-lg font-semibold text-surface-100">订阅源管理</h2>
          </div>
          
          <div className="flex items-center gap-2">
            {/* 刷新所有 */}
            <button
              onClick={handleRefreshAll}
              disabled={refreshingAll || subscriptions.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-surface-800 hover:bg-surface-700 text-surface-300 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshingAll ? 'animate-spin' : ''}`} />
              <span>全部刷新</span>
            </button>
            
            {/* 添加按钮 */}
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-primary-500 hover:bg-primary-400 text-surface-950 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>添加</span>
            </button>
          </div>
        </div>
        
        {/* 添加表单 */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="glass rounded-xl p-4 mb-4">
              <h3 className="text-sm font-medium text-surface-200 mb-3">添加订阅源</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-surface-400 mb-1 block">订阅源地址 *</label>
                  <div className="relative">
                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                    <input
                      type="url"
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      placeholder="https://example.com/plugins.json"
                      className="w-full bg-surface-800 rounded-lg py-2.5 pl-9 pr-3 text-sm text-surface-100 placeholder-surface-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-surface-400 mb-1 block">名称（可选）</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="我的订阅源"
                    className="w-full bg-surface-800 rounded-lg py-2.5 px-3 text-sm text-surface-100 placeholder-surface-500"
                  />
                </div>
                
                {addError && (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{addError}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleAdd}
                    disabled={adding || !newUrl.trim()}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary-500 text-surface-950 text-sm font-medium hover:bg-primary-400 transition-colors disabled:opacity-50"
                  >
                    {adding ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>添加中...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>确认添加</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowAddForm(false)
                      setNewUrl('')
                      setNewName('')
                      setAddError(null)
                    }}
                    className="px-4 py-2.5 rounded-lg bg-surface-800 text-surface-300 text-sm hover:bg-surface-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 单插件导入 */}
      <SinglePluginImport
        importSinglePlugin={usePluginStore.getState().importSinglePlugin}
      />

        {/* 统计信息 */}
        <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1.5 text-surface-400">
          <Rss className="w-4 h-4" />
          <span>{subscriptions.length} 个订阅源</span>
        </div>
        <div className="flex items-center gap-1.5 text-surface-400">
          <Radio className="w-4 h-4" />
          <span>{plugins.length} 个插件</span>
        </div>
        {pluginsLoading && (
          <div className="flex items-center gap-1.5 text-primary-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>加载中...</span>
          </div>
        )}
        </div>
        
        {/* 订阅源列表 */}
        <div className="flex-1 overflow-y-auto pb-32 space-y-3">
          {subscriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-surface-500">
              <Rss className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-surface-300 mb-2">暂无订阅源</p>
              <p className="text-sm mb-6">点击下方按钮导入预设音乐源，或手动添加订阅源</p>
              
              {importError && (
                <div className="flex items-center gap-2 text-red-400 text-sm mb-4">
                  <AlertCircle className="w-4 h-4" />
                  <span>{importError}</span>
                </div>
              )}
              
              <button
                onClick={handleImportDefault}
                disabled={importing}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-400 text-surface-950 font-medium transition-colors disabled:opacity-50"
              >
                {importing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>导入中...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>导入预设配置</span>
                  </>
                )}
              </button>
              
              <p className="text-xs text-surface-600 mt-4">
                预设配置包含 6 个音乐源：小秋、小蜗、小芸、小枸、bilibili、元力QQ
              </p>
            </div>
          ) : (
            subscriptions.map((subscription) => {
              const stats = getPluginStats(subscription.id)
              const isExpanded = expandedSubs.has(subscription.id)
              const subPlugins = getPluginsForSubscription(subscription.id)
              
              return (
                <motion.div
                  key={subscription.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-xl overflow-hidden"
                >
                {/* 订阅源头部 */}
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500/20 to-primary-600/20 flex items-center justify-center flex-shrink-0">
                      <Rss className="w-5 h-5 text-primary-400" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-surface-100 truncate">
                        {subscription.name}
                      </h3>
                      <p className="text-xs text-surface-500 truncate mt-0.5">
                        {subscription.url}
                      </p>
                      
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        {/* 插件统计 */}
                        <div className="flex items-center gap-1.5">
                          {stats.ready > 0 && (
                            <span className="flex items-center gap-0.5 text-green-400">
                              <CheckCircle2 className="w-3 h-3" />
                              {stats.ready}
                            </span>
                          )}
                          {stats.error > 0 && (
                            <span className="flex items-center gap-0.5 text-red-400">
                              <XCircle className="w-3 h-3" />
                              {stats.error}
                            </span>
                          )}
                          {stats.loading > 0 && (
                            <span className="flex items-center gap-0.5 text-yellow-400">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              {stats.loading}
                            </span>
                          )}
                        </div>
                        
                        <span className="text-surface-600">•</span>
                        
                        {/* 更新时间 */}
                        <div className="flex items-center gap-1 text-surface-500">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(subscription.lastUpdated)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* 操作按钮 */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleRefresh(subscription.id)}
                        disabled={refreshingId === subscription.id}
                        className="p-2 rounded-lg text-surface-400 hover:text-primary-400 hover:bg-surface-800 transition-colors disabled:opacity-50"
                        title="刷新"
                      >
                        <RefreshCw className={`w-4 h-4 ${refreshingId === subscription.id ? 'animate-spin' : ''}`} />
                      </button>
                      
                      <button
                        onClick={() => handleRemove(subscription.id)}
                        className="p-2 rounded-lg text-surface-400 hover:text-red-400 hover:bg-surface-800 transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => toggleExpand(subscription.id)}
                        className="p-2 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-800 transition-colors"
                        title={isExpanded ? '收起' : '展开'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* 插件列表 */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-surface-800"
                    >
                      <div className="p-3 bg-surface-900/50 max-h-64 overflow-y-auto">
                        {subPlugins.length === 0 ? (
                          <p className="text-center text-surface-500 text-sm py-4">
                            无插件
                          </p>
                        ) : (
                          <div className="space-y-1.5">
                            {subPlugins.map((plugin) => (
                              <div key={plugin.meta.id}>
                              <div
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${plugin.meta.enabled ? 'bg-surface-800/50' : 'bg-surface-800/30 opacity-60'}`}
                              >
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                  !plugin.meta.enabled ? 'bg-surface-600' :
                                  plugin.status === 'ready' ? 'bg-green-400' :
                                  plugin.status === 'loading' ? 'bg-yellow-400 animate-pulse' :
                                  plugin.status === 'error' ? 'bg-red-400' :
                                  'bg-surface-500'
                                }`} />
                                
                                <span className={`text-sm flex-1 truncate ${plugin.meta.enabled ? 'text-surface-200' : 'text-surface-500'}`}>
                                  {plugin.meta.name}
                                </span>

                                {/* 能力标签 */}
                                {plugin.status === 'ready' && plugin.instance && (
                                  <div className="flex items-center gap-1">
                                    {plugin.instance.capabilities?.includes('importSheet') && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20" title="支持导入歌单">
                                        歌单
                                      </span>
                                    )}
                                    {plugin.instance.capabilities?.includes('importVideo') && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20" title="支持导入视频">
                                        视频
                                      </span>
                                    )}
                                    {plugin.instance.capabilities?.includes('qualitySelect') && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20" title="支持音质选择">
                                        音质
                                      </span>
                                    )}
                                  </div>
                                )}

                                {plugin.meta.version && (
                                  <span className="text-xs text-surface-500">
                                    v{plugin.meta.version}
                                  </span>
                                )}
                                
                                {plugin.status === 'error' && plugin.error && (
                                  <span className="text-xs text-red-400 truncate max-w-[80px]" title={plugin.error}>
                                    {plugin.error}
                                  </span>
                                )}

                                {/* 启用/禁用 */}
                                <button
                                  onClick={() => togglePluginEnabled(plugin.meta.id)}
                                  className={`p-1 rounded transition-colors ${plugin.meta.enabled ? 'text-green-400 hover:bg-green-400/10' : 'text-surface-500 hover:bg-surface-700'}`}
                                  title={plugin.meta.enabled ? '禁用' : '启用'}
                                >
                                  {plugin.meta.enabled ? <Power className="w-3.5 h-3.5" /> : <PowerOff className="w-3.5 h-3.5" />}
                                </button>

                                {/* 更新 */}
                                <button
                                  onClick={() => updatePlugin(plugin.meta.id)}
                                  disabled={plugin.status === 'loading'}
                                  className="p-1 rounded text-surface-400 hover:text-primary-400 hover:bg-primary-400/10 transition-colors disabled:opacity-50"
                                  title="更新"
                                >
                                  <RefreshCw className={`w-3.5 h-3.5 ${plugin.status === 'loading' ? 'animate-spin' : ''}`} />
                                </button>

                                {/* 导入歌单 */}
                                {plugin.status === 'ready' && plugin.instance?.capabilities?.includes('importSheet') && (
                                  <button
                                    onClick={() => setImportSheetPluginId(importSheetPluginId === plugin.meta.id ? null : plugin.meta.id)}
                                    className={`p-1 rounded transition-colors ${importSheetPluginId === plugin.meta.id ? 'text-blue-400 bg-blue-400/10' : 'text-surface-400 hover:text-blue-400 hover:bg-blue-400/10'}`}
                                    title="导入歌单"
                                  >
                                    <ListMusic className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {/* 设置（用户变量） */}
                                <button
                                  onClick={() => setSettingsPluginId(settingsPluginId === plugin.meta.id ? null : plugin.meta.id)}
                                  className={`p-1 rounded transition-colors ${settingsPluginId === plugin.meta.id ? 'text-primary-400 bg-primary-400/10' : 'text-surface-400 hover:text-primary-400 hover:bg-primary-400/10'}`}
                                  title="用户变量"
                                >
                                  <Settings className="w-3.5 h-3.5" />
                                </button>

                                {/* 卸载 */}
                                <button
                                  onClick={() => {
                                    if (confirm(`确定卸载「${plugin.meta.name}」？`)) {
                                      removePlugin(plugin.meta.id)
                                    }
                                  }}
                                  className="p-1 rounded text-surface-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                                  title="卸载"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* 用户变量编辑器 */}
                              {settingsPluginId === plugin.meta.id && (
                                <div className="mx-3 mb-2 p-2 rounded-lg bg-surface-900/80 border border-surface-700">
                                  <p className="text-xs text-surface-400 mb-2">用户变量（插件可通过 env.getUserVariables() 读取）</p>
                                  {pluginUserVariables[plugin.meta.id] && Object.keys(pluginUserVariables[plugin.meta.id]).length > 0 ? (
                                    <div className="space-y-1 mb-2">
                                      {Object.entries(pluginUserVariables[plugin.meta.id]).map(([key, value]) => (
                                        <div key={key} className="flex items-center gap-2 text-xs">
                                          <span className="text-primary-400 font-mono">{key}</span>
                                          <span className="text-surface-500">=</span>
                                          <span className="text-surface-300 font-mono flex-1 truncate">{value}</span>
                                          <button
                                            onClick={() => removeUserVariable(plugin.meta.id, key)}
                                            className="text-surface-500 hover:text-red-400 transition-colors"
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-surface-600 mb-2">暂无变量</p>
                                  )}
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="text"
                                      placeholder="key"
                                      value={newVarKey}
                                      onChange={(e) => setNewVarKey(e.target.value)}
                                      className="w-20 bg-surface-800 rounded px-1.5 py-1 text-xs text-surface-200 placeholder-surface-600"
                                    />
                                    <input
                                      type="text"
                                      placeholder="value"
                                      value={newVarValue}
                                      onChange={(e) => setNewVarValue(e.target.value)}
                                      className="flex-1 bg-surface-800 rounded px-1.5 py-1 text-xs text-surface-200 placeholder-surface-600"
                                    />
                                    <button
                                      onClick={() => {
                                        if (newVarKey.trim()) {
                                          setUserVariable(plugin.meta.id, newVarKey.trim(), newVarValue)
                                          setNewVarKey('')
                                          setNewVarValue('')
                                        }
                                      }}
                                      disabled={!newVarKey.trim()}
                                      className="p-1 rounded text-primary-400 hover:bg-primary-400/10 transition-colors disabled:opacity-30"
                                    >
                                      <Check className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              )}
                              
                              {/* 导入歌单对话框 */}
                              {importSheetPluginId === plugin.meta.id && (
                                <div className="mx-3 mb-2 p-3 rounded-lg bg-surface-900/80 border border-blue-500/30">
                                  <p className="text-xs text-surface-300 mb-2">输入歌单链接（支持QQ音乐、网易云音乐等）</p>
                                  <input
                                    type="text"
                                    placeholder="https://y.qq.com/..."
                                    value={sheetUrl}
                                    onChange={(e) => setSheetUrl(e.target.value)}
                                    className="w-full bg-surface-800 rounded px-3 py-2 text-xs text-surface-200 placeholder-surface-600 mb-2"
                                  />
                                  {sheetImportError && (
                                    <p className="text-xs text-red-400 mb-2">{sheetImportError}</p>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={handleImportSheet}
                                      disabled={importingSheet || !sheetUrl.trim()}
                                      className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-500/20 text-blue-400 text-xs hover:bg-blue-500/30 transition-colors disabled:opacity-50"
                                    >
                                      {importingSheet ? (
                                        <><Loader2 className="w-3 h-3 animate-spin" />导入中...</>
                                      ) : (
                                        <><Download className="w-3 h-3" />导入并播放</>
                                      )}
                                    </button>
                                    <button
                                      onClick={() => {
                                        setImportSheetPluginId(null)
                                        setSheetUrl('')
                                        setSheetImportError(null)
                                      }}
                                      className="px-3 py-1.5 rounded text-surface-400 text-xs hover:bg-surface-800 transition-colors"
                                    >
                                      取消
                                    </button>
                                  </div>
                                </div>
                              )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })
        )}
        
        {/* 底部操作区域 */}
        {subscriptions.length > 0 && (
          <div className="mt-6 pt-4 border-t border-surface-800">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* 导入预设配置 */}
              <button
                onClick={handleImportDefault}
                disabled={importing}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-surface-800 hover:bg-surface-700 text-surface-300 text-sm transition-colors disabled:opacity-50"
              >
                {importing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>导入中...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>导入预设配置</span>
                  </>
                )}
              </button>
              
              {/* 清空订阅列表 */}
              <button
                onClick={handleClearAll}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-surface-800 hover:bg-red-500/20 text-surface-400 hover:text-red-400 text-sm transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>清空订阅列表</span>
              </button>
            </div>
            
            {importError && (
              <div className="flex items-center gap-2 text-red-400 text-sm mt-3">
                <AlertCircle className="w-4 h-4" />
                <span>{importError}</span>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  )
}

// 单插件导入组件
function SinglePluginImport({ importSinglePlugin }: { importSinglePlugin: (source: string | File, name?: string) => Promise<void> }) {
  const [showForm, setShowForm] = useState(false)
  const [pluginUrl, setPluginUrl] = useState('')
  const [pluginName, setPluginName] = useState('')
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUrlImport = async () => {
    if (!pluginUrl.trim()) return
    setImporting(true)
    setImportError(null)
    setImportSuccess(null)
    try {
      await importSinglePlugin(pluginUrl.trim(), pluginName.trim() || undefined)
      setImportSuccess(`插件 ${pluginName.trim() || pluginUrl.trim().split('/').pop()} 导入成功`)
      setPluginUrl('')
      setPluginName('')
    } catch (error) {
      setImportError(error instanceof Error ? error.message : '导入失败')
    } finally {
      setImporting(false)
    }
  }

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setImportError(null)
    setImportSuccess(null)
    importSinglePlugin(file)
      .then(() => {
        setImportSuccess(`插件 ${file.name} 导入成功`)
      })
      .catch((error) => {
        setImportError(error instanceof Error ? error.message : '导入失败')
      })
      .finally(() => {
        setImporting(false)
      })
    e.target.value = ''
  }

  return (
    <div className="mb-4">
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full flex items-center gap-2 p-3 glass rounded-xl hover:bg-surface-700/30 transition-colors text-left"
      >
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500/20 to-primary-600/20 flex items-center justify-center flex-shrink-0">
          <Download className="w-5 h-5 text-primary-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-surface-200">单插件导入</p>
          <p className="text-xs text-surface-500">通过 URL 或本地 .js 文件导入单个插件</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-surface-500 transition-transform duration-200 ${showForm ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="glass rounded-xl p-4 mt-3 space-y-4">
              {/* URL 导入 */}
              <div>
                <p className="text-xs text-surface-400 mb-2">通过 URL 导入</p>
                <div className="space-y-2">
                  <input
                    type="url"
                    value={pluginUrl}
                    onChange={(e) => { setPluginUrl(e.target.value); setImportError(null); setImportSuccess(null) }}
                    placeholder="https://example.com/plugin.js"
                    className="w-full bg-surface-800 rounded-lg py-2.5 px-3 text-sm text-surface-100 placeholder-surface-500"
                  />
                  <input
                    type="text"
                    value={pluginName}
                    onChange={(e) => setPluginName(e.target.value)}
                    placeholder="插件名称（可选）"
                    className="w-full bg-surface-800 rounded-lg py-2.5 px-3 text-sm text-surface-100 placeholder-surface-500"
                  />
                  <button
                    onClick={handleUrlImport}
                    disabled={importing || !pluginUrl.trim()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary-500 text-surface-950 text-sm font-medium hover:bg-primary-400 transition-colors disabled:opacity-50"
                  >
                    {importing ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /><span>导入中...</span></>
                    ) : (
                      <><Download className="w-4 h-4" /><span>导入插件</span></>
                    )}
                  </button>
                </div>
              </div>

              {/* 文件导入 */}
              <div>
                <p className="text-xs text-surface-400 mb-2">通过本地文件导入</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".js"
                  onChange={handleFileImport}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importing}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-surface-800 text-surface-300 text-sm hover:bg-surface-700 transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>选择 .js 文件</span>
                </button>
              </div>

              {/* 状态提示 */}
              {importError && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{importError}</span>
                </div>
              )}
              {importSuccess && (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{importSuccess}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// 测试 Tab
