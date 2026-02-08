<template>
  <div>
    <h2>多表单协作</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">两个独立表单 / 联合提交 — ConfigForm + Schema 实现</p>
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
import { setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { ConfigForm } from '@moluoxixi/vue'
/**
 * 多表单协作 — Config 模式
 *
 * 使用 ConfigForm + Schema 实现多表单协作。
 * 实际多表单联动需借助 field 模式的多个 form 实例；此处使用 void 节点分组模拟。
 */
import { ref } from 'vue'

setupAntdVue()

const st = ref<InstanceType<typeof StatusTabs>>()

const initialValues = { orderName: '', customer: '', total: 0, contactName: '', contactPhone: '', contactEmail: '' }

const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '联合提交', reset: '重置' } },
  properties: {
    orderSection: {
      type: 'void',
      component: 'LayoutCard',
      componentProps: { title: '主表单 - 订单信息' },
      properties: {
        orderName: { type: 'string', title: '订单名称', required: true },
        customer: { type: 'string', title: '客户', required: true },
        total: { type: 'number', title: '金额', required: true, componentProps: { min: 0, style: 'width: 100%' } },
      },
    },
    contactSection: {
      type: 'void',
      component: 'LayoutCard',
      componentProps: { title: '子表单 - 联系人' },
      properties: {
        contactName: { type: 'string', title: '联系人', required: true },
        contactPhone: { type: 'string', title: '电话', required: true, rules: [{ format: 'phone', message: '无效手机号' }] },
        contactEmail: { type: 'string', title: '邮箱', rules: [{ format: 'email', message: '无效邮箱' }] },
      },
    },
  },
}

/** 将 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}
</script>
