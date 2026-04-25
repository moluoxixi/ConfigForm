<script setup lang="ts">
import type { FieldDef } from './types'
import { useBem, useNamespace } from './useNamespace'

const props = defineProps<{
  field: FieldDef
  modelValue: any
  error?: string[]
  inline?: boolean
  labelWidth?: string | number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: any]
}>()

const ns = useNamespace()
const { b, e, m } = useBem(ns)

function onInput(value: any) {
  emit('update:modelValue', value)
}

/** 解析 labelWidth 为 CSS 值 */
function resolveLabelWidth(): string | undefined {
  if (!props.labelWidth)
    return undefined
  return typeof props.labelWidth === 'number' ? `${props.labelWidth}px` : props.labelWidth
}
</script>

<template>
  <div
    :class="[b('field'), { [m('field', 'inline')]: inline }]"
    :style="!inline && field.span ? { gridColumn: `span ${field.span}` } : undefined"
  >
    <!-- Label -->
    <label
      v-if="field.label"
      :class="e('field', 'label')"
      :style="{ width: resolveLabelWidth() }"
    >
      {{ field.label }}
    </label>

    <!-- 控件区域 -->
    <div :class="e('field', 'control')">
      <component
        :is="field.component"
        v-bind="field.props"
        :model-value="modelValue"
        @update:model-value="onInput"
      />

      <!-- 错误信息 slot -->
      <slot name="error" :error="error" :field="field">
        <div v-if="error?.length" :class="e('field', 'error')">
          <span v-for="(msg, i) in error" :key="i">{{ msg }}</span>
        </div>
      </slot>
    </div>
  </div>
</template>

<style lang="scss">
.#{$namespace}-field {
  display: flex;
  align-items: flex-start;
  gap: $--field-gap;

  &--inline {
    display: inline-flex;
    margin-right: 16px;
    align-items: center;
  }

  &__label {
    flex-shrink: 0;
    font-size: $--label-font-size;
    line-height: $--label-line-height;
    text-align: right;
    white-space: nowrap;
  }

  &--inline &__label {
    line-height: normal;
  }

  &__control {
    flex: 1;
    min-width: 0;
  }

  &__error {
    margin-top: $--error-margin-top;
    font-size: $--error-font-size;
    color: $--error-color;
    line-height: $--error-line-height;

    span {
      display: block;
    }
  }
}
</style>
