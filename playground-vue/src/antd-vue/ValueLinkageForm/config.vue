<template>
  <div>
    <h2>值联动</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">单向同步 / 格式转换 / 映射转换 / 多对一聚合</p>
    <PlaygroundForm :schema="schema" :initial-values="initialValues" />
  </div>
</template>

<script setup lang="ts">
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import type { ISchema } from '@moluoxixi/schema'
import PlaygroundForm from '../../components/PlaygroundForm.vue'

setupAntdVue()

const initialValues = { firstName: '', lastName: '', fullName: '', rawInput: '', upperCase: '', trimmed: '', country: 'china', areaCode: '+86', currency: 'CNY', province: '', city: '', district: '', fullAddress: '' }

const COUNTRY_CODE: Record<string, string> = { china: '+86', usa: '+1', japan: '+81', korea: '+82', uk: '+44' }
const COUNTRY_CURRENCY: Record<string, string> = { china: 'CNY', usa: 'USD', japan: 'JPY', korea: 'KRW', uk: 'GBP' }

const schema: ISchema = {
  type: 'object',
  decoratorProps: { actions: { submit: true, reset: true }, labelPosition: 'right', labelWidth: '150px' },
  properties: {
    firstName: { type: 'string', title: '姓', componentProps: { placeholder: '请输入姓' } },
    lastName: { type: 'string', title: '名', componentProps: { placeholder: '请输入名' } },
    fullName: { type: 'string', title: '全名（自动拼接）', componentProps: { disabled: true }, reactions: [{ watch: ['firstName', 'lastName'], fulfill: { run: (f: any, ctx: any) => { f.setValue(`${(ctx.values.firstName as string) ?? ''}${(ctx.values.lastName as string) ?? ''}`.trim()) } } }] },
    rawInput: { type: 'string', title: '输入文本', componentProps: { placeholder: '输入任意文本' } },
    upperCase: { type: 'string', title: '大写转换', componentProps: { disabled: true }, reactions: [{ watch: 'rawInput', fulfill: { run: (f: any, ctx: any) => { f.setValue(((ctx.values.rawInput as string) ?? '').toUpperCase()) } } }] },
    trimmed: { type: 'string', title: '去空格', componentProps: { disabled: true }, reactions: [{ watch: 'rawInput', fulfill: { run: (f: any, ctx: any) => { f.setValue(((ctx.values.rawInput as string) ?? '').trim()) } } }] },
    country: { type: 'string', title: '国家', default: 'china', enum: [{ label: '中国', value: 'china' }, { label: '美国', value: 'usa' }, { label: '日本', value: 'japan' }, { label: '韩国', value: 'korea' }, { label: '英国', value: 'uk' }] },
    areaCode: { type: 'string', title: '区号（自动）', componentProps: { disabled: true }, reactions: [{ watch: 'country', fulfill: { run: (f: any, ctx: any) => { f.setValue(COUNTRY_CODE[ctx.values.country as string] ?? '') } } }] },
    currency: { type: 'string', title: '货币（自动）', componentProps: { disabled: true }, reactions: [{ watch: 'country', fulfill: { run: (f: any, ctx: any) => { f.setValue(COUNTRY_CURRENCY[ctx.values.country as string] ?? '') } } }] },
    province: { type: 'string', title: '省', componentProps: { placeholder: '省' } },
    city: { type: 'string', title: '市', componentProps: { placeholder: '市' } },
    district: { type: 'string', title: '区', componentProps: { placeholder: '区' } },
    fullAddress: { type: 'string', title: '完整地址（聚合）', componentProps: { disabled: true }, reactions: [{ watch: ['province', 'city', 'district'], fulfill: { run: (f: any, ctx: any) => { f.setValue([ctx.values.province, ctx.values.city, ctx.values.district].filter(Boolean).join(' ')) } } }] },
  },
}
</script>
