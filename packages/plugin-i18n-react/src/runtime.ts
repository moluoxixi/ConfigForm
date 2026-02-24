import type { FormPlugin } from '@moluoxixi/core'
import type { I18nPluginAPI } from '@moluoxixi/plugin-i18n-core'
import type { i18n as I18nextInstance, Resource } from 'i18next'
import type { I18nMessages, ReactMessageI18nRuntime, ReactMessageI18nRuntimeOptions } from './types'
import i18next from 'i18next'
import { reactI18nPlugin } from './plugin'

/**
 * to Resources：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 to Resources 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function toResources(messages: I18nMessages, namespace: string): Resource {
  return Object.fromEntries(
    Object.entries(messages).map(([locale, values]) => [
      locale,
      { [namespace]: values },
    ]),
  )
}

/**
 * translate：负责该函数职责对应的主流程编排。
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
 * create React Message I18n Runtime：负责“创建create React Message I18n Runtime”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 create React Message I18n Runtime 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
export function createReactMessageI18nRuntime(options: ReactMessageI18nRuntimeOptions): ReactMessageI18nRuntime {
  const {
    messages,
    locale,
    fallbackLocale,
    namespace = 'translation',
    i18n: providedI18n,
    ...pluginOptions
  } = options

  const availableLocales = Object.keys(messages)
  const resolvedFallback = fallbackLocale ?? availableLocales[0] ?? ''
  const resolvedLocale = locale ?? resolvedFallback
  const i18n = providedI18n ?? i18next.createInstance()

  if (!i18n.isInitialized) {
    void i18n.init({
      resources: toResources(messages, namespace),
      lng: resolvedLocale,
      fallbackLng: resolvedFallback || undefined,
      defaultNS: namespace,
      ns: [namespace],
      interpolation: { escapeValue: false },
      initImmediate: false,
    })
  }
  else {
    for (const [localeName, values] of Object.entries(messages)) {
      i18n.addResourceBundle(localeName, namespace, values, true, true)
    }
    if (resolvedLocale) {
      void i18n.changeLanguage(resolvedLocale)
    }
  }

  const rawPlugin = reactI18nPlugin({
    ...pluginOptions,
    i18n,
    locale: resolvedLocale,
  })
  let pluginApi: I18nPluginAPI | undefined
  const plugin: FormPlugin<I18nPluginAPI> = {
    name: rawPlugin.name,
    /**
     * install：执行当前位置的功能逻辑。
     * 定位：`packages/plugin-i18n-react/src/runtime.ts:86`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @param form 参数 form 为业务对象，用于读写状态与属性。
     * @param context 参数 context 为上下文对象，用于传递场景数据。
     * @returns 返回当前分支执行后的处理结果。
     */
    install(form, context) {
      const installed = rawPlugin.install(form, context)
      pluginApi = installed.api
      return {
        api: installed.api,
        /**
         * dispose：执行当前位置的功能逻辑。
         * 定位：`packages/plugin-i18n-react/src/runtime.ts:91`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         */
        dispose: () => {
          if (pluginApi === installed.api) {
            pluginApi = undefined
          }
          installed.dispose?.()
        },
      }
    },
  }

  /**
   * subscribeLocale?????????????????
   * ???`packages/plugin-i18n-react/src/runtime.ts:124`?
   * ?????????????????????????????????
   * ??????????????????????????
   * @param listener ?? listener ????????????
   * @returns ?????????????
   */
  const /**
         * subscribeLocale：执行当前位置的功能逻辑。
         * 定位：`packages/plugin-i18n-react/src/runtime.ts:101`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @param listener 参数 listener 为当前功能所需的输入信息。
         * @returns 返回当前分支执行后的处理结果。
         */
    subscribeLocale = (listener: (nextLocale: string) => void): (() => void) => {
      /**
       * handler?????????????????
       * ???`packages/plugin-i18n-react/src/runtime.ts:132`?
       * ?????????????????????????????????
       * ??????????????????????????
       * @param nextLocale ?? nextLocale ????????????
       */
      const /**
             * handler：执行当前位置的功能逻辑。
             * 定位：`packages/plugin-i18n-react/src/runtime.ts:102`。
             * 功能：处理参数消化、状态变更与调用链行为同步。
             * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
             * @param nextLocale 参数 nextLocale 为当前功能所需的输入信息。
             */
        handler = (nextLocale: string): void => {
          listener(nextLocale)
        }
      i18n.on('languageChanged', handler)
      return () => {
        i18n.off('languageChanged', handler)
      }
    }

  /**
   * t?????????????????
   * ???`packages/plugin-i18n-react/src/runtime.ts:150`?
   * ?????????????????????????????????
   * ??????????????????????????
   * @param key ?? key ????????????
   * @param params ?? params ????????????
   * @returns ?????????????
   */
  const /**
         * t：执行当前位置的功能逻辑。
         * 定位：`packages/plugin-i18n-react/src/runtime.ts:111`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @param key 参数 key 为当前功能所需的输入信息。
         * @param params 参数 params 为当前功能所需的输入信息。
         * @returns 返回当前分支执行后的处理结果。
         */
    t = (key: string, params?: Record<string, unknown>): string => {
      return translate(i18n, key, params)
    }

  return {
    plugin,
    i18n,
    t,
    /**
     * getLocale：执行当前位置的功能逻辑。
     * 定位：`packages/plugin-i18n-react/src/runtime.ts:119`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    getLocale: () => i18n.resolvedLanguage || i18n.language || resolvedLocale || '',
    /**
     * setLocale：执行当前位置的功能逻辑。
     * 定位：`packages/plugin-i18n-react/src/runtime.ts:120`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @param nextLocale 参数 nextLocale 为当前功能所需的输入信息。
     */
    setLocale: async (nextLocale) => {
      if (pluginApi) {
        await pluginApi.setLocale(nextLocale)
        return
      }
      await i18n.changeLanguage(nextLocale)
    },
    subscribeLocale,
  }
}
