import type {
  FormRuntimeContext,
  FormRuntimeExtension,
  FormRuntimeLocale,
  RuntimeToken,
} from '@moluoxixi/config-form'

export interface I18nToken extends RuntimeToken<string, 'i18n'> {
  key: string
  fallback?: string
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
  fallback: string | undefined,
  context: FormRuntimeContext,
) => string | undefined

export interface I18nPluginOptions {
  name?: string
  priority?: number
  locale?: FormRuntimeLocale
  fallbackLocale?: FormRuntimeLocale
  messages?: I18nMessages
  translate?: I18nTranslate
  missing?: I18nTranslate
}

export function i18n(key: string, fallback?: string, params?: Record<string, unknown>): I18nToken {
  return {
    __configFormToken: 'i18n',
    fallback,
    key,
    params,
  }
}

export function isI18nToken(value: unknown): value is I18nToken {
  return Boolean(
    value
    && typeof value === 'object'
    && (value as { __configFormToken?: unknown }).__configFormToken === 'i18n',
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
          return undefined

        const locale = resolveLocale(options.locale)
        const fallbackLocale = resolveLocale(options.fallbackLocale)
        const i18nContext = { ...context, locale }
        const params = token.params
          ? helpers.resolveValue(token.params, i18nContext, `${path}.params`) as Record<string, unknown>
          : undefined
        const { fallback, key } = token
        const custom = options.translate?.(key, params, fallback, i18nContext)
        if (custom !== undefined)
          return custom

        const message = findMessage(options.messages, locale, key)
          ?? findMessage(options.messages, fallbackLocale, key)
        if (message !== undefined)
          return renderMessage(message, params, i18nContext)

        if (fallback !== undefined)
          return renderMessage(fallback, params, i18nContext)

        return options.missing?.(key, params, fallback, i18nContext) ?? key
      },
    },
    name: options.name ?? 'i18n',
    priority: options.priority ?? -100,
  }
}
