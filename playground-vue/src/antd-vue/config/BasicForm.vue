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
 * 覆盖全部注册组件类型 + 三种模式切换
 */
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import type { FormSchema } from '@moluoxixi/schema'
import PlaygroundForm from '../../components/PlaygroundForm.vue'

setupAntdVue()

const initialValues = {
  username: '', password: '', email: '', phone: '', age: 18,
  gender: undefined, marital: 'single', hobbies: [], notification: true, birthday: '', bio: '',
}

const schema: FormSchema = {
  form: { labelPosition: 'right', labelWidth: '120px' },
  fields: {
    username: { type: 'string', label: '用户名', required: true, component: 'Input', wrapper: 'FormItem', placeholder: '请输入用户名', rules: [{ minLength: 3, maxLength: 20, message: '3-20 个字符' }] },
    password: { type: 'string', label: '密码', required: true, component: 'Password', wrapper: 'FormItem', placeholder: '请输入密码', rules: [{ minLength: 8, message: '至少 8 字符' }] },
    email: { type: 'string', label: '邮箱', required: true, component: 'Input', wrapper: 'FormItem', placeholder: '请输入邮箱', rules: [{ format: 'email', message: '无效邮箱' }] },
    phone: { type: 'string', label: '手机号', component: 'Input', wrapper: 'FormItem', placeholder: '请输入手机号', rules: [{ format: 'phone', message: '无效手机号' }] },
    age: { type: 'number', label: '年龄', required: true, component: 'InputNumber', wrapper: 'FormItem', defaultValue: 18, componentProps: { min: 0, max: 150 } },
    gender: { type: 'string', label: '性别', component: 'Select', wrapper: 'FormItem', placeholder: '请选择', enum: [{ label: '男', value: 'male' }, { label: '女', value: 'female' }] },
    marital: { type: 'string', label: '婚姻状况', component: 'RadioGroup', wrapper: 'FormItem', defaultValue: 'single', enum: [{ label: '未婚', value: 'single' }, { label: '已婚', value: 'married' }] },
    hobbies: { type: 'array', label: '爱好', component: 'CheckboxGroup', wrapper: 'FormItem', defaultValue: [], enum: [{ label: '阅读', value: 'reading' }, { label: '运动', value: 'sports' }, { label: '编程', value: 'coding' }] },
    notification: { type: 'boolean', label: '接收通知', component: 'Switch', wrapper: 'FormItem', defaultValue: true },
    birthday: { type: 'string', label: '生日', component: 'DatePicker', wrapper: 'FormItem', placeholder: '请选择日期' },
    bio: { type: 'string', label: '个人简介', component: 'Textarea', wrapper: 'FormItem', placeholder: '不超过 200 字', rules: [{ maxLength: 200, message: '不超过 200 字' }] },
  },
}
</script>
