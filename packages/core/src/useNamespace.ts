import { computed, inject, provide, type ComputedRef } from 'vue'

const NAMESPACE_KEY = Symbol('config-form-namespace')

/** 默认命名空间 */
const DEFAULT_NAMESPACE = 'cf'

/** 提供命名空间（ConfigForm 调用） */
export function provideNamespace(ns: string | undefined) {
  const namespace = computed(() => ns || DEFAULT_NAMESPACE)
  provide(NAMESPACE_KEY, namespace)
}

/** 注入命名空间（FormField 调用） */
export function useNamespace(): ComputedRef<string> {
  return inject(NAMESPACE_KEY, computed(() => DEFAULT_NAMESPACE))
}

/** BEM 类名生成器 */
export function useBem(ns: ComputedRef<string>) {
  /**
   * 生成 block 类名
   * @example b('form') => 'cf-form'
   */
  function b(block: string): string {
    return `${ns.value}-${block}`
  }

  /**
   * 生成 element 类名
   * @example e('form', 'label') => 'cf-form__label'
   */
  function e(block: string, element: string): string {
    return `${ns.value}-${block}__${element}`
  }

  /**
   * 生成 modifier 类名
   * @example m('form', 'inline') => 'cf-form--inline'
   */
  function m(block: string, modifier: string): string {
    return `${ns.value}-${block}--${modifier}`
  }

  return { b, e, m }
}
