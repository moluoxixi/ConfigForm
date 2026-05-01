import type {
  FormRuntimeContext,
  FormRuntimeExtension,
  FormRuntimeLocale,
} from '@moluoxixi/config-form'

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
    i18n: {
      locale: options.locale,
      translate: (key, params, fallback, context) => {
        const locale = resolveLocale(options.locale)
        const fallbackLocale = resolveLocale(options.fallbackLocale)
        const i18nContext = { ...context, locale }
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
