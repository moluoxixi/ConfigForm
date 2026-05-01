import type { ConfigFormExpose, RuntimeToken } from '../src/types'
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
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
  setup(_props, { attrs, slots }) {
    return () => h('span', attrs, slots.default?.())
  },
}))

function resolveTestField(field: ReturnType<typeof defineField>) {
  const runtime = createFormRuntime()
  return runtime.resolveField(field, runtime.createContext({ errors: {}, values: {} }))
}

describe('config form component', () => {
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

  it('renders object slot configs recursively including scoped slot functions', () => {
    const field = defineField({
      component: SlotHost,
      field: 'choice',
      slots: {
        default: [
          { component: SlotLeaf, props: { 'data-role': 'first' }, slots: { default: '第一个选项' } },
          { component: SlotLeaf, props: { 'data-role': 'second' }, slots: { default: '第二个选项' } },
        ],
        suffix: scope => ({
          component: SlotLeaf,
          props: { 'data-role': 'suffix' },
          slots: { default: String(scope?.label) },
        }),
        footer: '纯文本插槽',
      },
    })

    const wrapper = mount(FormField, {
      props: {
        field: resolveTestField(field),
        modelValue: undefined,
        visible: true,
      },
    })

    expect(wrapper.text()).toContain('第一个选项')
    expect(wrapper.text()).toContain('第二个选项')
    expect(wrapper.text()).toContain('后缀作用域')
    expect(wrapper.text()).toContain('纯文本插槽')
    expect(wrapper.find('[data-role="first"]').exists()).toBe(true)
    expect(wrapper.find('[data-role="suffix"]').exists()).toBe(true)
  })

  it('renders recursive slot fields while embedded', () => {
    const field = defineField({
      component: SlotHost,
      field: 'embedded-choice',
      slots: {
        default: [
          { component: SlotLeaf, props: { 'data-role': 'embedded' }, slots: { default: '嵌入选项' } },
        ],
      },
    })

    const wrapper = mount(FormField, {
      props: {
        embedded: true,
        field: resolveTestField(field),
        modelValue: undefined,
      },
    })

    expect(wrapper.text()).toContain('嵌入选项')
    expect(wrapper.find('[data-role="embedded"]').exists()).toBe(true)
  })
})
