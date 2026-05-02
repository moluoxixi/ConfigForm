import type { ConfigFormExpose, RuntimeToken } from '../src/types'
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, markRaw, nextTick } from 'vue'
import { z } from 'zod'
import FormField from '../src/components/FormField/src/index.vue'
import ConfigForm from '../src/index.vue'
import { defineField } from '../src/models/field'
import { createFormRuntime, createRuntimeToken, expr } from '../src/runtime'

interface MessageToken extends RuntimeToken<string, 'message'> {
  key: string
  fallback?: string
}

function message(key: string, fallback?: string): MessageToken {
  return createRuntimeToken<string, 'message', Omit<MessageToken, '__configFormToken'>>('message', { fallback, key })
}

const TextInput = markRaw(defineComponent({
  name: 'TextInput',
  props: {
    disabled: Boolean,
    modelValue: { type: String, default: '' },
  },
  emits: ['update:modelValue', 'blur'],
  setup(props, { attrs, emit, slots }) {
    return () => h('div', [
      slots.prefix?.(),
      h('input', {
        ...attrs,
        disabled: props.disabled,
        value: props.modelValue,
        onBlur: () => emit('blur'),
        onInput: (event: Event) => {
          emit('update:modelValue', (event.target as HTMLInputElement).value)
        },
      }),
      slots.default?.(),
      slots.suffix?.(),
    ])
  },
}))

const CustomControl = markRaw(defineComponent({
  name: 'CustomControl',
  props: {
    current: { type: String, default: '' },
    disabled: Boolean,
  },
  emits: ['commit', 'focusout'],
  setup(props, { attrs, emit }) {
    return () => h('button', {
      ...attrs,
      disabled: props.disabled,
      type: 'button',
      onClick: () => emit('commit', 'next'),
      onFocusout: () => emit('focusout'),
    }, props.current)
  },
}))

const SlotHost = markRaw(defineComponent({
  name: 'SlotHost',
  setup(_props, { slots }) {
    return () => h('div', { 'data-testid': 'slot-host' }, [
      slots.default?.({ label: '默认作用域' }),
      slots.suffix?.({ label: '后缀作用域' }),
      slots.footer?.({ label: '底部作用域' }),
    ])
  },
}))

const SlotLeaf = markRaw(defineComponent({
  name: 'SlotLeaf',
  props: {
    role: String,
  },
  setup(props, { slots }) {
    return () => h('span', { 'data-role': props.role }, slots.default?.())
  },
}))

const CardContainer = markRaw(defineComponent({
  name: 'CardContainer',
  props: {
    title: String,
  },
  setup(props, { slots }) {
    return () => h('section', { 'data-card': props.title }, [
      h('h2', props.title),
      slots.default?.(),
    ])
  },
}))

function resolveTestField(field: ReturnType<typeof defineField>) {
  const runtime = createFormRuntime()
  return runtime.resolveField(field, runtime.createContext({ errors: {}, values: {} }))
}

describe('config form component', () => {
  it('renders component containers around real fields without binding container values', async () => {
    const fields = [
      {
        component: CardContainer,
        props: { title: '基础信息' },
        slots: {
          default: [
            {
              component: CardContainer,
              props: { title: '账号信息' },
              slots: {
                default: [
                  defineField({
                    component: TextInput,
                    field: 'username',
                    label: '用户名',
                    schema: z.string().min(4, '用户名至少 4 个字符'),
                    validateOn: 'blur',
                  }),
                ],
              },
            },
          ],
        },
      },
    ]

    const wrapper = mount(ConfigForm, {
      props: {
        fields,
        modelValue: {},
      },
    })

    expect(wrapper.find('[data-card="基础信息"]').exists()).toBe(true)
    expect(wrapper.find('[data-card="账号信息"]').exists()).toBe(true)
    expect(wrapper.findAll('label')).toHaveLength(1)
    expect(wrapper.get('label').text()).toBe('用户名')
    expect(wrapper.find('[data-card="基础信息"]').attributes('modelvalue')).toBeUndefined()

    await wrapper.get('input').setValue('Ada')
    await wrapper.get('input').trigger('blur')
    await flushPromises()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([{ username: 'Ada' }])
    expect(wrapper.text()).toContain('用户名至少 4 个字符')
  })

  it('reports form field topology and patch metrics to the devtools bridge', async () => {
    const bridge = {
      recordPatch: vi.fn(),
      registerField: vi.fn(),
      unregisterField: vi.fn(),
      updateField: vi.fn(),
    }
    ;(window as typeof window & { __CONFIG_FORM_DEVTOOLS_PENDING__?: boolean }).__CONFIG_FORM_DEVTOOLS_PENDING__ = true
    ;(window as typeof window & { __CONFIG_FORM_DEVTOOLS_BRIDGE__?: typeof bridge }).__CONFIG_FORM_DEVTOOLS_BRIDGE__ = bridge

    const source = {
      column: 3,
      file: 'D:/project-new/ConfigForm/playgrounds/element-plus-playground/src/demos/GridForm.vue',
      id: 'source-id',
      line: 55,
    }

    const fields = [
      defineField({
        __source: source,
        component: SlotHost,
        field: 'choice',
        label: '选择',
        slots: {
          default: [
            defineField({
              component: SlotLeaf,
              field: 'choice-first',
              label: '第一个',
              props: { role: 'first' },
              slots: { default: '第一个选项' },
            }),
          ],
        },
      }),
    ]

    const wrapper = mount(ConfigForm, {
      props: {
        fields,
        modelValue: {},
      },
    })

    await nextTick()

    const nodes = bridge.registerField.mock.calls.map(call => call[0])
    const parent = nodes.find(node => node.field === 'choice')
    const child = nodes.find(node => node.field === 'choice-first')

    expect(parent).toMatchObject({
      field: 'choice',
      kind: 'field',
      label: '选择',
      source,
    })
    expect(child).toMatchObject({
      field: 'choice-first',
      kind: 'field',
      parentId: parent.id,
      slotName: 'default',
    })
    expect(bridge.registerField.mock.calls[0]?.[1]).toBeInstanceOf(HTMLElement)
    expect(bridge.recordPatch).toHaveBeenCalledWith(expect.objectContaining({
      duration: expect.any(Number),
      id: parent.id,
      timestamp: expect.any(Number),
    }))
    expect(bridge.recordPatch).toHaveBeenCalledWith(expect.objectContaining({
      duration: expect.any(Number),
      id: child.id,
      timestamp: expect.any(Number),
    }))

    const mountedPatchCount = bridge.recordPatch.mock.calls.length

    await wrapper.setProps({ inline: true })
    await nextTick()

    expect(bridge.recordPatch.mock.calls.length).toBeGreaterThan(mountedPatchCount)
    expect(bridge.recordPatch).toHaveBeenCalledWith(expect.objectContaining({
      duration: expect.any(Number),
      id: parent.id,
      timestamp: expect.any(Number),
    }))

    wrapper.unmount()
    expect(bridge.unregisterField).toHaveBeenCalledWith(parent.id)

    delete (window as typeof window & { __CONFIG_FORM_DEVTOOLS_BRIDGE__?: typeof bridge }).__CONFIG_FORM_DEVTOOLS_BRIDGE__
    delete (window as typeof window & { __CONFIG_FORM_DEVTOOLS_PENDING__?: boolean }).__CONFIG_FORM_DEVTOOLS_PENDING__
  })

  it('registers fields when the devtools bridge becomes ready after mount', async () => {
    delete (window as typeof window & { __CONFIG_FORM_DEVTOOLS_BRIDGE__?: unknown }).__CONFIG_FORM_DEVTOOLS_BRIDGE__
    ;(window as typeof window & { __CONFIG_FORM_DEVTOOLS_PENDING__?: boolean }).__CONFIG_FORM_DEVTOOLS_PENDING__ = true

    const bridge = {
      recordPatch: vi.fn(),
      registerField: vi.fn(),
      unregisterField: vi.fn(),
      updateField: vi.fn(),
    }
    const fields = [
      defineField({
        component: TextInput,
        field: 'late-ready',
        label: '延迟注册',
      }),
    ]

    const wrapper = mount(ConfigForm, {
      props: {
        fields,
        modelValue: {},
      },
    })

    await nextTick()
    expect(bridge.registerField).not.toHaveBeenCalled()

    ;(window as typeof window & { __CONFIG_FORM_DEVTOOLS_BRIDGE__?: typeof bridge }).__CONFIG_FORM_DEVTOOLS_BRIDGE__ = bridge
    window.dispatchEvent(new CustomEvent('config-form-devtools:ready', { detail: bridge }))
    await nextTick()

    expect(bridge.registerField).toHaveBeenCalledWith(expect.objectContaining({
      field: 'late-ready',
      label: '延迟注册',
    }), expect.any(HTMLElement))
    expect(bridge.recordPatch).toHaveBeenCalledWith(expect.objectContaining({
      duration: expect.any(Number),
      id: bridge.registerField.mock.calls[0]?.[0].id,
      timestamp: expect.any(Number),
    }))

    wrapper.unmount()
    expect(bridge.unregisterField).toHaveBeenCalled()

    delete (window as typeof window & { __CONFIG_FORM_DEVTOOLS_BRIDGE__?: typeof bridge }).__CONFIG_FORM_DEVTOOLS_BRIDGE__
    delete (window as typeof window & { __CONFIG_FORM_DEVTOOLS_PENDING__?: boolean }).__CONFIG_FORM_DEVTOOLS_PENDING__
  })

  it('updates model values and renders blur validation errors', async () => {
    const fields = [
      defineField({
        field: 'username',
        label: '用户名',
        component: TextInput,
        schema: z.string().min(2, '用户名至少 2 个字符'),
        validateOn: 'blur',
      }),
    ]

    const wrapper = mount(ConfigForm, {
      props: {
        fields,
        labelWidth: 88,
        modelValue: {},
        namespace: 'strict',
      },
    })

    const input = wrapper.get('input')
    expect(wrapper.get('label').attributes('for')).toBe(input.attributes('id'))
    expect(wrapper.get('label').attributes('style')).toContain('width: 88px')

    await input.setValue('a')
    await input.trigger('blur')
    await flushPromises()

    expect(wrapper.text()).toContain('用户名至少 2 个字符')
    expect(wrapper.get('input').attributes('aria-invalid')).toBe('true')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([{ username: 'a' }])

    await wrapper.get('input').setValue('Ada')
    await wrapper.get('input').trigger('blur')
    await flushPromises()

    expect(wrapper.text()).not.toContain('用户名至少 2 个字符')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([{ username: 'Ada' }])
  })

  it('submits transformed visible values and respects hidden or disabled submit options', async () => {
    const fields = [
      defineField({
        field: 'visible',
        component: TextInput,
        defaultValue: 'ok',
        transform: value => value.toUpperCase(),
      }),
      defineField({
        field: 'hiddenSkipped',
        component: TextInput,
        defaultValue: 'skip',
        visible: () => false,
      }),
      defineField({
        field: 'disabledSkipped',
        component: TextInput,
        defaultValue: 'skip',
        disabled: () => true,
      }),
      defineField({
        field: 'hiddenKept',
        component: TextInput,
        defaultValue: 'keep-hidden',
        submitWhenHidden: true,
        visible: () => false,
      }),
      defineField({
        field: 'disabledKept',
        component: TextInput,
        defaultValue: 'keep-disabled',
        disabled: () => true,
        submitWhenDisabled: true,
      }),
    ]

    const wrapper = mount(ConfigForm, {
      props: {
        fields,
        modelValue: {},
      },
    })

    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.emitted('submit')?.[0]).toEqual([{
      disabledKept: 'keep-disabled',
      hiddenKept: 'keep-hidden',
      visible: 'OK',
    }])
  })

  it('exposes the imperative form API and supports custom field error slots', async () => {
    const fields = [
      defineField({
        field: 'name',
        component: TextInput,
        defaultValue: '',
        schema: z.string().min(2, '姓名至少 2 个字符'),
      }),
    ]

    const wrapper = mount(ConfigForm, {
      props: {
        fields,
        inline: true,
        modelValue: {},
      },
      slots: {
        'field-error': ({ error }: { error?: string[] }) =>
          h('strong', { 'data-testid': 'custom-error' }, error?.join('|')),
      },
    })

    const api = wrapper.vm as unknown as ConfigFormExpose<Record<string, unknown>>

    await expect(api.validateField('name')).resolves.toBe(false)
    expect(wrapper.find('[data-testid="custom-error"]').text()).toBe('姓名至少 2 个字符')
    expect(wrapper.get('form').classes()).toContain('cf-form--inline')

    api.setValue('name', 'Ada')
    await nextTick()
    expect(api.getValue('name')).toBe('Ada')
    await expect(api.validate()).resolves.toBe(true)

    api.setValues({ name: 'Grace' })
    await nextTick()
    expect(api.getValues()).toEqual({ name: 'Grace' })

    api.clearValidate('name')
    api.reset()
    await nextTick()
    expect(api.getValues()).toEqual({ name: '' })
  })

  it('resolves runtime registry, tokens, expressions, and nested slot configs', async () => {
    const events: string[] = []
    const runtime = createFormRuntime({
      components: {
        SlotLeaf,
        TextInput,
      },
      debug: {
        emit: event => events.push(event.type),
      },
      extensions: [
        {
          name: 'test-messages',
          tokens: {
            message: (token) => {
              const { fallback, key } = token as MessageToken
              const messages: Record<string, string> = {
                'field.nickname': '昵称',
                'field.nickname.placeholder': '请输入昵称',
                'slot.prefix': '前缀',
              }
              return messages[key] ?? fallback ?? key
            },
          },
        },
      ],
    })

    const fields = [
      defineField({
        field: 'role',
        component: TextInput,
        defaultValue: 'admin',
      }),
      defineField({
        field: 'nickname',
        label: message('field.nickname', 'Nickname'),
        component: 'TextInput',
        props: {
          placeholder: message('field.nickname.placeholder', 'Nickname placeholder'),
        },
        visible: expr({ left: { path: 'values.role' }, op: 'eq', right: 'admin' }, false),
        slots: {
          prefix: {
            component: 'SlotLeaf',
            props: { 'data-role': 'runtime-prefix' },
            slots: { default: message('slot.prefix', 'Prefix') },
          },
        },
      }),
    ]

    const wrapper = mount(ConfigForm, {
      props: {
        fields,
        modelValue: { role: 'admin' },
        runtime,
      },
    })

    expect(wrapper.text()).toContain('昵称')
    expect(wrapper.find('input[placeholder="请输入昵称"]').exists()).toBe(true)
    expect(wrapper.find('[data-role="runtime-prefix"]').text()).toBe('前缀')
    expect(events).toContain('field:resolved')

    const api = wrapper.vm as unknown as ConfigFormExpose<Record<string, unknown>>
    api.setValue('role', 'guest')
    await nextTick()

    expect(wrapper.text()).not.toContain('昵称')
  })
})

describe('form field component', () => {
  it('emits custom value and blur triggers through the public field contract', async () => {
    const field = defineField({
      blurTrigger: 'focusout',
      component: CustomControl,
      field: 'status',
      trigger: 'commit',
      valueProp: 'current',
    })

    const wrapper = mount(FormField, {
      props: {
        field: resolveTestField(field),
        modelValue: 'ready',
        visible: true,
      },
    })

    expect(wrapper.get('button').text()).toBe('ready')

    await wrapper.get('button').trigger('click')
    await wrapper.get('button').trigger('focusout')

    expect(wrapper.emitted('update:modelValue')).toEqual([['next']])
    expect(wrapper.emitted('change')).toEqual([['status']])
    expect(wrapper.emitted('blur')).toEqual([['status']])
  })

  it('renders field slot configs recursively including scoped slot functions', () => {
    const field = defineField({
      component: SlotHost,
      field: 'choice',
      slots: {
        default: [
          defineField({
            field: 'choice-first',
            component: SlotLeaf,
            props: { role: 'first' },
            slots: { default: '第一个选项' },
          }),
          defineField({
            field: 'choice-second',
            component: SlotLeaf,
            props: { role: 'second' },
            slots: { default: '第二个选项' },
          }),
        ],
        suffix: scope => defineField({
          field: 'choice-suffix',
          component: SlotLeaf,
          props: { role: 'suffix' },
          slots: { default: String(scope?.label) },
        }),
        footer: '纯文本插槽',
      },
    })

    const wrapper = mount(ConfigForm, {
      props: {
        fields: [field],
        modelValue: {},
      },
    })

    expect(wrapper.text()).toContain('第一个选项')
    expect(wrapper.text()).toContain('第二个选项')
    expect(wrapper.text()).toContain('后缀作用域')
    expect(wrapper.text()).toContain('纯文本插槽')
    expect(wrapper.find('[data-role="first"]').exists()).toBe(true)
    expect(wrapper.find('[data-role="suffix"]').exists()).toBe(true)
  })

  it('validates real fields rendered inside another field slot', async () => {
    const fields = [
      defineField({
        component: SlotHost,
        field: 'group',
        slots: {
          default: [
            defineField({
              component: TextInput,
              field: 'nestedName',
              label: '嵌套姓名',
              schema: z.string().min(2, '嵌套姓名至少 2 个字符'),
              validateOn: 'blur',
            }),
          ],
        },
      }),
    ]

    const wrapper = mount(ConfigForm, {
      props: {
        fields,
        modelValue: {},
      },
    })

    await wrapper.get('input').setValue('A')
    await wrapper.get('input').trigger('blur')
    await flushPromises()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([{
      group: undefined,
      nestedName: 'A',
    }])
    expect(wrapper.text()).toContain('嵌套姓名至少 2 个字符')

    await wrapper.get('input').setValue('Ada')
    await wrapper.get('input').trigger('blur')
    await flushPromises()

    expect(wrapper.text()).not.toContain('嵌套姓名至少 2 个字符')
  })

  it('renders component slot nodes without adding form field wrappers', () => {
    const fields = [
      {
        component: SlotHost,
        slots: {
          default: [
            {
              component: SlotLeaf,
              props: { role: 'slot-child' },
              slots: { default: '嵌入选项' },
            },
          ],
        },
      },
    ]

    const wrapper = mount(ConfigForm, {
      props: {
        fields,
        modelValue: {},
      },
    })

    expect(wrapper.text()).toContain('嵌入选项')
    expect(wrapper.find('[data-role="slot-child"]').exists()).toBe(true)
    expect(wrapper.find('.cf-field').exists()).toBe(false)
  })
})
