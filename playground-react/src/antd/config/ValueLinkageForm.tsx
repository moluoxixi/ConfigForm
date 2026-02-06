/**
 * 场景 6：值联动
 *
 * 覆盖：
 * - 单向同步：字段 A 变化，字段 B 自动跟随
 * - 格式转换：输入值自动转换（大写、去空格）
 * - 映射转换：根据 A 的值查表设置 B 的值
 * - 多对一：多个字段聚合到一个显示字段
 * - 三种模式切换
 */
import React, { useState, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { ConfigForm } from '@moluoxixi/react';
import { setupAntd } from '@moluoxixi/ui-antd';
import { Button, Space, Typography, Alert, Segmented } from 'antd';
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

/** 国家→区号映射 */
const COUNTRY_CODE_MAP: Record<string, string> = {
  china: '+86',
  usa: '+1',
  japan: '+81',
  korea: '+82',
  uk: '+44',
};

/** 国家→货币映射 */
const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  china: 'CNY',
  usa: 'USD',
  japan: 'JPY',
  korea: 'KRW',
  uk: 'GBP',
};

/**
 * 构建 Schema
 *
 * @param mode - 表单模式
 */
function buildSchema(mode: FieldPattern): FormSchema {
  return {
    form: { labelPosition: 'right', labelWidth: '150px', pattern: mode },
    fields: {
      /* ---- 场景 A：单向同步 ---- */
      firstName: {
        type: 'string',
        label: '姓',
        component: 'Input',
        wrapper: 'FormItem',
        placeholder: '请输入姓',
      },
      lastName: {
        type: 'string',
        label: '名',
        component: 'Input',
        wrapper: 'FormItem',
        placeholder: '请输入名',
      },
      fullName: {
        type: 'string',
        label: '全名（自动拼接）',
        component: 'Input',
        wrapper: 'FormItem',
        componentProps: { disabled: true },
        description: '自动由「姓」+「名」拼接',
        reactions: [
          {
            watch: ['firstName', 'lastName'],
            fulfill: {
              run: (field, ctx) => {
                const first = (ctx.values.firstName as string) ?? '';
                const last = (ctx.values.lastName as string) ?? '';
                field.setValue(`${first}${last}`.trim());
              },
            },
          },
        ],
      },

      /* ---- 场景 B：格式转换 ---- */
      rawInput: {
        type: 'string',
        label: '输入文本',
        component: 'Input',
        wrapper: 'FormItem',
        placeholder: '输入任意文本',
      },
      upperCase: {
        type: 'string',
        label: '大写转换',
        component: 'Input',
        wrapper: 'FormItem',
        componentProps: { disabled: true },
        description: '自动将输入转为大写',
        reactions: [
          {
            watch: 'rawInput',
            fulfill: {
              run: (field, ctx) => {
                const raw = (ctx.values.rawInput as string) ?? '';
                field.setValue(raw.toUpperCase());
              },
            },
          },
        ],
      },
      trimmed: {
        type: 'string',
        label: '去空格结果',
        component: 'Input',
        wrapper: 'FormItem',
        componentProps: { disabled: true },
        description: '自动去除首尾空格',
        reactions: [
          {
            watch: 'rawInput',
            fulfill: {
              run: (field, ctx) => {
                const raw = (ctx.values.rawInput as string) ?? '';
                field.setValue(raw.trim());
              },
            },
          },
        ],
      },

      /* ---- 场景 C：映射转换 ---- */
      country: {
        type: 'string',
        label: '国家',
        component: 'Select',
        wrapper: 'FormItem',
        defaultValue: 'china',
        enum: [
          { label: '中国', value: 'china' },
          { label: '美国', value: 'usa' },
          { label: '日本', value: 'japan' },
          { label: '韩国', value: 'korea' },
          { label: '英国', value: 'uk' },
        ],
      },
      areaCode: {
        type: 'string',
        label: '区号（自动映射）',
        component: 'Input',
        wrapper: 'FormItem',
        componentProps: { disabled: true },
        description: '根据国家自动映射区号',
        reactions: [
          {
            watch: 'country',
            fulfill: {
              run: (field, ctx) => {
                const c = (ctx.values.country as string) ?? '';
                field.setValue(COUNTRY_CODE_MAP[c] ?? '');
              },
            },
          },
        ],
      },
      currency: {
        type: 'string',
        label: '货币（自动映射）',
        component: 'Input',
        wrapper: 'FormItem',
        componentProps: { disabled: true },
        description: '根据国家自动映射货币',
        reactions: [
          {
            watch: 'country',
            fulfill: {
              run: (field, ctx) => {
                const c = (ctx.values.country as string) ?? '';
                field.setValue(COUNTRY_CURRENCY_MAP[c] ?? '');
              },
            },
          },
        ],
      },

      /* ---- 场景 D：多对一聚合 ---- */
      province: {
        type: 'string',
        label: '省',
        component: 'Input',
        wrapper: 'FormItem',
        placeholder: '省',
      },
      city: {
        type: 'string',
        label: '市',
        component: 'Input',
        wrapper: 'FormItem',
        placeholder: '市',
      },
      district: {
        type: 'string',
        label: '区',
        component: 'Input',
        wrapper: 'FormItem',
        placeholder: '区',
      },
      fullAddress: {
        type: 'string',
        label: '完整地址（聚合）',
        component: 'Input',
        wrapper: 'FormItem',
        componentProps: { disabled: true },
        description: '自动由 省 + 市 + 区 聚合',
        reactions: [
          {
            watch: ['province', 'city', 'district'],
            fulfill: {
              run: (field, ctx) => {
                const parts = [
                  ctx.values.province as string,
                  ctx.values.city as string,
                  ctx.values.district as string,
                ].filter(Boolean);
                field.setValue(parts.join(' '));
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
  firstName: '',
  lastName: '',
  fullName: '',
  rawInput: '',
  upperCase: '',
  trimmed: '',
  country: 'china',
  areaCode: '+86',
  currency: 'CNY',
  province: '',
  city: '',
  district: '',
  fullAddress: '',
};

/**
 * 值联动示例
 */
export const ValueLinkageForm = observer((): React.ReactElement => {
  const [mode, setMode] = useState<FieldPattern>('editable');
  const [result, setResult] = useState('');
  const [savedValues, setSavedValues] = useState<Record<string, unknown>>({ ...INITIAL_VALUES });

  const schema = useMemo(() => buildSchema(mode), [mode]);

  return (
    <div>
      <Title level={3}>值联动</Title>
      <Paragraph type="secondary">
        单向同步（姓+名→全名） / 格式转换（大写、去空格） / 映射转换（国家→区号/货币） / 多对一聚合
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
          <Space style={{ marginTop: 16 }}>
            <Button type="primary" htmlType="submit">提交</Button>
            <Button htmlType="reset">重置</Button>
          </Space>
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
