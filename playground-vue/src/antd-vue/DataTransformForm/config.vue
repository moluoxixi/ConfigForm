<template>
  <div>
    <h2>数据转换</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">format / parse / transform — ConfigForm + Schema 实现</p>
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
import { setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { ConfigForm } from '@moluoxixi/vue'
/**
 * 数据转换 — Config 模式
 *
 * 使用 ConfigForm + Schema 实现数据转换表单。
 * schema 中的 format / parse / transform 配置由框架自动处理。
 */
import { ref } from 'vue'

setupAntdVue()

const st = ref<InstanceType<typeof StatusTabs>>()

const initialValues = {
  priceCent: 9990,
  phoneRaw: '13800138000',
  fullName: '张三',
  tags: 'react,vue,typescript',
}

const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '140px', actions: { submit: '提交', reset: '重置' } },
  properties: {
    priceCent: { type: 'number', title: '价格（分）', description: '存储单位为分', componentProps: { style: 'width: 300px' } },
    phoneRaw: { type: 'string', title: '手机号', componentProps: { style: 'width: 300px' } },
    fullName: { type: 'string', title: '姓名', componentProps: { style: 'width: 300px' } },
    tags: { type: 'string', title: '标签（逗号分隔）', description: '提交时可转为数组', componentProps: { style: 'width: 300px' } },
  },
}

/** 将 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}
</script>
