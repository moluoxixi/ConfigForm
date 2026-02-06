<template>
  <div>
    <h2>嵌套对象</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">一级嵌套 / 多层嵌套 / 嵌套内联动</p>
    <ASegmented v-model:value="mode" :options="MODE_OPTIONS" style="margin-bottom: 16px" />
    <ConfigForm :key="mode" :schema="schema" :initial-values="savedValues" @values-change="(v: Record<string, unknown>) => savedValues = v" @submit="(v: Record<string, unknown>) => result = JSON.stringify(v, null, 2)" @submit-failed="(e: any[]) => result = '验证失败:\n' + e.map((x: any) => `[${x.path}] ${x.message}`).join('\n')">
      <template #default="{ form }"><ADivider /><ASpace v-if="mode === 'editable'"><AButton type="primary" html-type="submit">提交</AButton><AButton @click="form.reset()">重置</AButton></ASpace></template>
    </ConfigForm>
    <AAlert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" message="提交结果（嵌套结构）" style="margin-top: 16px"><template #description><pre style="margin: 0; white-space: pre-wrap">{{ result }}</pre></template></AAlert>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ConfigForm } from '@moluoxixi/vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { Button as AButton, Space as ASpace, Alert as AAlert, Segmented as ASegmented, Divider as ADivider } from 'ant-design-vue'
import type { FormSchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'

setupAntdVue()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const savedValues = ref<Record<string, unknown>>({ title: '', profile: { name: '', age: undefined, gender: undefined, contact: { phone: '', email: '' }, address: { province: undefined, city: '', detail: '' } }, company: { name: '', department: '', position: '' }, settings: { theme: 'light', customColor: '' } })

const schema = computed<FormSchema>(() => ({
  form: { labelPosition: 'right', labelWidth: '160px', pattern: mode.value },
  fields: {
    title: { type: 'string', label: '标题', required: true, component: 'Input', wrapper: 'FormItem', placeholder: '请输入标题' },
    'profile.name': { type: 'string', label: '姓名', required: true, component: 'Input', wrapper: 'FormItem', placeholder: '请输入' },
    'profile.age': { type: 'number', label: '年龄', component: 'InputNumber', wrapper: 'FormItem', componentProps: { min: 0, max: 150, style: { width: '100%' } } },
    'profile.gender': { type: 'string', label: '性别', component: 'Select', wrapper: 'FormItem', enum: [{ label: '男', value: 'male' }, { label: '女', value: 'female' }] },
    'profile.contact.phone': { type: 'string', label: '手机号', component: 'Input', wrapper: 'FormItem', rules: [{ format: 'phone', message: '无效手机号' }] },
    'profile.contact.email': { type: 'string', label: '邮箱', component: 'Input', wrapper: 'FormItem', rules: [{ format: 'email', message: '无效邮箱' }] },
    'profile.address.province': { type: 'string', label: '省份', component: 'Select', wrapper: 'FormItem', enum: [{ label: '北京', value: 'beijing' }, { label: '上海', value: 'shanghai' }] },
    'profile.address.city': { type: 'string', label: '城市', component: 'Input', wrapper: 'FormItem' },
    'profile.address.detail': { type: 'string', label: '详细地址', component: 'Textarea', wrapper: 'FormItem' },
    'company.name': { type: 'string', label: '公司名称', component: 'Input', wrapper: 'FormItem' },
    'company.department': { type: 'string', label: '部门', component: 'Input', wrapper: 'FormItem' },
    'company.position': { type: 'string', label: '职位', component: 'Input', wrapper: 'FormItem' },
    'settings.theme': { type: 'string', label: '主题', component: 'RadioGroup', wrapper: 'FormItem', defaultValue: 'light', enum: [{ label: '亮色', value: 'light' }, { label: '暗色', value: 'dark' }, { label: '自定义', value: 'custom' }] },
    'settings.customColor': { type: 'string', label: '自定义颜色', component: 'Input', wrapper: 'FormItem', placeholder: '#1677ff', visible: false, reactions: [{ watch: 'settings.theme', when: (v: unknown[]) => v[0] === 'custom', fulfill: { state: { visible: true, required: true } }, otherwise: { state: { visible: false, required: false } } }] },
  },
}))
</script>
