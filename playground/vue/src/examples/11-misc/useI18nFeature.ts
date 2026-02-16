import type { FormPlugin } from '@moluoxixi/core'
import type { SceneConfig } from '@playground/shared'
import type { Ref } from 'vue'
import { createVueMessageI18nRuntime } from '@moluoxixi/plugin-i18n-vue'
import { computed, ref, shallowRef, watch } from 'vue'

export interface I18nFeatureState {
  i18nRuntime: Ref<ReturnType<typeof createVueMessageI18nRuntime> | undefined>
  locale: Ref<string>
  localeOptions: Ref<Array<{ label: string, value: string }>>
  sceneTitle: Ref<string>
  sceneDescription: Ref<string>
  switchLocale: (value: string) => void
  plugin: Ref<FormPlugin | undefined>
}

export function useI18nFeature(sceneConfig: Ref<SceneConfig | null>): I18nFeatureState {
  const i18nRuntime = shallowRef<ReturnType<typeof createVueMessageI18nRuntime> | undefined>(undefined)
  const locale = ref('')

  watch(() => sceneConfig.value?.i18n, (config) => {
    if (!config) {
      i18nRuntime.value = undefined
      return
    }
    const messages = Object.fromEntries(
      Object.entries(config.messages).map(([localeKey, values]) => [localeKey, { ...values }]),
    )
    i18nRuntime.value = createVueMessageI18nRuntime({
      messages,
      locale: config.defaultLocale,
    })
  }, { immediate: true })

  watch(i18nRuntime, (runtime, _prev, onCleanup) => {
    if (!runtime) {
      locale.value = ''
      return
    }
    locale.value = runtime.getLocale()
    const dispose = runtime.subscribeLocale((nextLocale) => {
      locale.value = nextLocale
    })
    onCleanup(() => {
      dispose()
    })
  }, { immediate: true })

  const localeOptions = computed<Array<{ label: string, value: string }>>(() => {
    const config = sceneConfig.value
    if (!config?.i18n)
      return []
    if (config.localeOptions?.length)
      return config.localeOptions
    return Object.keys(config.i18n.messages).map(key => ({ label: key, value: key }))
  })

  function translateText(value: string): string {
    const runtime = i18nRuntime.value
    if (!runtime || !value.startsWith('$t:')) {
      return value
    }
    return runtime.t(value.slice(3))
  }

  const sceneTitle = computed(() => {
    const config = sceneConfig.value
    if (!config) {
      return ''
    }
    void locale.value
    return translateText(config.title)
  })

  const sceneDescription = computed(() => {
    const config = sceneConfig.value
    if (!config) {
      return ''
    }
    void locale.value
    return translateText(config.description)
  })

  const plugin = computed<FormPlugin | undefined>(() => i18nRuntime.value?.plugin)

  function switchLocale(value: string): void {
    i18nRuntime.value?.setLocale(value)
  }

  return {
    i18nRuntime,
    locale,
    localeOptions,
    sceneTitle,
    sceneDescription,
    switchLocale,
    plugin,
  }
}
