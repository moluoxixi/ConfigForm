import type { AnyFunction } from './types';

export interface DebouncedFunction<T extends AnyFunction> {
  (...args: Parameters<T>): void;
  /** 取消等待中的调用 */
  cancel(): void;
  /** 立即执行等待中的调用 */
  flush(): void;
}

/**
 * 防抖函数
 * @param fn - 要防抖的函数
 * @param delay - 延迟毫秒数
 * @param options - 配置项
 */
export function debounce<T extends AnyFunction>(
  fn: T,
  delay: number,
  options?: { leading?: boolean },
): DebouncedFunction<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  const leading = options?.leading ?? false;

  const debounced = function (this: unknown, ...args: Parameters<T>) {
    lastArgs = args;

    if (timer !== null) {
      clearTimeout(timer);
    }

    if (leading && timer === null) {
      fn.apply(this, args);
      lastArgs = null;
      timer = setTimeout(() => {
        timer = null;
      }, delay);
      return;
    }

    timer = setTimeout(() => {
      if (lastArgs) {
        fn.apply(this, lastArgs);
        lastArgs = null;
      }
      timer = null;
    }, delay);
  } as DebouncedFunction<T>;

  debounced.cancel = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    lastArgs = null;
  };

  debounced.flush = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    if (lastArgs) {
      fn(...lastArgs);
      lastArgs = null;
    }
  };

  return debounced;
}

export interface ThrottledFunction<T extends AnyFunction> {
  (...args: Parameters<T>): void;
  cancel(): void;
}

/**
 * 节流函数
 * @param fn - 要节流的函数
 * @param interval - 最小间隔毫秒数
 */
export function throttle<T extends AnyFunction>(
  fn: T,
  interval: number,
): ThrottledFunction<T> {
  let lastTime = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const throttled = function (this: unknown, ...args: Parameters<T>) {
    const now = Date.now();
    const remaining = interval - (now - lastTime);

    if (remaining <= 0) {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
      lastTime = now;
      fn.apply(this, args);
    } else if (timer === null) {
      timer = setTimeout(() => {
        lastTime = Date.now();
        timer = null;
        fn.apply(this, args);
      }, remaining);
    }
  } as ThrottledFunction<T>;

  throttled.cancel = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    lastTime = 0;
  };

  return throttled;
}
