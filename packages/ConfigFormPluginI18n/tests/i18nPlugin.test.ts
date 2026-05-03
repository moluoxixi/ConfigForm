import type { RuntimeToken } from '@moluoxixi/config-form'
import { createFormRuntime, createRuntimeToken, defineField } from '@moluoxixi/config-form'
import { describe, expect, it } from 'vitest'
import { createI18nPlugin, i18n } from '../src'

interface FormValueToken<TValue = unknown> extends RuntimeToken<TValue, 'form-value'> {
  field: string
}

function formValue<TValue = unknown>(field: string): FormValueToken<TValue> {
  return createRuntimeToken<TValue, 'form-value', { field: string }>('form-value', { field })
}

describe('i18n plugin package', () => {
  it('resolves i18n tokens in field labels, props, nested props, and slots', () => {
    const runtime = createFormRuntime({
      plugins: [
        createI18nPlugin({
          locale: 'zh-CN',
          messages: {
            'zh-CN': {
              'field.name': '姓名 {name}',
              'field.name.placeholder': '请输入 {name}',
              'role.admin': '管理员',
              'role.user': '普通用户',
              'slot.help': '帮助 {name}',
            },
          },
        }),
      ],
    })

    const field = defineField({
      component: 'input',
      field: 'name',
      label: i18n('field.name', { params: { name: 'Ada' } }),
      props: {
        options: [
          { label: i18n('role.admin'), value: 'admin' },
          { label: i18n('role.user'), value: 'user' },
        ],
        placeholder: i18n('field.name.placeholder', { params: { name: 'Ada' } }),
      },
      slots: {
        default: i18n('slot.help', { params: { name: 'Ada' } }),
      },
    })
    const resolved = runtime.resolveField(field, runtime.createResolveSnap({ errors: {}, values: {} }))

    expect(resolved.label).toBe('姓名 Ada')
    expect(resolved.props.placeholder).toBe('请输入 Ada')
    expect(resolved.props.options).toEqual([
      { label: '管理员', value: 'admin' },
      { label: '普通用户', value: 'user' },
    ])
    expect(resolved.slots?.default).toBe('帮助 Ada')
  })

  it('uses default messages and dynamic params when no locale message resolves', () => {
    const runtime = createFormRuntime({
      plugins: [
        {
          name: 'form-values',
          tokens: {
            'form-value': (token, resolveSnap) => resolveSnap.values[(token as FormValueToken).field],
          },
        },
        createI18nPlugin(),
      ],
    })
    const resolveSnap = runtime.createResolveSnap({ errors: {}, values: { name: 'Ada' } })

    expect(runtime.resolveValue(i18n('field.nickname', {
      defaultMessage: 'Nickname {name}',
      params: {
        name: formValue('name'),
      },
    }), resolveSnap)).toBe('Nickname Ada')
  })

  it('throws on invalid i18n token payloads', () => {
    const runtime = createFormRuntime({
      plugins: [createI18nPlugin()],
    })
    const resolveSnap = runtime.createResolveSnap({ errors: {}, values: {} })

    expect(() => runtime.resolveValue({ __configFormToken: 'i18n' } as never, resolveSnap))
      .toThrow(/Invalid i18n token/)
    expect(() => runtime.resolveValue(i18n('', { defaultMessage: 'Empty key' }), resolveSnap))
      .toThrow(/i18n key must be a non-empty string/)
    expect(() => runtime.resolveValue(i18n('bad.default', { defaultMessage: 123 as never }), resolveSnap))
      .toThrow(/i18n defaultMessage must be a string/)
    expect(() => runtime.resolveValue(i18n('bad.params', { params: [] as never }), resolveSnap))
      .toThrow(/i18n params must be an object/)
  })

  it('resolves messages by the active locale only', () => {
    const runtime = createFormRuntime({
      plugins: [
        createI18nPlugin({
          locale: 'zh-CN',
          messages: {
            'en-US': {
              'field.email': 'Email',
            },
            'zh-CN': {
              'field.name': '姓名 {name}',
              'slot.help': '帮助 {name}',
            },
          },
        }),
      ],
    })
    const resolveSnap = runtime.createResolveSnap({ errors: {}, values: {} })

    expect(runtime.resolveValue(i18n('field.name', { defaultMessage: 'Name', params: { name: 'Ada' } }), resolveSnap))
      .toBe('姓名 Ada')
    expect(runtime.resolveValue(i18n('field.email', { defaultMessage: 'Email default' }), resolveSnap))
      .toBe('Email default')
    expect(() => runtime.resolveValue(i18n('field.email'), resolveSnap))
      .toThrow(/Missing i18n message: field\.email/)
  })

  it('supports dynamic locale getters and custom translators', () => {
    let locale = 'en-US'
    const runtime = createFormRuntime({
      plugins: [
        createI18nPlugin({
          locale: () => locale,
          messages: {
            'en-US': { status: 'Status' },
            'zh-CN': { status: '状态' },
          },
          translate: (key, params, defaultMessage, resolveSnap, currentLocale) => {
            expect(resolveSnap).not.toHaveProperty('locale')
            expect(resolveSnap).not.toHaveProperty('plugins')
            if (key === 'runtime.locale')
              return `${currentLocale}:${String(params?.value)}`
            return defaultMessage
          },
        }),
      ],
    })
    const resolveSnap = runtime.createResolveSnap({ errors: {}, values: {} })

    expect(runtime.resolveValue(i18n('status'), resolveSnap)).toBe('Status')
    locale = 'zh-CN'
    expect(runtime.resolveValue(i18n('status'), resolveSnap)).toBe('状态')
    expect(runtime.resolveValue(i18n('runtime.locale', {
      defaultMessage: 'default',
      params: { value: 'active' },
    }), resolveSnap)).toBe('zh-CN:active')
  })

  it('supports function messages and empty interpolation values', () => {
    const runtime = createFormRuntime({
      plugins: [
        createI18nPlugin({
          locale: 'zh-CN',
          messages: {
            'zh-CN': {
              empty: '空值 { value }',
              greeting: (params, _resolveSnap, currentLocale) => `${currentLocale}:${String(params?.name)}`,
            },
          },
        }),
      ],
    })
    const resolveSnap = runtime.createResolveSnap({ errors: {}, values: {} })

    expect(runtime.resolveValue(i18n('greeting', { params: { name: 'Ada' } }), resolveSnap)).toBe('zh-CN:Ada')
    expect(runtime.resolveValue(i18n('empty', { params: { value: null } }), resolveSnap)).toBe('空值 ')
    expect(runtime.resolveValue(i18n('missing.default', {
      defaultMessage: '默认 { value }',
      params: { value: undefined },
    }), resolveSnap)).toBe('默认 ')
  })

  it('notifies missing handlers but still throws missing message errors', () => {
    let missingKey: string | undefined
    const plugin = createI18nPlugin({
      missing: (key) => {
        missingKey = key
      },
    })
    const runtime = createFormRuntime({ plugins: [plugin] })
    const resolveSnap = runtime.createResolveSnap({ errors: {}, values: {} })

    expect(plugin.name).toBe('i18n')
    expect(plugin).not.toHaveProperty('priority')
    expect(() => runtime.resolveValue(i18n('missing.key'), resolveSnap))
      .toThrow(/Missing i18n message: missing\.key/)
    expect(missingKey).toBe('missing.key')

    const runtimeWithReturningMissing = createFormRuntime({
      plugins: [
        createI18nPlugin({
          missing: () => 'should not resolve',
        }),
      ],
    })

    expect(() => runtimeWithReturningMissing.resolveValue(i18n('still.missing'), resolveSnap))
      .toThrow(/Missing i18n message: still\.missing/)
  })

  it('does not swallow errors from locale, translate, message, or missing handlers', () => {
    expect(() => {
      const runtime = createFormRuntime({
        plugins: [createI18nPlugin({ locale: () => { throw new Error('locale failed') } })],
      })
      runtime.resolveValue(i18n('status'), runtime.createResolveSnap())
    }).toThrow('locale failed')

    expect(() => {
      const runtime = createFormRuntime({
        plugins: [createI18nPlugin({ translate: () => { throw new Error('translate failed') } })],
      })
      runtime.resolveValue(i18n('status'), runtime.createResolveSnap())
    }).toThrow('translate failed')

    expect(() => {
      const runtime = createFormRuntime({
        plugins: [
          createI18nPlugin({
            locale: 'zh-CN',
            messages: {
              'zh-CN': {
                status: () => { throw new Error('message failed') },
              },
            },
          }),
        ],
      })
      runtime.resolveValue(i18n('status'), runtime.createResolveSnap())
    }).toThrow('message failed')

    expect(() => {
      const runtime = createFormRuntime({
        plugins: [createI18nPlugin({ missing: () => { throw new Error('missing failed') } })],
      })
      runtime.resolveValue(i18n('status'), runtime.createResolveSnap())
    }).toThrow('missing failed')
  })
})
