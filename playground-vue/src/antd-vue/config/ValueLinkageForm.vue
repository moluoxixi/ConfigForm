<template>
  <div>
    <h2>值联动</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">单向同步 / 格式转换 / 映射转换 / 多对一聚合</p>
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
const savedValues = ref<Record<string, unknown>>({ firstName: '', lastName: '', fullName: '', rawInput: '', upperCase: '', trimmed: '', country: 'china', areaCode: '+86', currency: 'CNY', province: '', city: '', district: '', fullAddress: '' })

const COUNTRY_CODE: Record<string, string> = { china: '+86', usa: '+1', japan: '+81', korea: '+82', uk: '+44' }
const COUNTRY_CURRENCY: Record<string, string> = { china: 'CNY', usa: 'USD', japan: 'JPY', korea: 'KRW', uk: 'GBP' }

const schema = computed<FormSchema>(() => ({
  form: { labelPosition: 'right', labelWidth: '150px', pattern: mode.value },
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
}))
</script>
