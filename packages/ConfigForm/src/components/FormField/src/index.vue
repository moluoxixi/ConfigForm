<script setup lang="ts">
import type { FormRuntimeContext } from '@/runtime'
import type { ResolvedField } from '@/types'
import { computed, ref } from 'vue'
import { useFormFieldDevtools } from '@/composables/useDevtools'
import { useBem, useNamespace } from '@/composables/useNamespace'
import { useRuntime } from '@/composables/useRuntime'
import { resolveLabelWidth } from '@/utils/style'

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
  /** 当前表单运行时上下文，递归字段会沿用它 */
  runtimeContext?: FormRuntimeContext
  /** 当前字段来自父组件哪个 slot */
  slotName?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: unknown]
  'blur': [field: string]
  'change': [field: string]
}>()

const ns = useNamespace()
const { b, e, m } = useBem(ns)
const runtimeRef = useRuntime()
const rootRef = ref<unknown>()
const slotNameRef = computed(() => props.slotName)

const currentRuntimeContext = computed<FormRuntimeContext>(() => {
  const base = props.runtimeContext ?? runtimeRef.value.createContext()
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
  [props.field.blurTrigger]: () => onBlur(),
  [props.field.trigger]: (...args: unknown[]) => onChange(...args),
}))

useFormFieldDevtools({
  field: computed(() => props.field),
  rootRef,
  slotName: slotNameRef,
})

function onChange(...args: unknown[]) {
  const value = props.field.getValueFromEvent
    ? props.field.getValueFromEvent(...args)
    : args[0]

  emit('update:modelValue', value)
  emit('change', props.field.field)
}

function onBlur() {
  emit('blur', props.field.field)
}
</script>

<template>
  <div
    v-if="visible !== false"
    ref="rootRef"
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
        :runtime-context="currentRuntimeContext"
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
