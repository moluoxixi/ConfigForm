<script setup lang="ts">
import type { FormRuntimeResolveSnap } from '@/runtime'
import type { ResolvedFormNode, SlotContent } from '@/types'
import { computed, defineComponent } from 'vue'
import { useRuntime } from '@/composables/useRuntime'
import { isFormNodeConfig } from '@/models/node'

/**
 * ComponentNode 渲染已经解析过的容器/字段组件，并把 slot 中的节点继续交给递归层处理。
 */
defineOptions({ name: 'ComponentNode' })

const SlotRender = defineComponent({
  name: 'SlotRender',
  props: {
    fn: { type: Function, required: true },
    scope: { type: Object, default: undefined },
  },
  /**
   * 将传入的 slot 函数包装为可渲染组件。
   *
   * 该组件只负责转发当前 slot scope，不参与字段解析和表单状态写入。
   */
  setup(props: { fn: (scope?: Record<string, unknown>) => unknown, scope?: Record<string, unknown> }) {
    return () => props.fn(props.scope)
  },
})

const props = defineProps<{
  node: ResolvedFormNode
  componentAttrs?: Record<string, unknown>
  componentListeners?: Record<string, (...args: unknown[]) => void>
  resolveSnap?: FormRuntimeResolveSnap
}>()

const runtimeRef = useRuntime()

const currentResolveSnap = computed<FormRuntimeResolveSnap>(() =>
  props.resolveSnap ?? runtimeRef.value.createResolveSnap(),
)

const attrs = computed(() => ({
  ...props.node.props,
  ...(props.componentAttrs ?? {}),
}))

type NormalizedSlotNode =
  | { key: string, kind: 'node', node: ResolvedFormNode, resolveSnap: FormRuntimeResolveSnap }
  | { fn: () => unknown, key: string, kind: 'render' }

type SlotResolveSnap = FormRuntimeResolveSnap & { slotName: string }

/**
 * 将 runtime 解析后的 slot 返回值统一成渲染节点。
 *
 * 对象节点会继续通过 FormRuntime.resolveNode(...) 解析，普通 VNode/原始值则原样渲染。
 */
function normalizeResolvedSlotValue(value: SlotContent, resolveSnap: SlotResolveSnap, path = '0'): NormalizedSlotNode[] {
  if (value == null || value === false)
    return []

  const { slotName } = resolveSnap

  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      normalizeResolvedSlotValue(item as SlotContent, resolveSnap, `${path}-${index}`),
    )
  }

  if (isFormNodeConfig(value)) {
    return [{
      key: `node-${slotName}-${path}`,
      kind: 'node',
      node: runtimeRef.value.resolveNode(value, resolveSnap, `${slotName}.${path}`),
      resolveSnap,
    }]
  }

  return [{
    /**
     * 延迟渲染普通 slot 内容。
     *
     * 该函数只把已解析内容交给 Vue 渲染，不再参与节点拓扑收集。
     */
    fn: () => value,
    key: `render-${slotName}-${path}`,
    kind: 'render',
  }]
}

/**
 * 将单个 slot 配置转换为递归层可消费的渲染节点列表。
 *
 * 函数 slot 会在当前 scope 下执行；返回的字段节点继续携带同一 slot resolveSnap。
 */
function normalizeSlotValue(slotValue: SlotContent, scope: Record<string, unknown> | undefined, slotName: string): NormalizedSlotNode[] {
  const resolveSnap: SlotResolveSnap = {
    ...currentResolveSnap.value,
    slotName,
    slotScope: scope,
  }
  const resolvedSlot = runtimeRef.value.resolveSlot(slotValue, resolveSnap, `slots.${slotName}`)

  if (typeof resolvedSlot === 'function')
    return normalizeResolvedSlotValue(resolvedSlot(scope), resolveSnap)

  return normalizeResolvedSlotValue(resolvedSlot, resolveSnap)
}
</script>

<template>
  <component
    :is="node.component"
    v-bind="attrs"
    v-on="componentListeners ?? {}"
  >
    <template v-for="(slotValue, slotName) in node.slots" :key="slotName" #[slotName]="scope">
      <template
        v-for="slotNode in normalizeSlotValue(slotValue, scope, String(slotName))"
        :key="slotNode.key"
      >
        <slot
          v-if="slotNode.kind === 'node'"
          name="node"
          :node="slotNode.node"
          :resolve-snap="slotNode.resolveSnap"
        />
        <SlotRender v-else :fn="slotNode.fn" />
      </template>
    </template>
  </component>
</template>
