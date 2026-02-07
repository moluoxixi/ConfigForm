<template>
  <div>
    <h2>分步表单</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">Steps 导航 / 步骤验证 / void 节点分步</p>
    <PlaygroundForm :schema="schema" :initial-values="initialValues" />
  </div>
</template>

<script setup lang="ts">
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import type { ISchema } from '@moluoxixi/schema'
import PlaygroundForm from '../../components/PlaygroundForm.vue'

setupAntdVue()

const initialValues = { name: '', phone: '', email: '', company: '', position: '' }

const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
  properties: {
    step1: {
      type: 'void',
      component: 'LayoutCard',
      componentProps: { title: '第 1 步：基本信息' },
      properties: {
        name: { type: 'string', title: '姓名', required: true, rules: [{ minLength: 2, message: '至少 2 字' }] },
        phone: { type: 'string', title: '手机号', required: true, rules: [{ format: 'phone', message: '无效手机号' }] },
        email: { type: 'string', title: '邮箱', required: true, rules: [{ format: 'email', message: '无效邮箱' }] },
      },
    },
    step2: {
      type: 'void',
      component: 'LayoutCard',
      componentProps: { title: '第 2 步：工作信息' },
      properties: {
        company: { type: 'string', title: '公司', required: true },
        position: { type: 'string', title: '职位', required: true },
      },
    },
  },
}
</script>
