import type {
  FormRuntimePlugin,
  FormRuntimeResolveSnap,
  RuntimeToken,
} from '@moluoxixi/config-form/plugins'

/** i18n runtime token；由本插件的 token resolver 解析为当前语言文案。 */
export interface I18nToken extends RuntimeToken<string, 'i18n'> {
  /** 当前 locale 下查找的文案 key。 */
  key: string
  /** 语言包缺失该 key 时使用的显式默认文案。 */
  defaultMessage?: string
  /** 文案模板插值参数，渲染前会先解析其中的 runtime token。 */
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

/** 动态文案解析函数，可基于 params、resolveSnap 和 locale 生成文案。 */
export type I18nMessageResolver = (
  params: Record<string, unknown> | undefined,
  resolveSnap: FormRuntimeResolveSnap,
  locale: string | undefined,
) => string

/** 语言包中单条文案的存储形态。 */
export type I18nMessage = string | I18nMessageResolver

/** createI18nPlugin(...) 消费的按 locale 索引语言包。 */
export type I18nMessages = Record<string, Record<string, I18nMessage>>

/** 可选自定义翻译器；返回 undefined 时继续走语言包查找。 */
export type I18nTranslate = (
  key: string,
  params: Record<string, unknown> | undefined,
  defaultMessage: string | undefined,
  resolveSnap: FormRuntimeResolveSnap,
  locale: string | undefined,
) => string | undefined

/** 缺少语言包文案和 defaultMessage 时、正式抛错前调用的回调。 */
export type I18nMissingHandler = (
  key: string,
  params: Record<string, unknown> | undefined,
  defaultMessage: string | undefined,
  resolveSnap: FormRuntimeResolveSnap,
  locale: string | undefined,
) => void

/** ConfigForm i18n runtime 插件选项。 */
export interface I18nPluginOptions {
  /** runtime 插件名称，默认 "i18n"。 */
  name?: string
  /** 静态 locale，或每次解析 token 时读取的 getter。 */
  locale?: I18nLocale
  /** 默认翻译器使用的按 locale 索引语言包。 */
  messages?: I18nMessages
  /** 自定义翻译 hook；返回 undefined 时回到 messages 查找。 */
  translate?: I18nTranslate
  /** 缺失文案时、resolver 抛错前调用的 hook。 */
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

/**
 * 解析当前 locale。
 *
 * getter 形式会在每次 token 解析时执行，异常保持向上传递给 runtime。
 */
function resolveLocale(locale?: I18nLocale): string | undefined {
  return typeof locale === 'function' ? locale() : locale
}

/**
 * 断言未知值是对象记录。
 *
 * 仅用于 i18n params 等外部输入校验，失败时抛出带路径的 TypeError。
 */
function assertRecord(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new TypeError(`${path} must be an object`)
  return value as Record<string, unknown>
}

/**
 * 校验 runtime 传入的 token 确实属于 i18n 插件。
 *
 * key、defaultMessage 和 params 不合法时直接抛错，避免解析为错误文案。
 */
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

/**
 * 渲染语言包文案。
 *
 * 函数文案接收完整 resolveSnap；字符串文案只处理 `{name}` 形式的浅层 params 插值。
 */
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

/**
 * 从语言包中查找指定 locale 和 key 的文案。
 *
 * locale 缺失时返回 undefined，让调用方继续 fallback 或抛错。
 */
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
 * 创建用于解析 i18n(...) token 的 ConfigForm runtime 插件。
 *
 * 解析顺序为自定义 translate hook、messages 语言包、defaultMessage、missing hook，
 * 最后对无法解析的 key 显式抛错。
 */
export function createI18nPlugin(options: I18nPluginOptions = {}): FormRuntimePlugin {
  return {
    name: options.name ?? 'i18n',
    tokens: {
      /**
       * 解析 i18n runtime token。
       *
       * params 会先经过 runtime.resolveValue 处理，缺失文案最终抛错而不是返回 key。
       */
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
