<template>
  <div>
    <h2>条件必填</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      开关控制必填 / 金额阈值 / 选择「其他」必填 / 多条件组合
    </p>
    <el-radio-group v-model="mode" size="small" style="margin-bottom: 16px">
      <el-radio-button v-for="opt in MODE_OPTIONS" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </el-radio-button>
    </el-radio-group>
    <ConfigForm :key="mode" :schema="schema" :initial-values="savedValues" @values-change="(v: Record<string, unknown>) => savedValues = v" @submit="(v: Record<string, unknown>) => result = JSON.stringify(v, null, 2)" @submit-failed="(e: any[]) => result = `验证失败:\n${e.map((x: any) => `[${x.path}] ${x.message}`).join('\n')}`">
      <template #default="{ form }">
        <el-divider /><el-space v-if="mode === 'editable'">
          <el-button type="primary" native-type="submit">
            提交
          </el-button><el-button @click="form.reset()">
            重置
          </el-button>
        </el-space>
      </template>
    </ConfigForm>
    <el-alert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" :title="result.startsWith('验证失败') ? '验证失败' : '提交成功'" :description="result" show-icon style="margin-top: 16px" />
  </div>
</template>

<script setup lang="ts">
import type { FormSchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import { ConfigForm } from '@moluoxixi/vue'
import { computed, ref } from 'vue'

setupElementPlus()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const savedValues = ref<Record<string, unknown>>({ needInvoice: false, invoiceTitle: '', invoiceTaxNo: '', amount: 0, approver: '', leaveType: 'annual', leaveReason: '', isOverseas: false, travelDays: 1, travelInsurance: '' })

const THRESHOLD = 10000

const schema = computed<FormSchema>(() => ({
  form: { labelPosition: 'right', labelWidth: '160px', pattern: mode.value },
  fields: {
    needInvoice: { type: 'boolean', label: '需要发票', component: 'Switch', wrapper: 'FormItem', defaultValue: false, description: '开启后抬头和税号必填' },
    invoiceTitle: { type: 'string', label: '发票抬头', component: 'Input', wrapper: 'FormItem', reactions: [{ watch: 'needInvoice', when: (v: unknown[]) => v[0] === true, fulfill: { state: { required: true } }, otherwise: { state: { required: false } } }] },
    invoiceTaxNo: { type: 'string', label: '纳税人识别号', component: 'Input', wrapper: 'FormItem', reactions: [{ watch: 'needInvoice', when: (v: unknown[]) => v[0] === true, fulfill: { state: { required: true } }, otherwise: { state: { required: false } } }] },
    amount: { type: 'number', label: '报销金额', required: true, component: 'InputNumber', wrapper: 'FormItem', defaultValue: 0, componentProps: { min: 0, step: 100, style: { width: '100%' } }, description: `超 ${THRESHOLD.toLocaleString()} 需填审批人` },
    approver: { type: 'string', label: '审批人', component: 'Input', wrapper: 'FormItem', reactions: [{ watch: 'amount', fulfill: { run: (f: any, ctx: any) => {
      const a = (ctx.values.amount as number) ?? 0
      f.required = a > THRESHOLD
      f.setComponentProps({ placeholder: a > THRESHOLD ? '必须填写审批人' : '选填' })
    } } }] },
    leaveType: { type: 'string', label: '请假类型', required: true, component: 'Select', wrapper: 'FormItem', defaultValue: 'annual', enum: [{ label: '年假', value: 'annual' }, { label: '事假', value: 'personal' }, { label: '其他', value: 'other' }] },
    leaveReason: { type: 'string', label: '请假原因', component: 'Textarea', wrapper: 'FormItem', placeholder: '选择其他时必填', reactions: [{ watch: 'leaveType', when: (v: unknown[]) => v[0] === 'other', fulfill: { state: { required: true } }, otherwise: { state: { required: false } } }] },
    isOverseas: { type: 'boolean', label: '海外出差', component: 'Switch', wrapper: 'FormItem', defaultValue: false },
    travelDays: { type: 'number', label: '出差天数', component: 'InputNumber', wrapper: 'FormItem', defaultValue: 1, componentProps: { min: 1, style: { width: '100%' } } },
    travelInsurance: { type: 'string', label: '保险单号', component: 'Input', wrapper: 'FormItem', description: '海外且>3天必填', reactions: [{ watch: ['isOverseas', 'travelDays'], fulfill: { run: (f: any, ctx: any) => { f.required = (ctx.values.isOverseas as boolean) && ((ctx.values.travelDays as number) ?? 0) > 3 } } }] },
  },
}))
</script>
