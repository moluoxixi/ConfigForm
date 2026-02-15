import { i18nPlugin } from '@moluoxixi/plugin-i18n-core'
import { isRef, watch } from 'vue'
import type { FormPlugin } from '@moluoxixi/core'
import type { I18nPluginAPI } from '@moluoxixi/plugin-i18n-core'
import type { I18n } from 'vue-i18n'
import type { VueComposerLike, VueI18nLike, VueI18nPluginOptions } from './types'

function resolveComposer(i18n: VueI18nLike): VueComposerLike {
  if ('global' in i18n) {
    return i18n.global as unknown as VueComposerLike
  }
  return i18n
}

function readLocale(composer: VueComposerLike): string {
  const { locale } = composer
  if (typeof locale === 'string') {
    return locale
  }
  return locale.value
}

function writeLocale(composer: VueComposerLike, nextLocale: string): void {
  const { locale } = composer
  if (typeof locale === 'string') {
    ;(composer as { locale: string }).locale = nextLocale
    return
  }
  locale.value = nextLocale
}

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

export function vueI18nPlugin(options: VueI18nPluginOptions): FormPlugin<I18nPluginAPI> {
  const { i18n, locale, ...rest } = options
  const composer = resolveComposer(i18n)

  return i18nPlugin({
    ...rest,
    locale: locale ?? readLocale(composer),
    t: (key, params) => String(composer.t(key, params)),
    changeLocale: async (nextLocale) => {
      writeLocale(composer, nextLocale)
    },
    onLocaleChange: (listener) => {
      return watchLocale(composer, listener)
    },
  })
}

export function asVueI18n(input: VueI18nLike): I18n | null {
  if ('global' in input) {
    return input
  }
  return null
}
