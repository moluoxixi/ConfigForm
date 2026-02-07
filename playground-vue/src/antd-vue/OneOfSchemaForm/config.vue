<template>
  <div>
    <h2>oneOf/anyOf ?? Schema</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      ?? ???Schema ???? JSON Schema ??oneOf ?????????????????    </p>
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
/**
 * ?? 54?oneOf/anyOf ?? Schema?Ant Design Vue?? *
 * ?? JSON Schema ??oneOf ???? * ?????????paymentType??????????? * ??????????properties ???? */
import { computed, ref } from 'vue'
import { setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { ConfigForm } from '@moluoxixi/vue'
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'

setupAntdVue()

const st = ref<InstanceType<typeof StatusTabs>>()

const paymentType = ref<'credit_card' | 'bank_transfer' | 'alipay'>('credit_card')
const initialValues = { paymentType: 'credit_card' }

/** ????????*/
const typeSchemas: Record<string, Record<string, ISchema>> = {
  credit_card: {
    cardNumber: { type: 'string', title: '??', required: true, rules: [{ pattern: '^\\d{16,19}$', message: '????16-19???? }] },
    cardHolder: { type: 'string', title: '????, required: true },
    expiryDate: { type: 'string', title: '????, required: true, componentProps: { placeholder: 'MM/YY' } },
    cvv: { type: 'string', title: 'CVV', required: true, component: 'Password', rules: [{ pattern: '^\\d{3,4}$', message: '3-4???? }] },
  },
  bank_transfer: {
    bankName: { type: 'string', title: '?????, required: true },
    accountNumber: { type: 'string', title: '????, required: true },
    accountName: { type: 'string', title: '??', required: true },
    swift: { type: 'string', title: 'SWIFT ??', componentProps: { placeholder: '???????? } },
  },
  alipay: {
    alipayAccount: { type: 'string', title: '??????, required: true, rules: [{ format: 'email', message: '?????????????? }] },
    alipayName: { type: 'string', title: '????', required: true },
  },
}

const currentSchema = computed<ISchema>(() => ({
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '??', reset: '??' } },
  properties: {
    paymentType: {
      type: 'string', title: '????', required: true,
      component: 'RadioGroup',
      enum: [
        { label: '????, value: 'credit_card' },
        { label: '????', value: 'bank_transfer' },
        { label: '????, value: 'alipay' },
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
