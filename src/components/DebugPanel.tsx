import { useState, useEffect, useRef } from 'react'
import { Bug, Trash2, Download, X } from 'lucide-react'
import { enableDebugLogs, subscribeDebugLogs } from '../lib/pluginHost'
import { getDebugEntries, clearDebugEntries, subscribeDebugBuffer, pushDebugEntry } from '../lib/debugBuffer'
import type { DebugLogEntry } from '../lib/pluginHost'

const TYPE_COLORS: Record<string, string> = {
  info: 'text-blue-400',
  success: 'text-green-400',
  error: 'text-red-400',
  request: 'text-yellow-400',
  response: 'text-cyan-400',
}

export function DebugPanel({ onClose }: { onClose: () => void }) {
  const [entries, setEntries] = useState<DebugLogEntry[]>([])
  const [autoScroll, setAutoScroll] = useState(true)
  const [filter, setFilter] = useState<string>('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setEntries(getDebugEntries())

    const unsub1 = subscribeDebugBuffer(() => {
      setEntries(getDebugEntries())
    })

    const unsub2 = subscribeDebugLogs((entry) => {
      pushDebugEntry(entry)
    })

    enableDebugLogs(true)

    return () => {
      unsub1()
      unsub2()
    }
  }, [])

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [entries, autoScroll])

  const filtered = filter
    ? entries.filter(e => e.message.toLowerCase().includes(filter.toLowerCase()))
    : entries

  const handleExport = () => {
    const data = JSON.stringify(entries, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `debug-logs-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatTime = (ts: number) => {
    const d = new Date(ts)
    return d.toLocaleTimeString('zh-CN', { hour12: false, fractionalSecondDigits: 3 } as any)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-surface-900 border border-surface-700 rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-700">
          <div className="flex items-center gap-2">
            <Bug className="w-4 h-4 text-primary-400" />
            <h3 className="text-sm font-semibold text-surface-100">插件调试日志</h3>
            <span className="text-xs text-surface-500">({filtered.length}/{entries.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="过滤..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="px-2 py-1 text-xs bg-surface-800 border border-surface-600 rounded-lg text-surface-200 w-32 focus:outline-none focus:border-primary-500"
            />
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`px-2 py-1 text-xs rounded-lg ${autoScroll ? 'bg-primary-500/20 text-primary-400' : 'bg-surface-800 text-surface-400'}`}
            >
              自动滚动
            </button>
            <button onClick={handleExport} className="p-1.5 text-surface-400 hover:text-surface-200" title="导出日志">
              <Download className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => { clearDebugEntries() }} className="p-1.5 text-surface-400 hover:text-red-400" title="清空">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={onClose} className="p-1.5 text-surface-400 hover:text-surface-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Log entries */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 font-mono text-xs space-y-0.5">
          {filtered.length === 0 ? (
            <div className="text-surface-500 text-center py-8">暂无日志</div>
          ) : (
            filtered.map((entry, i) => (
              <div key={i} className="flex gap-2 px-2 py-1 rounded hover:bg-surface-800/50">
                <span className="text-surface-500 shrink-0">{formatTime(entry.time)}</span>
                <span className={`shrink-0 w-16 ${TYPE_COLORS[entry.type] || 'text-surface-300'}`}>
                  {entry.type}
                </span>
                <span className="text-surface-200 break-all">{entry.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
