import type { ISchema } from '@moluoxixi/schema';
import type { FieldPattern } from '@moluoxixi/core';
import { ConfigForm, registerWrapper } from '@moluoxixi/react';
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd';
import { observer } from 'mobx-react-lite';
/**
 * 场景 52：自定义装饰器（Ant Design 版）
 *
 * 自定义 decorator 替换 FormItem，支持多种装饰器样式
 * - CardDecorator：卡片包裹装饰器
 * - InlineDecorator：内联装饰器
 * - 默认 FormItem 装饰器
 */
import React from 'react';

setupAntd();

/** 卡片装饰器：带背景和圆角的卡片包裹 */
const CardDecorator: React.FC<{
  label?: string;
  required?: boolean;
  errors?: Array<{ message: string }>;
  description?: string;
  children?: React.ReactNode;
}> = ({ label, required, errors = [], description, children }) => (
  <div style={{ border: '1px solid #e8e8e8', borderRadius: 8, padding: 16, marginBottom: 12, background: '#fafafa' }}>
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
      <span style={{ fontWeight: 600, fontSize: 14 }}>
        {label}
        {required && <span style={{ color: '#ff4d4f', marginLeft: 4 }}>*</span>}
      </span>
    </div>
    {children}
    {description && <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>{description}</div>}
    {errors.length > 0 && <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}>{errors[0].message}</div>}
  </div>
);

/** 内联装饰器：左标签右内容的紧凑布局 */
const InlineDecorator: React.FC<{
  label?: string;
  required?: boolean;
  errors?: Array<{ message: string }>;
  children?: React.ReactNode;
}> = ({ label, required, errors = [], children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, padding: '8px 0', borderBottom: '1px dashed #e8e8e8' }}>
    <span style={{ minWidth: 80, fontSize: 13, color: '#555' }}>
      {label}
      {required && <span style={{ color: '#ff4d4f' }}> *</span>}
    </span>
    <div style={{ flex: 1 }}>{children}</div>
    {errors.length > 0 && <span style={{ color: '#ff4d4f', fontSize: 12, whiteSpace: 'nowrap' }}>{errors[0].message}</span>}
  </div>
);

/* 注册自定义装饰器 */
registerWrapper('CardDecorator', CardDecorator);
registerWrapper('InlineDecorator', InlineDecorator);

/** 默认初始值 */
const INITIAL_VALUES: Record<string, unknown> = {
  projectName: '',
  projectCode: '',
  description: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  budget: 0,
  startDate: '',
};

/** 表单 Schema */
const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'top', actions: { submit: '提交', reset: '重置' } },
  properties: {
    projectName: {
      type: 'string',
      title: '项目名称',
      required: true,
      decorator: 'CardDecorator',
      decoratorProps: {},
      description: '请输入项目的完整名称',
    },
    projectCode: {
      type: 'string',
      title: '项目编号',
      required: true,
      decorator: 'CardDecorator',
      rules: [{ pattern: '^[A-Z]{2}-\\d{4}$', message: '格式：XX-0000' }],
    },
    description: {
      type: 'string',
      title: '项目描述',
      component: 'Textarea',
      decorator: 'CardDecorator',
      description: '不超过500字',
    },
    contactName: {
      type: 'string',
      title: '联系人',
      required: true,
      decorator: 'InlineDecorator',
    },
    contactPhone: {
      type: 'string',
      title: '电话',
      decorator: 'InlineDecorator',
      rules: [{ format: 'phone', message: '请输入有效手机号' }],
    },
    contactEmail: {
      type: 'string',
      title: '邮箱',
      decorator: 'InlineDecorator',
      rules: [{ format: 'email', message: '请输入有效邮箱' }],
    },
    budget: {
      type: 'number',
      title: '预算（万元）',
      componentProps: { min: 0 },
    },
    startDate: {
      type: 'date',
      title: '开始日期',
    },
  },
};

/** 将 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } };
}

/**
 * 自定义装饰器示例
 *
 * 自定义 decorator 替换 FormItem，支持卡片装饰器、内联装饰器和默认装饰器三种样式。
 */
export const CustomDecoratorForm = observer((): React.ReactElement => (
  <div>
    <h2>自定义装饰器</h2>
    <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>
      自定义装饰器 decorator 替换 FormItem，实现不同字段包裹样式
    </p>
    <StatusTabs>
      {({ mode, showResult, showErrors }) => (
        <ConfigForm
          schema={withMode(schema, mode)}
          initialValues={INITIAL_VALUES}
          onSubmit={showResult}
          onSubmitFailed={errors => showErrors(errors)}
        />
      )}
    </StatusTabs>
  </div>
));
