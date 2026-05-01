import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { computed, defineComponent, h, ref } from 'vue'
import { provideNamespace, useBem, useNamespace } from '../src/composables/useNamespace'
import { resolveLabelWidth } from '../src/utils/style'

const NamespaceConsumer = defineComponent({
  name: 'NamespaceConsumer',
  setup() {
    const ns = useNamespace()
    const { b, e, m } = useBem(ns)

    return () => h('div', {
      class: [b('form'), e('form', 'label'), m('form', 'inline')],
    }, ns.value)
  },
})

describe('namespace utilities', () => {
  it('uses the default namespace without a provider', () => {
    const wrapper = mount(NamespaceConsumer)

    expect(wrapper.text()).toBe('cf')
    expect(wrapper.classes()).toContain('cf-form')
    expect(wrapper.classes()).toContain('cf-form__label')
    expect(wrapper.classes()).toContain('cf-form--inline')
  })

  it('provides namespace values from strings, refs, and computed refs', () => {
    const StringProvider = defineComponent({
      setup() {
        provideNamespace('demo')
        return () => h(NamespaceConsumer)
      },
    })

    const RefProvider = defineComponent({
      setup() {
        provideNamespace(ref('ref-ns'))
        return () => h(NamespaceConsumer)
      },
    })

    const ComputedProvider = defineComponent({
      setup() {
        provideNamespace(computed(() => 'computed-ns'))
        return () => h(NamespaceConsumer)
      },
    })

    expect(mount(StringProvider).text()).toBe('demo')
    expect(mount(RefProvider).text()).toBe('ref-ns')
    expect(mount(ComputedProvider).text()).toBe('computed-ns')
  })

  it('falls back to the default namespace when provider value is empty', () => {
    const EmptyProvider = defineComponent({
      setup() {
        provideNamespace('')
        return () => h(NamespaceConsumer)
      },
    })

    expect(mount(EmptyProvider).text()).toBe('cf')
  })
})

describe('style utilities', () => {
  it('normalizes numeric and string label widths', () => {
    expect(resolveLabelWidth()).toBeUndefined()
    expect(resolveLabelWidth(0)).toBeUndefined()
    expect(resolveLabelWidth(96)).toBe('96px')
    expect(resolveLabelWidth('8rem')).toBe('8rem')
  })
})
