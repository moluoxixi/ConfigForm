import type { ISchema } from '@moluoxixi/schema';
import type { FieldPattern } from '@moluoxixi/core';
import { ConfigForm } from '@moluoxixi/react';
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd';
import { observer } from 'mobx-react-lite';
/**
 * 场景 54：oneOf/anyOf 条件 Schema（Ant Design 版）
 *
 * 基于 JSON Schema 的 oneOf 思路实现：
 * 根据支付方式（paymentType）动态切换不同的字段组合，
 * 不同支付方式展示不同的 properties 集合。
 */
import React, { useMemo, useState } from 'react';

setupAntd();

/** 支付方式类型 */
type PaymentType = 'credit_card' | 'bank_transfer' | 'alipay';

/** 各支付方式对应的字段 Schema */
const TYPE_SCHEMAS: Record<PaymentType, Record<string, ISchema>> = {
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
};

/** 将 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } };
}

/**
 * oneOf/anyOf 条件 Schema 示例
 *
 * 根据支付方式动态切换字段组合，展示不同支付所需的信息。
 */
export const OneOfSchemaForm = observer((): React.ReactElement => {
  const [paymentType, setPaymentType] = useState<PaymentType>('credit_card');

  /** 根据支付方式动态构建 schema */
  const currentSchema = useMemo<ISchema>(() => ({
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
            run: (field) => { setPaymentType(field.value as PaymentType); },
          },
        }],
      },
      /* 根据 paymentType 展开对应字段 */
      ...TYPE_SCHEMAS[paymentType],
      /* 公共字段 */
      amount: { type: 'number', title: '支付金额', required: true, componentProps: { min: 0.01 } },
      remark: { type: 'string', title: '备注', component: 'Textarea' },
    },
  }), [paymentType]);

  return (
    <div>
      <h2>oneOf/anyOf 条件 Schema</h2>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>
        基于条件 Schema 实现 JSON Schema 的 oneOf 思路，根据支付方式动态切换字段组合
      </p>
      <StatusTabs>
        {({ mode, showResult, showErrors }) => (
          <ConfigForm
            key={paymentType}
            schema={withMode(currentSchema, mode)}
            initialValues={{ paymentType }}
            onSubmit={showResult}
            onSubmitFailed={errors => showErrors(errors)}
          />
        )}
      </StatusTabs>
    </div>
  );
});
