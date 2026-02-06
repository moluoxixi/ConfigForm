import {
  observable,
  computed,
  autorun,
  reaction,
  runInAction,
  action,
  makeAutoObservable,
} from 'mobx';
import type { ReactiveAdapter, ReactionOptions } from '@moluoxixi/reactive';
import type { Disposer } from '@moluoxixi/shared';
import { debounce as createDebounce } from '@moluoxixi/shared';

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
    return observable(target);
  },

  shallowObservable<T extends object>(target: T): T {
    return observable(target, {}, { deep: false });
  },

  computed<T>(getter: () => T) {
    const computedValue = computed(getter);
    return {
      get value() {
        return computedValue.get();
      },
    };
  },

  autorun(effect: () => void): Disposer {
    return autorun(effect);
  },

  reaction<T>(
    track: () => T,
    effect: (value: T, oldValue: T) => void,
    options?: ReactionOptions,
  ): Disposer {
    if (options?.debounce && options.debounce > 0) {
      const debouncedEffect = createDebounce(effect, options.debounce);
      const disposer = reaction(track, debouncedEffect, {
        fireImmediately: options?.fireImmediately,
        equals: options?.equals as ((a: T, b: T) => boolean) | undefined,
      });
      return () => {
        debouncedEffect.cancel();
        disposer();
      };
    }
    return reaction(track, effect, {
      fireImmediately: options?.fireImmediately,
      equals: options?.equals as ((a: T, b: T) => boolean) | undefined,
    });
  },

  batch(fn: () => void): void {
    runInAction(fn);
  },

  action<T extends (...args: any[]) => any>(fn: T): T {
    return action(fn) as T;
  },

  makeObservable<T extends object>(target: T): T {
    /**
     * MobX makeAutoObservable 原地修改实例：
     * - 普通属性 → observable
     * - getter → computed
     * - 方法 → action
     * 返回同一引用
     */
    return makeAutoObservable(target as any, {}, { autoBind: true }) as T;
  },
};
