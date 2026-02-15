<template>
  <div>
    <h2>{{ displayTitle }}</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      {{ displayDescription }}
    </p>

    <!-- 语言切换器 -->
    <div
      v-if="i18nConfig && resolvedLocaleOptions.length"
      style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;"
    >
      <span style="font-size: 13px; font-weight: 600; color: #555;">语言：</span>
      <div style="display: flex; gap: 4px;">
        <button
          v-for="opt in resolvedLocaleOptions"
          :key="opt.value"
          :style="{
            padding: '4px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
            border: locale === opt.value ? '2px solid #1677ff' : '1px solid #d9d9d9',
            background: locale === opt.value ? '#e6f4ff' : '#fff',
            color: locale === opt.value ? '#1677ff' : '#333',
          }"
          @click="locale = opt.value"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <!-- Schema 变体切换器（如布局切换） -->
    <div v-if="props.config.schemaVariants" style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
      <span style="font-size: 13px; font-weight: 600; color: #555;">{{ props.config.schemaVariants.label }}：</span>
      <div style="display: flex; gap: 4px;">
        <button
          v-for="opt in props.config.schemaVariants.options" :key="opt.value"
          :style="{
            padding: '4px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
            border: variantValue === opt.value ? '2px solid #1677ff' : '1px solid #d9d9d9',
            background: variantValue === opt.value ? '#e6f4ff' : '#fff',
            color: variantValue === opt.value ? '#1677ff' : '#333',
          }"
          @click="variantValue = opt.value"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <component :is="props.statusTabs" ref="st" v-slot="{ mode, showResult }">
      <ConfigForm
        :schema="withMode(localizedSchema, mode)"
        :initial-values="props.config.initialValues"
        :effects="props.config.effects"
        :plugins="[...(props.config.plugins ?? []), devTools]"
        @submit="showResult"
        @submit-failed="(e: any) => st?.showErrors(e)"
        @reset="() => clearStatus()"
      />
    </component>
  </div>
</template>

<script setup lang="ts">
/**
 * 场景渲染器（UI 库无关）
 *
 * StatusTabs 通过 prop 注入，由 App 根据当前 UI 库提供。
 * ConfigForm 内部通过全局注册表解析字段组件，自动匹配当前 UI 库。
 * 当场景配置包含 schemaVariants 时，渲染变体切换 UI（如布局切换）。
 */
import type { FieldPattern, ISchema } from '@moluoxixi/core'
import type { SceneConfig } from '@playground/shared'
import type { Component } from 'vue'
import { isI18nKey, translateSchema } from '@moluoxixi/core'
import { devToolsPlugin } from '@moluoxixi/plugin-devtools'
import { ConfigForm } from '@moluoxixi/vue'
import { computed, ref, shallowRef, watch, watchEffect } from 'vue'
import { createI18n } from 'vue-i18n'

const props = defineProps<{
  config: SceneConfig
  statusTabs: Component
}>()

/** DevTools 插件单例 */
const devTools = devToolsPlugin({ formId: 'vue-playground' })

interface StatusTabsExpose {
  mode: FieldPattern | { value: FieldPattern }
  showErrors: (errors: unknown[]) => void
}
const st = ref<StatusTabsExpose | null>(null)

function clearStatus(): void {
  st.value?.showErrors([])
}

/** 变体选中值 */
const variantValue = ref(props.config.schemaVariants?.defaultValue ?? '')

const i18nConfig = computed(() => props.config.i18n)
const resolvedLocaleOptions = computed(() => {
  const config = i18nConfig.value
  if (!config)
    return []
  if (props.config.localeOptions && props.config.localeOptions.length > 0)
    return props.config.localeOptions
  return Object.keys(config.messages ?? {}).map(key => ({ label: key, value: key }))
})
const defaultLocale = computed(() => {
  const config = i18nConfig.value
  if (!config)
    return ''
  return config.defaultLocale
    ?? resolvedLocaleOptions.value[0]?.value
    ?? Object.keys(config.messages ?? {})[0]
    ?? ''
})
const locale = ref(defaultLocale.value)
const i18n = shallowRef<ReturnType<typeof createI18n> | null>(null)

watch(defaultLocale, (next) => {
  if (next && locale.value !== next) {
    locale.value = next
  }
})

watchEffect(() => {
  const config = i18nConfig.value
  if (!config) {
    i18n.value = null
    return
  }
  i18n.value = createI18n({
    legacy: false,
    locale: defaultLocale.value || 'zh-CN',
    fallbackLocale: defaultLocale.value || 'zh-CN',
    messages: config.messages ?? {},
  })
})

watch(locale, (value) => {
  if (i18n.value) {
    i18n.value.global.locale.value = value
  }
})

/** 当前使用的 schema（有变体时动态生成，否则使用静态 schema） */
const currentSchema = computed<ISchema>(() => {
  const variants = props.config.schemaVariants
  if (variants && variantValue.value) {
    return variants.factory(variantValue.value)
  }
  return props.config.schema
})

const localizedSchema = computed<ISchema>(() => {
  const schema = currentSchema.value
  const activeLocale = locale.value
  if (!i18nConfig.value || !i18n.value || !activeLocale)
    return schema
  const translate = (key: string, params?: Record<string, unknown>) => i18n.value?.global.t(key, params) as string
  return translateSchema(schema, { t: translate })
})

/** 注入 pattern 到 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

function readModeValue(): FieldPattern | undefined {
  const mode = st.value?.mode as { value?: FieldPattern } | FieldPattern | undefined
  if (mode && typeof mode === 'object' && 'value' in mode)
    return mode.value
  return mode
}

watch(readModeValue, () => {
  clearStatus()
})

const displayTitle = computed(() => {
  if (!i18nConfig.value || !i18n.value)
    return props.config.title
  if (isI18nKey(props.config.title)) {
    return i18n.value.global.t(props.config.title.slice(3)) as string
  }
  return props.config.title
})

const displayDescription = computed(() => {
  if (!i18nConfig.value || !i18n.value)
    return props.config.description
  if (isI18nKey(props.config.description)) {
    return i18n.value.global.t(props.config.description.slice(3)) as string
  }
  return props.config.description
})
</script>
