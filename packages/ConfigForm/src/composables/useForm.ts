import type { MaybeRef, Ref } from 'vue'
import type { FormRuntimeOptions } from '@/runtime'
import type { FieldConfig, FieldKey, FormErrors, FormNodeConfig, FormValues, ValidateTrigger } from '@/types'
import { computed, reactive, ref, toRaw, toValue, watch } from 'vue'
import { normalizeFormRuntime } from '@/composables/useRuntime'
import { applyFieldTransform, shouldValidateOn } from '@/models/field'
import { collectFieldConfigs } from '@/models/node'
import { validateFieldRules, validateForm } from '@/utils/validate'

/** 无头表单控制器选项，驱动值状态、校验和提交流程。 */
export interface UseFormOptions<T extends object = FormValues> {
  /** 响应式节点树；只有真实字段节点会参与值、错误和提交。 */
  fields: Ref<FormNodeConfig[]>
  /** 外部初始值，通常来自 ConfigForm 的 v-model。 */
  initialValues?: Ref<Partial<T> | undefined>
  /** 运行时配置，用于解析组件、runtime token 和插件生命周期。 */
  runtime?: MaybeRef<FormRuntimeOptions | undefined>
  /** 校验通过后接收已执行 transform 的提交值。 */
  onSubmit?: (values: T) => void
  /** 提交校验失败时接收当前错误集合。 */
  onError?: (errors: FormErrors) => void
}

/**
 * 创建 ConfigForm 的无头状态控制器。
 *
 * 负责字段值、校验错误、显隐/禁用映射、提交序列化、重置逻辑和组件 ref 暴露的方法。
 */
export function useForm<T extends object = FormValues>(options: UseFormOptions<T>) {
  const { fields, initialValues, onSubmit, onError } = options

  // T 提供外部类型安全，Record 允许内部动态 key 访问。
  const values = reactive<T & FormValues>({} as T & FormValues)
  const valueStore = values as FormValues
  const errors = ref<FormErrors>({})
  const runtimeRef = computed(() => normalizeFormRuntime(toValue(options.runtime)))
  const fieldConfigs = computed(() => collectFieldConfigs(fields.value))
  const fieldTopologyKey = computed(() => fieldConfigs.value.map(field => field.field).join('\0'))

  // 先同步校验初始字段拓扑，避免 Vue watcher 注册后才暴露重复 field 等配置错误。
  collectFieldConfigs(fields.value)

  function clearFieldError(fieldName?: string) {
    if (!fieldName) {
      errors.value = {}
      return
    }
    if (errors.value[fieldName]) {
      const { [fieldName]: _, ...rest } = errors.value
      errors.value = rest
    }
  }

  function syncErrorsToFields(fields: readonly Pick<FieldConfig, 'field'>[]) {
    const fieldNames = new Set(fields.map(field => field.field))
    const nextErrors = Object.fromEntries(
      Object.entries(errors.value).filter(([field]) => fieldNames.has(field)),
    )

    if (Object.keys(nextErrors).length !== Object.keys(errors.value).length)
      errors.value = nextErrors
  }

  function syncValues(next: FormValues) {
    for (const key of Object.keys(values)) {
      if (!Object.hasOwn(next, key))
        delete valueStore[key]
    }

    for (const [key, val] of Object.entries(next)) {
      if (valueStore[key] !== val)
        valueStore[key] = val
    }
  }

  function createValuesWithDefaults(source: FormValues, pruneToFields: boolean): FormValues {
    const runtime = runtimeRef.value
    const transformedFields = fieldConfigs.value.map(config => runtime.transformField(config))
    const fieldNames = new Set(transformedFields.map(field => field.field))
    const next: FormValues = pruneToFields
      ? Object.fromEntries(Object.entries(source).filter(([key]) => fieldNames.has(key)))
      : { ...source }

    for (const field of transformedFields) {
      if (!Object.hasOwn(next, field.field))
        next[field.field] = field.defaultValue !== undefined ? field.defaultValue : undefined
    }

    return next
  }

  function initValues(source: FormValues = (initialValues?.value ?? {}) as FormValues, pruneToFields = false) {
    const next = createValuesWithDefaults(source, pruneToFields)
    syncValues(next)
  }

  function syncFieldTopology() {
    initValues({ ...toRaw(values) }, true)
    syncErrorsToFields(fieldConfigs.value)
  }

  watch(
    () => initialValues?.value,
    source => initValues((source ?? {}) as FormValues),
    { immediate: true, deep: true },
  )

  watch(
    fieldTopologyKey,
    () => syncFieldTopology(),
  )

  function createResolveSnap(snapshot: FormValues) {
    return runtimeRef.value.createResolveSnap({
      errors: errors.value,
      values: snapshot,
    })
  }

  const visibilityMap = computed<Record<string, boolean>>(() => {
    const snap = { ...values }
    const resolveSnap = createResolveSnap(snap)
    return Object.fromEntries(fieldConfigs.value.map(f => [f.field, runtimeRef.value.resolveVisible(f, resolveSnap)]))
  })

  const disabledMap = computed<Record<string, boolean>>(() => {
    const snap = { ...values }
    const resolveSnap = createResolveSnap(snap)
    return Object.fromEntries(fieldConfigs.value.map(f => [f.field, runtimeRef.value.resolveDisabled(f, resolveSnap)]))
  })

  function setValue<K extends FieldKey<T>>(field: K, value: T[K]): void
  function setValue(field: string, value: unknown): void
  function setValue(field: string, value: unknown) {
    valueStore[field] = value
    clearFieldError(field)
  }

  function setValues(nextValues: Partial<T>, replace = false) {
    if (replace) {
      initValues(nextValues as FormValues)
    }
    else {
      for (const [key, val] of Object.entries(nextValues)) {
        valueStore[key] = val
        clearFieldError(key)
      }
    }
  }

  function getValue<K extends FieldKey<T>>(field: K): T[K]
  function getValue(field: string): unknown
  function getValue(field: string): unknown {
    return valueStore[field]
  }

  /** 获取表单值的浅拷贝快照，保留 Date/Dayjs 等实例。 */
  function getValues(): T & FormValues {
    return { ...toRaw(values) } as T & FormValues
  }

  async function validateSingleField(fieldName: string, trigger: ValidateTrigger): Promise<boolean> {
    const config = fieldConfigs.value.find(f => f.field === fieldName)
    const field = config ? runtimeRef.value.transformField(config) : undefined
    if (!field?.schema && !field?.validator) {
      clearFieldError(fieldName)
      return true
    }

    const snap = { ...values }
    const resolveSnap = createResolveSnap(snap)

    const shouldValidateHidden = trigger === 'submit' && field.submitWhenHidden
    const shouldValidateDisabled = trigger === 'submit' && field.submitWhenDisabled

    if (
      (!runtimeRef.value.resolveVisible(field, resolveSnap) && !shouldValidateHidden)
      || (runtimeRef.value.resolveDisabled(field, resolveSnap) && !shouldValidateDisabled)
    ) {
      clearFieldError(fieldName)
      return true
    }

    if (!shouldValidateOn(field, trigger))
      return true

    const fieldErrors = await validateFieldRules(snap[fieldName], field.schema, snap, field.validator)
    if (fieldErrors.length > 0) {
      errors.value = { ...errors.value, [fieldName]: fieldErrors }
    }
    else {
      clearFieldError(fieldName)
    }

    return fieldErrors.length === 0
  }

  async function validate(): Promise<boolean> {
    const formErrors = await validateForm({ ...values }, fieldConfigs.value, 'submit', runtimeRef.value)
    errors.value = formErrors
    if (Object.keys(formErrors).length > 0) {
      onError?.(formErrors)
      return false
    }
    return true
  }

  async function submit(): Promise<boolean> {
    if (!await validate())
      return false

    const snap = { ...values }
    const resolveSnap = createResolveSnap(snap)
    const submitValues: FormValues = {}
    for (const config of fieldConfigs.value) {
      const field = runtimeRef.value.transformField(config)
      if (!runtimeRef.value.resolveVisible(field, resolveSnap) && !field.submitWhenHidden)
        continue
      if (runtimeRef.value.resolveDisabled(field, resolveSnap) && !field.submitWhenDisabled)
        continue
      submitValues[field.field] = applyFieldTransform(field, snap[field.field], snap)
    }
    onSubmit?.(submitValues as T)
    return true
  }

  function reset() {
    initValues({})
    errors.value = {}
  }

  return {
    values,
    errors,
    visibilityMap,
    disabledMap,
    validate,
    validateSingleField,
    submit,
    reset,
    setValue,
    setValues,
    getValue,
    getValues,
    clearFieldError,
  }
}
