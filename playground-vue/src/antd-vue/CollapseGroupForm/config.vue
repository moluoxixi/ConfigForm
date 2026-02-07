<template>
  <div>
    <h2>折叠面板分组</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">Collapse 分组 / void 节点布局</p>
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
import { ref } from 'vue'
import { setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { ConfigForm } from '@moluoxixi/vue'
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'

setupAntdVue()

const st = ref<InstanceType<typeof StatusTabs>>()

/** 工具：将 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

const initialValues = { name: '', email: '', phone: '', company: '', position: '', salary: undefined, school: '', major: '', degree: undefined, bio: '', hobby: '' }

const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
  properties: {
    basicCard: {
      type: 'void',
      component: 'LayoutCard',
      componentProps: { title: '基本信息' },
      properties: {
        name: { type: 'string', title: '姓名', required: true },
        email: { type: 'string', title: '邮箱', required: true, rules: [{ format: 'email', message: '无效邮箱' }] },
        phone: { type: 'string', title: '手机号' },
      },
    },
    workCard: {
      type: 'void',
      component: 'LayoutCard',
      componentProps: { title: '工作信息' },
      properties: {
        company: { type: 'string', title: '公司' },
        position: { type: 'string', title: '职位' },
        salary: { type: 'number', title: '薪资', componentProps: { min: 0, style: { width: '100%' } } },
      },
    },
    eduCard: {
      type: 'void',
      component: 'LayoutCard',
      componentProps: { title: '教育经历' },
      properties: {
        school: { type: 'string', title: '学校' },
        major: { type: 'string', title: '专业' },
        degree: { type: 'string', title: '学历', enum: [{ label: '本科', value: 'bachelor' }, { label: '硕士', value: 'master' }, { label: '博士', value: 'phd' }] },
      },
    },
    otherCard: {
      type: 'void',
      component: 'LayoutCard',
      componentProps: { title: '其他' },
      properties: {
        bio: { type: 'string', title: '简介', component: 'Textarea' },
        hobby: { type: 'string', title: '爱好' },
      },
    },
  },
}
</script>
