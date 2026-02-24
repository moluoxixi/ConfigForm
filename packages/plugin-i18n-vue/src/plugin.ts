import type { FormPlugin } from '@moluoxixi/core'
import type { I18nPluginAPI } from '@moluoxixi/plugin-i18n-core'
import type { I18n } from 'vue-i18n'
import type { VueComposerLike, VueI18nLike, VueI18nPluginOptions } from './types'
import { i18nPlugin } from '@moluoxixi/plugin-i18n-core'
import { isRef, watch } from 'vue'

/**
 * resolve Composer：负责“解析resolve Composer”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 resolve Composer 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function resolveComposer(i18n: VueI18nLike): VueComposerLike {
  if ('global' in i18n) {
    return i18n.global as unknown as VueComposerLike
  }
  return i18n
}

/**
 * read Locale：负责编排该能力的主流程。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 read Locale 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function readLocale(composer: VueComposerLike): string {
  const { locale } = composer
  if (typeof locale === 'string') {
    return locale
  }
  return locale.value
}

/**
 * write Locale：负责编排该能力的主流程。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 write Locale 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function writeLocale(composer: VueComposerLike, nextLocale: string): void {
  const { locale } = composer
  if (typeof locale === 'string') {
    ;(composer as { locale: string }).locale = nextLocale
    return
  }
  locale.value = nextLocale
}

/**
 * watch Locale：负责编排该能力的主流程。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 watch Locale 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function watchLocale(composer: VueComposerLike, listener: (locale: string) => void): () => void {
  const { locale } = composer
  if (!isRef(locale)) {
    return () => {}
  }
  const stop = watch(locale, (nextLocale) => {
    listener(String(nextLocale))
  })
  return () => {
    stop()
  }
}

/**
 * vue I18n Plugin：负责编排该能力的主流程。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 vue I18n Plugin 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function vueI18nPlugin(options: VueI18nPluginOptions): FormPlugin<I18nPluginAPI> {
  const { i18n, locale, ...rest } = options
  const composer = resolveComposer(i18n)

  return i18nPlugin({
    ...rest,
    locale: locale ?? readLocale(composer),
    /**
     * t：处理当前分支的交互与状态同步。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * @param key 参数 key 为当前功能所需的输入信息。
     * @param params 参数 params 为当前功能所需的输入信息。
     * @returns 返回当前分支执行后的处理结果。
     */
    t: (key, params) => String(composer.t(key, params)),
    /**
     * changeLocale：处理当前分支的交互与状态同步。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * @param nextLocale 参数 nextLocale 为当前功能所需的输入信息。
     */
    changeLocale: async (nextLocale) => {
      writeLocale(composer, nextLocale)
    },
    /**
     * onLocaleChange：处理当前分支的交互与状态同步。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * @param listener 参数 listener 为当前功能所需的输入信息。
     * @returns 返回当前分支执行后的处理结果。
     */
    onLocaleChange: (listener) => {
      return watchLocale(composer, listener)
    },
  })
}

/**
 * as Vue I18n：负责编排该能力的主流程。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 as Vue I18n 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function asVueI18n(input: VueI18nLike): I18n | null {
  if ('global' in input) {
    return input
  }
  return null
}
