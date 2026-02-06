<template>
  <div>
    <h2>属性联动</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">动态 disabled / required / placeholder / componentProps</p>
    <ASegmented v-model:value="mode" :options="MODE_OPTIONS" style="margin-bottom: 16px" />
    <ConfigForm :key="mode" :schema="schema" :initial-values="savedValues" @values-change="(v: Record<string, unknown>) => savedValues = v" @submit="(v: Record<string, unknown>) => result = JSON.stringify(v, null, 2)" @submit-failed="(e: any[]) => result = '验证失败:\n' + e.map((x: any) => `[${x.path}] ${x.message}`).join('\n')">
      <template #default="{ form }"><ASpace v-if="mode === 'editable'" style="margin-top: 16px"><AButton type="primary" html-type="submit">提交</AButton><AButton @click="form.reset()">重置</AButton></ASpace></template>
    </ConfigForm>
    <AAlert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" message="提交结果" style="margin-top: 16px"><template #description><pre style="margin: 0; white-space: pre-wrap">{{ result }}</pre></template></AAlert>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ConfigForm } from '@moluoxixi/vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { Button as AButton, Space as ASpace, Alert as AAlert, Segmented as ASegmented } from 'ant-design-vue'
import type { FormSchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'

setupAntdVue()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const savedValues = ref<Record<string, unknown>>({ enableRemark: false, remark: '', contactType: 'phone', contactValue: '', productType: 'standard', quantity: 1, isVip: false, vipCompany: '', vipId: '' })

const schema = computed<FormSchema>(() => ({
  form: { labelPosition: 'right', labelWidth: '150px', pattern: mode.value },
  fields: {
    enableRemark: { type: 'boolean', label: '启用备注', component: 'Switch', wrapper: 'FormItem', defaultValue: false },
    remark: { type: 'string', label: '备注内容', component: 'Textarea', wrapper: 'FormItem', placeholder: '请先开启', disabled: true, reactions: [{ watch: 'enableRemark', when: (v: unknown[]) => v[0] === true, fulfill: { state: { disabled: false } }, otherwise: { state: { disabled: true } } }] },
    contactType: { type: 'string', label: '联系方式类型', component: 'Select', wrapper: 'FormItem', defaultValue: 'phone', enum: [{ label: '手机', value: 'phone' }, { label: '邮箱', value: 'email' }, { label: '微信', value: 'wechat' }] },
    contactValue: {
      type: 'string', label: '联系方式', component: 'Input', wrapper: 'FormItem', required: true, placeholder: '请输入手机号',
      reactions: [{ watch: 'contactType', fulfill: { run: (f: any, ctx: any) => { const t = ctx.values.contactType as string; const c: Record<string, { placeholder: string; required: boolean }> = { phone: { placeholder: '11 位手机号', required: true }, email: { placeholder: '邮箱地址', required: true }, wechat: { placeholder: '微信号（选填）', required: false } }; const cfg = c[t] ?? { placeholder: '请输入', required: false }; f.setComponentProps({ placeholder: cfg.placeholder }); f.required = cfg.required } } }],
    },
    productType: { type: 'string', label: '产品类型', component: 'RadioGroup', wrapper: 'FormItem', defaultValue: 'standard', enum: [{ label: '标准品', value: 'standard' }, { label: '计重品', value: 'weight' }] },
    quantity: {
      type: 'number', label: '数量', component: 'InputNumber', wrapper: 'FormItem', defaultValue: 1, description: '根据产品类型调整 step',
      reactions: [{ watch: 'productType', fulfill: { run: (f: any, ctx: any) => { f.setComponentProps(ctx.values.productType === 'weight' ? { min: 0.01, step: 0.01, addonAfter: 'kg' } : { min: 1, step: 1, addonAfter: '件' }) } } }],
    },
    isVip: { type: 'boolean', label: 'VIP 用户', component: 'Switch', wrapper: 'FormItem', defaultValue: false, description: '开启后公司名称和工号必填' },
    vipCompany: { type: 'string', label: '公司名称', component: 'Input', wrapper: 'FormItem', placeholder: 'VIP 必填', reactions: [{ watch: 'isVip', when: (v: unknown[]) => v[0] === true, fulfill: { state: { required: true } }, otherwise: { state: { required: false } } }] },
    vipId: { type: 'string', label: '工号', component: 'Input', wrapper: 'FormItem', placeholder: 'VIP 必填', reactions: [{ watch: 'isVip', when: (v: unknown[]) => v[0] === true, fulfill: { state: { required: true } }, otherwise: { state: { required: false } } }] },
  },
}))
</script>
