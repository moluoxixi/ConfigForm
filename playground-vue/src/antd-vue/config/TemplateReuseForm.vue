<template>
  <div>
    <h2>模板复用</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">Schema 片段复用 + 继承覆盖 = 不同业务表单</p>
    <ASpace direction="vertical" :style="{ width: '100%', marginBottom: '16px' }">
      <ASegmented v-model:value="mode" :options="MODE_OPTIONS" />
      <ASegmented v-model:value="template" :options="templateOptions" @change="result = ''" />
    </ASpace>
    <ASpace style="margin-bottom: 12px"><ATag color="blue">复用片段：个人信息 + 地址 + 备注</ATag></ASpace>
    <ConfigForm :key="`${template}-${mode}`" :schema="schema" @submit="(v: Record<string, unknown>) => result = JSON.stringify(v, null, 2)" @submit-failed="(e: any[]) => result = '验证失败:\n' + e.map((x: any) => `[${x.path}] ${x.message}`).join('\n')">
      <template #default="{ form }"><ASpace v-if="mode === 'editable'" style="margin-top: 16px"><AButton type="primary" html-type="submit">提交</AButton><AButton @click="form.reset()">重置</AButton></ASpace></template>
    </ConfigForm>
    <AAlert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" message="提交结果" style="margin-top: 16px"><template #description><pre style="margin: 0; white-space: pre-wrap">{{ result }}</pre></template></AAlert>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ConfigForm } from '@moluoxixi/vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { Button as AButton, Space as ASpace, Alert as AAlert, Segmented as ASegmented, Tag as ATag } from 'ant-design-vue'
import type { FormSchema, FieldSchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'

setupAntdVue()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')

type TKey = 'employee' | 'customer' | 'supplier'
const template = ref<TKey>('employee')
const templateOptions = [{ label: '员工入职', value: 'employee' }, { label: '客户登记', value: 'customer' }, { label: '供应商注册', value: 'supplier' }]

const PERSON: Record<string, FieldSchema> = { name: { type: 'string', label: '姓名', required: true, component: 'Input', wrapper: 'FormItem', rules: [{ minLength: 2, message: '至少 2 字' }] }, phone: { type: 'string', label: '手机号', required: true, component: 'Input', wrapper: 'FormItem', rules: [{ format: 'phone', message: '无效手机号' }] }, email: { type: 'string', label: '邮箱', component: 'Input', wrapper: 'FormItem', rules: [{ format: 'email', message: '无效邮箱' }] } }
const ADDRESS: Record<string, FieldSchema> = { province: { type: 'string', label: '省份', component: 'Select', wrapper: 'FormItem', enum: [{ label: '北京', value: 'bj' }, { label: '上海', value: 'sh' }] }, city: { type: 'string', label: '城市', component: 'Input', wrapper: 'FormItem' }, address: { type: 'string', label: '详细地址', component: 'Textarea', wrapper: 'FormItem' } }
const REMARK: Record<string, FieldSchema> = { remark: { type: 'string', label: '备注', component: 'Textarea', wrapper: 'FormItem', rules: [{ maxLength: 500, message: '不超过 500 字' }] } }

const TEMPLATES: Record<TKey, { overrides: Record<string, Partial<FieldSchema>> }> = {
  employee: { overrides: { department: { type: 'string', label: '部门', required: true, component: 'Select', wrapper: 'FormItem', enum: [{ label: '技术', value: 'tech' }, { label: '产品', value: 'product' }] }, position: { type: 'string', label: '职位', required: true, component: 'Input', wrapper: 'FormItem' }, name: { type: 'string', label: '员工姓名', required: true, component: 'Input', wrapper: 'FormItem', rules: [{ minLength: 2, message: '至少 2 字' }] } } },
  customer: { overrides: { company: { type: 'string', label: '所属公司', component: 'Input', wrapper: 'FormItem' }, level: { type: 'string', label: '等级', component: 'Select', wrapper: 'FormItem', enum: [{ label: '普通', value: 'normal' }, { label: 'VIP', value: 'vip' }] }, name: { type: 'string', label: '客户姓名', required: true, component: 'Input', wrapper: 'FormItem', rules: [{ minLength: 2, message: '至少 2 字' }] } } },
  supplier: { overrides: { companyName: { type: 'string', label: '公司名称', required: true, component: 'Input', wrapper: 'FormItem' }, creditCode: { type: 'string', label: '信用代码', required: true, component: 'Input', wrapper: 'FormItem', rules: [{ pattern: /^[0-9A-Z]{18}$/, message: '18 位' }] }, name: { type: 'string', label: '联系人', required: true, component: 'Input', wrapper: 'FormItem', rules: [{ minLength: 2, message: '至少 2 字' }] } } },
}

const schema = computed<FormSchema>(() => {
  const fields: Record<string, FieldSchema> = { ...PERSON, ...ADDRESS, ...REMARK }
  const t = TEMPLATES[template.value]
  for (const [k, v] of Object.entries(t.overrides)) { fields[k] = fields[k] ? { ...fields[k], ...v } : v as FieldSchema }
  return { form: { labelPosition: 'right', labelWidth: '120px', pattern: mode.value }, fields }
})
</script>
