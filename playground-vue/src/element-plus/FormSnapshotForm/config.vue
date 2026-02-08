<template>
  <div>
    <h2>表单快照</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">暂存草稿 / 恢复草稿 — ConfigForm + Schema 实现</p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <ConfigForm
        :schema="withMode(schema, mode)"
        :initial-values="initialValues"
        @submit="showResult"
        @submit-failed="(e: any) => st?.showErrors(e)"
      />
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'
import { setupElementPlus, StatusTabs } from '@moluoxixi/ui-element-plus'
import { ConfigForm } from '@moluoxixi/vue'
/**
 * 表单快照 — Config 模式
 *
 * 使用 ConfigForm + Schema 实现表单快照。
 * 实际草稿功能需借助 field 模式的 form API；此处展示 schema 驱动的基础表单。
 */
import { ref } from 'vue'

setupElementPlus()

const st = ref<InstanceType<typeof StatusTabs>>()

const initialValues = { title: '', description: '', category: '', priority: '' }

const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '100px', actions: { submit: '提交', reset: '重置' } },
  properties: {
    title: { type: 'string', title: '标题', required: true },
    description: { type: 'string', title: '描述', component: 'Textarea', componentProps: { rows: 3 } },
    category: { type: 'string', title: '分类' },
    priority: { type: 'string', title: '优先级', enum: [{ label: '高', value: 'high' }, { label: '中', value: 'medium' }, { label: '低', value: 'low' }] },
  },
}

/** 将 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}
</script>
