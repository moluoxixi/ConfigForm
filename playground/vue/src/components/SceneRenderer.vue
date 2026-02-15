<template>
  <div>
    <h2>{{ props.title ?? props.config.title }}</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      {{ props.description ?? props.config.description }}
    </p>

    <slot name="header-extra" />

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
        :schema="withMode(currentSchema, mode)"
        :initial-values="props.config.initialValues"
        :effects="props.config.effects"
        :plugins="resolvedPlugins"
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
 * 仅负责通用场景渲染（标题、变体切换、三态切换、ConfigForm）。
 * 场景特定能力（如 i18n 运行时与语言切换）在外层注入，避免通用渲染器耦合业务逻辑。
 */
import type { FieldPattern, FormPlugin, ISchema } from '@moluoxixi/core'
import type { SceneConfig } from '@playground/shared'
import type { Component } from 'vue'
import { devToolsPlugin } from '@moluoxixi/plugin-devtools'
import { ConfigForm } from '@moluoxixi/vue'
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  config: SceneConfig
  statusTabs: Component
  title?: string
  description?: string
  extraPlugins?: FormPlugin[]
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

const resolvedPlugins = computed(() => [
  ...(props.config.plugins ?? []),
  ...(props.extraPlugins ?? []),
  devTools,
])

/** 当前使用的 schema（有变体时动态生成，否则使用静态 schema） */
const currentSchema = computed<ISchema>(() => {
  const variants = props.config.schemaVariants
  if (variants && variantValue.value) {
    return variants.factory(variantValue.value)
  }
  return props.config.schema
})

/** 注入 pattern 到 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

function readModeValue(): FieldPattern | undefined {
  const mode = st.value?.mode
  if (mode && typeof mode === 'object' && 'value' in mode)
    return mode.value
  return typeof mode === 'string' ? mode : undefined
}

watch(readModeValue, () => {
  clearStatus()
})
</script>
