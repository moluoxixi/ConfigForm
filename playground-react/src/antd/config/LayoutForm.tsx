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
import { setupAntd } from '@moluoxixi/ui-antd';
import { Typography, Segmented } from 'antd';
import type { FormSchema } from '@moluoxixi/schema';
import { PlaygroundForm } from '../../components/PlaygroundForm';

const { Title, Paragraph, Text } = Typography;

setupAntd();

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
 * 根据布局类型构建 Schema
 *
 * @param layoutType - 布局类型
 * @returns 完整的表单 Schema
 */
function buildSchema(layoutType: LayoutType): FormSchema {
  const schema: FormSchema = {
    form: {
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
  const [layoutType, setLayoutType] = useState<LayoutType>('horizontal');

  const schema = useMemo(() => buildSchema(layoutType), [layoutType]);

  return (
    <div>
      <Title level={3}>表单布局</Title>
      <Paragraph type="secondary">
        水平布局 / 垂直布局 / 行内布局 / 栅格两列 / 栅格三列
      </Paragraph>

      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ marginRight: 12 }}>布局类型：</Text>
        <Segmented
          value={layoutType}
          onChange={(val) => setLayoutType(val as LayoutType)}
          options={LAYOUT_OPTIONS}
        />
      </div>

      <PlaygroundForm schema={schema} initialValues={INITIAL_VALUES} />
    </div>
  );
});
