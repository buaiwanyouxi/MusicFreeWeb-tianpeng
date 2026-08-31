/**
 * 分级日志器
 * - 生产环境仅输出 warn/error
 * - 开发环境输出所有级别
 * - 可选转发到调试日志系统（enableDebugLogs 开启时）
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

let currentLevel: LogLevel = 'info'
let forwardToDebug: ((type: string, message: string, data?: unknown) => void) | null = null

const isDev = () => {
  if (typeof window !== 'undefined' && window.location) {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  }
  return process.env.NODE_ENV !== 'production'
}

export const setLogLevel = (level: LogLevel) => {
  currentLevel = level
}

export const setDebugForward = (fn: ((type: string, message: string, data?: unknown) => void) | null) => {
  forwardToDebug = fn
}

const shouldLog = (level: LogLevel): boolean => {
  if (level === 'warn' || level === 'error') return true
  if (isDev()) return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[currentLevel]
  return false
}

const formatMessage = (tag: string, message: string): string => {
  return `[${tag}] ${message}`
}

export const createLogger = (tag: string) => ({
  debug: (message: string, data?: unknown) => {
    if (forwardToDebug) forwardToDebug('info', formatMessage(tag, message), data)
    if (!shouldLog('debug')) return
    if (data !== undefined) console.debug(formatMessage(tag, message), data)
    else console.debug(formatMessage(tag, message))
  },
  info: (message: string, data?: unknown) => {
    if (forwardToDebug) forwardToDebug('info', formatMessage(tag, message), data)
    if (!shouldLog('info')) return
    if (data !== undefined) console.info(formatMessage(tag, message), data)
    else console.info(formatMessage(tag, message))
  },
  warn: (message: string, data?: unknown) => {
    if (forwardToDebug) forwardToDebug('error', formatMessage(tag, message), data)
    if (!shouldLog('warn')) return
    if (data !== undefined) console.warn(formatMessage(tag, message), data)
    else console.warn(formatMessage(tag, message))
  },
  error: (message: string, data?: unknown) => {
    if (forwardToDebug) forwardToDebug('error', formatMessage(tag, message), data)
    if (!shouldLog('error')) return
    if (data !== undefined) console.error(formatMessage(tag, message), data)
    else console.error(formatMessage(tag, message))
  },
})
