<template>
  <div>
    <h2>{{ props.config.title }}</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      {{ props.config.description }}
    </p>

    <component :is="props.statusTabs" ref="st" v-slot="{ mode, showResult }">
      <ConfigForm
        :schema="withMode(props.config.schema, mode)"
        :initial-values="props.config.initialValues"
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
 */
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/core'
import type { SceneConfig } from '@playground/shared'
import type { Component } from 'vue'
import { ConfigForm } from '@moluoxixi/vue'
import { ref } from 'vue'

const props = defineProps<{
  config: SceneConfig
  statusTabs: Component
}>()

const st = ref<{ showErrors: (errors: unknown[]) => void } | null>(null)

/** 注入 pattern 到 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}
</script>
