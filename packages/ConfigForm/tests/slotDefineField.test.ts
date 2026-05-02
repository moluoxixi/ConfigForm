import type { FieldConfig, ResolvedField } from '../src/types'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, markRaw } from 'vue'

const defineFieldCalls = vi.hoisted(() => [] as FieldConfig[])

vi.mock('@/models/field', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/models/field')>()

  return {
    ...actual,
    defineField: vi.fn((config: FieldConfig) => {
      defineFieldCalls.push(config)
      return { ...config }
    }),
  }
})

const { default: FormField } = await import('../src/components/FormField/src/index.vue')
const { createFormRuntime } = await import('../src/runtime')

const SlotHost = markRaw(defineComponent({
  name: 'SlotHost',
  setup(_props, { slots }) {
    return () => h('div', slots.default?.())
  },
}))

const SlotLeaf = markRaw(defineComponent({
  name: 'SlotLeaf',
  setup(_props, { attrs, slots }) {
    return () => h('span', attrs, slots.default?.())
  },
}))

function resolveTestField(field: FieldConfig): ResolvedField {
  const runtime = createFormRuntime()
  return runtime.resolveField(field, runtime.createContext({ errors: {}, values: {} }))
}

describe('slot field configs', () => {
  it('does not call defineField while rendering object slot configs', () => {
    const field = resolveTestField({
      component: SlotHost,
      field: 'choice',
      slots: {
        default: [
          { component: SlotLeaf, props: { 'data-role': 'first' }, slots: { default: '第一个选项' } },
        ],
      },
    })

    defineFieldCalls.length = 0

    mount(FormField, {
      props: {
        field,
        modelValue: undefined,
        visible: true,
      },
    })

    expect(defineFieldCalls).toEqual([])
  })
})
