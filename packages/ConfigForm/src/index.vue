<script setup lang="ts" generic="T extends object = Record<string, unknown>">
import { computed, watch } from 'vue'
import type { ConfigFormEmits, ConfigFormExpose, ConfigFormProps } from '@/types'
import RecursiveField from '@/components/RecursiveField'
import { provideFormDevtoolsContext } from '@/composables/useDevtools'
import { useForm } from '@/composables/useForm'
import { provideNamespace, useBem } from '@/composables/useNamespace'
import { normalizeFormRuntime, provideRuntime } from '@/composables/useRuntime'
import { resolveLabelWidth } from '@/utils/style'


const props = withDefaults(defineProps<ConfigFormProps<T>>(), {
  namespace: 'cf',
})

const emit = defineEmits<ConfigFormEmits<T>>()

const namespaceRef = computed(() => props.namespace)
provideNamespace(namespaceRef)
provideFormDevtoolsContext()
const { b, m } = useBem(namespaceRef)

const rawNodes = computed(() => props.fields)
const initialValues = computed(() => props.modelValue)
const runtimeRef = computed(() => normalizeFormRuntime(props.runtime))
provideRuntime(runtimeRef)

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
  fields: rawNodes,
  initialValues,
  runtime: runtimeRef,
  onSubmit: vals => emit('submit', vals as T),
  onError: errs => emit('error', errs),
})

const runtimeContext = computed(() => runtimeRef.value.createContext({
  errors: errors.value,
  values: { ...values },
}))

const resolvedNodes = computed(() =>
  rawNodes.value.map((node, index) => runtimeRef.value.resolveNode(node, runtimeContext.value, `fields.${index}`)),
)

function nodeKey(node: typeof resolvedNodes.value[number], index: number): string {
  if ('field' in node)
    return node.field

  return node.__source?.id ?? `${String(node.component)}-${index}`
}

const keyedResolvedNodes = computed(() =>
  resolvedNodes.value.map((node, index) => ({
    key: nodeKey(node, index),
    node,
  })),
)

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
    <template v-for="item in keyedResolvedNodes" :key="item.key">
      <RecursiveField
        :node="item.node"
        :values="values"
        :errors="errors"
        :visibility-map="visibilityMap"
        :disabled-map="disabledMap"
        :inline="inline"
        :label-width="resolveLabelWidth(labelWidth)"
        :runtime-context="runtimeContext"
        @update:field-value="(field: string, val: unknown) => setValue(field, val)"
        @field-blur="(name: string) => validateSingleField(name, 'blur')"
        @field-change="(name: string) => validateSingleField(name, 'change')"
      >
        <template #field-error="slotProps">
          <slot name="field-error" v-bind="slotProps" />
        </template>
      </RecursiveField>
    </template>
  </form>
</template>
