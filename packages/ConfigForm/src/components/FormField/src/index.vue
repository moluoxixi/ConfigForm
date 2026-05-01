<script setup lang="ts">
import type { FieldConfig, SlotContent, SlotFieldConfig } from '@/types'
import { computed, defineComponent } from 'vue'
import { FieldDef } from '@/models/FieldDef'
import { useBem, useNamespace } from '@/composables/useNamespace'
import { resolveLabelWidth } from '@/utils/style'

defineOptions({ name: 'FormField' })

/** 辅助组件：执行插槽渲染函数 */
const SlotRender = defineComponent({
  name: 'SlotRender',
  props: {
    fn: { type: Function, required: true },
    scope: { type: Object, default: undefined },
  },
  setup(props: { fn: (scope?: Record<string, any>) => any; scope?: Record<string, any> }) {
    return () => props.fn(props.scope)
  },
})

const props = defineProps<{
  field: FieldDef
  modelValue: any
  error?: string[]
  inline?: boolean
  labelWidth?: string | number
  /** 由父层 visibilityMap 计算传入 */
  visible?: boolean
  /** 由父层 disabledMap 计算传入 */
  disabled?: boolean
  /** 作为父组件插槽内容递归渲染时，只输出实际组件，不输出表单项外壳 */
  embedded?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: any]
  'blur': [field: string]
  'change': [field: string]
}>()

const ns = useNamespace()
const { b, e, m } = useBem(ns)

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

type NormalizedSlotNode =
  | { field: FieldDef, key: string, kind: 'field' }
  | { fn: () => any, key: string, kind: 'render' }

function isSlotFieldConfig(value: unknown): value is SlotFieldConfig {
  return Boolean(
    value
    && typeof value === 'object'
    && !Array.isArray(value)
    && 'component' in value,
  )
}

function toSlotFieldDef(config: FieldDef | SlotFieldConfig, slotName: string, path: string): FieldDef {
  if (config instanceof FieldDef)
    return config

  return new FieldDef({
    ...config,
    field: config.field ?? `${props.field.field}-${slotName}-${path}`,
  } as FieldConfig)
}

function normalizeResolvedSlotValue(value: SlotContent, slotName: string, path = '0'): NormalizedSlotNode[] {
  if (value == null || value === false)
    return []

  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      normalizeResolvedSlotValue(item as SlotContent, slotName, `${path}-${index}`),
    )
  }

  if (value instanceof FieldDef || isSlotFieldConfig(value)) {
    return [{
      field: toSlotFieldDef(value, slotName, path),
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

function normalizeSlotValue(slotValue: SlotContent, scope: Record<string, any> | undefined, slotName: string): NormalizedSlotNode[] {
  if (typeof slotValue === 'function')
    return normalizeResolvedSlotValue(slotValue(scope), slotName)

  return normalizeResolvedSlotValue(slotValue, slotName)
}

function onChange(value: any) {
  emit('update:modelValue', value)
  emit('change', props.field.field)
}

function onBlur() {
  emit('blur', props.field.field)
}


</script>

<template>
  <component
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
          embedded
        />
        <SlotRender v-else :fn="slotNode.fn" />
      </template>
    </template>
  </component>

  <div
    v-else-if="visible !== false"
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
