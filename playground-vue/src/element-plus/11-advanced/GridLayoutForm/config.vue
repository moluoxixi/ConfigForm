<template>
  <div>
    <h2>Grid ????</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      ?? span ??????????? 24 ????????????
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <ConfigForm
        :schema="withMode(schema, mode)"
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
 * ?? 49?Grid ?????Ant Design Vue?? *
 * ?? schema.span ????????????24 ????? * decoratorProps.grid ??????????? span ??????
 */
import { ref } from 'vue'

setupElementPlus()

const st = ref<InstanceType<typeof StatusTabs>>()

const schema: ISchema = {
  type: 'object',
  decoratorProps: {
    labelPosition: 'top',
    labelWidth: 'auto',
    actions: { submit: '??', reset: '??' },
    grid: true,
    gridColumns: 24,
    gridGap: '16px',
  },
  properties: {
    firstName: {
      type: 'string',
      title: '姓',
      required: true,
      span: 12,
      componentProps: { placeholder: '请输入姓氏' },
    },
    lastName: {
      type: 'string',
      title: '名',
      required: true,
      span: 12,
      componentProps: { placeholder: '请输入名字' },
    },
    email: {
      type: 'string',
      title: '邮箱',
      span: 16,
      rules: [{ format: 'email', message: '请输入有效邮箱' }],
      componentProps: { placeholder: 'user@example.com' },
    },
    age: {
      type: 'number',
      title: '年龄',
      span: 8,
      componentProps: { min: 0, max: 150 },
    },
    address: {
      type: 'string',
      title: '详细地址',
      span: 24,
      component: 'Textarea',
      componentProps: { placeholder: '请输入详细地址', rows: 2 },
    },
    province: {
      type: 'string',
      title: '省份',
      span: 8,
      enum: [
        { label: '北京', value: 'beijing' },
        { label: '上海', value: 'shanghai' },
        { label: '广东', value: 'guangdong' },
      ],
    },
    city: {
      type: 'string',
      title: '城市',
      span: 8,
      componentProps: { placeholder: '请输入城市' },
    },
    zipCode: {
      type: 'string',
      title: '邮编',
      span: 8,
      componentProps: { placeholder: '100000' },
    },
    phone: {
      type: 'string',
      title: '手机号',
      span: 12,
      rules: [{ format: 'phone', message: '????????' }],
    },
    notification: {
      type: 'boolean',
      title: '????',
      span: 12,
    },
  },
}

/** ? mode ?? schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}
</script>
