<script setup lang="ts">
import type { ResolvedBoundNode } from '@/types'
import { computed } from 'vue'
import FormNode from '@/components/FormNode'
import { useFieldBinding } from '@/composables/useFieldBinding'
import { useFormContext } from '@/composables/useFormContext'

/**
 * FormComponent 基于 FormNode 封装，增加值绑定但无 label/error 外包装。
 *
 * props 与 FormField/FormNode 统一为 { field }，
 * 表单状态通过 inject 获取。
 */
defineOptions({ name: 'FormComponent' })

const props = defineProps<{
  field: ResolvedBoundNode
}>()

const ctx = useFormContext()

/** 当前组件字段配置；RecursiveField 只会把无 label 的 ResolvedField 分派到本组件。 */
const resolvedField = computed(() => props.field)

/**
 * 无 label 字段没有 FormItem 外壳，布局属性必须透传到真实组件根节点。
 *
 * data-cf-bound-field 仅作为渲染定位标记，不参与字段/容器分类，也不透传 field.id；
 * 这里不创建额外 DOM，避免破坏组件 slot 子节点的直接嵌套关系。
 */
const layoutAttrs = computed(() => {
  if (ctx.inline)
    return {
      'data-cf-bound-field': props.field.field,
    }

  return {
    'data-cf-bound-field': props.field.field,
    style: { gridColumn: `span ${props.field.span}` },
  }
})

const { attrs: boundAttrs, listeners: componentListeners } = useFieldBinding(resolvedField)

const componentAttrs = computed(() => ({
  ...boundAttrs.value,
  ...layoutAttrs.value,
}))
</script>

<template>
  <FormNode
    :field="field"
    :component-attrs="componentAttrs"
    :component-listeners="componentListeners"
  />
</template>
