<template>
  <div>
    <h2>值联动</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">单向同步 / 格式转换 / 映射转换 / 多对一聚合</p>
    <PlaygroundForm :schema="schema" :initial-values="initialValues" />
  </div>
</template>

<script setup lang="ts">
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import type { FormSchema } from '@moluoxixi/schema'
import PlaygroundForm from '../../components/PlaygroundForm.vue'

setupAntdVue()

const initialValues = { firstName: '', lastName: '', fullName: '', rawInput: '', upperCase: '', trimmed: '', country: 'china', areaCode: '+86', currency: 'CNY', province: '', city: '', district: '', fullAddress: '' }

const COUNTRY_CODE: Record<string, string> = { china: '+86', usa: '+1', japan: '+81', korea: '+82', uk: '+44' }
const COUNTRY_CURRENCY: Record<string, string> = { china: 'CNY', usa: 'USD', japan: 'JPY', korea: 'KRW', uk: 'GBP' }

const schema: FormSchema = {
  form: { labelPosition: 'right', labelWidth: '150px' },
  fields: {
    firstName: { type: 'string', label: '姓', component: 'Input', wrapper: 'FormItem', placeholder: '请输入姓' },
    lastName: { type: 'string', label: '名', component: 'Input', wrapper: 'FormItem', placeholder: '请输入名' },
    fullName: { type: 'string', label: '全名（自动拼接）', component: 'Input', wrapper: 'FormItem', componentProps: { disabled: true }, reactions: [{ watch: ['firstName', 'lastName'], fulfill: { run: (f: any, ctx: any) => { f.setValue(`${(ctx.values.firstName as string) ?? ''}${(ctx.values.lastName as string) ?? ''}`.trim()) } } }] },
    rawInput: { type: 'string', label: '输入文本', component: 'Input', wrapper: 'FormItem', placeholder: '输入任意文本' },
    upperCase: { type: 'string', label: '大写转换', component: 'Input', wrapper: 'FormItem', componentProps: { disabled: true }, reactions: [{ watch: 'rawInput', fulfill: { run: (f: any, ctx: any) => { f.setValue(((ctx.values.rawInput as string) ?? '').toUpperCase()) } } }] },
    trimmed: { type: 'string', label: '去空格', component: 'Input', wrapper: 'FormItem', componentProps: { disabled: true }, reactions: [{ watch: 'rawInput', fulfill: { run: (f: any, ctx: any) => { f.setValue(((ctx.values.rawInput as string) ?? '').trim()) } } }] },
    country: { type: 'string', label: '国家', component: 'Select', wrapper: 'FormItem', defaultValue: 'china', enum: [{ label: '中国', value: 'china' }, { label: '美国', value: 'usa' }, { label: '日本', value: 'japan' }, { label: '韩国', value: 'korea' }, { label: '英国', value: 'uk' }] },
    areaCode: { type: 'string', label: '区号（自动）', component: 'Input', wrapper: 'FormItem', componentProps: { disabled: true }, reactions: [{ watch: 'country', fulfill: { run: (f: any, ctx: any) => { f.setValue(COUNTRY_CODE[ctx.values.country as string] ?? '') } } }] },
    currency: { type: 'string', label: '货币（自动）', component: 'Input', wrapper: 'FormItem', componentProps: { disabled: true }, reactions: [{ watch: 'country', fulfill: { run: (f: any, ctx: any) => { f.setValue(COUNTRY_CURRENCY[ctx.values.country as string] ?? '') } } }] },
    province: { type: 'string', label: '省', component: 'Input', wrapper: 'FormItem', placeholder: '省' },
    city: { type: 'string', label: '市', component: 'Input', wrapper: 'FormItem', placeholder: '市' },
    district: { type: 'string', label: '区', component: 'Input', wrapper: 'FormItem', placeholder: '区' },
    fullAddress: { type: 'string', label: '完整地址（聚合）', component: 'Input', wrapper: 'FormItem', componentProps: { disabled: true }, reactions: [{ watch: ['province', 'city', 'district'], fulfill: { run: (f: any, ctx: any) => { f.setValue([ctx.values.province, ctx.values.city, ctx.values.district].filter(Boolean).join(' ')) } } }] },
  },
}
</script>
