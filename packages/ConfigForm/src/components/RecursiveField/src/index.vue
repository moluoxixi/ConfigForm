<script setup lang="ts">
import type { FormRuntimeContext } from '@/runtime'
import type { FormErrors, FormValues, ResolvedField, ResolvedFormNode } from '@/types'
import { computed } from 'vue'
import ComponentNode from '@/components/ComponentNode'
import FormField from '@/components/FormField'
import { isFieldConfig } from '@/models/node'

defineOptions({ name: 'RecursiveField' })

const props = defineProps<{
  node: ResolvedFormNode
  values: FormValues
  errors: FormErrors
  visibilityMap: Record<string, boolean>
  disabledMap: Record<string, boolean>
  inline?: boolean
  labelWidth?: string | number
  runtimeContext?: FormRuntimeContext
  slotName?: string
}>()

defineSlots<{
  'field-error'?: (props: { error?: string[], field: ResolvedField }) => unknown
}>()

const emit = defineEmits<{
  'update:fieldValue': [field: string, value: unknown]
  'fieldBlur': [field: string]
  'fieldChange': [field: string]
}>()

const fieldNode = computed(() => isFieldConfig(props.node) ? props.node : undefined)

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
    :runtime-context="runtimeContext"
    :visible="visibilityMap[fieldNode.field]"
    :disabled="disabledMap[fieldNode.field]"
    :slot-name="slotName"
    @update:model-value="emitCurrentFieldValue"
    @blur="(name: string) => emit('fieldBlur', name)"
    @change="(name: string) => emit('fieldChange', name)"
  >
    <template #default="{ componentAttrs, componentListeners, runtimeContext: fieldRuntimeContext }">
      <ComponentNode
        :node="fieldNode"
        :component-attrs="componentAttrs"
        :component-listeners="componentListeners"
        :register-devtools="false"
        :runtime-context="fieldRuntimeContext"
      >
        <template #node="{ node: childNode, slotName: childSlotName }">
          <RecursiveField
            :node="childNode"
            :values="values"
            :errors="errors"
            :visibility-map="visibilityMap"
            :disabled-map="disabledMap"
            :inline="inline"
            :label-width="labelWidth"
            :runtime-context="fieldRuntimeContext"
            :slot-name="childSlotName"
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
    :runtime-context="runtimeContext"
    :slot-name="slotName"
  >
    <template #node="{ node: childNode, slotName: childSlotName }">
      <RecursiveField
        :node="childNode"
        :values="values"
        :errors="errors"
        :visibility-map="visibilityMap"
        :disabled-map="disabledMap"
        :inline="inline"
        :label-width="labelWidth"
        :runtime-context="runtimeContext"
        :slot-name="childSlotName"
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
