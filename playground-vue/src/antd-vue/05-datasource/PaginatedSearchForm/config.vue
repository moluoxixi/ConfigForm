<template>
  <div>
    <h2>分页搜索数据源</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      远程数据源配置 / 搜索防抖 — ConfigForm + ISchema 实现
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
 * 分页搜索数据源 — Config 模式（Ant Design Vue）
 *
 * 使用 ConfigForm + ISchema 实现带数据源的选择器。
 * 通过 dataSource 配置远程数据源，框架自动处理加载。
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

const initialValues = { userId: undefined }

/** 模拟用户数据 */
const userOptions = Array.from({ length: 50 }, (_, i) => ({
  label: `用户${String(i + 1).padStart(4, '0')}（${['技术', '产品', '设计', '运营'][i % 4]}）`,
  value: `user-${i + 1}`,
}))

const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
  properties: {
    userId: {
      type: 'string',
      title: '选择用户',
      required: true,
      component: 'Select',
      dataSource: userOptions,
      componentProps: {
        showSearch: true,
        placeholder: '输入关键词搜索用户',
        style: 'width: 400px',
      },
    },
    department: {
      type: 'string',
      title: '部门',
      enum: [
        { label: '技术部', value: 'tech' },
        { label: '产品部', value: 'product' },
        { label: '设计部', value: 'design' },
        { label: '运营部', value: 'operation' },
      ],
      componentProps: { placeholder: '选择部门' },
    },
  },
}
</script>
