import type { Disposer, ReactionOptions, ReactiveAdapter } from '@moluoxixi/core'
import { debounce as createDebounce } from '@moluoxixi/core'
import {
  action,
  autorun,
  computed,
  makeObservable,
  observable,
  reaction,
  runInAction,
} from 'mobx'

/**
 * MobX 响应式适配器
 *
 * 用于 React 项目。利用 MobX 成熟的响应式系统：
 * - 精确的依赖追踪
 * - 高性能的批量更新
 * - 与 mobx-react-lite 无缝配合
 */
export const mobxAdapter: ReactiveAdapter = {
  name: 'mobx',

  /**
   * observable：封装该模块的核心渲染与交互逻辑。
   * 所属模块：`packages/reactive-react/src/adapter.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param target 参数 `target`用于提供当前函数执行所需的输入信息。
   * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
   */
  observable<T extends object>(target: T): T {
    return observable(target)
  },

  /**
   * shallow Observable：封装该模块的核心渲染与交互逻辑。
   * 所属模块：`packages/reactive-react/src/adapter.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param target 参数 `target`用于提供当前函数执行所需的输入信息。
   * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
   */
  shallowObservable<T extends object>(target: T): T {
    return observable(target, {}, { deep: false })
  },

  /**
   * computed：封装该模块的核心渲染与交互逻辑。
   * 所属模块：`packages/reactive-react/src/adapter.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param getter 参数 `getter`用于提供当前函数执行所需的输入信息。
   * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
   */
  computed<T>(getter: () => T) {
    const computedValue = computed(getter)
    return {
      /**
       * value?????????????????
       * ???`packages/reactive-react/src/adapter.ts:59`?
       * ?????????????????????????????????
       * ??????????????????????????
       * @returns ?????????????
       */
      get value() {
        return computedValue.get()
      },
    }
  },

  /**
   * autorun：封装该模块的核心渲染与交互逻辑。
   * 所属模块：`packages/reactive-react/src/adapter.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param effect 参数 `effect`用于提供当前函数执行所需的输入信息。
   * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
   */
  autorun(effect: () => void): Disposer {
    return autorun(effect)
  },

  /**
   * reaction：封装该模块的核心渲染与交互逻辑。
   * 所属模块：`packages/reactive-react/src/adapter.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param track 参数 `track`用于提供当前函数执行所需的输入信息。
   * @param effect 参数 `effect`用于提供当前函数执行所需的输入信息。
   * @param [options] 参数 `options`用于提供可选配置，调整当前功能模块的执行策略。
   * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
   */
  reaction<T>(
    track: () => T,
    effect: (value: T, oldValue: T) => void,
    options?: ReactionOptions,
  ): Disposer {
    /**
     * run Effect：封装该模块的核心渲染与交互逻辑。
     * 所属模块：`packages/reactive-react/src/adapter.ts`。
     * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
     * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
     * @param value 参数 `value`用于提供待处理的值并参与结果计算。
     * @param oldValue 参数 `oldValue`用于提供待处理的值并参与结果计算。
     */
    const /**
           * runEffect：执行当前功能逻辑。
           *
           * @param value 参数 value 的输入说明。
           * @param oldValue 参数 oldValue 的输入说明。
           */
      runEffect = (value: T, oldValue: T | undefined) => {
        effect(value, oldValue === undefined ? value : oldValue)
      }

    if (options?.debounce && options.debounce > 0) {
      const debouncedEffect = createDebounce(runEffect, options.debounce)
      const disposer = reaction(track, debouncedEffect, {
        fireImmediately: options?.fireImmediately,
        equals: options?.equals as ((a: T, b: T) => boolean) | undefined,
      })
      return () => {
        debouncedEffect.cancel()
        disposer()
      }
    }
    return reaction(track, runEffect, {
      fireImmediately: options?.fireImmediately,
      equals: options?.equals as ((a: T, b: T) => boolean) | undefined,
    })
  },

  /**
   * batch：封装该模块的核心渲染与交互逻辑。
   * 所属模块：`packages/reactive-react/src/adapter.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param fn 参数 `fn`用于提供当前函数执行所需的输入信息。
   */
  batch(fn: () => void): void {
    runInAction(fn)
  },

  /**
   * action：封装该模块的核心渲染与交互逻辑。
   * 所属模块：`packages/reactive-react/src/adapter.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param fn 参数 `fn`用于提供当前函数执行所需的输入信息。
   * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
   */
  action<T extends (...args: any[]) => any>(fn: T): T {
    return action(fn) as T
  },

  /**
   * make Observable：封装该模块的核心渲染与交互逻辑。
   * 所属模块：`packages/reactive-react/src/adapter.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param target 参数 `target`用于提供当前函数执行所需的输入信息。
   * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
   */
  makeObservable<T extends object>(target: T): T {
    /**
     * 动态生成 MobX 注解，支持继承类（如 ArrayField extends Field）
     *
     * 遍历对象自身及原型链上的所有属性：
     * - getter → computed
     * - 方法 → action.bound
     * - 普通属性 → observable
     *
     * 私有属性（以 _ 开头）和以下属性被跳过：
     * - id, form, path, name, reactions（只读）
     * - disposers, valueChangeHandlers 等私有状态
     */
    const annotations: Record<string, any> = {}
    const skippedProps = new Set([
      'constructor',
      'id',
      'form',
      'path',
      'name',
      'reactions',
      'initialValues',
    ])

    // 遍历自身属性
    for (const key of Object.keys(target)) {
      if (skippedProps.has(key) || key.startsWith('_'))
        continue
      const descriptor = Object.getOwnPropertyDescriptor(target, key)
      if (descriptor?.get) {
        annotations[key] = computed
      }
      else if (typeof (target as any)[key] === 'function') {
        annotations[key] = action.bound
      }
      else {
        annotations[key] = observable
      }
    }

    // 遍历原型链（获取 getter 和方法）
    let proto = Object.getPrototypeOf(target)
    while (proto && proto !== Object.prototype) {
      for (const key of Object.getOwnPropertyNames(proto)) {
        if (skippedProps.has(key) || key.startsWith('_') || annotations[key])
          continue
        const descriptor = Object.getOwnPropertyDescriptor(proto, key)
        if (descriptor?.get) {
          annotations[key] = computed
        }
        else if (typeof descriptor?.value === 'function') {
          annotations[key] = action.bound
        }
      }
      proto = Object.getPrototypeOf(proto)
    }

    return makeObservable(target, annotations, { autoBind: true }) as T
  },
}
