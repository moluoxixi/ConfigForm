<template>
  <div>
    <h2>标签页切换分组</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">Tabs 分组 / 切换保留数据</p>
    <PlaygroundForm :schema="schema" :initial-values="initialValues" />
  </div>
</template>

<script setup lang="ts">
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import type { FormSchema } from '@moluoxixi/schema'
import PlaygroundForm from '../../components/PlaygroundForm.vue'

setupAntdVue()

const initialValues = { name: '', email: '', phone: '', company: '', position: '', department: undefined, bio: '', website: '', github: '' }

const schema: FormSchema = {
  form: { labelPosition: 'right', labelWidth: '120px' },
  layout: { type: 'tabs', tabs: [{ title: '基本信息', fields: ['name', 'email', 'phone'], showErrorBadge: true }, { title: '工作信息', fields: ['company', 'position', 'department'], showErrorBadge: true }, { title: '其他', fields: ['bio', 'website', 'github'] }] },
  fields: {
    name: { type: 'string', label: '姓名', required: true, component: 'Input', wrapper: 'FormItem' },
    email: { type: 'string', label: '邮箱', required: true, component: 'Input', wrapper: 'FormItem', rules: [{ format: 'email', message: '无效邮箱' }] },
    phone: { type: 'string', label: '手机号', component: 'Input', wrapper: 'FormItem' },
    company: { type: 'string', label: '公司', required: true, component: 'Input', wrapper: 'FormItem' },
    position: { type: 'string', label: '职位', component: 'Input', wrapper: 'FormItem' },
    department: { type: 'string', label: '部门', component: 'Select', wrapper: 'FormItem', enum: [{ label: '技术', value: 'tech' }, { label: '产品', value: 'product' }] },
    bio: { type: 'string', label: '简介', component: 'Textarea', wrapper: 'FormItem', rules: [{ maxLength: 200, message: '不超过 200 字' }] },
    website: { type: 'string', label: '网站', component: 'Input', wrapper: 'FormItem', rules: [{ format: 'url', message: '无效 URL' }] },
    github: { type: 'string', label: 'GitHub', component: 'Input', wrapper: 'FormItem' },
  },
}
</script>
