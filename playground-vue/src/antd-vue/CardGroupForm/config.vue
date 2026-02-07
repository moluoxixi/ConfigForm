<template>
  <div>
    <h2>卡片分组</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">Card 多卡片分组 / void 节点布局 / 卡片内验证</p>
    <PlaygroundForm :schema="schema" :initial-values="initialValues" />
  </div>
</template>

<script setup lang="ts">
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import type { ISchema } from '@moluoxixi/schema'
import PlaygroundForm from '../../components/PlaygroundForm.vue'

setupAntdVue()

const initialValues = { username: '', password: '', realName: '', gender: undefined, email: '', phone: '', address: '' }

const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
  properties: {
    accountCard: {
      type: 'void',
      component: 'LayoutCard',
      componentProps: { title: '🔐 账户信息' },
      properties: {
        username: { type: 'string', title: '用户名', required: true, rules: [{ minLength: 3, message: '至少 3 字符' }] },
        password: { type: 'string', title: '密码', required: true, component: 'Password', rules: [{ minLength: 8, message: '至少 8 字符' }] },
      },
    },
    personalCard: {
      type: 'void',
      component: 'LayoutCard',
      componentProps: { title: '👤 个人信息' },
      properties: {
        realName: { type: 'string', title: '真实姓名', required: true },
        gender: { type: 'string', title: '性别', component: 'RadioGroup', enum: [{ label: '男', value: 'male' }, { label: '女', value: 'female' }] },
      },
    },
    contactCard: {
      type: 'void',
      component: 'LayoutCard',
      componentProps: { title: '📞 联系方式' },
      properties: {
        email: { type: 'string', title: '邮箱', required: true, rules: [{ format: 'email', message: '无效邮箱' }] },
        phone: { type: 'string', title: '手机号', rules: [{ format: 'phone', message: '无效手机号' }] },
        address: { type: 'string', title: '地址', component: 'Textarea' },
      },
    },
  },
}
</script>
