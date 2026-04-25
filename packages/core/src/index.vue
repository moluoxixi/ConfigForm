<script setup lang="ts">
import { toRef } from 'vue'
import type { ConfigFormEmits, ConfigFormExpose, ConfigFormProps } from './types'
import FormField from './components/FormField'
import { useForm } from './composables/useForm'
import { provideNamespace, useBem, useNamespace } from './composables/useNamespace'

const props = withDefaults(defineProps<ConfigFormProps>(), {
  namespace: 'cf',
})

const emit = defineEmits<ConfigFormEmits>()

// 提供命名空间给子组件
provideNamespace(props.namespace)

const ns = useNamespace()
const { b, m } = useBem(ns)

const fieldsRef = toRef(props, 'fields')

const { values, errors, validate, submit, reset, setValue } = useForm({
  fields: fieldsRef,
  initialValues: props.initialValues,
  onSubmit: (vals) => {
    emit('submit', vals)
  },
  onError: (errs) => {
    emit('error', errs)
  },
})

defineExpose<ConfigFormExpose>({
  submit,
  validate,
  reset,
})

/** 原生 form 提交拦截 */
function onFormSubmit(e: Event) {
  e.preventDefault()
  submit()
}

/** 解析 labelWidth 为 CSS 值 */
function resolveLabelWidth(): string | undefined {
  if (!props.labelWidth)
    return undefined
  return typeof props.labelWidth === 'number' ? `${props.labelWidth}px` : props.labelWidth
}
</script>

<template>
  <form
    :class="[b('form'), { [m('form', 'inline')]: inline }]"
    @submit="onFormSubmit"
  >
    <template v-for="field in fields" :key="field.field">
      <FormField
        :field="field"
        :model-value="values[field.field]"
        :error="errors[field.field]"
        :inline="inline"
        :label-width="resolveLabelWidth()"
        @update:model-value="(val: any) => setValue(field.field, val)"
      >
        <template #error="slotProps">
          <slot name="field-error" v-bind="slotProps" />
        </template>
      </FormField>
    </template>
  </form>
</template>
