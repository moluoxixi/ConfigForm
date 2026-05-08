<script setup lang="ts">
import type { CSSProperties, StyleValue } from 'vue'
import type { ResolvedFormNode } from '@/types'
import { computed } from 'vue'
import RecursiveField from '@/components/RecursiveField'
import { useFormContext } from '@/composables/useFormContext'
import { resolveSlotNodes } from '@/utils/slot'

/**
 * FormNode 渲染已经解析过的节点组件，slot 中的 defineField 节点交给 RecursiveField 递归处理。
 */
defineOptions({ name: 'FormNode' })

const props = defineProps<{
  field: ResolvedFormNode
  componentAttrs?: Record<string, unknown>
  componentListeners?: Record<string, (...args: unknown[]) => Promise<boolean> | void>
}>()

const ctx = useFormContext()

/** 容器节点在 grid 模式下使用 runtime 已补齐的 span。 */
const containerStyle = computed<CSSProperties | undefined>(() => {
  if (ctx.inline) return undefined
  if ('field' in props.field) return undefined
  return { gridColumn: `span ${props.field.span}` }
})

/** 所有节点从无头控制器读取有效可见性，容器隐藏会同时隐藏整棵子树。 */
const visible = computed(() => ctx.isVisible(props.field))

/** 判断传入值是否是 Vue 可消费的 style 对象。 */
function isStyleObject(value: unknown): value is CSSProperties {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

/** 校验并读取用户透传的 Vue style 值，非法 style 直接抛错暴露配置问题。 */
function readStyleValue(value: unknown): StyleValue | undefined {
  if (value == null || value === false)
    return undefined

  if (typeof value === 'string' || isStyleObject(value) || Array.isArray(value))
    return value

  throw new TypeError('FormNode props.style must be a Vue style value')
}

/** 合并容器 grid span 和用户 style；字符串/数组 style 交给 Vue 的数组 style 语义处理。 */
function mergeStyleValue(baseStyle: CSSProperties | undefined, existingStyle: StyleValue | undefined): StyleValue | undefined {
  if (!baseStyle)
    return existingStyle
  if (!existingStyle)
    return baseStyle
  if (isStyleObject(existingStyle))
    return { ...baseStyle, ...existingStyle }
  return [baseStyle, existingStyle]
}

const attrs = computed(() => {
  const baseStyle = containerStyle.value
  const existingStyle = readStyleValue(props.field.props?.style)
  return {
    ...props.field.props,
    ...(props.componentAttrs ?? {}),
    style: mergeStyleValue(baseStyle, existingStyle),
  }
})

</script>

<template>
  <component
    v-if="visible"
    :is="field.component"
    v-bind="attrs"
    v-on="componentListeners ?? {}"
  >
    <template v-for="(slotValue, slotName) in field.slots" :key="slotName" #[slotName]>
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
</template>
