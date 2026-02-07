<template>
  <div>
    <h2>卡片分组</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">Card 多卡片分组布局</p>
    <PlaygroundForm :schema="schema" :initial-values="initialValues" />
  </div>
</template>

<script setup lang="ts">
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import type { FormSchema } from '@moluoxixi/schema'
import PlaygroundForm from '../../components/PlaygroundForm.vue'

setupAntdVue()

const initialValues = { username: '', password: '', confirmPwd: '', realName: '', gender: undefined, birthday: '', email: '', phone: '', address: '' }

const schema: FormSchema = {
  form: { labelPosition: 'right', labelWidth: '120px' },
  layout: { type: 'groups', groups: [{ title: '账户信息', component: 'Card', fields: ['username', 'password', 'confirmPwd'] }, { title: '个人信息', component: 'Card', fields: ['realName', 'gender', 'birthday'] }, { title: '联系方式', component: 'Card', fields: ['email', 'phone', 'address'] }] },
  fields: {
    username: { type: 'string', label: '用户名', required: true, component: 'Input', wrapper: 'FormItem', rules: [{ minLength: 3, message: '至少 3 字符' }] },
    password: { type: 'string', label: '密码', required: true, component: 'Password', wrapper: 'FormItem', rules: [{ minLength: 8, message: '至少 8 字符' }] },
    confirmPwd: { type: 'string', label: '确认密码', required: true, component: 'Password', wrapper: 'FormItem', rules: [{ validator: (v: unknown, _r: unknown, ctx: any) => v !== ctx.getFieldValue('password') ? '密码不一致' : undefined, trigger: 'blur' }] },
    realName: { type: 'string', label: '真实姓名', required: true, component: 'Input', wrapper: 'FormItem' },
    gender: { type: 'string', label: '性别', component: 'RadioGroup', wrapper: 'FormItem', enum: [{ label: '男', value: 'male' }, { label: '女', value: 'female' }] },
    birthday: { type: 'string', label: '生日', component: 'DatePicker', wrapper: 'FormItem' },
    email: { type: 'string', label: '邮箱', required: true, component: 'Input', wrapper: 'FormItem', rules: [{ format: 'email', message: '无效邮箱' }] },
    phone: { type: 'string', label: '手机号', component: 'Input', wrapper: 'FormItem', rules: [{ format: 'phone', message: '无效手机号' }] },
    address: { type: 'string', label: '地址', component: 'Textarea', wrapper: 'FormItem' },
  },
}
</script>
