import type { ISchema } from '@moluoxixi/schema';
import type { FieldPattern } from '@moluoxixi/core';
import { ConfigForm } from '@moluoxixi/react';
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd';
import { observer } from 'mobx-react-lite';
/**
 * 场景 53：Schema 表达式（Ant Design 版）
 *
 * 使用 ConfigForm 的 Schema 级 reactions 实现字段联动
 * 参考了 Formily 的 x-reactions 模式：
 * - watch + when + fulfill/otherwise 条件联动
 * - value 函数设置计算值
 * - state 函数设置字段状态
 */
import React from 'react';

setupAntd();

/** 默认初始值 */
const INITIAL_VALUES: Record<string, unknown> = {
  orderType: 'normal',
  amount: 0,
  urgentFee: 0,
  totalAmount: 0,
  needInvoice: false,
  invoiceTitle: '',
  invoiceType: 'personal',
  taxNumber: '',
};

/** 表单 Schema */
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
      title: '订单金额',
      required: true,
      componentProps: { min: 0 },
    },

    /* 条件显隐：orderType === 'urgent' 时显示加急费用 */
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

    /* 自动计算：totalAmount = amount + urgentFee（仅加急时） */
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

    /* 是否需要发票 */
    needInvoice: {
      type: 'boolean',
      title: '需要发票',
    },

    /* 条件显隐：needInvoice === true 时显示 */
    invoiceTitle: {
      type: 'string',
      title: '发票抬头',
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
      title: '发票类型',
      visible: false,
      component: 'RadioGroup',
      enum: [
        { label: '个人', value: 'personal' },
        { label: '企业', value: 'company' },
      ],
      reactions: [{
        watch: 'needInvoice',
        when: ([v]) => v === true,
        fulfill: { state: { visible: true } },
        otherwise: { state: { visible: false } },
      }],
    },

    /* 多条件：invoiceType === 'company' 且 needInvoice 时显示税号 */
    taxNumber: {
      type: 'string',
      title: '税号',
      visible: false,
      reactions: [{
        watch: ['needInvoice', 'invoiceType'],
        when: ([invoice, type]) => invoice === true && type === 'company',
        fulfill: { state: { visible: true, required: true }, componentProps: { placeholder: '请输入税号' } },
        otherwise: { state: { visible: false, required: false } },
      }],
    },
  },
};

/** 将 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } };
}

/**
 * Schema 表达式示例
 *
 * 使用 reactions 实现字段联动、条件显隐和自动计算。
 */
export const SchemaExpressionForm = observer((): React.ReactElement => (
  <div>
    <h2>Schema 表达式</h2>
    <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>
      使用 reactions 实现字段联动 Schema 表达式，类似 Formily 的 x-reactions 模式
    </p>
    <StatusTabs>
      {({ mode, showResult, showErrors }) => (
        <ConfigForm
          schema={withMode(schema, mode)}
          initialValues={INITIAL_VALUES}
          onSubmit={showResult}
          onSubmitFailed={errors => showErrors(errors)}
        />
      )}
    </StatusTabs>
  </div>
));
