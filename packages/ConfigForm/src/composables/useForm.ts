import type { MaybeRef, Ref } from 'vue'
import type { FormRuntimeInput } from '@/runtime'
import type { FieldKey, FormErrors, FormNodeConfig, FormValues, ValidateTrigger } from '@/types'
import { computed, reactive, ref, toRaw, toValue, watch } from 'vue'
import { normalizeFormRuntime } from '@/composables/useRuntime'
import { applyFieldTransform, normalizeField, shouldValidateOn } from '@/models/field'
import { collectFieldConfigs } from '@/models/node'
import { validateFieldRules, validateForm } from '@/utils/validate'

export interface UseFormOptions<T extends object = FormValues> {
  fields: Ref<FormNodeConfig[]>
  initialValues?: Ref<Partial<T> | undefined>
  runtime?: MaybeRef<FormRuntimeInput | undefined>
  onSubmit?: (values: T) => void
  onError?: (errors: FormErrors) => void
}

export function useForm<T extends object = FormValues>(options: UseFormOptions<T>) {
  const { fields, initialValues, onSubmit, onError } = options

  // T 提供外部类型安全，Record 允许内部动态 key 访问。
  const values = reactive<T & FormValues>({} as T & FormValues)
  const valueStore = values as FormValues
  const errors = ref<FormErrors>({})
  const runtimeRef = computed(() => normalizeFormRuntime(toValue(options.runtime)))
  const fieldConfigs = computed(() => collectFieldConfigs(fields.value))

  // ── 工具 ─────────────────────────────────────────────────────

  /** 从 errors 中移除指定字段的错误；不传字段名时清空全部错误 */
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

  // ── 初始化 ───────────────────────────────────────────────────

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

  function initValues(source: FormValues = (initialValues?.value ?? {}) as FormValues) {
    const next: FormValues = { ...source }
    for (const config of fieldConfigs.value) {
      const field = normalizeField(config)
      if (!Object.hasOwn(next, field.field))
        next[field.field] = field.defaultValue !== undefined ? field.defaultValue : undefined
    }
    syncValues(next)
  }

  watch(
    [fields, () => initialValues?.value],
    () => initValues(),
    { immediate: true, deep: true },
  )

  // ── 动态状态 ─────────────────────────────────────────────────

  function createRuntimeContext(snapshot: FormValues) {
    return runtimeRef.value.createContext({
      errors: errors.value,
      values: snapshot,
    })
  }

  const visibilityMap = computed<Record<string, boolean>>(() => {
    const snap = { ...values }
    const context = createRuntimeContext(snap)
    return Object.fromEntries(fieldConfigs.value.map(f => [f.field, runtimeRef.value.resolveVisible(f, context)]))
  })

  const disabledMap = computed<Record<string, boolean>>(() => {
    const snap = { ...values }
    const context = createRuntimeContext(snap)
    return Object.fromEntries(fieldConfigs.value.map(f => [f.field, runtimeRef.value.resolveDisabled(f, context)]))
  })

  // ── 值操作 ───────────────────────────────────────────────────

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

  /** 获取表单值的浅拷贝快照，保留 Date/Dayjs 等实例 */
  function getValues(): T & FormValues {
    return { ...toRaw(values) } as T & FormValues
  }

  // ── 校验 ─────────────────────────────────────────────────────

  async function validateSingleField(fieldName: string, trigger: ValidateTrigger): Promise<boolean> {
    const config = fieldConfigs.value.find(f => f.field === fieldName)
    const field = config ? normalizeField(config) : undefined
    if (!field?.schema && !field?.validator)
      return true

    const snap = { ...values }
    const context = createRuntimeContext(snap)

    const shouldValidateHidden = trigger === 'submit' && field.submitWhenHidden
    const shouldValidateDisabled = trigger === 'submit' && field.submitWhenDisabled

    if (
      (!runtimeRef.value.resolveVisible(field, context) && !shouldValidateHidden)
      || (runtimeRef.value.resolveDisabled(field, context) && !shouldValidateDisabled)
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

  // ── 提交 ─────────────────────────────────────────────────────

  async function submit(): Promise<boolean> {
    if (!await validate())
      return false

    const snap = { ...values }
    const context = createRuntimeContext(snap)
    const submitValues: FormValues = {}
    for (const config of fieldConfigs.value) {
      const field = normalizeField(config)
      if (!runtimeRef.value.resolveVisible(field, context) && !field.submitWhenHidden)
        continue
      if (runtimeRef.value.resolveDisabled(field, context) && !field.submitWhenDisabled)
        continue
      submitValues[field.field] = applyFieldTransform(field, snap[field.field], snap)
    }
    onSubmit?.(submitValues as T)
    return true
  }

  // ── 重置 ─────────────────────────────────────────────────────

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
