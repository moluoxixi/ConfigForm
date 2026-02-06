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
import React, { useState, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { ConfigForm } from '@moluoxixi/react';
import { setupAntd } from '@moluoxixi/ui-antd';
import { Button, Space, Typography, Alert, Segmented, Divider } from 'antd';
import type { FormSchema } from '@moluoxixi/schema';
import type { FieldPattern } from '@moluoxixi/shared';

const { Title, Paragraph } = Typography;

setupAntd();

/** 模式选项 */
const MODE_OPTIONS = [
  { label: '编辑态', value: 'editable' },
  { label: '阅读态', value: 'readOnly' },
  { label: '禁用态', value: 'disabled' },
];

/** 金额阈值：超过此值需要填写审批人 */
const AMOUNT_THRESHOLD = 10000;

/**
 * 构建 Schema
 *
 * @param mode - 表单模式
 */
function buildSchema(mode: FieldPattern): FormSchema {
  return {
    form: { labelPosition: 'right', labelWidth: '160px', pattern: mode },
    fields: {
      /* ---- 场景 A：开关控制必填 ---- */
      needInvoice: {
        type: 'boolean',
        label: '需要发票',
        component: 'Switch',
        wrapper: 'FormItem',
        defaultValue: false,
        description: '开启后「发票抬头」和「税号」变为必填',
      },
      invoiceTitle: {
        type: 'string',
        label: '发票抬头',
        component: 'Input',
        wrapper: 'FormItem',
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
        label: '纳税人识别号',
        component: 'Input',
        wrapper: 'FormItem',
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
        label: '报销金额',
        required: true,
        component: 'InputNumber',
        wrapper: 'FormItem',
        defaultValue: 0,
        componentProps: { min: 0, step: 100, style: { width: '100%' } },
        description: `超过 ${AMOUNT_THRESHOLD.toLocaleString()} 元需要填写审批人`,
      },
      approver: {
        type: 'string',
        label: '审批人',
        component: 'Input',
        wrapper: 'FormItem',
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
        label: '请假类型',
        required: true,
        component: 'Select',
        wrapper: 'FormItem',
        defaultValue: 'annual',
        enum: [
          { label: '年假', value: 'annual' },
          { label: '事假', value: 'personal' },
          { label: '病假', value: 'sick' },
          { label: '其他', value: 'other' },
        ],
      },
      leaveReason: {
        type: 'string',
        label: '请假原因',
        component: 'Textarea',
        wrapper: 'FormItem',
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
        label: '海外出差',
        component: 'Switch',
        wrapper: 'FormItem',
        defaultValue: false,
      },
      travelDays: {
        type: 'number',
        label: '出差天数',
        component: 'InputNumber',
        wrapper: 'FormItem',
        defaultValue: 1,
        componentProps: { min: 1, style: { width: '100%' } },
      },
      travelInsurance: {
        type: 'string',
        label: '保险单号',
        component: 'Input',
        wrapper: 'FormItem',
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
}

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

/**
 * 条件必填示例
 */
export const ConditionalRequiredForm = observer((): React.ReactElement => {
  const [mode, setMode] = useState<FieldPattern>('editable');
  const [result, setResult] = useState('');
  const [savedValues, setSavedValues] = useState<Record<string, unknown>>({ ...INITIAL_VALUES });

  const schema = useMemo(() => buildSchema(mode), [mode]);

  return (
    <div>
      <Title level={3}>条件必填</Title>
      <Paragraph type="secondary">
        开关控制必填 / 金额阈值必填 / 选择「其他」必填 / 多条件组合必填
      </Paragraph>

      <Segmented
        value={mode}
        onChange={(val) => setMode(val as FieldPattern)}
        options={MODE_OPTIONS}
        style={{ marginBottom: 16 }}
      />

      <ConfigForm
        key={mode}
        schema={schema}
        initialValues={savedValues}
        onValuesChange={(values) => setSavedValues(values as Record<string, unknown>)}
        onSubmit={(values) => setResult(JSON.stringify(values, null, 2))}
        onSubmitFailed={(errors) =>
          setResult('验证失败:\n' + errors.map((e) => `[${e.path}] ${e.message}`).join('\n'))
        }
      >
        {mode === 'editable' && (
          <>
            <Divider />
            <Space>
              <Button type="primary" htmlType="submit">提交</Button>
              <Button htmlType="reset">重置</Button>
            </Space>
          </>
        )}
      </ConfigForm>

      {result && (
        <Alert
          style={{ marginTop: 16 }}
          type={result.startsWith('验证失败') ? 'error' : 'success'}
          message="提交结果"
          description={<pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{result}</pre>}
        />
      )}
    </div>
  );
});
