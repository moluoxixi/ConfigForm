import { createFormRuntime, defineField } from '@moluoxixi/config-form'
import { describe, expect, it } from 'vitest'
import { createI18nPlugin, i18n } from '../src'

describe('i18n plugin package', () => {
  it('resolves messages by locale, fallback locale, fallback text, and params', () => {
    const runtime = createFormRuntime({
      extensions: [
        createI18nPlugin({
          fallbackLocale: 'en-US',
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
        placeholder: i18n('field.email', 'Email fallback'),
        title: i18n('field.missing', 'Missing fallback'),
      },
      slots: {
        default: i18n('slot.help', 'Help', { name: 'Ada' }),
      },
    })
    const resolved = runtime.resolveField(field, runtime.createContext({ errors: {}, values: {} }))

    expect(resolved.label).toBe('姓名 Ada')
    expect(resolved.props.placeholder).toBe('Email')
    expect(resolved.props.title).toBe('Missing fallback')
    expect(resolved.slots?.default).toBe('帮助 Ada')
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
          translate: (key, params, fallback, context) => {
            if (key === 'runtime.locale')
              return `${context.locale}:${String(params?.value)}`
            return fallback
          },
        }),
      ],
    })
    const context = runtime.createContext({ errors: {}, values: {} })

    expect(runtime.resolveValue(i18n('status'), context)).toBe('Status')
    locale = 'zh-CN'
    expect(runtime.resolveValue(i18n('status'), context)).toBe('状态')
    expect(runtime.resolveValue(i18n('runtime.locale', 'fallback', { value: 'active' }), context)).toBe('zh-CN:active')
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
    expect(runtime.resolveValue(i18n('missing.fallback', '兜底 { value }', { value: undefined }), context)).toBe('兜底 ')
  })

  it('uses missing handlers and default plugin metadata', () => {
    const plugin = createI18nPlugin({
      missing: key => `missing:${key}`,
    })
    const runtime = createFormRuntime({ extensions: [plugin] })
    const context = runtime.createContext({ errors: {}, values: {} })

    expect(plugin.name).toBe('i18n')
    expect(plugin.priority).toBe(-100)
    expect(runtime.resolveValue(i18n('missing.key'), context)).toBe('missing:missing.key')
  })

  it('returns the key when nothing resolves the message', () => {
    const runtime = createFormRuntime({
      extensions: [createI18nPlugin()],
    })
    const context = runtime.createContext({ errors: {}, values: {} })

    expect(runtime.resolveValue(i18n('raw.key'), context)).toBe('raw.key')
  })
})
