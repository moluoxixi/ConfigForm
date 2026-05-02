<script setup lang="ts">
import type { FieldConfig, ResolvedField, SlotContent, SlotFieldConfig } from '@/types'
import type { FormRuntimeContext } from '@/runtime'
import { computed, defineComponent, ref } from 'vue'
import { useFormFieldDevtools } from '@/composables/useDevtools'
import { useBem, useNamespace } from '@/composables/useNamespace'
import { useRuntime } from '@/composables/useRuntime'
import { resolveLabelWidth } from '@/utils/style'

defineOptions({ name: 'FormField' })

/** 辅助组件：执行插槽渲染函数 */
const SlotRender = defineComponent({
  name: 'SlotRender',
  props: {
    fn: { type: Function, required: true },
    scope: { type: Object, default: undefined },
  },
  setup(props: { fn: (scope?: Record<string, unknown>) => unknown; scope?: Record<string, unknown> }) {
    return () => props.fn(props.scope)
  },
})

const props = defineProps<{
  field: ResolvedField
  modelValue: unknown
  error?: string[]
  inline?: boolean
  labelWidth?: string | number
  /** 由父层 visibilityMap 计算传入 */
  visible?: boolean
  /** 由父层 disabledMap 计算传入 */
  disabled?: boolean
  /** 当前表单运行时上下文，递归插槽字段会沿用它 */
  runtimeContext?: FormRuntimeContext
  /** 作为父组件插槽内容递归渲染时，只输出实际组件，不输出表单项外壳 */
  embedded?: boolean
  /** 当前字段来自父组件哪个 slot */
  slotName?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: unknown]
  'blur': [field: string]
  'change': [field: string]
}>()

const ns = useNamespace()
const { b, e, m } = useBem(ns)
const runtimeRef = useRuntime()
const rootRef = ref<unknown>()
const embeddedRef = computed(() => props.embedded === true)
const slotNameRef = computed(() => props.slotName)

const currentRuntimeContext = computed<FormRuntimeContext>(() => {
  const base = props.runtimeContext ?? runtimeRef.value.createContext()
  return {
    ...base,
    field: props.field,
  }
})

const fieldId = computed(() => {
  const safeFieldName = props.field.field.replace(/[^\w-]/g, '-')
  return `${ns.value}-${safeFieldName}-field`
})

const errorId = computed(() => `${fieldId.value}-error`)

const componentProps = computed(() => {
  const next = { ...(props.field.props ?? {}) }

  if (next.id == null)
    next.id = fieldId.value

  if (props.error?.length) {
    next['aria-invalid'] = true
    next['aria-describedby'] = errorId.value
  }

  if (props.disabled)
    next.disabled = true

  return next
})

const valueBinding = computed(() => {
  if (props.embedded && props.modelValue === undefined)
    return {}
  return { [props.field.valueProp]: props.modelValue }
})

const componentAttrs = computed(() => ({
  ...componentProps.value,
  ...valueBinding.value,
}))

useFormFieldDevtools({
  embedded: embeddedRef,
  field: computed(() => props.field),
  rootRef,
  slotName: slotNameRef,
})

type NormalizedSlotNode =
  | { field: ResolvedField, key: string, kind: 'field' }
  | { fn: () => unknown, key: string, kind: 'render' }

function isSlotFieldConfig(value: unknown): value is SlotFieldConfig {
  return Boolean(
    value
    && typeof value === 'object'
    && !Array.isArray(value)
    && 'component' in value,
  )
}

function toSlotField(config: SlotFieldConfig, slotName: string, path: string): ResolvedField {
  const field = {
    ...config,
    field: config.field ?? `${props.field.field}-${slotName}-${path}`,
  } as FieldConfig
  return runtimeRef.value.resolveField(field, currentRuntimeContext.value)
}

function normalizeResolvedSlotValue(value: SlotContent, slotName: string, path = '0'): NormalizedSlotNode[] {
  if (value == null || value === false)
    return []

  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      normalizeResolvedSlotValue(item as SlotContent, slotName, `${path}-${index}`),
    )
  }

  if (isSlotFieldConfig(value)) {
    return [{
      field: toSlotField(value, slotName, path),
      key: `field-${slotName}-${path}`,
      kind: 'field',
    }]
  }

  return [{
    fn: () => value,
    key: `render-${slotName}-${path}`,
    kind: 'render',
  }]
}

function normalizeSlotValue(slotValue: SlotContent, scope: Record<string, unknown> | undefined, slotName: string): NormalizedSlotNode[] {
  const context = {
    ...currentRuntimeContext.value,
    meta: {
      ...currentRuntimeContext.value.meta,
      slotScope: scope,
    },
  }

  const resolvedSlot = runtimeRef.value.resolveSlot(slotValue, context, `${props.field.field}.slots.${slotName}`)

  if (typeof resolvedSlot === 'function')
    return normalizeResolvedSlotValue(resolvedSlot(scope), slotName)

  return normalizeResolvedSlotValue(resolvedSlot, slotName)
}

function onChange(value: unknown) {
  emit('update:modelValue', value)
  emit('change', props.field.field)
}

function onBlur() {
  emit('blur', props.field.field)
}


</script>

<template>
  <component
    ref="rootRef"
    :is="field.component"
    v-if="embedded"
    v-bind="componentAttrs"
    @[field.trigger]="onChange"
    @[field.blurTrigger]="onBlur"
  >
    <template v-for="(slotValue, slotName) in field.slots" :key="slotName" #[slotName]="scope">
      <template
        v-for="slotNode in normalizeSlotValue(slotValue, scope, String(slotName))"
        :key="slotNode.key"
      >
        <FormField
          v-if="slotNode.kind === 'field'"
          :field="slotNode.field"
          :model-value="undefined"
          :runtime-context="currentRuntimeContext"
          :slot-name="String(slotName)"
          embedded
        />
        <SlotRender v-else :fn="slotNode.fn" />
      </template>
    </template>
  </component>

  <div
    v-else-if="visible !== false"
    ref="rootRef"
    :class="[b('field'), { [m('field', 'inline')]: inline }]"
    :style="!inline && field.span ? { gridColumn: `span ${field.span}` } : undefined"
  >
    <label
      v-if="field.label"
      :class="e('field', 'label')"
      :for="fieldId"
      :style="{ width: resolveLabelWidth(labelWidth) }"
    >
      {{ field.label }}
    </label>

    <div :class="e('field', 'control')">
      <component
        :is="field.component"
        v-bind="componentAttrs"
        @[field.trigger]="onChange"
        @[field.blurTrigger]="onBlur"
      >
        <template v-for="(slotValue, slotName) in field.slots" :key="slotName" #[slotName]="scope">
          <template
            v-for="slotNode in normalizeSlotValue(slotValue, scope, String(slotName))"
            :key="slotNode.key"
          >
            <FormField
              v-if="slotNode.kind === 'field'"
              :field="slotNode.field"
              :model-value="undefined"
              :runtime-context="currentRuntimeContext"
              :slot-name="String(slotName)"
              embedded
            />
            <SlotRender v-else :fn="slotNode.fn" />
          </template>
        </template>
      </component>

      <slot name="error" :error="error" :field="field">
        <div v-if="error?.length" :id="errorId" :class="e('field', 'error')">
          <span v-for="(msg, i) in error" :key="i">{{ msg }}</span>
        </div>
      </slot>
    </div>
  </div>
</template>
