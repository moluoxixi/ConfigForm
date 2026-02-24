import type { Disposer, ReactionOptions, ReactiveAdapter } from '@moluoxixi/core'
import { debounce as createDebounce } from '@moluoxixi/core'
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
 * @param a 参数 `a`用于提供当前函数执行所需的输入信息。
 * @param b 参数 `b`用于提供当前函数执行所需的输入信息。
 * @returns 返回布尔值，用于表示条件是否成立或操作是否成功。
 */
function shallowEquals(a: unknown, b: unknown): boolean {
  if (a === b)
    return true
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length)
      return false
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i])
        return false
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

  /**
   * observable：封装该模块的核心渲染与交互逻辑。
   * 所属模块：`packages/reactive-vue/src/adapter.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param target 参数 `target`用于提供当前函数执行所需的输入信息。
   * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
   */
  observable<T extends object>(target: T): T {
    return reactive(target) as T
  },

  /**
   * shallow Observable：封装该模块的核心渲染与交互逻辑。
   * 所属模块：`packages/reactive-vue/src/adapter.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param target 参数 `target`用于提供当前函数执行所需的输入信息。
   * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
   */
  shallowObservable<T extends object>(target: T): T {
    return shallowReactive(target) as T
  },

  /**
   * computed：封装该模块的核心渲染与交互逻辑。
   * 所属模块：`packages/reactive-vue/src/adapter.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param getter 参数 `getter`用于提供当前函数执行所需的输入信息。
   * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
   */
  computed<T>(getter: () => T) {
    return computed(getter)
  },

  /**
   * autorun：封装该模块的核心渲染与交互逻辑。
   * 所属模块：`packages/reactive-vue/src/adapter.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param fn 参数 `fn`用于提供当前函数执行所需的输入信息。
   * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
   */
  autorun(fn: () => void): Disposer {
    const runner = vueEffect(fn)
    return () => {
      runner.effect.stop()
    }
  },

  /**
   * reaction：封装该模块的核心渲染与交互逻辑。
   * 所属模块：`packages/reactive-vue/src/adapter.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param track 参数 `track`用于提供当前函数执行所需的输入信息。
   * @param effectFn 参数 `effectFn`用于提供当前函数执行所需的输入信息。
   * @param [options] 参数 `options`用于提供可选配置，调整当前功能模块的执行策略。
   * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
   */
  reaction<T>(
    track: () => T,
    effectFn: (value: T, oldValue: T) => void,
    options?: ReactionOptions,
  ): Disposer {
    let oldValue: T

    const wrappedEffect = options?.debounce && options.debounce > 0
      ? createDebounce(effectFn, options.debounce)
      : null

    /**
     * call Effect：封装该模块的核心渲染与交互逻辑。
     * 所属模块：`packages/reactive-vue/src/adapter.ts`。
     * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
     * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
     * @param newValue 参数 `newValue`用于提供待处理的值并参与结果计算。
     * @param prev 参数 `prev`用于提供当前函数执行所需的输入信息。
     */
    const /**
           * callEffect：执行当前功能逻辑。
           *
           * @param newValue 参数 newValue 的输入说明。
           * @param prev 参数 prev 的输入说明。
           */
      callEffect = (newValue: T, prev: T): void => {
        if (wrappedEffect) {
          wrappedEffect(newValue, prev)
        }
        else {
          effectFn(newValue, prev)
        }
      }

    let initialized = false
    const runner = vueEffect(() => {
      const newValue = track()
      if (!initialized) {
        oldValue = newValue
        initialized = true
        if (options?.fireImmediately) {
          callEffect(newValue, newValue)
        }
        return
      }

      const shouldRun = options?.equals
        ? !options.equals(newValue, oldValue)
        : !shallowEquals(newValue, oldValue)
      if (shouldRun) {
        const prev = oldValue
        oldValue = newValue
        callEffect(newValue, prev)
      }
    })

    return () => {
      runner.effect.stop()
      wrappedEffect?.cancel()
    }
  },

  /**
   * batch：封装该模块的核心渲染与交互逻辑。
   * 所属模块：`packages/reactive-vue/src/adapter.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param fn 参数 `fn`用于提供当前函数执行所需的输入信息。
   */
  batch(fn: () => void): void {
    /* Vue reactivity 自动批处理，无需额外包装 */
    fn()
  },

  /**
   * action：封装该模块的核心渲染与交互逻辑。
   * 所属模块：`packages/reactive-vue/src/adapter.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param fn 参数 `fn`用于提供当前函数执行所需的输入信息。
   * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
   */
  action<T extends (...args: any[]) => any>(fn: T): T {
    /* Vue 不需要 action 标记 */
    return fn
  },

  /**
   * make Observable：封装该模块的核心渲染与交互逻辑。
   * 所属模块：`packages/reactive-vue/src/adapter.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param target 参数 `target`用于提供当前函数执行所需的输入信息。
   * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
   */
  makeObservable<T extends object>(target: T): T {
    /**
     * Vue 的 reactive() 返回新的 Proxy 对象，
     * 调用者必须使用返回值而非原始对象。
     */
    return reactive(target) as T
  },
}
