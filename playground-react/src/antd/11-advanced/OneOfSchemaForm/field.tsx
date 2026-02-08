/**
 * oneOf/anyOf 条件 Schema — Field 模式
 *
 * 使用 FormProvider + FormField + 条件渲染实现。
 * 根据 paymentType 的值动态切换不同支付方式的字段组合。
 */
import React, { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/react';
import { LayoutFormActions, setupAntd, StatusTabs } from '@moluoxixi/ui-antd';

setupAntd();

/**
 * oneOf/anyOf 条件 Schema（Field 版）
 *
 * 根据 paymentType 的值，使用条件渲染显示不同支付方式的字段。
 */
export const OneOfSchemaForm = observer((): React.ReactElement => {
  const form = useCreateForm({
    initialValues: { paymentType: 'credit_card', amount: 0, remark: '' },
  });

  /** 当前支付方式 */
  const paymentType = useMemo(
    () => (form.getFieldValue('paymentType') as string) ?? 'credit_card',
    [form.values],
  );

  /** 监听支付方式变化（触发 React 重新计算 useMemo） */
  form.onValuesChange(() => {
    /* 触发 React 重新渲染以更新 paymentType */
  });

  return (
    <div>
      <h2>oneOf/anyOf 条件 Schema</h2>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>
        根据支付方式切换字段组合 — FormField + 条件渲染实现
      </p>
      <StatusTabs>
        {({ mode, showResult, showErrors }) => {
          form.pattern = mode;
          return (
            <FormProvider form={form}>
              <FormField name="paymentType" fieldProps={{ label: '支付方式', required: true, component: 'RadioGroup', dataSource: [{ label: '信用卡', value: 'credit_card' }, { label: '银行转账', value: 'bank_transfer' }, { label: '支付宝', value: 'alipay' }] }} />
              {/* 信用卡字段 */}
              {paymentType === 'credit_card' && (
                <>
                  <FormField name="cardNumber" fieldProps={{ label: '卡号', required: true, component: 'Input', rules: [{ pattern: '^\\d{16,19}$', message: '请输入16-19位数字' }] }} />
                  <FormField name="cardHolder" fieldProps={{ label: '持卡人', required: true, component: 'Input' }} />
                  <FormField name="expiryDate" fieldProps={{ label: '有效期', required: true, component: 'Input', componentProps: { placeholder: 'MM/YY' } }} />
                  <FormField name="cvv" fieldProps={{ label: 'CVV', required: true, component: 'Password', rules: [{ pattern: '^\\d{3,4}$', message: '3-4位数字' }] }} />
                </>
              )}
              {/* 银行转账字段 */}
              {paymentType === 'bank_transfer' && (
                <>
                  <FormField name="bankName" fieldProps={{ label: '开户银行', required: true, component: 'Input' }} />
                  <FormField name="accountNumber" fieldProps={{ label: '账号', required: true, component: 'Input' }} />
                  <FormField name="accountName" fieldProps={{ label: '户名', required: true, component: 'Input' }} />
                  <FormField name="swift" fieldProps={{ label: 'SWIFT 代码', component: 'Input', componentProps: { placeholder: '国际汇款时填写' } }} />
                </>
              )}
              {/* 支付宝字段 */}
              {paymentType === 'alipay' && (
                <>
                  <FormField name="alipayAccount" fieldProps={{ label: '支付宝账号', required: true, component: 'Input', rules: [{ format: 'email', message: '请输入邮箱或手机号' }] }} />
                  <FormField name="alipayName" fieldProps={{ label: '真实姓名', required: true, component: 'Input' }} />
                </>
              )}
              {/* 公共字段 */}
              <FormField name="amount" fieldProps={{ label: '支付金额', required: true, component: 'InputNumber', componentProps: { min: 0.01, style: { width: '100%' } } }} />
              <FormField name="remark" fieldProps={{ label: '备注', component: 'Textarea' }} />
              <LayoutFormActions onSubmit={showResult} onSubmitFailed={showErrors} />
            </FormProvider>
          );
        }}
      </StatusTabs>
    </div>
  );
});
