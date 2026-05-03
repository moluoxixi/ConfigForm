import type { ComputedRef, InjectionKey } from 'vue'
import type { FormRuntime, FormRuntimeOptions } from '@/runtime'
import { computed, inject, provide } from 'vue'
import { createFormRuntime } from '@/runtime'

const runtimeKey: InjectionKey<ComputedRef<FormRuntime>> = Symbol('config-form-runtime')
const defaultRuntime = createFormRuntime()

export function normalizeFormRuntime(input?: FormRuntimeOptions): FormRuntime {
  if (!input)
    return defaultRuntime
  return createFormRuntime(input)
}

export function provideRuntime(runtime: ComputedRef<FormRuntime>) {
  provide(runtimeKey, runtime)
}

export function useRuntime(): ComputedRef<FormRuntime> {
  return inject(runtimeKey, computed(() => defaultRuntime))
}
