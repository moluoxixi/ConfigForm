<script setup lang="ts">
import type { ResolvedField } from '@/types'
import { computed } from 'vue'
import FormComponent from '@/components/FormComponent'
import FormItem from '@/components/FormItem'
import { useFormContext } from '@/composables/useFormContext'

/**
 * FormField 组合 FormItem 与 FormComponent，保留带 label 字段的公共入口。
 *
 * 外壳、label 和 error 由 FormItem 处理；值绑定和组件渲染由 FormComponent 独立处理。
 */
defineOptions({ name: 'FormField' })

const props = defineProps<{
  field: ResolvedField
}>()

const ctx = useFormContext()

/** 生成内置 FormItem 的轻量 props，避免把完整字段配置传给外壳组件。 */
const formItemComponentProps = computed(() => ({
  field: props.field.field,
  formItemProps: props.field.formItemProps,
  label: props.field.label,
  required: typeof props.field.required === 'function'
    ? props.field.required(ctx.values)
    : props.field.required,
  span: props.field.span,
}))
</script>

<template>
  <FormItem
    v-bind="formItemComponentProps"
  >
    <FormComponent :field="field" />
  </FormItem>
</template>
