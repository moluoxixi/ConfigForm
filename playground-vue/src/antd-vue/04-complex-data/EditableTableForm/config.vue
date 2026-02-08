<template>
  <div>
    <h2>可编辑表格</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      表格行内编辑 / 数组字段 — ConfigForm + ISchema 实现
    </p>
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
/**
 * 可编辑表格 — Config 模式（Ant Design Vue）
 *
 * 使用 ConfigForm + ISchema 实现可编辑表格。
 * 通过 type: 'array' + items 定义表格数据结构，
 * 框架自动处理三种模式的渲染。
 */
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/core'
import { setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { ConfigForm } from '@moluoxixi/vue'
import { ref } from 'vue'

setupAntdVue()

const st = ref<InstanceType<typeof StatusTabs>>()

/** 工具：将 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

const initialValues = {
  items: [
    { productName: '键盘', quantity: 2, unitPrice: 299 },
    { productName: '鼠标', quantity: 3, unitPrice: 99 },
  ],
}

const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
  properties: {
    items: {
      type: 'array',
      title: '订单明细',
      minItems: 1,
      maxItems: 20,
      itemTemplate: { productName: '', quantity: 1, unitPrice: 0 },
      items: {
        type: 'object',
        properties: {
          productName: { type: 'string', title: '商品', required: true, componentProps: { placeholder: '商品名称' } },
          quantity: { type: 'number', title: '数量', required: true, componentProps: { min: 1, placeholder: '数量' } },
          unitPrice: { type: 'number', title: '单价', required: true, componentProps: { min: 0, step: 0.01, placeholder: '单价' } },
        },
      },
    },
  },
}
</script>
