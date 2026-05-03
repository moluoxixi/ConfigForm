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

function resolveDevtoolsSourceId(node: ResolvedFormNode): string | undefined {
  const source = (node as { __source?: { id?: unknown } }).__source
  return typeof source?.id === 'string' && source.id.length > 0 ? source.id : undefined
}

const devtoolsAttrs = computed(() => {
  const sourceId = resolveDevtoolsSourceId(props.node)
  return sourceId
    ? { 'data-cf-devtools-source-id': sourceId }
    : {}
})

const attrs = computed(() => ({
  ...props.node.props,
  ...(props.componentAttrs ?? {}),
  ...devtoolsAttrs.value,
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
    fn: () => value,
    key: `render-${slotName}-${path}`,
    kind: 'render',
  }]
}

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
