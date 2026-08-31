/**
 * 调试日志环形缓冲
 * 上限 500 条，超出后覆盖最旧的条目。
 */

import type { DebugLogEntry } from './pluginHost'

const MAX_ENTRIES = 500

class RingBuffer<T> {
  private buffer: (T | undefined)[]
  private head = 0
  private size = 0

  constructor(private capacity: number) {
    this.buffer = new Array(capacity)
  }

  push(item: T) {
    this.buffer[this.head] = item
    this.head = (this.head + 1) % this.capacity
    if (this.size < this.capacity) this.size++
  }

  toArray(): T[] {
    if (this.size === 0) return []
    if (this.size < this.capacity) {
      return this.buffer.slice(0, this.size) as T[]
    }
    const start = this.head
    return [
      ...this.buffer.slice(start),
      ...this.buffer.slice(0, start),
    ].filter(Boolean) as T[]
  }

  clear() {
    this.buffer = new Array(this.capacity)
    this.head = 0
    this.size = 0
  }

  getSize() {
    return this.size
  }
}

const buffer = new RingBuffer<DebugLogEntry>(MAX_ENTRIES)
let listeners: Array<() => void> = []

export const pushDebugEntry = (entry: DebugLogEntry) => {
  buffer.push(entry)
  listeners.forEach(fn => fn())
}

export const getDebugEntries = (): DebugLogEntry[] => {
  return buffer.toArray()
}

export const clearDebugEntries = () => {
  buffer.clear()
  listeners.forEach(fn => fn())
}

export const subscribeDebugBuffer = (fn: () => void): (() => void) => {
  listeners.push(fn)
  return () => {
    listeners = listeners.filter(l => l !== fn)
  }
}

export const getDebugBufferSize = () => buffer.getSize()
