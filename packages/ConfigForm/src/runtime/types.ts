import type { FieldConfig, FormErrors, FormValues, NormalizedFieldConfig, ResolvedField, SlotContent } from '@/types'

export type ComponentRegistry = Record<string, FieldConfig['component']>

export type FormRuntimeDebugEventType
  = | 'runtime:created'
    | 'field:resolved'
    | 'extension:resolved'
    | 'value:resolved'
    | 'condition:resolved'
    | 'conflict'

export interface FormRuntimeDebugEvent {
  type: FormRuntimeDebugEventType
  field?: string
  extension?: string
  path?: string
  message?: string
  data?: Record<string, unknown>
}

export interface FormRuntimeConflict {
  type: 'component' | 'extension'
  key: string
  message: string
  existing?: unknown
  incoming?: unknown
}

export type FormRuntimeConflictStrategy = 'warn' | 'error' | 'last-write-wins'

export interface FormRuntimeContext<TValues extends FormValues = FormValues> {
  values: TValues
  errors: FormErrors
  field?: NormalizedFieldConfig
  locale?: string
  meta?: Record<string, unknown>
}

export interface FormRuntimeExtension {
  name: string
  priority?: number
  components?: ComponentRegistry
  prepareField?: (field: NormalizedFieldConfig, context: FormRuntimeContext) => NormalizedFieldConfig | void
  resolveValue?: (value: unknown, context: FormRuntimeContext, path: string) => unknown
  resolveField?: (field: ResolvedField, context: FormRuntimeContext) => ResolvedField | void
  resolveSlot?: (slot: SlotContent, context: FormRuntimeContext, path: string) => SlotContent | void
  resolveVisible?: (field: NormalizedFieldConfig, context: FormRuntimeContext, next: () => boolean) => boolean
  resolveDisabled?: (field: NormalizedFieldConfig, context: FormRuntimeContext, next: () => boolean) => boolean
  onDebugEvent?: (event: FormRuntimeDebugEvent) => void
}

export interface FormI18nAdapter {
  locale?: string
  t: (
    key: string,
    params: Record<string, unknown> | undefined,
    fallback: string | undefined,
    context: FormRuntimeContext,
  ) => string
}

export interface FormExpressionAdapter {
  evaluate?: (input: unknown, context: FormRuntimeContext) => unknown
}

export interface FormRuntimeOptions {
  components?: ComponentRegistry
  extensions?: FormRuntimeExtension[]
  i18n?: FormI18nAdapter
  expression?: FormExpressionAdapter
  debug?: {
    emit?: (event: FormRuntimeDebugEvent) => void
  }
  conflictStrategy?: FormRuntimeConflictStrategy
  onConflict?: (conflict: FormRuntimeConflict) => void
}

export interface CreateRuntimeContextInput<TValues extends FormValues = FormValues> {
  values?: TValues
  errors?: FormErrors
  field?: NormalizedFieldConfig
  meta?: Record<string, unknown>
}

export interface FormRuntime {
  readonly __configFormRuntime: true
  readonly components: ComponentRegistry
  readonly extensions: readonly FormRuntimeExtension[]
  readonly locale?: string
  createContext: <TValues extends FormValues = FormValues>(
    input?: CreateRuntimeContextInput<TValues>,
  ) => FormRuntimeContext<TValues>
  emitDebug: (event: FormRuntimeDebugEvent) => void
  resolveValue: <TValue = unknown>(value: TValue, context: FormRuntimeContext, path?: string) => unknown
  resolveSlot: (slot: SlotContent, context: FormRuntimeContext, path?: string) => SlotContent
  resolveField: (field: FieldConfig, context: FormRuntimeContext) => ResolvedField
  resolveVisible: (field: FieldConfig | NormalizedFieldConfig, context: FormRuntimeContext) => boolean
  resolveDisabled: (field: FieldConfig | NormalizedFieldConfig, context: FormRuntimeContext) => boolean
}

export type FormRuntimeInput = FormRuntime | FormRuntimeOptions
