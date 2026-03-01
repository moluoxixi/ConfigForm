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
 */
export const mobxAdapter: ReactiveAdapter = {
  name: 'mobx',

  observable<T extends object>(target: T): T {
    return observable(target) as T
  },

  shallowObservable<T extends object>(target: T): T {
    return observable(target, {}, { deep: false }) as T
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
    const runEffect = (value: T, oldValue: T | undefined) => {
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

  batch(fn: () => void): void {
    runInAction(fn)
  },

  action<T extends (...args: any[]) => any>(fn: T): T {
    return action(fn) as T
  },

  makeObservable<T extends object>(target: T): T {
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
