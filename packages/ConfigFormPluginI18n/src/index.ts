import type {
  FormRuntimePlugin,
  FormRuntimeResolveSnap,
  RuntimeToken,
} from '@moluoxixi/config-form'

/** i18n runtime token；由本插件的 token resolver 解析为当前语言文案。 */
export interface I18nToken extends RuntimeToken<string, 'i18n'> {
  /** Message key looked up in the current locale. */
  key: string
  /** Fallback message rendered when the key is missing from the message table. */
  defaultMessage?: string
  /** Template params; runtime tokens are resolved before message rendering. */
  params?: Record<string, unknown>
}

/** 创建 i18n token 时可携带的元信息。 */
export interface I18nTokenOptions {
  /** 语言包缺失时使用的显式默认文案。 */
  defaultMessage?: string
  /** 文案模板插值参数，支持 runtime token 作为嵌套值。 */
  params?: Record<string, unknown>
}

/** locale 输入形态；插件每次解析文案时按需读取当前语言。 */
export type I18nLocale = string | (() => string | undefined)

/** Function message resolver for dynamic, locale-aware message rendering. */
export type I18nMessageResolver = (
  params: Record<string, unknown> | undefined,
  resolveSnap: FormRuntimeResolveSnap,
  locale: string | undefined,
) => string

/** Message entry stored in the locale message table. */
export type I18nMessage = string | I18nMessageResolver

/** Locale-keyed message table consumed by createI18nPlugin(...). */
export type I18nMessages = Record<string, Record<string, I18nMessage>>

/** Optional custom translator that can override message-table lookup. */
export type I18nTranslate = (
  key: string,
  params: Record<string, unknown> | undefined,
  defaultMessage: string | undefined,
  resolveSnap: FormRuntimeResolveSnap,
  locale: string | undefined,
) => string | undefined

/** Callback invoked before throwing when no message or defaultMessage exists. */
export type I18nMissingHandler = (
  key: string,
  params: Record<string, unknown> | undefined,
  defaultMessage: string | undefined,
  resolveSnap: FormRuntimeResolveSnap,
  locale: string | undefined,
) => void

/** Options for the ConfigForm i18n runtime plugin. */
export interface I18nPluginOptions {
  /** Runtime plugin name; defaults to "i18n". */
  name?: string
  /** Static locale or getter read at token resolution time. */
  locale?: I18nLocale
  /** Locale-keyed messages used by the default translator. */
  messages?: I18nMessages
  /** Custom translation hook; returning undefined falls back to messages. */
  translate?: I18nTranslate
  /** Missing-message hook called immediately before the resolver throws. */
  missing?: I18nMissingHandler
}

/** 创建 i18n token，可用于 label、props、slots 等 runtime 会解析的位置。 */
export function i18n(key: string, options: I18nTokenOptions = {}): I18nToken {
  return {
    __configFormToken: 'i18n',
    defaultMessage: options.defaultMessage,
    key,
    params: options.params,
  }
}

/** 判断未知值是否是本插件创建的 i18n token。 */
export function isI18nToken(value: unknown): value is I18nToken {
  return Boolean(
    value
    && typeof value === 'object'
    && (value as { __configFormToken?: unknown }).__configFormToken === 'i18n'
    && typeof (value as { key?: unknown }).key === 'string',
  )
}

function resolveLocale(locale?: I18nLocale): string | undefined {
  return typeof locale === 'function' ? locale() : locale
}

function assertRecord(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new TypeError(`${path} must be an object`)
  return value as Record<string, unknown>
}

function assertI18nToken(token: RuntimeToken): asserts token is I18nToken {
  if (!isI18nToken(token))
    throw new Error('Invalid i18n token')
  if (token.key.length === 0)
    throw new TypeError('i18n key must be a non-empty string')
  if (token.defaultMessage !== undefined && typeof token.defaultMessage !== 'string')
    throw new TypeError('i18n defaultMessage must be a string')
  if (token.params !== undefined)
    assertRecord(token.params, 'i18n params')
}

function renderMessage(
  message: I18nMessage,
  params: Record<string, unknown> | undefined,
  resolveSnap: FormRuntimeResolveSnap,
  locale: string | undefined,
): string {
  if (typeof message === 'function')
    return message(params, resolveSnap, locale)

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

/**
 * Create a ConfigForm runtime plugin that resolves i18n(...) tokens.
 *
 * Resolution order is custom translate hook, message table, defaultMessage,
 * missing hook, then an explicit error for unresolved keys.
 */
export function createI18nPlugin(options: I18nPluginOptions = {}): FormRuntimePlugin {
  return {
    name: options.name ?? 'i18n',
    tokens: {
      i18n: (token, resolveSnap, path, helpers) => {
        assertI18nToken(token)

        const locale = resolveLocale(options.locale)
        const params = token.params
          ? helpers.resolveValue(token.params, resolveSnap, `${path}.params`) as Record<string, unknown>
          : undefined
        const { defaultMessage, key } = token
        const custom = options.translate?.(key, params, defaultMessage, resolveSnap, locale)
        if (custom !== undefined)
          return custom

        const message = findMessage(options.messages, locale, key)
        if (message !== undefined)
          return renderMessage(message, params, resolveSnap, locale)

        if (defaultMessage !== undefined)
          return renderMessage(defaultMessage, params, resolveSnap, locale)

        options.missing?.(key, params, defaultMessage, resolveSnap, locale)

        throw new Error(`Missing i18n message: ${key}`)
      },
    },
  }
}
