import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Link, Music, Video, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { usePluginStore } from '../stores/pluginStore'

interface ImportSheetDialogProps {
  open: boolean
  onClose: () => void
}

export function ImportSheetDialog({ open, onClose }: ImportSheetDialogProps) {
  const { plugins, importMusicSheet, importVideo } = usePluginStore()
  const [url, setUrl] = useState('')
  const [type, setType] = useState<'music' | 'video'>('music')
  const [selectedPluginId, setSelectedPluginId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const readyPlugins = plugins.filter(p => p.status === 'ready')

  const handleSubmit = async () => {
    if (!url.trim()) {
      setError('请输入链接地址')
      return
    }
    if (!selectedPluginId) {
      setError('请选择插件')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (type === 'music') {
        await importMusicSheet(selectedPluginId, url.trim())
        setSuccess('歌单导入成功！')
      } else {
        await importVideo(selectedPluginId, url.trim())
        setSuccess('视频导入成功！')
      }
      setTimeout(() => {
        onClose()
        setUrl('')
        setSuccess(null)
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : '导入失败')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setUrl('')
      setError(null)
      setSuccess(null)
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 top-[20%] z-50 max-w-md mx-auto bg-surface-900 border border-surface-700 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-800">
              <h3 className="text-sm font-semibold text-surface-100">导入歌单 / 视频</h3>
              <button
                onClick={handleClose}
                className="p-1 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* 类型切换 */}
              <div className="flex gap-2">
                <button
                  onClick={() => setType('music')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all ${
                    type === 'music'
                      ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                      : 'bg-surface-800 text-surface-400 border border-surface-700 hover:border-surface-600'
                  }`}
                >
                  <Music className="w-4 h-4" />
                  歌单
                </button>
                <button
                  onClick={() => setType('video')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all ${
                    type === 'video'
                      ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                      : 'bg-surface-800 text-surface-400 border border-surface-700 hover:border-surface-600'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  视频
                </button>
              </div>

              {/* URL 输入 */}
              <div>
                <label className="block text-xs text-surface-400 mb-1.5">链接地址</label>
                <div className="relative">
                  <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder={type === 'music' ? '粘贴歌单链接（如B站收藏夹）' : '粘贴视频链接'}
                    className="w-full pl-9 pr-3 py-2.5 bg-surface-800 border border-surface-700 rounded-xl text-sm text-surface-200 placeholder-surface-600 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* 插件选择 */}
              <div>
                <label className="block text-xs text-surface-400 mb-1.5">使用插件</label>
                {readyPlugins.length === 0 ? (
                  <p className="text-xs text-surface-500 bg-surface-800/50 rounded-lg p-3">
                    暂无可用插件，请先在插件管理中添加订阅源
                  </p>
                ) : (
                  <select
                    value={selectedPluginId}
                    onChange={(e) => setSelectedPluginId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-surface-800 border border-surface-700 rounded-xl text-sm text-surface-200 focus:outline-none focus:border-primary-500/50"
                    disabled={loading}
                  >
                    <option value="">选择插件...</option>
                    {readyPlugins.map(p => (
                      <option key={p.meta.id} value={p.meta.id}>
                        {p.meta.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* 状态提示 */}
              {error && (
                <div className="flex items-center gap-2 text-xs text-red-400 bg-red-400/10 rounded-lg p-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 text-xs text-green-400 bg-green-400/10 rounded-lg p-2.5">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  {success}
                </div>
              )}

              {/* 提交按钮 */}
              <button
                onClick={handleSubmit}
                disabled={loading || !url.trim() || !selectedPluginId || readyPlugins.length === 0}
                className="w-full py-2.5 rounded-xl text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    导入中...
                  </>
                ) : (
                  '导入'
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
