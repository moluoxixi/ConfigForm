<script setup lang="ts">
import type { FormRuntimeResolveSnap } from '@/runtime'
import type { ResolvedField } from '@/types'
import { computed } from 'vue'
import { useBem, useNamespace } from '@/composables/useNamespace'
import { useRuntime } from '@/composables/useRuntime'
import { resolveLabelWidth } from '@/utils/style'

interface InternalFieldSourceMeta {
  readonly id?: unknown
}

type ResolvedFieldWithDevtoolsSource = ResolvedField & {
  readonly __source?: InternalFieldSourceMeta
}

const DEVTOOLS_SOURCE_ID_ATTRIBUTE = 'data-cf-devtools-source-id'

/**
 * FormField 负责单个真实字段的布局、组件事件适配和校验错误展示。
 */
defineOptions({ name: 'FormField' })

const props = defineProps<{
  field: ResolvedField
  modelValue: unknown
  error?: string[]
  inline?: boolean
  labelWidth?: string | number
  /** 由父层 visibilityMap 计算传入 */
  visible?: boolean
  /** 由父层 disabledMap 计算传入 */
  disabled?: boolean
  /** 当前解析快照，递归字段会沿用它 */
  resolveSnap?: FormRuntimeResolveSnap
}>()

const emit = defineEmits<{
  'update:modelValue': [value: unknown]
  'blur': [field: string]
  'change': [field: string]
}>()

const ns = useNamespace()
const { b, e, m } = useBem(ns)
const runtimeRef = useRuntime()

const currentResolveSnap = computed<FormRuntimeResolveSnap>(() => {
  const base = props.resolveSnap ?? runtimeRef.value.createResolveSnap()
  return {
    ...base,
    field: props.field,
  }
})

const fieldId = computed(() => {
  const safeFieldName = props.field.field.replace(/[^\w-]/g, '-')
  return `${ns.value}-${safeFieldName}-field`
})

const errorId = computed(() => `${fieldId.value}-error`)

/**
 * 生成字段根节点的 devtools 源码定位属性。
 *
 * `__source` 是 Vite devtools 插件注入的内部元信息，不属于公开 FieldConfig 输入。
 */
const fieldSourceAttrs = computed<Record<string, string>>(() => {
  const sourceId = (props.field as ResolvedFieldWithDevtoolsSource).__source?.id
  const attrs: Record<string, string> = {}
  if (typeof sourceId === 'string' && sourceId.length > 0)
    attrs[DEVTOOLS_SOURCE_ID_ATTRIBUTE] = sourceId
  return attrs
})

const componentProps = computed(() => {
  const next = { ...(props.field.props ?? {}) }

  if (next.id == null)
    next.id = fieldId.value

  if (props.error?.length) {
    next['aria-invalid'] = true
    next['aria-describedby'] = errorId.value
  }

  if (props.disabled)
    next.disabled = true

  return next
})

const componentAttrs = computed(() => ({
  ...componentProps.value,
  [props.field.valueProp]: props.modelValue,
}))

const componentListeners = computed<Record<string, (...args: unknown[]) => void>>(() => ({
  /**
   * 将组件 blur 类事件映射为字段级校验触发点。
   *
   * 事件参数不参与字段名推导，字段来源固定为当前 ResolvedField。
   */
  [props.field.blurTrigger]: () => onBlur(),
  /**
   * 将组件值变更事件映射为 ConfigForm 模型更新。
   *
   * 参数保持原样交给 getValueFromEvent 或默认取第一个事件参数。
   */
  [props.field.trigger]: (...args: unknown[]) => onChange(...args),
}))

/**
 * 响应字段组件的值变更事件。
 *
 * 只更新当前字段模型值并触发 change 校验事件，不直接执行校验或提交。
 */
function onChange(...args: unknown[]) {
  const value = props.field.getValueFromEvent
    ? props.field.getValueFromEvent(...args)
    : args[0]

  emit('update:modelValue', value)
  emit('change', props.field.field)
}

/**
 * 响应字段组件的失焦事件。
 *
 * 仅向上通知当前字段名，具体校验时机由父级表单控制器决定。
 */
function onBlur() {
  emit('blur', props.field.field)
}
</script>

<template>
  <div
    v-if="visible !== false"
    v-bind="fieldSourceAttrs"
    :class="[b('field'), { [m('field', 'inline')]: inline }]"
    :style="!inline && field.span ? { gridColumn: `span ${field.span}` } : undefined"
  >
    <label
      v-if="field.label"
      :class="e('field', 'label')"
      :for="fieldId"
      :style="{ width: resolveLabelWidth(labelWidth) }"
    >
      {{ field.label }}
    </label>

    <div :class="e('field', 'control')">
      <slot
        :component-attrs="componentAttrs"
        :component-listeners="componentListeners"
        :resolve-snap="currentResolveSnap"
      >
        <component
          :is="field.component"
          v-bind="componentAttrs"
          v-on="componentListeners"
        />
      </slot>

      <slot name="error" :error="error" :field="field">
        <div v-if="error?.length" :id="errorId" :class="e('field', 'error')">
          <span v-for="(msg, i) in error" :key="i">{{ msg }}</span>
        </div>
      </slot>
    </div>
  </div>
</template>
