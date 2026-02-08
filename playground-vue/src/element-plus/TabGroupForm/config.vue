<template>
  <div>
    <h2>标签页切换分组</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      Tabs 分组 / 切换保留数据 — ConfigForm + ISchema 实现
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
 * 标签页切换分组 — Config 模式（Element Plus）
 *
 * 使用 ConfigForm + ISchema + void 节点实现 Tabs 分组布局。
 * 通过 type: 'void' + component: 'LayoutTabs' 创建标签页容器，
 * 子字段通过 properties 嵌套在各 tab 内。
 */
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/core'
import { setupElementPlus, StatusTabs } from '@moluoxixi/ui-element-plus'
import { ConfigForm } from '@moluoxixi/vue'
import { ref } from 'vue'

setupElementPlus()

const st = ref<InstanceType<typeof StatusTabs>>()

function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

const initialValues = {
  name: '', email: '', phone: '',
  company: '', position: '', department: undefined,
  bio: '', website: '', github: '',
}

const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
  properties: {
    tabs: {
      type: 'void',
      component: 'LayoutTabs',
      properties: {
        basicTab: {
          type: 'void',
          componentProps: { title: '基本信息' },
          properties: {
            name: { type: 'string', title: '姓名', required: true },
            email: { type: 'string', title: '邮箱', required: true, rules: [{ format: 'email', message: '无效邮箱' }] },
            phone: { type: 'string', title: '手机号' },
          },
        },
        workTab: {
          type: 'void',
          componentProps: { title: '工作信息' },
          properties: {
            company: { type: 'string', title: '公司', required: true },
            position: { type: 'string', title: '职位' },
            department: {
              type: 'string', title: '部门', component: 'Select',
              enum: [{ label: '技术', value: 'tech' }, { label: '产品', value: 'product' }],
            },
          },
        },
        otherTab: {
          type: 'void',
          componentProps: { title: '其他' },
          properties: {
            bio: { type: 'string', title: '简介', component: 'Textarea', rules: [{ maxLength: 200, message: '不超过 200 字' }] },
            website: { type: 'string', title: '网站', rules: [{ format: 'url', message: '无效 URL' }] },
            github: { type: 'string', title: 'GitHub' },
          },
        },
      },
    },
  },
}
</script>
