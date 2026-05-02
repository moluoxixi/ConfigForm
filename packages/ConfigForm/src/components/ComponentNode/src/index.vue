<script setup lang="ts">
import type { FormRuntimeContext } from '@/runtime'
import type { ResolvedComponentNode, ResolvedFormNode, SlotContent } from '@/types'
import { computed, defineComponent, ref } from 'vue'
import { useFormComponentNodeDevtools } from '@/composables/useDevtools'
import { useRuntime } from '@/composables/useRuntime'
import { isFieldConfig, isFormNodeConfig } from '@/models/node'

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

const props = withDefaults(defineProps<{
  node: ResolvedFormNode
  componentAttrs?: Record<string, unknown>
  componentListeners?: Record<string, (...args: unknown[]) => void>
  registerDevtools?: boolean
  runtimeContext?: FormRuntimeContext
  slotName?: string
}>(), {
  registerDevtools: true,
})

const runtimeRef = useRuntime()
const rootRef = ref<unknown>()

const currentRuntimeContext = computed<FormRuntimeContext>(() =>
  props.runtimeContext ?? runtimeRef.value.createContext(),
)

const attrs = computed(() => ({
  ...props.node.props,
  ...(props.componentAttrs ?? {}),
}))

const devtoolsNode = computed<ResolvedComponentNode | undefined>(() =>
  props.registerDevtools !== false && !isFieldConfig(props.node)
    ? props.node
    : undefined,
)

useFormComponentNodeDevtools({
  enabled: props.registerDevtools !== false,
  node: devtoolsNode,
  rootRef,
  slotName: computed(() => props.slotName),
})

type NormalizedSlotNode =
  | { key: string, kind: 'node', node: ResolvedFormNode }
  | { fn: () => unknown, key: string, kind: 'render' }

function normalizeResolvedSlotValue(value: SlotContent, slotName: string, path = '0'): NormalizedSlotNode[] {
  if (value == null || value === false)
    return []

  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      normalizeResolvedSlotValue(item as SlotContent, slotName, `${path}-${index}`),
    )
  }

  if (isFormNodeConfig(value)) {
    return [{
      key: `node-${slotName}-${path}`,
      kind: 'node',
      node: runtimeRef.value.resolveNode(value, currentRuntimeContext.value, `${slotName}.${path}`),
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

  const resolvedSlot = runtimeRef.value.resolveSlot(slotValue, context, `slots.${slotName}`)

  if (typeof resolvedSlot === 'function')
    return normalizeResolvedSlotValue(resolvedSlot(scope), slotName)

  return normalizeResolvedSlotValue(resolvedSlot, slotName)
}
</script>

<template>
  <component
    ref="rootRef"
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
          :slot-name="String(slotName)"
        />
        <SlotRender v-else :fn="slotNode.fn" />
      </template>
    </template>
  </component>
</template>
