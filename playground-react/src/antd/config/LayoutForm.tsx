/**
 * 场景 2：表单布局
 *
 * 覆盖：
 * - 水平布局（labelPosition: left / right）
 * - 垂直布局（labelPosition: top）
 * - 行内布局（direction: inline）
 * - 栅格布局（layout.type = 'grid'，一行两列 / 三列）
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

/** 布局类型 */
type LayoutType = 'horizontal' | 'vertical' | 'inline' | 'grid-2col' | 'grid-3col';

/** 布局选项 */
const LAYOUT_OPTIONS: Array<{ label: string; value: LayoutType }> = [
  { label: '水平布局', value: 'horizontal' },
  { label: '垂直布局', value: 'vertical' },
  { label: '行内布局', value: 'inline' },
  { label: '栅格两列', value: 'grid-2col' },
  { label: '栅格三列', value: 'grid-3col' },
];

/** 基础字段定义（所有布局共享） */
const BASE_FIELDS: FormSchema['fields'] = {
  name: {
    type: 'string',
    label: '姓名',
    required: true,
    component: 'Input',
    wrapper: 'FormItem',
    placeholder: '请输入姓名',
  },
  email: {
    type: 'string',
    label: '邮箱',
    required: true,
    component: 'Input',
    wrapper: 'FormItem',
    placeholder: '请输入邮箱',
    rules: [{ format: 'email', message: '请输入有效邮箱' }],
  },
  phone: {
    type: 'string',
    label: '手机号',
    component: 'Input',
    wrapper: 'FormItem',
    placeholder: '请输入手机号',
  },
  department: {
    type: 'string',
    label: '部门',
    component: 'Select',
    wrapper: 'FormItem',
    placeholder: '请选择部门',
    enum: [
      { label: '技术部', value: 'tech' },
      { label: '产品部', value: 'product' },
      { label: '设计部', value: 'design' },
      { label: '运营部', value: 'operation' },
    ],
  },
  role: {
    type: 'string',
    label: '职位',
    component: 'Input',
    wrapper: 'FormItem',
    placeholder: '请输入职位',
  },
  joinDate: {
    type: 'string',
    label: '入职日期',
    component: 'DatePicker',
    wrapper: 'FormItem',
    placeholder: '请选择日期',
  },
};

/**
 * 根据布局类型和模式构建 Schema
 *
 * @param layoutType - 布局类型
 * @param mode - 表单模式
 * @returns 完整的表单 Schema
 */
function buildSchema(layoutType: LayoutType, mode: FieldPattern): FormSchema {
  const schema: FormSchema = {
    form: {
      pattern: mode,
      labelWidth: '100px',
    },
    fields: { ...BASE_FIELDS },
  };

  /* 根据布局类型调整 form 配置 */
  switch (layoutType) {
    case 'horizontal':
      schema.form!.labelPosition = 'right';
      schema.form!.direction = 'vertical';
      break;
    case 'vertical':
      schema.form!.labelPosition = 'top';
      schema.form!.direction = 'vertical';
      break;
    case 'inline':
      schema.form!.labelPosition = 'right';
      schema.form!.direction = 'inline';
      break;
    case 'grid-2col':
      schema.form!.labelPosition = 'right';
      schema.layout = {
        type: 'grid',
        columns: 2,
        gutter: 24,
      };
      break;
    case 'grid-3col':
      schema.form!.labelPosition = 'top';
      schema.layout = {
        type: 'grid',
        columns: 3,
        gutter: 16,
      };
      break;
  }

  return schema;
}

/** 默认初始值 */
const INITIAL_VALUES: Record<string, unknown> = {
  name: '',
  email: '',
  phone: '',
  department: undefined,
  role: '',
  joinDate: '',
};

/**
 * 表单布局示例
 *
 * 可切换水平 / 垂直 / 行内 / 栅格两列 / 栅格三列布局。
 */
export const LayoutForm = observer((): React.ReactElement => {
  const [mode, setMode] = useState<FieldPattern>('editable');
  const [layoutType, setLayoutType] = useState<LayoutType>('horizontal');
  const [result, setResult] = useState('');
  const [savedValues, setSavedValues] = useState<Record<string, unknown>>({ ...INITIAL_VALUES });

  const schema = useMemo(() => buildSchema(layoutType, mode), [layoutType, mode]);

  return (
    <div>
      <Title level={3}>表单布局</Title>
      <Paragraph type="secondary">
        水平布局 / 垂直布局 / 行内布局 / 栅格两列 / 栅格三列
      </Paragraph>

      {/* 模式切换 */}
      <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
        <div>
          <Text strong style={{ marginRight: 12 }}>表单模式：</Text>
          <Segmented
            value={mode}
            onChange={(val) => setMode(val as FieldPattern)}
            options={MODE_OPTIONS}
          />
        </div>
        <div>
          <Text strong style={{ marginRight: 12 }}>布局类型：</Text>
          <Segmented
            value={layoutType}
            onChange={(val) => setLayoutType(val as LayoutType)}
            options={LAYOUT_OPTIONS}
          />
        </div>
      </Space>

      <Divider />

      <ConfigForm
        key={`${layoutType}-${mode}`}
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
