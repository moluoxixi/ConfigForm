<template>
  <div>
    <h2>打印、导出</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">打印预览 / 导出 JSON / 导出 CSV — ConfigForm + Schema 实现</p>
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
 * 打印导出 — Config 模式
 *
 * 使用 ConfigForm + Schema 实现打印导出表单。
 * 实际打印/导出操作需借助 field 模式的 form API；此处展示 schema 驱动的基础表单。
 */
import { ref } from 'vue'

setupElementPlus()

const st = ref<InstanceType<typeof StatusTabs>>()

const initialValues = { orderNo: 'ORD-20260207-001', customer: '张三', amount: 9999, date: '2026-02-07', address: '北京市朝阳区', remark: '加急处理' }

const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '100px', actions: { submit: '提交', reset: '重置' } },
  properties: {
    orderNo: { type: 'string', title: '订单号' },
    customer: { type: 'string', title: '客户' },
    amount: { type: 'number', title: '金额', componentProps: { style: 'width: 100%' } },
    date: { type: 'string', title: '日期' },
    address: { type: 'string', title: '地址' },
    remark: { type: 'string', title: '备注', component: 'Textarea', componentProps: { rows: 2 } },
  },
}

/** 将 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}
</script>
