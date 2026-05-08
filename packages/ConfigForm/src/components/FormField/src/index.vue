<script setup lang="ts">
import type { ResolvedField } from '@/types'
import { computed } from 'vue'
import RecursiveField from '@/components/RecursiveField'
import { useFieldBinding } from '@/composables/useFieldBinding'
import { useFormContext } from '@/composables/useFormContext'
import { useBem, useNamespace } from '@/composables/useNamespace'
import { resolveSlotNodes } from '@/utils/slot'
import { resolveLabelWidth } from '@/utils/style'

interface InternalFieldSourceMeta {
  readonly id?: unknown
}

type ResolvedFieldWithDevtoolsSource = ResolvedField & {
  readonly __source?: InternalFieldSourceMeta
}

const DEVTOOLS_SOURCE_ID_ATTRIBUTE = 'data-cf-devtools-source-id'

/**
 * FormField 负责真实字段的 label、error、值绑定和字段组件渲染。
 *
 * props 使用 { field }，表单状态通过 inject 获取，不再复用 FormNode 的容器可见性逻辑。
 */
defineOptions({ name: 'FormField' })

const props = defineProps<{
  field: ResolvedField
}>()

defineSlots<{
  error?: (props: { error?: string[], field: ResolvedField }) => unknown
}>()

const ctx = useFormContext()
const ns = useNamespace()
const { b, e, m } = useBem(ns)

/** 当前真实字段配置；RecursiveField 只会把 ResolvedField 分派到本组件。 */
const resolvedField = computed(() => props.field)

const error = computed(() => ctx.errors[resolvedField.value.field])
const visible = computed(() => ctx.isVisible(resolvedField.value))

const fieldId = computed(() => {
  const safeFieldName = resolvedField.value.field.replace(/[^\w-]/g, '-')
  return `${ns.value}-${safeFieldName}-field`
})

const errorId = computed(() => `${fieldId.value}-error`)

const fieldSourceAttrs = computed<Record<string, string>>(() => {
  const sourceId = (resolvedField.value as ResolvedFieldWithDevtoolsSource).__source?.id
  const attrs: Record<string, string> = {}
  if (typeof sourceId === 'string' && sourceId.length > 0)
    attrs[DEVTOOLS_SOURCE_ID_ATTRIBUTE] = sourceId
  return attrs
})

const fieldAttrs = computed<Record<string, unknown>>(() => {
  const next: Record<string, unknown> = {}

  if (resolvedField.value.props.id == null)
    next.id = fieldId.value

  if (error.value?.length) {
    next['aria-invalid'] = true
    next['aria-describedby'] = errorId.value
  }

  return next
})

const { attrs: componentAttrs, listeners: componentListeners } = useFieldBinding(resolvedField, fieldAttrs)
</script>

<template>
  <div
    v-if="visible"
    v-bind="fieldSourceAttrs"
    :class="[b('field'), { [m('field', 'inline')]: ctx.inline }]"
    :style="!ctx.inline && resolvedField.span ? { gridColumn: `span ${resolvedField.span}` } : undefined"
  >
    <label
      v-if="resolvedField.label"
      :class="e('field', 'label')"
      :for="fieldId"
      :style="{ width: resolveLabelWidth(ctx.labelWidth) }"
    >
      {{ resolvedField.label }}
    </label>

    <div :class="e('field', 'control')">
      <component
        :is="resolvedField.component"
        v-bind="componentAttrs"
        v-on="componentListeners"
      >
        <template v-for="(slotValue, slotName) in resolvedField.slots" :key="slotName" #[slotName]>
          <template
            v-for="slotField in resolveSlotNodes(slotValue, String(slotName))"
            :key="slotField.key"
          >
            <RecursiveField
              :field="slotField.field"
            />
          </template>
        </template>
      </component>

      <slot name="error" :error="error" :field="resolvedField">
        <div v-if="error?.length" :id="errorId" :class="e('field', 'error')">
          <span v-for="(msg, i) in error" :key="i">{{ msg }}</span>
        </div>
      </slot>
    </div>
  </div>
</template>
