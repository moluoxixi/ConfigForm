import type { ReactionOptions, ReactiveAdapter } from '@moluoxixi/reactive'
import type { Disposer } from '@moluoxixi/shared'
import { debounce as createDebounce } from '@moluoxixi/shared'
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

  observable<T extends object>(target: T): T {
    return observable(target)
  },

  shallowObservable<T extends object>(target: T): T {
    return observable(target, {}, { deep: false })
  },

  computed<T>(getter: () => T) {
    const computedValue = computed(getter)
    return {
      get value() {
        return computedValue.get()
      },
    }
  },

  autorun(effect: () => void): Disposer {
    return autorun(effect)
  },

  reaction<T>(
    track: () => T,
    effect: (value: T, oldValue: T) => void,
    options?: ReactionOptions,
  ): Disposer {
    if (options?.debounce && options.debounce > 0) {
      const debouncedEffect = createDebounce(effect, options.debounce)
      const disposer = reaction(track, debouncedEffect, {
        fireImmediately: options?.fireImmediately,
        equals: options?.equals as ((a: T, b: T) => boolean) | undefined,
      })
      return () => {
        debouncedEffect.cancel()
        disposer()
      }
    }
    return reaction(track, effect, {
      fireImmediately: options?.fireImmediately,
      equals: options?.equals as ((a: T, b: T) => boolean) | undefined,
    })
  },

  batch(fn: () => void): void {
    runInAction(fn)
  },

  action<T extends (...args: any[]) => any>(fn: T): T {
    return action(fn) as T
  },

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
