<script setup lang="ts" generic="T extends object = Record<string, any>">
import { computed, watch } from 'vue'
import type { ConfigFormEmits, ConfigFormExpose, ConfigFormProps } from '@/types'
import FormField from '@/components/FormField'
import { useForm } from '@/composables/useForm'
import { provideNamespace, useBem } from '@/composables/useNamespace'
import { resolveLabelWidth } from '@/utils/style'


const props = withDefaults(defineProps<ConfigFormProps<T>>(), {
  namespace: 'cf',
})

const emit = defineEmits<ConfigFormEmits<T>>()

const namespaceRef = computed(() => props.namespace)
provideNamespace(namespaceRef)
const { b, m } = useBem(namespaceRef)

const resolvedFields = computed(() => props.fields)
const initialValues = computed(() => props.modelValue)

const {
  values,
  errors,
  visibilityMap,
  disabledMap,
  validate,
  validateSingleField,
  submit,
  reset,
  setValue,
  setValues,
  getValue,
  getValues,
  clearFieldError,
} = useForm({
  fields: resolvedFields,
  initialValues,
  onSubmit: vals => emit('submit', vals as T),
  onError: errs => emit('error', errs),
})

// ── v-model：值变化时向上发出 ──────────────────────────────────
watch(values, (newVals) => {
  emit('update:modelValue', { ...newVals } as T)
}, { deep: true })

defineExpose<ConfigFormExpose<T>>({
  submit,
  validate,
  validateField: (field, trigger = 'submit') => validateSingleField(field, trigger),
  reset,
  setValue,
  setValues,
  getValue,
  getValues: getValues as () => T,
  clearValidate: clearFieldError,
})


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
