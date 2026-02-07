<template>
  <div>
    <h2>折叠面板分组</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">Collapse 分组 / 默认展开 / 折叠切换</p>
    <PlaygroundForm :schema="schema" :initial-values="initialValues" />
  </div>
</template>

<script setup lang="ts">
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import type { FormSchema } from '@moluoxixi/schema'
import PlaygroundForm from '../../components/PlaygroundForm.vue'

setupAntdVue()

const initialValues = { name: '', email: '', phone: '', company: '', position: '', salary: undefined, school: '', major: '', degree: undefined, bio: '', hobby: '' }

const schema: FormSchema = {
  form: { labelPosition: 'right', labelWidth: '120px' },
  layout: { type: 'groups', groups: [{ title: '基本信息', component: 'Collapse', fields: ['name', 'email', 'phone'], collapsed: false }, { title: '工作信息', component: 'Collapse', fields: ['company', 'position', 'salary'] }, { title: '教育经历', component: 'Collapse', fields: ['school', 'major', 'degree'], collapsed: true }, { title: '其他', component: 'Collapse', fields: ['bio', 'hobby'], collapsed: true }] },
  fields: {
    name: { type: 'string', label: '姓名', required: true, component: 'Input', wrapper: 'FormItem' },
    email: { type: 'string', label: '邮箱', required: true, component: 'Input', wrapper: 'FormItem', rules: [{ format: 'email', message: '无效邮箱' }] },
    phone: { type: 'string', label: '手机号', component: 'Input', wrapper: 'FormItem' },
    company: { type: 'string', label: '公司', component: 'Input', wrapper: 'FormItem' },
    position: { type: 'string', label: '职位', component: 'Input', wrapper: 'FormItem' },
    salary: { type: 'number', label: '薪资', component: 'InputNumber', wrapper: 'FormItem', componentProps: { min: 0, style: { width: '100%' } } },
    school: { type: 'string', label: '学校', component: 'Input', wrapper: 'FormItem' },
    major: { type: 'string', label: '专业', component: 'Input', wrapper: 'FormItem' },
    degree: { type: 'string', label: '学历', component: 'Select', wrapper: 'FormItem', enum: [{ label: '本科', value: 'bachelor' }, { label: '硕士', value: 'master' }, { label: '博士', value: 'phd' }] },
    bio: { type: 'string', label: '简介', component: 'Textarea', wrapper: 'FormItem' },
    hobby: { type: 'string', label: '爱好', component: 'Input', wrapper: 'FormItem' },
  },
}
</script>
