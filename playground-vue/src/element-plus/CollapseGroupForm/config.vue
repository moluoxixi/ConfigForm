<template>
  <div>
    <h2>折叠面板分组</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      Collapse 分组 / 默认展开 / 折叠切换 — ConfigForm + ISchema 实现
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
 * 折叠面板分组 — Config 模式（Element Plus）
 *
 * 使用 ConfigForm + ISchema + void 节点实现 Collapse 分组布局。
 * 通过 type: 'void' + component: 'LayoutCollapse' 创建折叠面板容器。
 */
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'
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
  company: '', position: '', salary: undefined,
  school: '', major: '', degree: undefined,
  bio: '', hobby: '',
}

const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
  properties: {
    collapseGroup: {
      type: 'void',
      component: 'LayoutCollapse',
      properties: {
        basicSection: {
          type: 'void',
          componentProps: { title: '基本信息', collapsed: false },
          properties: {
            name: { type: 'string', title: '姓名', required: true },
            email: { type: 'string', title: '邮箱', required: true, rules: [{ format: 'email', message: '无效邮箱' }] },
            phone: { type: 'string', title: '手机号' },
          },
        },
        workSection: {
          type: 'void',
          componentProps: { title: '工作信息' },
          properties: {
            company: { type: 'string', title: '公司' },
            position: { type: 'string', title: '职位' },
            salary: { type: 'number', title: '薪资', component: 'InputNumber', componentProps: { min: 0, style: 'width: 100%' } },
          },
        },
        eduSection: {
          type: 'void',
          componentProps: { title: '教育经历', collapsed: true },
          properties: {
            school: { type: 'string', title: '学校' },
            major: { type: 'string', title: '专业' },
            degree: {
              type: 'string', title: '学历', component: 'Select',
              enum: [{ label: '本科', value: 'bachelor' }, { label: '硕士', value: 'master' }, { label: '博士', value: 'phd' }],
            },
          },
        },
        otherSection: {
          type: 'void',
          componentProps: { title: '其他', collapsed: true },
          properties: {
            bio: { type: 'string', title: '简介', component: 'Textarea' },
            hobby: { type: 'string', title: '爱好' },
          },
        },
      },
    },
  },
}
</script>
