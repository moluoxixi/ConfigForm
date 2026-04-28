<script setup lang="ts" generic="T extends object = Record<string, any>">
import { computed } from 'vue'
import type { ConfigFormEmits, ConfigFormExpose, ConfigFormProps } from '@/types'
import FormField from '@/components/FormField'
import { useForm } from '@/composables/useForm'
import { useBem, provideNamespace } from '@/composables/useNamespace'
import { resolveLabelWidth } from '@/utils/style'


const props = withDefaults(defineProps<ConfigFormProps<T>>(), {
  namespace: 'cf',
})

const emit = defineEmits<ConfigFormEmits<T>>()

const namespaceRef = computed(() => props.namespace)
provideNamespace(namespaceRef)
const { b, m } = useBem(namespaceRef)

const resolvedFields = computed(() => props.fields)

const { values, errors, visibilityMap, disabledMap, validate, validateSingleField, submit, reset, setValue } = useForm({
  fields: resolvedFields,
  initialValues: props.initialValues,
  onSubmit: vals => emit('submit', vals),
  onError: errs => emit('error', errs),
})

defineExpose<ConfigFormExpose<T>>({ submit, validate, reset })


</script>

<template>
  <form
    :class="[b('form'), { [m('form', 'inline')]: inline }]"
    @submit.prevent="submit()"
  >
    <template v-for="field in resolvedFields" :key="field.field">
      <FormField
        :field="field"
        :model-value="values[field.field]"
        :error="errors[field.field]"
        :inline="inline"
        :label-width="resolveLabelWidth(labelWidth)"
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
