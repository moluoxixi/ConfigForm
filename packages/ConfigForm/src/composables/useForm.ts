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

  /**
   * 清理字段错误状态。
   *
   * 不传 fieldName 时清空整张表单错误；传入字段名时只移除该字段，调用方负责保证字段名来自当前表单拓扑。
   */
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

  /**
   * 将错误集合裁剪到当前真实字段集合。
   *
   * 字段拓扑变化时调用，避免已移除字段继续向视图暴露过期错误。
   */
  function syncErrorsToFields(fields: readonly Pick<FieldConfig, 'field'>[]) {
    const fieldNames = new Set(fields.map(field => field.field))
    const nextErrors = Object.fromEntries(
      Object.entries(errors.value).filter(([field]) => fieldNames.has(field)),
    )

    if (Object.keys(nextErrors).length !== Object.keys(errors.value).length)
      errors.value = nextErrors
  }

  /**
   * 用浅层快照同步 reactive 表单值。
   *
   * 该函数只增删改顶层字段，保留 Date、Dayjs 等实例引用，不做深层 normalize。
   */
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

  /**
   * 创建带字段默认值的表单值快照。
   *
   * pruneToFields 为 true 时会移除不属于当前真实字段拓扑的值，用于字段树变化后的状态收敛。
   */
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

  /**
   * 初始化或重建内部表单值。
   *
   * 默认读取外部 initialValues；调用时不会吞掉 runtime.transformField 抛出的配置错误。
   */
  function initValues(source: FormValues = (initialValues?.value ?? {}) as FormValues, pruneToFields = false) {
    const next = createValuesWithDefaults(source, pruneToFields)
    syncValues(next)
  }

  /**
   * 响应字段拓扑变化并同步值与错误边界。
   *
   * 只保留当前真实字段的值和错误，避免容器节点或已卸载字段参与提交。
   */
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

  /**
   * 基于当前错误和指定值快照创建 runtime 解析上下文。
   *
   * 调用方传入的 snapshot 是一次性读快照，后续 reactive values 变化不会反向更新该上下文。
   */
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

  /** 写入单个模型字段，并清除该字段已有校验错误。 */
  function setValue<K extends FieldKey<T>>(field: K, value: T[K]): void
  /** 写入运行时字符串字段，并清除该字段已有校验错误。 */
  function setValue(field: string, value: unknown): void
  /**
   * 写入单个字段值。
   *
   * 该函数不校验字段是否存在于当前拓扑，供组件事件和暴露 API 共享同一写入路径。
   */
  function setValue(field: string, value: unknown) {
    valueStore[field] = value
    clearFieldError(field)
  }

  /**
   * 批量写入模型值。
   *
   * replace 为 true 时按初始化语义重建默认值；否则仅覆盖传入字段并逐项清理错误。
   */
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

  /** 读取类型化字段值，返回值类型由外部 T 推导。 */
  function getValue<K extends FieldKey<T>>(field: K): T[K]
  /** 读取运行时字符串字段值，未知字段返回 undefined。 */
  function getValue(field: string): unknown
  /**
   * 从内部值存储读取单个字段。
   *
   * 该函数不触发校验，也不解析 runtime token，只返回当前模型层值。
   */
  function getValue(field: string): unknown {
    return valueStore[field]
  }

  /** 获取表单值的浅拷贝快照，保留 Date/Dayjs 等实例。 */
  function getValues(): T & FormValues {
    return { ...toRaw(values) } as T & FormValues
  }

  /**
   * 校验当前拓扑中的单个字段。
   *
   * 隐藏或禁用字段按提交配置决定是否跳过；schema 或 validator 抛错会原样透传给调用方。
   */
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

  /**
   * 执行整表提交级校验。
   *
   * 校验失败会同步 errors 并触发 onError；底层校验异常不转换为成功结果。
   */
  async function validate(): Promise<boolean> {
    const formErrors = await validateForm({ ...values }, fieldConfigs.value, 'submit', runtimeRef.value)
    errors.value = formErrors
    if (Object.keys(formErrors).length > 0) {
      onError?.(formErrors)
      return false
    }
    return true
  }

  /**
   * 校验并提交可参与提交的字段值。
   *
   * 仅提交 visible/disabled 规则允许的真实字段，并在提交前执行字段 transform。
   */
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

  /**
   * 重置内部值和错误状态。
   *
   * 重置后会重新写入当前字段默认值，不保留外部 initialValues 的旧编辑态。
   */
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
