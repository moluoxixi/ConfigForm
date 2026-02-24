import type { FormPlugin } from '@moluoxixi/core'
import type { SceneConfig } from '@playground/shared'
import type { Ref } from 'vue'
import { createVueMessageI18nRuntime } from '@moluoxixi/plugin-i18n-vue'
import { computed, ref, shallowRef, watch } from 'vue'

/**
 * I18n Feature State：描述该模块对外暴露的数据结构。
 * 所属模块：`playground/vue/src/examples/11-misc/useI18nFeature.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface I18nFeatureState {
  i18nRuntime: Ref<ReturnType<typeof createVueMessageI18nRuntime> | undefined>
  locale: Ref<string>
  localeOptions: Ref<Array<{ label: string, value: string }>>
  sceneTitle: Ref<string>
  sceneDescription: Ref<string>
  switchLocale: (value: string) => void
  plugin: Ref<FormPlugin | undefined>
}

/**
 * use I18n Feature：封装该模块的核心渲染与交互逻辑。
 * 所属模块：`playground/vue/src/examples/11-misc/useI18nFeature.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param sceneConfig 参数 `sceneConfig`用于提供可选配置，调整当前功能模块的执行策略。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
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

  /**
   * translate Text：封装该模块的核心渲染与交互逻辑。
   * 所属模块：`playground/vue/src/examples/11-misc/useI18nFeature.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param value 参数 `value`用于提供待处理的值并参与结果计算。
   * @returns 返回字符串结果，通常用于文本展示或下游拼接。
   */
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

  /**
   * switch Locale：封装该模块的核心渲染与交互逻辑。
   * 所属模块：`playground/vue/src/examples/11-misc/useI18nFeature.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param value 参数 `value`用于提供待处理的值并参与结果计算。
   */
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
