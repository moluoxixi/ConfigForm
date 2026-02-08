/**
 * Schema 表达式 — Field 模式
 *
 * 使用 FormProvider + FormField + createForm effects 实现字段联动。
 * 通过 onFieldValueChange 监听字段变化，实现条件显隐和自动计算。
 */
import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { createForm } from '@moluoxixi/core';
import type { FieldPattern } from '@moluoxixi/core';
import { FormField, FormProvider } from '@moluoxixi/react';
import { LayoutFormActions, setupAntd, StatusTabs } from '@moluoxixi/ui-antd';

setupAntd();

/**
 * Schema 表达式（Field 版）
 *
 * 使用 createForm effects + 条件渲染实现字段联动、条件显隐和自动计算。
 */
export const SchemaExpressionForm = observer((): React.ReactElement => {
  /** 响应式标记（用于条件渲染） */
  const [isUrgent, setIsUrgent] = useState(false);
  const [needInvoice, setNeedInvoice] = useState(false);
  const [isCompanyInvoice, setIsCompanyInvoice] = useState(false);

  /** 表单实例（仅初始化一次） */
  const [form] = useState(() => createForm({
    initialValues: {
      orderType: 'normal',
      amount: 0,
      urgentFee: 0,
      totalAmount: 0,
      needInvoice: false,
      invoiceTitle: '',
      invoiceType: 'personal',
      taxNumber: '',
    },
    effects: (f) => {
      /* 订单类型 → 加急费用显隐 + 自动计算 */
      f.onFieldValueChange('orderType', (val) => {
        setIsUrgent(val === 'urgent');
        if (val !== 'urgent') {
          f.setFieldValue('urgentFee', 0);
        } else {
          f.setFieldValue('urgentFee', Math.round((f.getFieldValue('amount') as number ?? 0) * 0.2));
        }
      });

      /* 金额变化 → 重算总额 */
      f.onFieldValueChange('amount', (val) => {
        const urgentFee = f.getFieldValue('urgentFee') as number ?? 0;
        f.setFieldValue('totalAmount', (val as number ?? 0) + urgentFee);
      });

      /* 加急费变化 → 重算总额 */
      f.onFieldValueChange('urgentFee', (val) => {
        const amount = f.getFieldValue('amount') as number ?? 0;
        f.setFieldValue('totalAmount', amount + (val as number ?? 0));
      });

      /* 是否需要发票 */
      f.onFieldValueChange('needInvoice', (val) => {
        setNeedInvoice(val === true);
      });

      /* 发票类型 */
      f.onFieldValueChange('invoiceType', (val) => {
        setIsCompanyInvoice(val === 'company');
      });
    },
  }));

  return (
    <div>
      <h2>Schema 表达式</h2>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>
        字段联动 / 条件显隐 / 自动计算 — FormField + watch 实现
      </p>
      <StatusTabs>
        {({ mode, showResult, showErrors }) => {
          form.pattern = mode as FieldPattern;
          return (
            <FormProvider form={form}>
              <FormField name="orderType" fieldProps={{ label: '订单类型', component: 'Select', dataSource: [{ label: '普通订单', value: 'normal' }, { label: '加急订单', value: 'urgent' }, { label: 'VIP 订单', value: 'vip' }] }} />
              <FormField name="amount" fieldProps={{ label: '订单金额', required: true, component: 'InputNumber', componentProps: { min: 0, style: { width: '100%' } } }} />
              {/* 加急费用：仅加急订单显示 */}
              {isUrgent && (
                <FormField name="urgentFee" fieldProps={{ label: '加急费用', component: 'InputNumber', componentProps: { min: 0, style: { width: '100%' } } }} />
              )}
              {/* 总额：自动计算 */}
              <FormField name="totalAmount" fieldProps={{ label: '订单总额（自动计算）', component: 'InputNumber', disabled: true, componentProps: { style: { width: '100%' } } }} />
              <FormField name="needInvoice" fieldProps={{ label: '需要发票', component: 'Switch' }} />
              {/* 发票信息：仅需要发票时显示 */}
              {needInvoice && (
                <>
                  <FormField name="invoiceTitle" fieldProps={{ label: '发票抬头', required: true, component: 'Input' }} />
                  <FormField name="invoiceType" fieldProps={{ label: '发票类型', component: 'RadioGroup', dataSource: [{ label: '个人', value: 'personal' }, { label: '企业', value: 'company' }] }} />
                  {isCompanyInvoice && (
                    <FormField name="taxNumber" fieldProps={{ label: '税号', required: true, component: 'Input', componentProps: { placeholder: '请输入税号' } }} />
                  )}
                </>
              )}
              <LayoutFormActions onSubmit={showResult} onSubmitFailed={showErrors} />
            </FormProvider>
          );
        }}
      </StatusTabs>
    </div>
  );
});
