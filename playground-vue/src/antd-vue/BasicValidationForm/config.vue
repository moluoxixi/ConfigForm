<template>
  <div>
    <h2>必填与格式验证</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">required / email / phone / URL / pattern / min-max</p>
    <PlaygroundForm :schema="schema" :initial-values="initialValues" />
  </div>
</template>

<script setup lang="ts">
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import type { ISchema } from '@moluoxixi/schema'
import PlaygroundForm from '../../components/PlaygroundForm.vue'

setupAntdVue()

const initialValues = { username: '', email: '', phone: '', website: '', nickname: '', age: undefined, zipCode: '', idCard: '', password: '' }

const schema: ISchema = {
  type: 'object',
  decoratorProps: { actions: { submit: true, reset: true }, labelPosition: 'right', labelWidth: '140px' },
  properties: {
    username: { type: 'string', title: '用户名（必填）', required: true, placeholder: '请输入', rules: [{ minLength: 3, maxLength: 20, message: '3-20 字符' }] },
    email: { type: 'string', title: '邮箱', required: true, placeholder: '请输入邮箱', rules: [{ format: 'email', message: '无效邮箱' }] },
    phone: { type: 'string', title: '手机号', required: true, placeholder: '11 位手机号', rules: [{ format: 'phone', message: '无效手机号' }] },
    website: { type: 'string', title: '个人网站', placeholder: 'https://...', rules: [{ format: 'url', message: '无效 URL' }] },
    nickname: { type: 'string', title: '昵称', placeholder: '2-10 字符', rules: [{ minLength: 2, message: '至少 2 字符' }, { maxLength: 10, message: '最多 10 字符' }] },
    age: { type: 'number', title: '年龄', required: true, component: 'InputNumber', rules: [{ min: 1, max: 150, message: '1-150' }] },
    zipCode: { type: 'string', title: '邮编', placeholder: '6 位数字', rules: [{ pattern: /^\d{6}$/, message: '6 位数字' }] },
    idCard: { type: 'string', title: '身份证号', placeholder: '18 位', rules: [{ pattern: /^\d{17}[\dXx]$/, message: '无效身份证' }] },
    password: { type: 'string', title: '密码', required: true, component: 'Password', placeholder: '8-32 位', rules: [{ minLength: 8, maxLength: 32, message: '8-32 字符' }, { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: '需含大小写和数字' }] },
  },
}
</script>
