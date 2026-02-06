<template>
  <div>
    <h2>跨字段验证</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">密码一致性 / 日期范围 / 比例总和=100% / 数值区间 / 预算限制</p>
    <ASegmented v-model:value="mode" :options="MODE_OPTIONS" style="margin-bottom: 16px" />
    <ConfigForm :key="mode" :schema="schema" :initial-values="savedValues" @values-change="(v: Record<string, unknown>) => savedValues = v" @submit="(v: Record<string, unknown>) => result = JSON.stringify(v, null, 2)" @submit-failed="(e: any[]) => result = '验证失败:\n' + e.map((x: any) => `[${x.path}] ${x.message}`).join('\n')">
      <template #default="{ form }"><ADivider /><ASpace v-if="mode === 'editable'"><AButton type="primary" html-type="submit">提交</AButton><AButton @click="form.reset()">重置</AButton></ASpace></template>
    </ConfigForm>
    <AAlert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" message="提交结果" style="margin-top: 16px"><template #description><pre style="margin: 0; white-space: pre-wrap">{{ result }}</pre></template></AAlert>
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
const savedValues = ref<Record<string, unknown>>({ password: '', confirmPassword: '', startDate: '', endDate: '', ratioA: 40, ratioB: 30, ratioC: 30, minAge: 18, maxAge: 60, budget: 10000, expense: 0 })

const schema = computed<FormSchema>(() => ({
  form: { labelPosition: 'right', labelWidth: '150px', pattern: mode.value },
  fields: {
    password: { type: 'string', label: '密码', required: true, component: 'Password', wrapper: 'FormItem', rules: [{ minLength: 8, message: '至少 8 字符' }] },
    confirmPassword: { type: 'string', label: '确认密码', required: true, component: 'Password', wrapper: 'FormItem', rules: [{ validator: (v: unknown, _r: unknown, ctx: any) => { if (v && ctx.getFieldValue('password') && v !== ctx.getFieldValue('password')) return '密码不一致'; return undefined }, trigger: 'blur' }] },
    startDate: { type: 'string', label: '开始日期', required: true, component: 'DatePicker', wrapper: 'FormItem' },
    endDate: { type: 'string', label: '结束日期', required: true, component: 'DatePicker', wrapper: 'FormItem', rules: [{ validator: (v: unknown, _r: unknown, ctx: any) => { const s = ctx.getFieldValue('startDate') as string; if (s && v && String(v) < s) return '结束日期不能早于开始日期'; return undefined }, trigger: 'blur' }] },
    ratioA: { type: 'number', label: '项目 A（%）', required: true, component: 'InputNumber', wrapper: 'FormItem', defaultValue: 40, componentProps: { min: 0, max: 100, style: { width: '100%' } }, description: 'A+B+C=100' },
    ratioB: { type: 'number', label: '项目 B（%）', required: true, component: 'InputNumber', wrapper: 'FormItem', defaultValue: 30, componentProps: { min: 0, max: 100, style: { width: '100%' } } },
    ratioC: { type: 'number', label: '项目 C（%）', required: true, component: 'InputNumber', wrapper: 'FormItem', defaultValue: 30, componentProps: { min: 0, max: 100, style: { width: '100%' } }, rules: [{ validator: (_v: unknown, _r: unknown, ctx: any) => { const t = ((ctx.getFieldValue('ratioA') as number) ?? 0) + ((ctx.getFieldValue('ratioB') as number) ?? 0) + ((ctx.getFieldValue('ratioC') as number) ?? 0); if (t !== 100) return `总和须为 100%，当前 ${t}%`; return undefined }, trigger: 'blur' }] },
    minAge: { type: 'number', label: '最小年龄', required: true, component: 'InputNumber', wrapper: 'FormItem', defaultValue: 18, componentProps: { min: 0, max: 150, style: { width: '100%' } } },
    maxAge: { type: 'number', label: '最大年龄', required: true, component: 'InputNumber', wrapper: 'FormItem', defaultValue: 60, componentProps: { min: 0, max: 150, style: { width: '100%' } }, rules: [{ validator: (v: unknown, _r: unknown, ctx: any) => { if (Number(v) <= (ctx.getFieldValue('minAge') as number)) return '须大于最小年龄'; return undefined }, trigger: 'blur' }] },
    budget: { type: 'number', label: '预算上限', required: true, component: 'InputNumber', wrapper: 'FormItem', defaultValue: 10000, componentProps: { min: 0, style: { width: '100%' } } },
    expense: { type: 'number', label: '实际支出', required: true, component: 'InputNumber', wrapper: 'FormItem', defaultValue: 0, componentProps: { min: 0, style: { width: '100%' } }, rules: [{ validator: (v: unknown, _r: unknown, ctx: any) => { if (Number(v) > (ctx.getFieldValue('budget') as number)) return `支出不能超过预算`; return undefined }, trigger: 'blur' }] },
  },
}))
</script>
