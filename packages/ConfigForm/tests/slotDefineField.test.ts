import type { FieldConfig } from '../src/types'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, markRaw } from 'vue'

const defineFieldCalls: FieldConfig[] = []

vi.mock('@/models/FieldDef', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/models/FieldDef')>()

  return {
    ...actual,
    defineField: vi.fn((config: FieldConfig) => {
      defineFieldCalls.push(config)
      return new actual.FieldDef(config)
    }),
  }
})

const { default: FormField } = await import('../src/components/FormField/src/index.vue')
const { FieldDef } = await import('@/models/FieldDef')

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

describe('slot field configs', () => {
  it('does not call defineField while rendering object slot configs', () => {
    defineFieldCalls.length = 0

    mount(FormField, {
      props: {
        field: new FieldDef({
          component: SlotHost,
          field: 'choice',
          slots: {
            default: [
              { component: SlotLeaf, props: { 'data-role': 'first' }, slots: { default: '第一个选项' } },
            ],
          },
        }),
        modelValue: undefined,
        visible: true,
      },
    })

    expect(defineFieldCalls).toEqual([])
  })
})
