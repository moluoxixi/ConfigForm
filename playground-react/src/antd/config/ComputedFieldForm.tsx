/**
 * 场景 9：计算字段
 *
 * 覆盖：
 * - 简单计算：总价 = 单价 × 数量
 * - 百分比计算：折后价 = 原价 × (1 - 折扣率)
 * - 聚合统计：合计 = 项目 A + 项目 B + 项目 C
 * - 条件计算：根据条件选择不同计算公式
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

/**
 * 构建 Schema
 *
 * @param mode - 表单模式
 */
function buildSchema(mode: FieldPattern): FormSchema {
  return {
    form: { labelPosition: 'right', labelWidth: '150px', pattern: mode },
    fields: {
      /* ---- 场景 A：总价 = 单价 × 数量 ---- */
      unitPrice: {
        type: 'number',
        label: '单价（元）',
        component: 'InputNumber',
        wrapper: 'FormItem',
        defaultValue: 100,
        componentProps: { min: 0, step: 0.01, style: { width: '100%' } },
      },
      quantity: {
        type: 'number',
        label: '数量',
        component: 'InputNumber',
        wrapper: 'FormItem',
        defaultValue: 1,
        componentProps: { min: 1, step: 1, style: { width: '100%' } },
      },
      totalPrice: {
        type: 'number',
        label: '总价（自动计算）',
        component: 'InputNumber',
        wrapper: 'FormItem',
        componentProps: { disabled: true, style: { width: '100%' } },
        description: '公式：单价 × 数量',
        reactions: [
          {
            watch: ['unitPrice', 'quantity'],
            fulfill: {
              run: (field, ctx) => {
                const price = (ctx.values.unitPrice as number) ?? 0;
                const qty = (ctx.values.quantity as number) ?? 0;
                field.setValue(Math.round(price * qty * 100) / 100);
              },
            },
          },
        ],
      },

      /* ---- 场景 B：折后价 ---- */
      originalPrice: {
        type: 'number',
        label: '原价（元）',
        component: 'InputNumber',
        wrapper: 'FormItem',
        defaultValue: 500,
        componentProps: { min: 0, step: 1, style: { width: '100%' } },
      },
      discountRate: {
        type: 'number',
        label: '折扣率（%）',
        component: 'InputNumber',
        wrapper: 'FormItem',
        defaultValue: 10,
        componentProps: { min: 0, max: 100, step: 1, style: { width: '100%' } },
      },
      discountedPrice: {
        type: 'number',
        label: '折后价（自动计算）',
        component: 'InputNumber',
        wrapper: 'FormItem',
        componentProps: { disabled: true, style: { width: '100%' } },
        description: '公式：原价 × (1 - 折扣率 / 100)',
        reactions: [
          {
            watch: ['originalPrice', 'discountRate'],
            fulfill: {
              run: (field, ctx) => {
                const price = (ctx.values.originalPrice as number) ?? 0;
                const rate = (ctx.values.discountRate as number) ?? 0;
                field.setValue(Math.round(price * (1 - rate / 100) * 100) / 100);
              },
            },
          },
        ],
      },

      /* ---- 场景 C：聚合统计 ---- */
      scoreA: {
        type: 'number',
        label: '科目 A 分数',
        component: 'InputNumber',
        wrapper: 'FormItem',
        defaultValue: 85,
        componentProps: { min: 0, max: 100, style: { width: '100%' } },
      },
      scoreB: {
        type: 'number',
        label: '科目 B 分数',
        component: 'InputNumber',
        wrapper: 'FormItem',
        defaultValue: 90,
        componentProps: { min: 0, max: 100, style: { width: '100%' } },
      },
      scoreC: {
        type: 'number',
        label: '科目 C 分数',
        component: 'InputNumber',
        wrapper: 'FormItem',
        defaultValue: 78,
        componentProps: { min: 0, max: 100, style: { width: '100%' } },
      },
      totalScore: {
        type: 'number',
        label: '总分（自动计算）',
        component: 'InputNumber',
        wrapper: 'FormItem',
        componentProps: { disabled: true, style: { width: '100%' } },
        description: '公式：A + B + C',
        reactions: [
          {
            watch: ['scoreA', 'scoreB', 'scoreC'],
            fulfill: {
              run: (field, ctx) => {
                const a = (ctx.values.scoreA as number) ?? 0;
                const b = (ctx.values.scoreB as number) ?? 0;
                const c = (ctx.values.scoreC as number) ?? 0;
                field.setValue(a + b + c);
              },
            },
          },
        ],
      },
      avgScore: {
        type: 'number',
        label: '平均分（自动计算）',
        component: 'InputNumber',
        wrapper: 'FormItem',
        componentProps: { disabled: true, style: { width: '100%' } },
        description: '公式：(A + B + C) / 3',
        reactions: [
          {
            watch: ['scoreA', 'scoreB', 'scoreC'],
            fulfill: {
              run: (field, ctx) => {
                const a = (ctx.values.scoreA as number) ?? 0;
                const b = (ctx.values.scoreB as number) ?? 0;
                const c = (ctx.values.scoreC as number) ?? 0;
                field.setValue(Math.round((a + b + c) / 3 * 100) / 100);
              },
            },
          },
        ],
      },

      /* ---- 场景 D：条件计算 ---- */
      calcType: {
        type: 'string',
        label: '计税方式',
        component: 'RadioGroup',
        wrapper: 'FormItem',
        defaultValue: 'inclusive',
        enum: [
          { label: '含税（税率 13%）', value: 'inclusive' },
          { label: '不含税', value: 'exclusive' },
        ],
      },
      amount: {
        type: 'number',
        label: '金额',
        component: 'InputNumber',
        wrapper: 'FormItem',
        defaultValue: 1000,
        componentProps: { min: 0, style: { width: '100%' } },
      },
      taxAmount: {
        type: 'number',
        label: '税额（自动计算）',
        component: 'InputNumber',
        wrapper: 'FormItem',
        componentProps: { disabled: true, style: { width: '100%' } },
        description: '含税：金额 / 1.13 × 0.13 | 不含税：金额 × 0.13',
        reactions: [
          {
            watch: ['calcType', 'amount'],
            fulfill: {
              run: (field, ctx) => {
                const type = ctx.values.calcType as string;
                const amt = (ctx.values.amount as number) ?? 0;
                const TAX_RATE = 0.13;
                if (type === 'inclusive') {
                  /* 含税价反算税额 */
                  field.setValue(Math.round(amt / (1 + TAX_RATE) * TAX_RATE * 100) / 100);
                } else {
                  /* 不含税直接算 */
                  field.setValue(Math.round(amt * TAX_RATE * 100) / 100);
                }
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
  unitPrice: 100,
  quantity: 1,
  totalPrice: 100,
  originalPrice: 500,
  discountRate: 10,
  discountedPrice: 450,
  scoreA: 85,
  scoreB: 90,
  scoreC: 78,
  totalScore: 253,
  avgScore: 84.33,
  calcType: 'inclusive',
  amount: 1000,
  taxAmount: 115.04,
};

/**
 * 计算字段示例
 */
export const ComputedFieldForm = observer((): React.ReactElement => {
  const [mode, setMode] = useState<FieldPattern>('editable');
  const [result, setResult] = useState('');
  const [savedValues, setSavedValues] = useState<Record<string, unknown>>({ ...INITIAL_VALUES });

  const schema = useMemo(() => buildSchema(mode), [mode]);

  return (
    <div>
      <Title level={3}>计算字段</Title>
      <Paragraph type="secondary">
        乘法（单价×数量） / 百分比（折后价） / 聚合（总分+平均分） / 条件计算（含税/不含税）
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
