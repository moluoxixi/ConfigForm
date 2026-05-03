<script setup lang="ts">
import type { FormRuntimeContext } from '@/runtime'
import type { ResolvedFormNode, SlotContent } from '@/types'
import { computed, defineComponent } from 'vue'
import { useRuntime } from '@/composables/useRuntime'
import { isFormNodeConfig } from '@/models/node'

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
  runtimeContext?: FormRuntimeContext
}>()

const runtimeRef = useRuntime()

const currentRuntimeContext = computed<FormRuntimeContext>(() =>
  props.runtimeContext ?? runtimeRef.value.createContext(),
)

const attrs = computed(() => ({
  ...props.node.props,
  ...(props.componentAttrs ?? {}),
}))

type NormalizedSlotNode =
  | { key: string, kind: 'node', node: ResolvedFormNode, runtimeContext: FormRuntimeContext }
  | { fn: () => unknown, key: string, kind: 'render' }

type SlotRuntimeContext = FormRuntimeContext & { slotName: string }

function normalizeResolvedSlotValue(value: SlotContent, context: SlotRuntimeContext, path = '0'): NormalizedSlotNode[] {
  if (value == null || value === false)
    return []

  const { slotName } = context

  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      normalizeResolvedSlotValue(item as SlotContent, context, `${path}-${index}`),
    )
  }

  if (isFormNodeConfig(value)) {
    return [{
      key: `node-${slotName}-${path}`,
      kind: 'node',
      node: runtimeRef.value.resolveNode(value, context, `${slotName}.${path}`),
      runtimeContext: context,
    }]
  }

  return [{
    fn: () => value,
    key: `render-${slotName}-${path}`,
    kind: 'render',
  }]
}

function normalizeSlotValue(slotValue: SlotContent, scope: Record<string, unknown> | undefined, slotName: string): NormalizedSlotNode[] {
  const context: SlotRuntimeContext = {
    ...currentRuntimeContext.value,
    slotName,
    slotScope: scope,
  }
  const resolvedSlot = runtimeRef.value.resolveSlot(slotValue, context, `slots.${slotName}`)

  if (typeof resolvedSlot === 'function')
    return normalizeResolvedSlotValue(resolvedSlot(scope), context)

  return normalizeResolvedSlotValue(resolvedSlot, context)
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
          :runtime-context="slotNode.runtimeContext"
        />
        <SlotRender v-else :fn="slotNode.fn" />
      </template>
    </template>
  </component>
</template>
