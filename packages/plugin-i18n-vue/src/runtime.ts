import { createI18n } from 'vue-i18n'
import { isRef, watch } from 'vue'
import { vueI18nPlugin } from './plugin'
import type { FormPlugin } from '@moluoxixi/core'
import type { I18nPluginAPI } from '@moluoxixi/plugin-i18n-core'
import type { VueComposerLike, VueI18nLike, VueMessageI18nRuntime, VueMessageI18nRuntimeOptions } from './types'

function resolveComposer(i18n: VueI18nLike): VueComposerLike {
  if ('global' in i18n) {
    return i18n.global as unknown as VueComposerLike
  }
  return i18n
}

function readLocale(composer: VueComposerLike): string {
  if (typeof composer.locale === 'string') {
    return composer.locale
  }
  return composer.locale.value
}

function writeLocale(composer: VueComposerLike, nextLocale: string): void {
  if (typeof composer.locale === 'string') {
    ;(composer as { locale: string }).locale = nextLocale
    return
  }
  composer.locale.value = nextLocale
}

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
