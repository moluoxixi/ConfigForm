<template>
  <div>
    <h2>{{ props.config.title }}</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      {{ props.config.description }}
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
 * 使用 ConfigForm + SchemaField 递归渲染 schema.properties。
 * StatusTabs 提供编辑态/阅读态/禁用态三态切换。
 */
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/core'
import type { SceneConfig } from '@playground/shared'
import { StatusTabs } from '@moluoxixi/ui-antd-vue'
import { ConfigForm } from '@moluoxixi/vue'
import { ref } from 'vue'

const props = defineProps<{
  config: SceneConfig
}>()

const st = ref<InstanceType<typeof StatusTabs>>()

/** 注入 pattern 到 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}
</script>
