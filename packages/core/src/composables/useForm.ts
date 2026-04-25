import type { Ref } from 'vue'
import { reactive, ref, watch } from 'vue'
import type { FieldDef, FormErrors } from '../types'
import { validateForm } from '../utils/validate'

export interface UseFormOptions {
  fields: Ref<FieldDef[]>
  initialValues?: Record<string, any>
  onSubmit?: (values: Record<string, any>) => void
  onError?: (errors: FormErrors) => void
}

export function useForm(options: UseFormOptions) {
  const { fields, initialValues, onSubmit, onError } = options

  // 响应式表单值
  const values = reactive<Record<string, any>>({})

  // 响应式错误
  const errors = ref<FormErrors>({})

  // 初始化 values
  function initValues() {
    // 清空旧值
    for (const key of Object.keys(values))
      delete values[key]

    // 从 fields 初始化默认值
    for (const field of fields.value)
      values[field.field] = undefined

    // 覆盖初始值
    if (initialValues) {
      for (const [key, val] of Object.entries(initialValues))
        values[key] = val
    }
  }

  // 字段变化时重新初始化
  watch(fields, initValues, { immediate: true, deep: true })

  /** 设置指定字段值 */
  function setValue(field: string, value: any) {
    values[field] = value
    // 清除该字段的错误
    if (errors.value[field]) {
      const newErrors = { ...errors.value }
      delete newErrors[field]
      errors.value = newErrors
    }
  }

  /** 获取指定字段值 */
  function getValue(field: string): any {
    return values[field]
  }

  /** 校验所有字段，返回是否通过 */
  async function validate(): Promise<boolean> {
    const formErrors = validateForm({ ...values }, fields.value)
    errors.value = formErrors

    if (Object.keys(formErrors).length > 0) {
      onError?.(formErrors)
      return false
    }

    return true
  }

  /** 提交：先校验，通过触发 onSubmit，失败触发 onError */
  async function submit(): Promise<boolean> {
    const isValid = await validate()
    if (isValid) {
      onSubmit?.({ ...values })
    }
    return isValid
  }

  /** 重置表单值和错误 */
  function reset() {
    initValues()
    errors.value = {}
  }

  return {
    values,
    errors,
    validate,
    submit,
    reset,
    setValue,
    getValue,
  }
}
