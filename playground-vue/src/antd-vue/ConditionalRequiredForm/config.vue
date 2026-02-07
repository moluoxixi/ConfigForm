<template>
  <div>
    <h2>条件必填</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">开关控制必填 / 金额阈值 / 选择「其他」必填 / 多条件组合</p>
    <PlaygroundForm :schema="schema" :initial-values="initialValues" />
  </div>
</template>

<script setup lang="ts">
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import type { ISchema } from '@moluoxixi/schema'
import PlaygroundForm from '../../components/PlaygroundForm.vue'

setupAntdVue()

const initialValues = { needInvoice: false, invoiceTitle: '', invoiceTaxNo: '', amount: 0, approver: '', leaveType: 'annual', leaveReason: '', isOverseas: false, travelDays: 1, travelInsurance: '' }

const THRESHOLD = 10000

const schema: ISchema = {
  type: 'object',
  decoratorProps: { actions: { submit: true, reset: true }, labelPosition: 'right', labelWidth: '160px' },
  properties: {
    needInvoice: { type: 'boolean', title: '需要发票', default: false, description: '开启后抬头和税号必填' },
    invoiceTitle: { type: 'string', title: '发票抬头', reactions: [{ watch: 'needInvoice', when: (v: unknown[]) => v[0] === true, fulfill: { state: { required: true } }, otherwise: { state: { required: false } } }] },
    invoiceTaxNo: { type: 'string', title: '纳税人识别号', reactions: [{ watch: 'needInvoice', when: (v: unknown[]) => v[0] === true, fulfill: { state: { required: true } }, otherwise: { state: { required: false } } }] },
    amount: { type: 'number', title: '报销金额', required: true, default: 0, componentProps: { min: 0, step: 100, style: { width: '100%' } }, description: `超 ${THRESHOLD.toLocaleString()} 需填审批人` },
    approver: { type: 'string', title: '审批人', reactions: [{ watch: 'amount', fulfill: { run: (f: any, ctx: any) => { const a = (ctx.values.amount as number) ?? 0; f.required = a > THRESHOLD; f.setComponentProps({ placeholder: a > THRESHOLD ? '必须填写审批人' : '选填' }) } } }] },
    leaveType: { type: 'string', title: '请假类型', required: true, default: 'annual', enum: [{ label: '年假', value: 'annual' }, { label: '事假', value: 'personal' }, { label: '其他', value: 'other' }] },
    leaveReason: { type: 'string', title: '请假原因', component: 'Textarea', placeholder: '选择其他时必填', reactions: [{ watch: 'leaveType', when: (v: unknown[]) => v[0] === 'other', fulfill: { state: { required: true } }, otherwise: { state: { required: false } } }] },
    isOverseas: { type: 'boolean', title: '海外出差', default: false },
    travelDays: { type: 'number', title: '出差天数', default: 1, componentProps: { min: 1, style: { width: '100%' } } },
    travelInsurance: { type: 'string', title: '保险单号', description: '海外且>3天必填', reactions: [{ watch: ['isOverseas', 'travelDays'], fulfill: { run: (f: any, ctx: any) => { f.required = (ctx.values.isOverseas as boolean) && ((ctx.values.travelDays as number) ?? 0) > 3 } } }] },
  },
}
</script>
