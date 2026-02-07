<template>
  <div>
    <h2>基础表单</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      Input / Password / Textarea / InputNumber / Select / RadioGroup / CheckboxGroup / Switch / DatePicker
    </p>
    <PlaygroundForm :schema="schema" :initial-values="initialValues" />
  </div>
</template>

<script setup lang="ts">
/**
 * 场景 1：基础表单（Ant Design Vue）
 *
 * 展示所有基础字段类型 + 必填校验和格式校验
 */
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import type { ISchema } from '@moluoxixi/schema'
import PlaygroundForm from '../../components/PlaygroundForm.vue'

setupAntdVue()

const initialValues = {
  username: '', password: '', email: '', phone: '', age: 18,
  gender: undefined, marital: 'single', hobbies: [], notification: true, birthday: '', bio: '',
}

const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
  properties: {
    username: { type: 'string', title: '用户名', required: true, rules: [{ minLength: 3, maxLength: 20, message: '3-20 个字符' }] },
    password: { type: 'string', title: '密码', required: true, component: 'Password', rules: [{ minLength: 8, message: '至少 8 个字符' }] },
    email: { type: 'string', title: '邮箱', required: true, rules: [{ format: 'email', message: '邮箱格式不正确' }] },
    phone: { type: 'string', title: '手机号', rules: [{ format: 'phone', message: '手机号格式不正确' }] },
    age: { type: 'number', title: '年龄', required: true, default: 18, componentProps: { min: 0, max: 150 } },
    gender: { type: 'string', title: '性别', enum: [{ label: '男', value: 'male' }, { label: '女', value: 'female' }] },
    marital: { type: 'string', title: '婚姻状况', component: 'RadioGroup', default: 'single', enum: [{ label: '未婚', value: 'single' }, { label: '已婚', value: 'married' }] },
    hobbies: { type: 'array', title: '爱好', component: 'CheckboxGroup', default: [], enum: [{ label: '阅读', value: 'reading' }, { label: '运动', value: 'sports' }, { label: '编程', value: 'coding' }] },
    notification: { type: 'boolean', title: '开启通知', default: true },
    birthday: { type: 'date', title: '生日' },
    bio: { type: 'string', title: '个人简介', component: 'Textarea', rules: [{ maxLength: 200, message: '最多 200 字' }] },
  },
}
</script>
