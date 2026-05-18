<script setup lang="ts">
import type { ResolvedBoundNode } from '@/types'
import { computed } from 'vue'
import FormNode from '@/components/FormNode'
import { useFieldBinding } from '@/composables/useFieldBinding'

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

/** 当前组件字段配置；RecursiveField 只会把无 label 的 ResolvedField 分派到本组件。 */
const resolvedField = computed(() => props.field)

const { attrs: componentAttrs, listeners: componentListeners } = useFieldBinding(resolvedField)
</script>

<template>
  <FormNode
    :field="field"
    :component-attrs="componentAttrs"
    :component-listeners="componentListeners"
  />
</template>
