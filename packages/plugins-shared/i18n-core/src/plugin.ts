import type { FormInstance, FormPlugin } from '@moluoxixi/core'
import type { I18nPluginAPI, I18nPluginConfig } from './types'
import { translateSchema } from './schema-i18n'

/**
 * i18n 插件（框架无关）
 *
 * 将外部 i18n 库注入表单：
 * - 由插件提供 schema 翻译能力
 * - 通过 version/subscribe 驱动框架层重渲染
 * - 提供 translateSchema / setLocale 等 API
 * @param config 参数 `config`用于提供可选配置，调整当前功能模块的执行策略。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function i18nPlugin(config: I18nPluginConfig): FormPlugin<I18nPluginAPI> {
  const {
    locale: initialLocale,
    changeLocale,
    onLocaleChange,
    t,
    prefix,
    translatableProps,
    translateEnumLabels,
  } = config

  const schemaConfig = {
    t,
    prefix,
    translatableProps,
    translateEnumLabels,
  }

  return {
    name: 'i18n',

    /**
     * install：封装该模块的核心渲染与交互逻辑。
     * 所属模块：`packages/plugin-i18n-core/src/plugin.ts`。
     * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
     * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
     * @param _form 参数 `_form`用于提供表单上下文或实例，支撑状态读写与生命周期调用。
     * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
     */
    install(_form: FormInstance) {
      let currentLocale = initialLocale
      let version = 0
      const listeners = new Set<(nextVersion: number) => void>()

      /**
       * refresh：封装该模块的核心渲染与交互逻辑。
       * 所属模块：`packages/plugin-i18n-core/src/plugin.ts`。
       * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
       * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
       */
      const refresh = (): void => {
          version += 1
          for (const listener of listeners) {
            listener(version)
          }
        }

      /**
       * set Locale：封装该模块的核心渲染与交互逻辑。
       * 所属模块：`packages/plugin-i18n-core/src/plugin.ts`。
       * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
       * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
       * @param next 参数 `next`用于提供当前函数执行所需的输入信息。
       */
      const setLocale = async (next: string): Promise<void> => {
          if (next === currentLocale)
            return
          currentLocale = next
          if (changeLocale) {
            await changeLocale(next)
          }
          refresh()
        }

      const disposeLocale = onLocaleChange
        ? onLocaleChange((next) => {
            currentLocale = next
            refresh()
          })
        : undefined

      /**
       * subscribe：封装该模块的核心渲染与交互逻辑。
       * 所属模块：`packages/plugin-i18n-core/src/plugin.ts`。
       * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
       * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
       * @param listener 参数 `listener`用于提供集合数据，支撑批量遍历与扩展处理。
       * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
       */
      const subscribe = (listener: (nextVersion: number) => void): (() => void) => {
          listeners.add(listener)
          return () => {
            listeners.delete(listener)
          }
        }

      const api: I18nPluginAPI = {
        t,
        /**
         * version：执行当前功能逻辑。
         *
         * @returns 返回当前功能的处理结果。
         */
        get version() {
          return version
        },
        subscribe,
        /**
         * getLocale：执行当前功能逻辑。
         *
         * @returns 返回当前功能的处理结果。
         */

        getLocale: () => currentLocale,
        setLocale,
        refresh,
        /**
         * translateSchema：执行当前功能逻辑。
         *
         * @param schema 参数 schema 的输入说明。
         *
         * @returns 返回当前功能的处理结果。
         */

        translateSchema: schema => translateSchema(schema, schemaConfig),
      }

      return {
        api,
        /**
         * dispose：封装该模块的核心渲染与交互逻辑。
         * 所属模块：`packages/plugin-i18n-core/src/plugin.ts`。
         * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
         * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
         */
        dispose() {
          disposeLocale?.()
          listeners.clear()
        },
      }
    },
  }
}

