/**
 * 场景 4：默认值
 *
 * 覆盖：
 * - 静态默认值（defaultValue 直接赋值）
 * - 动态计算默认值（通过 reactions 动态计算初始值）
 * - initialValues 外部注入
 * - 重置恢复默认值
 * - 三种模式切换
 */
import React, { useState, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { ConfigForm } from '@moluoxixi/react';
import { setupAntd } from '@moluoxixi/ui-antd';
import { Button, Space, Typography, Alert, Segmented, Divider } from 'antd';
import type { FormSchema } from '@moluoxixi/schema';
import type { FieldPattern } from '@moluoxixi/shared';

const { Title, Paragraph, Text } = Typography;

setupAntd();

/** 模式选项 */
const MODE_OPTIONS = [
  { label: '编辑态', value: 'editable' },
  { label: '阅读态', value: 'readOnly' },
  { label: '禁用态', value: 'disabled' },
];

/** 生成今天的日期字符串 */
function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

/** 生成默认订单编号 */
function generateOrderNo(): string {
  const now = new Date();
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `ORD-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

/**
 * 构建 Schema
 *
 * @param mode - 表单模式
 */
function buildSchema(mode: FieldPattern): FormSchema {
  return {
    form: {
      labelPosition: 'right',
      labelWidth: '140px',
      pattern: mode,
    },
    fields: {
      /* ---- 静态默认值 ---- */
      country: {
        type: 'string',
        label: '国家',
        component: 'Select',
        wrapper: 'FormItem',
        defaultValue: 'china',
        description: '静态默认值：中国',
        enum: [
          { label: '中国', value: 'china' },
          { label: '美国', value: 'usa' },
          { label: '日本', value: 'japan' },
          { label: '韩国', value: 'korea' },
        ],
      },

      status: {
        type: 'string',
        label: '状态',
        component: 'RadioGroup',
        wrapper: 'FormItem',
        defaultValue: 'draft',
        description: '静态默认值：草稿',
        enum: [
          { label: '草稿', value: 'draft' },
          { label: '发布', value: 'published' },
          { label: '归档', value: 'archived' },
        ],
      },

      enableNotify: {
        type: 'boolean',
        label: '开启通知',
        component: 'Switch',
        wrapper: 'FormItem',
        defaultValue: true,
        description: '静态默认值：开启',
      },

      quantity: {
        type: 'number',
        label: '默认数量',
        component: 'InputNumber',
        wrapper: 'FormItem',
        defaultValue: 1,
        description: '静态默认值：1',
        componentProps: { min: 1 },
      },

      /* ---- 动态计算默认值 ---- */
      unitPrice: {
        type: 'number',
        label: '单价',
        component: 'InputNumber',
        wrapper: 'FormItem',
        defaultValue: 99.9,
        componentProps: { min: 0, step: 0.1 },
      },

      totalPrice: {
        type: 'number',
        label: '总价（自动计算）',
        component: 'InputNumber',
        wrapper: 'FormItem',
        componentProps: { disabled: true },
        description: '动态默认值：数量 × 单价',
        reactions: [
          {
            watch: ['quantity', 'unitPrice'],
            fulfill: {
              run: (field, ctx) => {
                const qty = (ctx.values.quantity as number) ?? 0;
                const price = (ctx.values.unitPrice as number) ?? 0;
                field.setValue(Math.round(qty * price * 100) / 100);
              },
            },
          },
        ],
      },

      /* ---- 级别联动的默认值 ---- */
      level: {
        type: 'string',
        label: '会员等级',
        component: 'Select',
        wrapper: 'FormItem',
        defaultValue: 'silver',
        enum: [
          { label: '银牌', value: 'silver' },
          { label: '金牌', value: 'gold' },
          { label: '钻石', value: 'diamond' },
        ],
      },
      discountRate: {
        type: 'number',
        label: '折扣率（%）',
        component: 'InputNumber',
        wrapper: 'FormItem',
        componentProps: { disabled: true },
        description: '根据会员等级动态设置默认值',
        reactions: [
          {
            watch: 'level',
            fulfill: {
              run: (field, ctx) => {
                const levelMap: Record<string, number> = {
                  silver: 5,
                  gold: 10,
                  diamond: 20,
                };
                const level = ctx.values.level as string;
                field.setValue(levelMap[level] ?? 0);
              },
            },
          },
        ],
      },
    },
  };
}

/**
 * 默认值示例
 *
 * 静态默认值 + 动态计算默认值 + initialValues 注入 + 重置恢复。
 */
export const DefaultValueForm = observer((): React.ReactElement => {
  const [mode, setMode] = useState<FieldPattern>('editable');
  const [result, setResult] = useState('');

  /** 外部注入的初始值（模拟从接口获取） */
  const externalInitialValues: Record<string, unknown> = {
    orderNo: generateOrderNo(),
    createDate: getToday(),
    country: 'china',
    status: 'draft',
    enableNotify: true,
    quantity: 1,
    unitPrice: 99.9,
    totalPrice: 99.9,
    level: 'silver',
    discountRate: 5,
  };

  const [savedValues, setSavedValues] = useState<Record<string, unknown>>(externalInitialValues);
  const schema = useMemo(() => buildSchema(mode), [mode]);

  return (
    <div>
      <Title level={3}>默认值</Title>
      <Paragraph type="secondary">
        静态 defaultValue / 动态计算默认值 / initialValues 外部注入 / 重置恢复
      </Paragraph>

      <Segmented
        value={mode}
        onChange={(val) => setMode(val as FieldPattern)}
        options={MODE_OPTIONS}
        style={{ marginBottom: 16 }}
      />

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message={
          <span>
            外部注入初始值：订单号 <Text code>{externalInitialValues.orderNo as string}</Text>，
            日期 <Text code>{externalInitialValues.createDate as string}</Text>
          </span>
        }
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
              <Button htmlType="reset">重置（恢复默认值）</Button>
              <Button onClick={() => setSavedValues(externalInitialValues)}>
                重新加载初始值
              </Button>
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
