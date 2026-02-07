/**
 * 场景 10：条件必填
 *
 * 覆盖：
 * - 单条件必填：开关控制某字段必填
 * - 多条件必填：多个字段组合决定必填
 * - 值范围条件：数值超过阈值时某字段变必填
 * - 选项联动必填：选择「其他」时备注变必填
 * - 三种模式切换
 */
import React from 'react';
import { observer } from 'mobx-react-lite';
import { setupAntd } from '@moluoxixi/ui-antd';
import { Typography } from 'antd';
import type { ISchema } from '@moluoxixi/schema';
import { PlaygroundForm } from '../../components/PlaygroundForm';

const { Title, Paragraph } = Typography;

setupAntd();

/** 金额阈值：超过此值需要填写审批人 */
const AMOUNT_THRESHOLD = 10000;

/** 默认初始值 */
const INITIAL_VALUES: Record<string, unknown> = {
  needInvoice: false,
  invoiceTitle: '',
  invoiceTaxNo: '',
  amount: 0,
  approver: '',
  leaveType: 'annual',
  leaveReason: '',
  isOverseas: false,
  travelDays: 1,
  travelInsurance: '',
};

/** 表单 Schema */
const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '160px' },
  properties: {
    /* ---- 场景 A：开关控制必填 ---- */
    needInvoice: {
      type: 'boolean',
      title: '需要发票',
      default: false,
      description: '开启后「发票抬头」和「税号」变为必填',
    },
    invoiceTitle: {
      type: 'string',
      title: '发票抬头',
      placeholder: '请输入发票抬头',
      reactions: [
        {
          watch: 'needInvoice',
          when: (v) => v[0] === true,
          fulfill: { state: { required: true } },
          otherwise: { state: { required: false } },
        },
      ],
    },
    invoiceTaxNo: {
      type: 'string',
      title: '纳税人识别号',
      placeholder: '请输入税号',
      reactions: [
        {
          watch: 'needInvoice',
          when: (v) => v[0] === true,
          fulfill: { state: { required: true } },
          otherwise: { state: { required: false } },
        },
      ],
    },

    /* ---- 场景 B：金额超阈值 → 审批人必填 ---- */
    amount: {
      type: 'number',
      title: '报销金额',
      required: true,
      default: 0,
      componentProps: { min: 0, step: 100, style: { width: '100%' } },
      description: `超过 ${AMOUNT_THRESHOLD.toLocaleString()} 元需要填写审批人`,
    },
    approver: {
      type: 'string',
      title: '审批人',
      placeholder: '金额较小时选填',
      reactions: [
        {
          watch: 'amount',
          fulfill: {
            run: (field, ctx) => {
              const amt = (ctx.values.amount as number) ?? 0;
              field.required = amt > AMOUNT_THRESHOLD;
              field.setComponentProps({
                placeholder: amt > AMOUNT_THRESHOLD
                  ? `金额超过 ${AMOUNT_THRESHOLD.toLocaleString()} 元，必须填写审批人`
                  : '金额较小时选填',
              });
            },
          },
        },
      ],
    },

    /* ---- 场景 C：选择「其他」→ 备注必填 ---- */
    leaveType: {
      type: 'string',
      title: '请假类型',
      required: true,
      default: 'annual',
      enum: [
        { label: '年假', value: 'annual' },
        { label: '事假', value: 'personal' },
        { label: '病假', value: 'sick' },
        { label: '其他', value: 'other' },
      ],
    },
    leaveReason: {
      type: 'string',
      title: '请假原因',
      component: 'Textarea',
      placeholder: '选择「其他」时必填',
      reactions: [
        {
          watch: 'leaveType',
          when: (v) => v[0] === 'other',
          fulfill: { state: { required: true } },
          otherwise: { state: { required: false } },
        },
      ],
    },

    /* ---- 场景 D：多条件组合必填 ---- */
    isOverseas: {
      type: 'boolean',
      title: '海外出差',
      default: false,
    },
    travelDays: {
      type: 'number',
      title: '出差天数',
      default: 1,
      componentProps: { min: 1, style: { width: '100%' } },
    },
    travelInsurance: {
      type: 'string',
      title: '保险单号',
      placeholder: '海外出差且超过 3 天必填',
      description: '当「海外出差」开启且「出差天数 > 3」时必填',
      reactions: [
        {
          watch: ['isOverseas', 'travelDays'],
          fulfill: {
            run: (field, ctx) => {
              const overseas = ctx.values.isOverseas as boolean;
              const days = (ctx.values.travelDays as number) ?? 0;
              const isRequired = overseas && days > 3;
              field.required = isRequired;
              field.setComponentProps({
                placeholder: isRequired
                  ? '海外出差超过 3 天，必须填写保险单号'
                  : '海外出差且超过 3 天时必填',
              });
            },
          },
        },
      ],
    },
  },
};

/**
 * 条件必填示例
 */
export const ConditionalRequiredForm = observer((): React.ReactElement => {
  return (
    <div>
      <Title level={3}>条件必填</Title>
      <Paragraph type="secondary">
        开关控制必填 / 金额阈值必填 / 选择「其他」必填 / 多条件组合必填
      </Paragraph>
      <PlaygroundForm schema={schema} initialValues={INITIAL_VALUES} />
    </div>
  );
});
