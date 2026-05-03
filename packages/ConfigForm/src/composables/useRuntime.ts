import type { ComputedRef, InjectionKey } from 'vue'
import type { FormRuntime, FormRuntimeOptions } from '@/runtime'
import { computed, inject, provide } from 'vue'
import { createFormRuntime } from '@/runtime'

const runtimeKey: InjectionKey<ComputedRef<FormRuntime>> = Symbol('config-form-runtime')
const defaultRuntime = createFormRuntime()

/** Normalize optional runtime options into a concrete FormRuntime instance. */
export function normalizeFormRuntime(input?: FormRuntimeOptions): FormRuntime {
  if (!input)
    return defaultRuntime
  return createFormRuntime(input)
}

/** Provide a computed runtime instance to descendant ConfigForm field renderers. */
export function provideRuntime(runtime: ComputedRef<FormRuntime>) {
  provide(runtimeKey, runtime)
}

/** Inject the nearest FormRuntime, falling back to the default runtime. */
export function useRuntime(): ComputedRef<FormRuntime> {
  return inject(runtimeKey, computed(() => defaultRuntime))
}
