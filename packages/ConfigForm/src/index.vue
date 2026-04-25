<script setup lang="ts">
import { toRef, computed } from 'vue'
import type { ConfigFormEmits, ConfigFormExpose, ConfigFormProps } from '@/types'
import FormField from '@/components/FormField'
import { useForm } from '@/composables/useForm'
import { useBem, provideNamespace } from '@/composables/useNamespace'

const props = withDefaults(defineProps<ConfigFormProps>(), {
  namespace: 'cf',
})

const emit = defineEmits<ConfigFormEmits>()

const namespaceRef = computed(() => props.namespace)
provideNamespace(namespaceRef)
const { b, m } = useBem(namespaceRef)

const { values, errors, visibilityMap, disabledMap, validate, validateSingleField, submit, reset, setValue } = useForm({
  fields: toRef(props, 'fields'),
  initialValues: props.initialValues,
  onSubmit: vals => emit('submit', vals),
  onError: errs => emit('error', errs),
})

defineExpose<ConfigFormExpose>({ submit, validate, reset })

function resolveLabelWidth(): string | undefined {
  if (!props.labelWidth)
    return undefined
  return typeof props.labelWidth === 'number' ? `${props.labelWidth}px` : props.labelWidth
}
</script>

<template>
  <form
    :class="[b('form'), { [m('form', 'inline')]: inline }]"
    @submit.prevent="submit()"
  >
    <template v-for="field in fields" :key="field.field">
      <FormField
        :field="field"
        :model-value="values[field.field]"
        :error="errors[field.field]"
        :inline="inline"
        :label-width="resolveLabelWidth()"
        :visible="visibilityMap[field.field]"
        :disabled="disabledMap[field.field]"
        @update:model-value="(val: any) => setValue(field.field, val)"
        @blur="(name: string) => validateSingleField(name, 'blur')"
        @change="(name: string) => validateSingleField(name, 'change')"
      >
        <template #error="slotProps">
          <slot name="field-error" v-bind="slotProps" />
        </template>
      </FormField>
    </template>
  </form>
</template>
