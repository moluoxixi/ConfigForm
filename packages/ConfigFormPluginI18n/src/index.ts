import type {
  FormRuntimeContext,
  FormRuntimeExtension,
  FormRuntimeLocale,
  RuntimeToken,
} from '@moluoxixi/config-form'

export interface I18nToken extends RuntimeToken<string, 'i18n'> {
  key: string
  defaultMessage?: string
  params?: Record<string, unknown>
}

export type I18nMessageResolver = (
  params: Record<string, unknown> | undefined,
  context: FormRuntimeContext,
) => string

export type I18nMessage = string | I18nMessageResolver
export type I18nMessages = Record<string, Record<string, I18nMessage>>

export type I18nTranslate = (
  key: string,
  params: Record<string, unknown> | undefined,
  defaultMessage: string | undefined,
  context: FormRuntimeContext,
) => string | undefined

export type I18nMissingHandler = (
  key: string,
  params: Record<string, unknown> | undefined,
  defaultMessage: string | undefined,
  context: FormRuntimeContext,
) => void

export interface I18nPluginOptions {
  name?: string
  priority?: number
  locale?: FormRuntimeLocale
  messages?: I18nMessages
  translate?: I18nTranslate
  missing?: I18nMissingHandler
}

export function i18n(key: string, defaultMessage?: string, params?: Record<string, unknown>): I18nToken {
  return {
    __configFormToken: 'i18n',
    defaultMessage,
    key,
    params,
  }
}

export function isI18nToken(value: unknown): value is I18nToken {
  return Boolean(
    value
    && typeof value === 'object'
    && (value as { __configFormToken?: unknown }).__configFormToken === 'i18n'
    && typeof (value as { key?: unknown }).key === 'string',
  )
}

function resolveLocale(locale?: FormRuntimeLocale): string | undefined {
  return typeof locale === 'function' ? locale() : locale
}

function renderMessage(
  message: I18nMessage,
  params: Record<string, unknown> | undefined,
  context: FormRuntimeContext,
): string {
  if (typeof message === 'function')
    return message(params, context)

  return message.replace(/\{([^}]+)\}/g, (_, key: string) => {
    const value = params?.[key.trim()]
    return value == null ? '' : String(value)
  })
}

function findMessage(
  messages: I18nMessages | undefined,
  locale: string | undefined,
  key: string,
): I18nMessage | undefined {
  if (!locale)
    return undefined
  return messages?.[locale]?.[key]
}

export function createI18nPlugin(options: I18nPluginOptions = {}): FormRuntimeExtension {
  return {
    tokens: {
      i18n: (token, context, path, helpers) => {
        if (!isI18nToken(token))
          throw new Error('Invalid i18n token')

        const locale = resolveLocale(options.locale)
        const i18nContext = { ...context, locale }
        const params = token.params
          ? helpers.resolveValue(token.params, i18nContext, `${path}.params`) as Record<string, unknown>
          : undefined
        const { defaultMessage, key } = token
        const custom = options.translate?.(key, params, defaultMessage, i18nContext)
        if (custom !== undefined)
          return custom

        const message = findMessage(options.messages, locale, key)
        if (message !== undefined)
          return renderMessage(message, params, i18nContext)

        if (defaultMessage !== undefined)
          return renderMessage(defaultMessage, params, i18nContext)

        options.missing?.(key, params, defaultMessage, i18nContext)

        throw new Error(`Missing i18n message: ${key}`)
      },
    },
    name: options.name ?? 'i18n',
    priority: options.priority ?? -100,
  }
}
