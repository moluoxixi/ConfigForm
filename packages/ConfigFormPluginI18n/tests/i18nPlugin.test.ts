import { createFormRuntime, defineField } from '@moluoxixi/config-form'
import { describe, expect, it } from 'vitest'
import { createI18nPlugin, i18n } from '../src'

describe('i18n plugin package', () => {
  it('resolves messages by locale, default message, and params', () => {
    const runtime = createFormRuntime({
      extensions: [
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

    const field = defineField({
      component: 'input',
      field: 'name',
      label: i18n('field.name', 'Name', { name: 'Ada' }),
      props: {
        placeholder: i18n('field.email', 'Email default'),
        title: i18n('field.missing', 'Missing default'),
      },
      slots: {
        default: i18n('slot.help', 'Help', { name: 'Ada' }),
      },
    })
    const resolved = runtime.resolveField(field, runtime.createContext({ errors: {}, values: {} }))

    expect(resolved.label).toBe('姓名 Ada')
    expect(resolved.props.placeholder).toBe('Email default')
    expect(resolved.props.title).toBe('Missing default')
    expect(resolved.slots?.default).toBe('帮助 Ada')
  })

  it('throws instead of resolving messages from another locale', () => {
    const runtime = createFormRuntime({
      extensions: [
        createI18nPlugin({
          locale: 'zh-CN',
          messages: {
            'en-US': {
              'field.email': 'Email',
            },
          },
        }),
      ],
    })
    const context = runtime.createContext({ errors: {}, values: {} })

    expect(() => runtime.resolveValue(i18n('field.email'), context))
      .toThrow(/Missing i18n message: field\.email/)
  })

  it('supports dynamic locale getters and custom translators', () => {
    let locale = 'en-US'
    const runtime = createFormRuntime({
      extensions: [
        createI18nPlugin({
          locale: () => locale,
          messages: {
            'en-US': { status: 'Status' },
            'zh-CN': { status: '状态' },
          },
          translate: (key, params, defaultMessage, context) => {
            if (key === 'runtime.locale')
              return `${context.locale}:${String(params?.value)}`
            return defaultMessage
          },
        }),
      ],
    })
    const context = runtime.createContext({ errors: {}, values: {} })

    expect(runtime.resolveValue(i18n('status'), context)).toBe('Status')
    locale = 'zh-CN'
    expect(runtime.resolveValue(i18n('status'), context)).toBe('状态')
    expect(runtime.resolveValue(i18n('runtime.locale', 'default', { value: 'active' }), context)).toBe('zh-CN:active')
  })

  it('supports function messages and empty interpolation values', () => {
    const runtime = createFormRuntime({
      extensions: [
        createI18nPlugin({
          locale: 'zh-CN',
          messages: {
            'zh-CN': {
              empty: '空值 { value }',
              greeting: (params, context) => `${context.locale}:${String(params?.name)}`,
            },
          },
        }),
      ],
    })
    const context = runtime.createContext({ errors: {}, values: {} })

    expect(runtime.resolveValue(i18n('greeting', undefined, { name: 'Ada' }), context)).toBe('zh-CN:Ada')
    expect(runtime.resolveValue(i18n('empty', undefined, { value: null }), context)).toBe('空值 ')
    expect(runtime.resolveValue(i18n('missing.default', '默认 { value }', { value: undefined }), context)).toBe('默认 ')
  })

  it('notifies missing handlers but still throws missing message errors', () => {
    let missingKey: string | undefined
    const plugin = createI18nPlugin({
      missing: (key) => {
        missingKey = key
      },
    })
    const runtime = createFormRuntime({ extensions: [plugin] })
    const context = runtime.createContext({ errors: {}, values: {} })

    expect(plugin.name).toBe('i18n')
    expect(plugin.priority).toBe(-100)
    expect(() => runtime.resolveValue(i18n('missing.key'), context))
      .toThrow(/Missing i18n message: missing\.key/)
    expect(missingKey).toBe('missing.key')

    const runtimeWithReturningMissing = createFormRuntime({
      extensions: [
        createI18nPlugin({
          missing: () => 'should not resolve',
        }),
      ],
    })

    expect(() => runtimeWithReturningMissing.resolveValue(i18n('still.missing'), context))
      .toThrow(/Missing i18n message: still\.missing/)
  })

  it('throws when nothing resolves the message', () => {
    const runtime = createFormRuntime({
      extensions: [createI18nPlugin()],
    })
    const context = runtime.createContext({ errors: {}, values: {} })

    expect(() => runtime.resolveValue(i18n('raw.key'), context)).toThrow(/Missing i18n message: raw\.key/)
  })

  it('does not swallow errors from locale, translate, message, or missing handlers', () => {
    expect(() => {
      const runtime = createFormRuntime({
        extensions: [createI18nPlugin({ locale: () => { throw new Error('locale failed') } })],
      })
      runtime.resolveValue(i18n('status'), runtime.createContext())
    }).toThrow('locale failed')

    expect(() => {
      const runtime = createFormRuntime({
        extensions: [createI18nPlugin({ translate: () => { throw new Error('translate failed') } })],
      })
      runtime.resolveValue(i18n('status'), runtime.createContext())
    }).toThrow('translate failed')

    expect(() => {
      const runtime = createFormRuntime({
        extensions: [
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
      runtime.resolveValue(i18n('status'), runtime.createContext())
    }).toThrow('message failed')

    expect(() => {
      const runtime = createFormRuntime({
        extensions: [createI18nPlugin({ missing: () => { throw new Error('missing failed') } })],
      })
      runtime.resolveValue(i18n('status'), runtime.createContext())
    }).toThrow('missing failed')
  })
})
