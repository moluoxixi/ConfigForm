import type { AnyFunction } from './types'

/**
 * 节流函数返回类型。
 * 除了可调用本体外，还提供 `cancel` 用于主动清理挂起任务。
 */
export interface ThrottledFunction<T extends AnyFunction> {
  (...args: Parameters<T>): void
  cancel: () => void
}

/**
 * 创建节流函数。
 * 在一个节流窗口内，函数最多执行一次；窗口末尾可补执行一次尾调用。
 * @param fn 需要节流的原始函数。
 * @param interval 节流间隔（毫秒）。
 * @returns 带 cancel 能力的节流函数。
 */
export function throttle<T extends AnyFunction>(
  fn: T,
  interval: number,
): ThrottledFunction<T> {
  let lastTime = 0
  let timer: ReturnType<typeof setTimeout> | null = null

  const throttled = function (this: unknown, ...args: Parameters<T>) {
    const now = Date.now()
    const remaining = interval - (now - lastTime)

    if (remaining <= 0) {
      if (timer !== null) {
        clearTimeout(timer)
        timer = null
      }
      lastTime = now
      fn.apply(this, args)
    }
    else if (timer === null) {
      timer = setTimeout(() => {
        lastTime = Date.now()
        timer = null
        fn.apply(this, args)
      }, remaining)
    }
  } as ThrottledFunction<T>

  throttled.cancel = () => {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
    lastTime = 0
  }

  return throttled
}
