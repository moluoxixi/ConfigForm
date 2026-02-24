import type { FormPlugin } from '@moluoxixi/core'
import type { I18nPluginAPI } from '@moluoxixi/plugin-i18n-core'
import type { i18n as I18nextInstance } from 'i18next'
import type { ReactI18nPluginOptions } from './types'
import { i18nPlugin } from '@moluoxixi/plugin-i18n-core'

/**
 * resolve Locale：负责“解析resolve Locale”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 resolve Locale 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function resolveLocale(i18n: I18nextInstance, fallback?: string): string {
  return i18n.resolvedLanguage || i18n.language || fallback || ''
}

/**
 * translate：负责编排该能力的主流程。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 translate 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function translate(i18n: I18nextInstance, key: string, params?: Record<string, unknown>): string {
  const t = i18n.t as unknown as (nextKey: string, nextParams?: Record<string, unknown>) => string
  return String(t(key, params))
}

/**
 * react I18n Plugin：负责编排该能力的主流程。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 react I18n Plugin 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function reactI18nPlugin(options: ReactI18nPluginOptions): FormPlugin<I18nPluginAPI> {
  const { i18n, locale, ...rest } = options

  return i18nPlugin({
    ...rest,
    locale: locale ?? resolveLocale(i18n),
    /**
     * t：处理当前分支的交互与状态同步。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * @param key 参数 key 为当前功能所需的输入信息。
     * @param params 参数 params 为当前功能所需的输入信息。
     * @returns 返回当前分支执行后的处理结果。
     */
    t: (key, params) => translate(i18n, key, params),
    /**
     * changeLocale：处理当前分支的交互与状态同步。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * @param nextLocale 参数 nextLocale 为当前功能所需的输入信息。
     */
    changeLocale: async (nextLocale) => {
      await i18n.changeLanguage(nextLocale)
    },
    /**
     * onLocaleChange：处理当前分支的交互与状态同步。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * @param listener 参数 listener 为当前功能所需的输入信息。
     * @returns 返回当前分支执行后的处理结果。
     */
    onLocaleChange: (listener) => {
      /**
       * handler?????????????????
       * ???`packages/plugin-i18n-react/src/plugin.ts:79`?
       * ?????????????????????????????????
       * ??????????????????????????
       * @param nextLocale ?? nextLocale ????????????
       */
      const /**
             * handler：处理当前分支的交互与状态同步。
             * 功能：处理参数消化、状态变更与调用链行为同步。
             * @param nextLocale 参数 nextLocale 为当前功能所需的输入信息。
             */
        handler = (nextLocale: string): void => {
          listener(nextLocale)
        }
      i18n.on('languageChanged', handler)
      return () => {
        i18n.off('languageChanged', handler)
      }
    },
  })
}
