<template>
  <div>
    <h2>{{ props.config.title }}</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      {{ props.config.description }}
    </p>

    <!-- Schema 变体切换器（如布局切换） -->
    <div v-if="props.config.schemaVariants" style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
      <span style="font-size: 13px; font-weight: 600; color: #555;">{{ props.config.schemaVariants.label }}：</span>
      <div style="display: flex; gap: 4px;">
        <button
          v-for="opt in props.config.schemaVariants.options" :key="opt.value"
          :style="{
            padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 500,
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
        :plugins="props.config.plugins"
        @submit="showResult"
        @submit-failed="(e: any) => st?.showErrors(e)"
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
import type { FieldPattern,ISchema } from '@moluoxixi/core'
import type { SceneConfig } from '@playground/shared'
import type { Component } from 'vue'
import { ConfigForm } from '@moluoxixi/vue'
import { computed, ref } from 'vue'

const props = defineProps<{
  config: SceneConfig
  statusTabs: Component
}>()

const st = ref<{ showErrors: (errors: unknown[]) => void } | null>(null)

/** 变体选中值 */
const variantValue = ref(props.config.schemaVariants?.defaultValue ?? '')

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
</script>
