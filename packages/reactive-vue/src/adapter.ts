import type { ReactionOptions, ReactiveAdapter } from '@moluoxixi/reactive'
import type { Disposer } from '@moluoxixi/shared'
import { debounce as createDebounce } from '@moluoxixi/shared'
import {
  computed,
  reactive,
  shallowReactive,
  effect as vueEffect,
} from '@vue/reactivity'

/**
 * 浅比较两个值
 *
 * 用于 reaction 的默认值比较：
 * - 基本类型：直接 ===
 * - 数组：逐元素 === 比较（联动引擎的 getWatchedValues 返回数组）
 * - 其他引用类型：===
 */
function shallowEquals(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false
    }
    return true
  }
  return false
}

/**
 * Vue Reactivity 适配器
 *
 * 用于 Vue 项目。直接使用 @vue/reactivity 核心包：
 * - 与 Vue 组件响应式系统完全一致
 * - 无需任何桥接，Vue 模板自动追踪
 * - 利用 Vue DevTools 进行调试
 */
export const vueAdapter: ReactiveAdapter = {
  name: 'vue',

  observable<T extends object>(target: T): T {
    return reactive(target) as T
  },

  shallowObservable<T extends object>(target: T): T {
    return shallowReactive(target) as T
  },

  computed<T>(getter: () => T) {
    return computed(getter)
  },

  autorun(fn: () => void): Disposer {
    const runner = vueEffect(fn)
    return () => {
      runner.effect.stop()
    }
  },

  reaction<T>(
    track: () => T,
    effectFn: (value: T, oldValue: T) => void,
    options?: ReactionOptions,
  ): Disposer {
    let oldValue: T

    const wrappedEffect = options?.debounce && options.debounce > 0
      ? createDebounce(effectFn, options.debounce)
      : null

    const callEffect = (newValue: T, prev: T): void => {
      if (wrappedEffect) {
        wrappedEffect(newValue, prev)
      }
      else {
        effectFn(newValue, prev)
      }
    }

    /**
     * 使用 effect + scheduler 模式：
     * 1. effect 函数执行 track()，收集依赖
     * 2. 依赖变化时 scheduler 被调用（而非重新执行 effect）
     * 3. scheduler 中手动调用 runner() 获取新值并比较
     */
    const runner = vueEffect(() => track(), {
      lazy: true,
      scheduler: () => {
        const newValue = runner()
        const shouldRun = options?.equals
          ? !options.equals(newValue, oldValue)
          : !shallowEquals(newValue, oldValue)
        if (shouldRun) {
          const prev = oldValue
          oldValue = newValue
          callEffect(newValue, prev)
        }
      },
    })

    /* 首次执行收集依赖，获取初始值 */
    oldValue = runner()

    if (options?.fireImmediately) {
      callEffect(oldValue, oldValue)
    }

    return () => {
      runner.effect.stop()
      wrappedEffect?.cancel()
    }
  },

  batch(fn: () => void): void {
    /* Vue reactivity 自动批处理，无需额外包装 */
    fn()
  },

  action<T extends (...args: any[]) => any>(fn: T): T {
    /* Vue 不需要 action 标记 */
    return fn
  },

  makeObservable<T extends object>(target: T): T {
    /**
     * Vue 的 reactive() 返回新的 Proxy 对象，
     * 调用者必须使用返回值而非原始对象。
     */
    return reactive(target) as T
  },
}
