<template>
  <div>
    <h2>{{ props.config.title }}{{ props.mode === 'field' ? '（Field 版）' : '' }}</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      {{ props.config.description }}{{ props.mode === 'field' ? ' — FormProvider + SchemaField 实现' : '' }}
    </p>

    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <ConfigForm
        :schema="withMode(props.config.schema, mode)"
        :initial-values="props.config.initialValues"
        @submit="showResult"
        @submit-failed="(e: any) => st?.showErrors(e)"
      />
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
/**
 * 场景渲染器
 *
 * Config / Field 模式都使用 ConfigForm + 同一份 schema 渲染。
 * ConfigForm 内部通过 SchemaField 递归渲染 schema.properties，
 * 与 Formily 的 RecursionField 机制一致。
 */
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/core'
import type { SceneConfig } from '@playground/shared'
import { StatusTabs } from '@moluoxixi/ui-antd-vue'
import { ConfigForm } from '@moluoxixi/vue'
import { ref } from 'vue'

const props = defineProps<{
  config: SceneConfig
  mode: 'config' | 'field'
}>()

const st = ref<InstanceType<typeof StatusTabs>>()

/** 注入 pattern 到 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}
</script>
