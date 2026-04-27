import type { Ref } from 'vue'
import { computed, reactive, ref, watch } from 'vue'
import type { FormErrors, FormValues, ValidateTrigger } from '@/types'
import type { FieldDef } from '@/models/FieldDef'
import { validateField, validateForm } from '@/utils/validate'

export interface UseFormOptions<T extends object = Record<string, any>> {
  fields: Ref<FieldDef[]>
  initialValues?: Partial<T>
  onSubmit?: (values: T) => void
  onError?: (errors: FormErrors) => void
}

export function useForm<T extends object = Record<string, any>>(options: UseFormOptions<T>) {
  const { fields, initialValues, onSubmit, onError } = options

  // 原因说明 1：T 作为泛型，可能包含必填属性。我们使用 reactive 初始化空对象，因此需要类型断言。
  // 同时，我们将 T 交叉上 Record<string, any>，这是因为在后续遍历与取值逻辑中，字段的 key 是动态生成的 string（如 values[field.field]），
  // TypeScript 无法保证这些动态字符串严格属于 keyof T。这样做直接消灭了下方所有针对 values 的 as any 断言。
  const values = reactive<T & Record<string, any>>({} as (T & Record<string, any>))
  const errors = ref<FormErrors>({})

  // ── 初始化 ───────────────────────────────────────────────────

  function initValues() {
    for (const key of Object.keys(values))
      delete values[key]
    for (const field of fields.value)
      values[field.field] = field.defaultValue !== undefined ? field.defaultValue : undefined
    if (initialValues) {
      for (const [key, val] of Object.entries(initialValues))
        values[key] = val
    }
  }

  watch(fields, initValues, { immediate: true, deep: false })

  // ── 动态状态 ─────────────────────────────────────────────────

  const visibilityMap = computed<Record<string, boolean>>(() => {
    const snap = { ...values }
    return Object.fromEntries(fields.value.map(f => [f.field, f.isVisible(snap)]))
  })

  const disabledMap = computed<Record<string, boolean>>(() => {
    const snap = { ...values }
    return Object.fromEntries(fields.value.map(f => [f.field, f.isDisabled(snap)]))
  })

  // ── 值操作 ───────────────────────────────────────────────────

  function setValue(field: string, value: any) {
    values[field] = value
    if (errors.value[field]) {
      const next = { ...errors.value }
      delete next[field]
      errors.value = next
    }
  }

  function getValue(field: string): any {
    return values[field]
  }

  // ── 校验 ─────────────────────────────────────────────────────

  async function validateSingleField(fieldName: string, trigger: ValidateTrigger): Promise<boolean> {
    const field = fields.value.find(f => f.field === fieldName)
    if (!field?.type)
      return true

    const snap = { ...values }

    if (!field.isVisible(snap) || field.isDisabled(snap)) {
      if (errors.value[fieldName]) {
        const next = { ...errors.value }
        delete next[fieldName]
        errors.value = next
      }
      return true
    }

    if (!field.shouldValidateOn(trigger))
      return true

    const fieldErrors = validateField(snap[fieldName], field.type, snap)
    errors.value = fieldErrors.length > 0
      ? { ...errors.value, [fieldName]: fieldErrors }
      : (({ [fieldName]: _, ...rest }) => rest)(errors.value)

    return fieldErrors.length === 0
  }

  async function validate(): Promise<boolean> {
    const formErrors = validateForm({ ...values }, fields.value, 'submit')
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
    const submitValues: FormValues = {}
    for (const field of fields.value) {
      if (!field.isVisible(snap) || field.isDisabled(snap))
        continue
      submitValues[field.field] = field.applyTransform(snap[field.field], snap)
    }
    // 原因说明 2：submitValues 是根据动态的 fields 数组，在运行时挑选并执行 transform 后组装的纯净数据。
    // 在静态分析层面，TypeScript 无法确认它包含了 T 的所有必填属性，但对于外部使用者而言，
    // 这些被提取并转换后的最终数据就是 T。
    onSubmit?.(submitValues as T)
    return true
  }

  // ── 重置 ─────────────────────────────────────────────────────

  function reset() {
    initValues()
    errors.value = {}
  }

  return { values, errors, visibilityMap, disabledMap, validate, validateSingleField, submit, reset, setValue, getValue }
}
