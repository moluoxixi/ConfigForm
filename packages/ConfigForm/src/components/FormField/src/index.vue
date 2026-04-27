<script setup lang="ts">
import type { FieldDef } from '@/models/FieldDef'
import { useBem, useNamespace } from '@/composables/useNamespace'

const props = defineProps<{
  field: FieldDef
  modelValue: any
  error?: string[]
  inline?: boolean
  labelWidth?: string | number
  /** 由父层 visibilityMap 计算传入 */
  visible?: boolean
  /** 由父层 disabledMap 计算传入 */
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: any]
  'blur': [field: string]
  'change': [field: string]
}>()

const ns = useNamespace()
const { b, e, m } = useBem(ns)

function onInput(value: any) {
  emit('update:modelValue', value)
  emit('change', props.field.field)
}

function onBlur() {
  emit('blur', props.field.field)
}

function resolveLabelWidth(): string | undefined {
  if (!props.labelWidth)
    return undefined
  return typeof props.labelWidth === 'number' ? `${props.labelWidth}px` : props.labelWidth
}
</script>

<template>
  <div
    v-if="visible !== false"
    :class="[b('field'), { [m('field', 'inline')]: inline }]"
    :style="!inline && field.span ? { gridColumn: `span ${field.span}` } : undefined"
  >
    <label
      v-if="field.label"
      :class="e('field', 'label')"
      :style="{ width: resolveLabelWidth() }"
    >
      {{ field.label }}
    </label>

    <div :class="e('field', 'control')">
      <component
        :is="field.component"
        v-bind="field.props"
        :[field.valueProp]="modelValue"
        @[field.trigger]="onInput"
        @blur="onBlur"
        :disabled="disabled || undefined"
      />

      <slot name="error" :error="error" :field="field">
        <div v-if="error?.length" :class="e('field', 'error')">
          <span v-for="(msg, i) in error" :key="i">{{ msg }}</span>
        </div>
      </slot>
    </div>
  </div>
</template>
