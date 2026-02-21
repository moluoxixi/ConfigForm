import type { FormPlugin } from '@moluoxixi/core'
import type { I18nPluginAPI } from '@moluoxixi/plugin-i18n-core'
import type { VueComposerLike, VueI18nLike, VueMessageI18nRuntime, VueMessageI18nRuntimeOptions } from './types'
import { isRef, watch } from 'vue'
import { createI18n } from 'vue-i18n'
import { vueI18nPlugin } from './plugin'

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
 * read Locale：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 read Locale 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function readLocale(composer: VueComposerLike): string {
  if (typeof composer.locale === 'string') {
    return composer.locale
  }
  return composer.locale.value
}

/**
 * write Locale：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 write Locale 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function writeLocale(composer: VueComposerLike, nextLocale: string): void {
  if (typeof composer.locale === 'string') {
    ;(composer as { locale: string }).locale = nextLocale
    return
  }
  composer.locale.value = nextLocale
}

/**
 * create Vue Message I18n Runtime：负责“创建create Vue Message I18n Runtime”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 create Vue Message I18n Runtime 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
export function createVueMessageI18nRuntime(options: VueMessageI18nRuntimeOptions): VueMessageI18nRuntime {
  const {
    messages,
    locale,
    fallbackLocale,
    i18n: providedI18n,
    ...pluginOptions
  } = options

  const availableLocales = Object.keys(messages)
  const resolvedFallback = fallbackLocale ?? availableLocales[0] ?? ''
  const resolvedLocale = locale ?? resolvedFallback
  const i18n = providedI18n ?? createI18n({
    legacy: false,
    locale: resolvedLocale,
    fallbackLocale: resolvedFallback || undefined,
    messages,
  })
  const composer = resolveComposer(i18n)

  const rawPlugin = vueI18nPlugin({
    ...pluginOptions,
    i18n,
    locale: resolvedLocale,
  })
  let pluginApi: I18nPluginAPI | undefined
  const plugin: FormPlugin<I18nPluginAPI> = {
    name: rawPlugin.name,
    install(form, context) {
      const installed = rawPlugin.install(form, context)
      pluginApi = installed.api
      return {
        api: installed.api,
        dispose: () => {
          if (pluginApi === installed.api) {
            pluginApi = undefined
          }
          installed.dispose?.()
        },
      }
    },
  }

  const subscribeLocale = (listener: (nextLocale: string) => void): (() => void) => {
    if (!isRef(composer.locale)) {
      return () => {}
    }
    const stop = watch(composer.locale, (nextLocale) => {
      listener(String(nextLocale))
    })
    return () => {
      stop()
    }
  }

  const t = (key: string, params?: Record<string, unknown>): string => {
    return String(composer.t(key, params))
  }

  return {
    plugin,
    i18n,
    t,
    getLocale: () => readLocale(composer),
    setLocale: (nextLocale) => {
      if (pluginApi) {
        void pluginApi.setLocale(nextLocale)
        return
      }
      writeLocale(composer, nextLocale)
    },
    subscribeLocale,
  }
}
