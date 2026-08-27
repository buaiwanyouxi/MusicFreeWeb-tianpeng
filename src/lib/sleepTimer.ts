type TimerCallback = () => void

let timerId: ReturnType<typeof setTimeout> | null = null
let endTime: number | null = null
let onTimerEnd: TimerCallback | null = null

export function startTimer(minutes: number, callback: TimerCallback) {
  clearTimer()
  endTime = Date.now() + minutes * 60 * 1000
  onTimerEnd = callback
  timerId = setTimeout(() => {
    timerId = null
    endTime = null
    callback()
  }, minutes * 60 * 1000)
}

export function clearTimer() {
  if (timerId) {
    clearTimeout(timerId)
    timerId = null
  }
  endTime = null
  onTimerEnd = null
}

export function getRemainingMs(): number | null {
  if (!endTime) return null
  return Math.max(0, endTime - Date.now())
}

export function isTimerActive(): boolean {
  return timerId !== null
}

export function getTimerCallback(): TimerCallback | null {
  return onTimerEnd
}
