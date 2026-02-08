<template>
  <div>
    <h2>生命周期钩子</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">onMount / onChange / onSubmit / onReset — ConfigForm + Schema 实现</p>
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
import type { FieldPattern } from '@moluoxixi/core'
import { setupElementPlus, StatusTabs } from '@moluoxixi/ui-element-plus'
import { ConfigForm } from '@moluoxixi/vue'
/**
 * 生命周期钩子 — Config 模式
 *
 * 使用 ConfigForm + Schema 实现生命周期表单。
 * 实际事件日志和自动保存需借助 field 模式的 form API；此处展示 schema 驱动的基础表单。
 */
import { ref } from 'vue'

setupElementPlus()

const st = ref<InstanceType<typeof StatusTabs>>()

const initialValues = { title: '生命周期测试', price: 99, description: '' }

const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '100px', actions: { submit: '提交', reset: '重置' } },
  properties: {
    title: { type: 'string', title: '标题', required: true },
    price: { type: 'number', title: '价格', componentProps: { style: 'width: 100%' } },
    description: { type: 'string', title: '描述', component: 'Textarea', componentProps: { rows: 3 } },
  },
}

/** 将 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}
</script>
