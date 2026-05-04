<script setup lang="ts">
import type { FormRuntimeResolveSnap } from '@/runtime'
import type { FormErrors, FormValues, ResolvedField, ResolvedFormNode } from '@/types'
import { computed } from 'vue'
import ComponentNode from '@/components/ComponentNode'
import FormField from '@/components/FormField'
import { isResolvedFieldConfig } from '@/models/node'

/**
 * RecursiveField 负责在字段节点和容器节点之间分派渲染，并沿 slot 树传递表单状态。
 */
defineOptions({ name: 'RecursiveField' })

const props = defineProps<{
  node: ResolvedFormNode
  values: FormValues
  errors: FormErrors
  visibilityMap: Record<string, boolean>
  disabledMap: Record<string, boolean>
  inline?: boolean
  labelWidth?: string | number
  resolveSnap?: FormRuntimeResolveSnap
}>()

defineSlots<{
  'field-error'?: (props: { error?: string[], field: ResolvedField }) => unknown
}>()

const emit = defineEmits<{
  'update:fieldValue': [field: string, value: unknown]
  'fieldBlur': [field: string]
  'fieldChange': [field: string]
}>()

const fieldNode = computed(() => isResolvedFieldConfig(props.node) ? props.node : undefined)

/**
 * 将当前字段节点的模型值变更转发给父级表单。
 *
 * 组件节点没有 field 绑定，若误触发该路径会直接抛错暴露递归边界问题。
 */
function emitCurrentFieldValue(value: unknown) {
  if (!fieldNode.value)
    throw new Error('Cannot update a component node without field')

  emit('update:fieldValue', fieldNode.value.field, value)
}
</script>

<template>
  <FormField
    v-if="fieldNode"
    :field="fieldNode"
    :model-value="values[fieldNode.field]"
    :error="errors[fieldNode.field]"
    :inline="inline"
    :label-width="labelWidth"
    :resolve-snap="resolveSnap"
    :visible="visibilityMap[fieldNode.field]"
    :disabled="disabledMap[fieldNode.field]"
    @update:model-value="emitCurrentFieldValue"
    @blur="(name: string) => emit('fieldBlur', name)"
    @change="(name: string) => emit('fieldChange', name)"
  >
    <template #default="{ componentAttrs, componentListeners, resolveSnap: fieldResolveSnap }">
      <ComponentNode
        :node="fieldNode"
        :component-attrs="componentAttrs"
        :component-listeners="componentListeners"
        :resolve-snap="fieldResolveSnap"
      >
        <template #node="{ node: childNode, resolveSnap: childResolveSnap }">
          <RecursiveField
            :node="childNode"
            :values="values"
            :errors="errors"
            :visibility-map="visibilityMap"
            :disabled-map="disabledMap"
            :inline="inline"
            :label-width="labelWidth"
            :resolve-snap="childResolveSnap"
            @update:field-value="(field: string, value: unknown) => emit('update:fieldValue', field, value)"
            @field-blur="(field: string) => emit('fieldBlur', field)"
            @field-change="(field: string) => emit('fieldChange', field)"
          >
            <template #field-error="slotProps">
              <slot name="field-error" v-bind="slotProps" />
            </template>
          </RecursiveField>
        </template>
      </ComponentNode>
    </template>

    <template #error="slotProps">
      <slot name="field-error" v-bind="slotProps" />
    </template>
  </FormField>

  <ComponentNode
    v-else
    :node="node"
    :resolve-snap="resolveSnap"
  >
    <template #node="{ node: childNode, resolveSnap: childResolveSnap }">
      <RecursiveField
        :node="childNode"
        :values="values"
        :errors="errors"
        :visibility-map="visibilityMap"
        :disabled-map="disabledMap"
        :inline="inline"
        :label-width="labelWidth"
        :resolve-snap="childResolveSnap"
        @update:field-value="(field: string, value: unknown) => emit('update:fieldValue', field, value)"
        @field-blur="(field: string) => emit('fieldBlur', field)"
        @field-change="(field: string) => emit('fieldChange', field)"
      >
        <template #field-error="slotProps">
          <slot name="field-error" v-bind="slotProps" />
        </template>
      </RecursiveField>
    </template>
  </ComponentNode>
</template>
