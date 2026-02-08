import type { ISchema } from '@moluoxixi/schema';
import type { FieldPattern } from '@moluoxixi/core';
import { ConfigForm } from '@moluoxixi/react';
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd';
import { observer } from 'mobx-react-lite';
/**
 * 场景 49：Grid 栅格布局（Ant Design 版）
 *
 * 使用 schema.span 控制字段栅格宽度，24 列布局体系。
 * decoratorProps.grid 开启栅格模式，各字段通过 span 属性控制宽度。
 */
import React from 'react';

setupAntd();

/** 表单 Schema */
const schema: ISchema = {
  type: 'object',
  decoratorProps: {
    labelPosition: 'top',
    labelWidth: 'auto',
    actions: { submit: '提交', reset: '重置' },
    grid: true,
    gridColumns: 24,
    gridGap: '16px',
  },
  properties: {
    firstName: {
      type: 'string',
      title: '姓',
      required: true,
      span: 12,
      componentProps: { placeholder: '请输入姓氏' },
    },
    lastName: {
      type: 'string',
      title: '名',
      required: true,
      span: 12,
      componentProps: { placeholder: '请输入名字' },
    },
    email: {
      type: 'string',
      title: '邮箱',
      span: 16,
      rules: [{ format: 'email', message: '请输入有效邮箱' }],
      componentProps: { placeholder: 'user@example.com' },
    },
    age: {
      type: 'number',
      title: '年龄',
      span: 8,
      componentProps: { min: 0, max: 150 },
    },
    address: {
      type: 'string',
      title: '详细地址',
      span: 24,
      component: 'Textarea',
      componentProps: { placeholder: '请输入详细地址', rows: 2 },
    },
    province: {
      type: 'string',
      title: '省份',
      span: 8,
      enum: [
        { label: '北京', value: 'beijing' },
        { label: '上海', value: 'shanghai' },
        { label: '广东', value: 'guangdong' },
      ],
    },
    city: {
      type: 'string',
      title: '城市',
      span: 8,
      componentProps: { placeholder: '请输入城市' },
    },
    zipCode: {
      type: 'string',
      title: '邮编',
      span: 8,
      componentProps: { placeholder: '100000' },
    },
    phone: {
      type: 'string',
      title: '手机号',
      span: 12,
      rules: [{ format: 'phone', message: '请输入有效手机号' }],
    },
    notification: {
      type: 'boolean',
      title: '接收通知',
      span: 12,
    },
  },
};

/** 将 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } };
}

/**
 * Grid 栅格布局示例
 *
 * 使用 span 属性控制字段宽度，24 列栅格布局。
 */
export const GridLayoutForm = observer((): React.ReactElement => (
  <div>
    <h2>Grid 栅格布局</h2>
    <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>
      使用 span 控制字段宽度，总计 24 列栅格体系，可灵活组合
    </p>
    <StatusTabs>
      {({ mode, showResult, showErrors }) => (
        <ConfigForm
          schema={withMode(schema, mode)}
          onSubmit={showResult}
          onSubmitFailed={errors => showErrors(errors)}
        />
      )}
    </StatusTabs>
  </div>
));
