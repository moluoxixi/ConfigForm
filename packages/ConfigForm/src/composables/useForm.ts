import type { Ref } from 'vue'
import { computed, reactive, ref, watch } from 'vue'
import type { FormErrors, FormValues, ValidateTrigger } from '@/types'
import type { FieldDef } from '@/models/FieldDef'
import { validateField, validateForm } from '@/utils/validate'

export interface UseFormOptions {
  fields: Ref<FieldDef[]>
  initialValues?: Record<string, any>
  onSubmit?: (values: Record<string, any>) => void
  onError?: (errors: FormErrors) => void
}

export function useForm(options: UseFormOptions) {
  const { fields, initialValues, onSubmit, onError } = options

  const values = reactive<FormValues>({})
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
    onSubmit?.(submitValues)
    return true
  }

  // ── 重置 ─────────────────────────────────────────────────────

  function reset() {
    initValues()
    errors.value = {}
  }

  return { values, errors, visibilityMap, disabledMap, validate, validateSingleField, submit, reset, setValue, getValue }
}
