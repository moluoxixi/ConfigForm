<template>
  <div>
    <h2>
      Schema ????/h2>
      <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
        ?? reactions ???????? Schema ????????????Formily ??x-reactions ????
      </p>
      <StatusTabs ref="st" v-slot="{ mode, showResult }">
        <ConfigForm
          :schema="withMode(schema, mode)"
          :initial-values="initialValues"
          @submit="showResult"
          @submit-failed="(e: any) => st?.showErrors(e)"
        />
      </StatusTabs>
    </h2>
  </div>
</template>

<script setup lang="ts">
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/core'
import { setupElementPlus, StatusTabs } from '@moluoxixi/ui-element-plus'
import { ConfigForm } from '@moluoxixi/vue'
/**
 * ?? 53?Schema ????Ant Design Vue?? *
 * ?? ConfigForm ??????reactions ?????????? * ??????? reactions ???? Formily ???????????? * - watch + when + fulfill/otherwise ????
 * - value ?????????? * - state ?????????
 */
import { ref } from 'vue'

setupElementPlus()

const st = ref<InstanceType<typeof StatusTabs>>()

const initialValues = {
  orderType: 'normal',
  amount: 0,
  urgentFee: 0,
  totalAmount: 0,
  needInvoice: false,
  invoiceTitle: '',
  invoiceType: 'personal',
  taxNumber: '',
}

const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
  properties: {
    orderType: {
      type: 'string',
      title: '订单类型',
      enum: [
        { label: '普通订单', value: 'normal' },
        { label: '加急订单', value: 'urgent' },
        { label: 'VIP 订单', value: 'vip' },
      ],
    },

    amount: {
      type: 'number',
      title: '????',
      required: true,
      componentProps: { min: 0 },
    },

    /* ????orderType === 'urgent' ????????? */
    urgentFee: {
      type: 'number',
      title: '加急费用',
      componentProps: { min: 0 },
      reactions: [{
        watch: 'orderType',
        when: ([type]) => type === 'urgent',
        fulfill: {
          state: { visible: true },
          value: ({ values }) => Math.round((values.amount as number ?? 0) * 0.2),
        },
        otherwise: {
          state: { visible: false },
          value: () => 0,
        },
      }],
    },

    /* ????totalAmount = amount + urgentFee?????? */
    totalAmount: {
      type: 'number',
      title: '订单总额（自动计算）',
      componentProps: { disabled: true },
      reactions: [{
        watch: ['amount', 'urgentFee'],
        fulfill: {
          value: ({ values }) => (values.amount as number ?? 0) + (values.urgentFee as number ?? 0),
        },
      }],
    },

    /* ???????????????*/
    needInvoice: {
      type: 'boolean',
      title: '需要发票',
    },

    /* ????needInvoice === true ????*/
    invoiceTitle: {
      type: 'string',
      title: '????',
      visible: false,
      reactions: [{
        watch: 'needInvoice',
        when: ([v]) => v === true,
        fulfill: { state: { visible: true, required: true } },
        otherwise: { state: { visible: false, required: false } },
      }],
    },

    invoiceType: {
      type: 'string',
      title: '????',
      visible: false,
      component: 'RadioGroup',
      enum: [
        { label: '??', value: 'personal' },
        { label: '??', value: 'company' },
      ],
      reactions: [{
        watch: 'needInvoice',
        when: ([v]) => v === true,
        fulfill: { state: { visible: true } },
        otherwise: { state: { visible: false } },
      }],
    },

    /* ????invoiceType === 'company' ??needInvoice ??????*/
    taxNumber: {
      type: 'string',
      title: '??',
      visible: false,
      reactions: [{
        watch: ['needInvoice', 'invoiceType'],
        when: ([invoice, type]) => invoice === true && type === 'company',
        fulfill: { state: { visible: true, required: true }, componentProps: { placeholder: '请输入税号' } },
        otherwise: { state: { visible: false, required: false } },
      }],
    },
  },
}

/** ? mode ?? schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}
</script>
