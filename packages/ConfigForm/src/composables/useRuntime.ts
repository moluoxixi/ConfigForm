import type { ComputedRef, InjectionKey } from 'vue'
import type { FormRuntime, FormRuntimeInput } from '@/runtime'
import { computed, inject, provide } from 'vue'
import { createFormRuntime, isFormRuntime } from '@/runtime'

const runtimeKey: InjectionKey<ComputedRef<FormRuntime>> = Symbol('config-form-runtime')
const defaultRuntime = createFormRuntime()

export function normalizeFormRuntime(input?: FormRuntimeInput): FormRuntime {
  if (!input)
    return defaultRuntime
  return isFormRuntime(input) ? input : createFormRuntime(input)
}

export function provideRuntime(runtime: ComputedRef<FormRuntime>) {
  provide(runtimeKey, runtime)
}

export function useRuntime(): ComputedRef<FormRuntime> {
  return inject(runtimeKey, computed(() => defaultRuntime))
}
