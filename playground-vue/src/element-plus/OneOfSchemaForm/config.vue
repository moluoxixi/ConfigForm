<template>
  <div>
    <h2>oneOf/anyOf ?? Schema</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      ?? ???Schema ???? JSON Schema ??oneOf ?????????????????
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <ConfigForm
        :key="paymentType"
        :schema="withMode(currentSchema, mode)"
        :initial-values="initialValues"
        @submit="showResult"
        @submit-failed="(e: any) => st?.showErrors(e)"
      />
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/core'
import { setupElementPlus, StatusTabs } from '@moluoxixi/ui-element-plus'
import { ConfigForm } from '@moluoxixi/vue'
/**
 * ?? 54?oneOf/anyOf ?? Schema?Ant Design Vue?? *
 * ?? JSON Schema ??oneOf ???? * ?????????paymentType??????????? * ??????????properties ????
 */
import { computed, ref } from 'vue'

setupElementPlus()

const st = ref<InstanceType<typeof StatusTabs>>()

const paymentType = ref<'credit_card' | 'bank_transfer' | 'alipay'>('credit_card')
const initialValues = { paymentType: 'credit_card' }

/** ????????*/
const typeSchemas: Record<string, Record<string, ISchema>> = {
  credit_card: {
    cardNumber: { type: 'string', title: '卡号', required: true, rules: [{ pattern: '^\\d{16,19}$', message: '请输入16-19位数字' }] },
    cardHolder: { type: 'string', title: '持卡人', required: true },
    expiryDate: { type: 'string', title: '有效期', required: true, componentProps: { placeholder: 'MM/YY' } },
    cvv: { type: 'string', title: 'CVV', required: true, component: 'Password', rules: [{ pattern: '^\\d{3,4}$', message: '3-4位数字' }] },
  },
  bank_transfer: {
    bankName: { type: 'string', title: '开户银行', required: true },
    accountNumber: { type: 'string', title: '账号', required: true },
    accountName: { type: 'string', title: '户名', required: true },
    swift: { type: 'string', title: 'SWIFT 代码', componentProps: { placeholder: '国际汇款时填写' } },
  },
  alipay: {
    alipayAccount: { type: 'string', title: '支付宝账号', required: true, rules: [{ format: 'email', message: '请输入邮箱或手机号' }] },
    alipayName: { type: 'string', title: '真实姓名', required: true },
  },
}

const currentSchema = computed<ISchema>(() => ({
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
  properties: {
    paymentType: {
      type: 'string',
      title: '支付方式',
      required: true,
      component: 'RadioGroup',
      enum: [
        { label: '信用卡', value: 'credit_card' },
        { label: '银行转账', value: 'bank_transfer' },
        { label: '支付宝', value: 'alipay' },
      ],
      reactions: [{
        watch: 'paymentType',
        fulfill: {
          run: (field) => { paymentType.value = field.value as typeof paymentType.value },
        },
      }],
    },
    /* ?? paymentType ????????? */
    ...typeSchemas[paymentType.value],
    /* ???? */
    amount: { type: 'number', title: '????', required: true, componentProps: { min: 0.01 } },
    remark: { type: 'string', title: '??', component: 'Textarea' },
  },
}))

/** ? mode ?? schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}
</script>
