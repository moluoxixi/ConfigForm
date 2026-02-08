import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'
import { ConfigForm } from '@moluoxixi/react'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
import { observer } from 'mobx-react-lite'
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
import React, { useMemo, useState } from 'react'

setupAntd()

/** 工具：将 StatusTabs 的 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

/** 布局类型 */
type LayoutType = 'horizontal' | 'vertical' | 'inline' | 'grid-2col' | 'grid-3col'

/** 布局选项 */
const LAYOUT_OPTIONS: Array<{ label: string, value: LayoutType }> = [
  { label: '水平布局', value: 'horizontal' },
  { label: '垂直布局', value: 'vertical' },
  { label: '行内布局', value: 'inline' },
  { label: '栅格两列', value: 'grid-2col' },
  { label: '栅格三列', value: 'grid-3col' },
]

/** 基础字段定义（所有布局共享） */
const BASE_PROPERTIES: ISchema['properties'] = {
  name: {
    type: 'string',
    title: '姓名',
    required: true,
    placeholder: '请输入姓名',
  },
  email: {
    type: 'string',
    title: '邮箱',
    required: true,
    placeholder: '请输入邮箱',
    rules: [{ format: 'email', message: '请输入有效邮箱' }],
  },
  phone: {
    type: 'string',
    title: '手机号',
    placeholder: '请输入手机号',
  },
  department: {
    type: 'string',
    title: '部门',
    component: 'Select',
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
    title: '职位',
    placeholder: '请输入职位',
  },
  joinDate: {
    type: 'string',
    title: '入职日期',
    component: 'DatePicker',
    placeholder: '请选择日期',
  },
}

/**
 * 根据布局类型构建 Schema
 *
 * @param layoutType - 布局类型
 * @returns 完整的表单 Schema
 */
function buildSchema(layoutType: LayoutType): ISchema {
  const schema: ISchema = {
    type: 'object',
    decoratorProps: {
      labelWidth: '100px',
    },
    properties: { ...BASE_PROPERTIES },
  }

  /* 根据布局类型调整 decoratorProps 配置 */
  switch (layoutType) {
    case 'horizontal':
      schema.decoratorProps!.labelPosition = 'right'
      schema.decoratorProps!.direction = 'vertical'
      break
    case 'vertical':
      schema.decoratorProps!.labelPosition = 'top'
      schema.decoratorProps!.direction = 'vertical'
      break
    case 'inline':
      schema.decoratorProps!.labelPosition = 'right'
      schema.decoratorProps!.direction = 'inline'
      break
    case 'grid-2col':
      schema.decoratorProps!.labelPosition = 'right'
      schema.layout = {
        type: 'grid',
        columns: 2,
        gutter: 24,
      }
      break
    case 'grid-3col':
      schema.decoratorProps!.labelPosition = 'top'
      schema.layout = {
        type: 'grid',
        columns: 3,
        gutter: 16,
      }
      break
  }

  return schema
}

/** 默认初始值 */
const INITIAL_VALUES: Record<string, unknown> = {
  name: '',
  email: '',
  phone: '',
  department: undefined,
  role: '',
  joinDate: '',
}

/**
 * 表单布局示例
 *
 * 可切换水平 / 垂直 / 行内 / 栅格两列 / 栅格三列布局。
 */
export const LayoutForm = observer((): React.ReactElement => {
  const [layoutType, setLayoutType] = useState<LayoutType>('horizontal')

  const schema = useMemo(() => buildSchema(layoutType), [layoutType])

  return (
    <div>
      <h2>表单布局</h2>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>
        水平布局 / 垂直布局 / 行内布局 / 栅格两列 / 栅格三列
      </p>

      <div style={{ marginBottom: 16 }}>
        <strong style={{ marginRight: 12 }}>布局类型：</strong>
        <span style={{ display: 'inline-flex', gap: 0, border: '1px solid #d9d9d9', borderRadius: 6, overflow: 'hidden' }}>
          {LAYOUT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setLayoutType(opt.value)}
              style={{
                padding: '4px 12px',
                border: 'none',
                cursor: 'pointer',
                fontSize: 14,
                background: layoutType === opt.value ? '#1677ff' : '#fff',
                color: layoutType === opt.value ? '#fff' : 'rgba(0,0,0,0.88)',
              }}
            >
              {opt.label}
            </button>
          ))}
        </span>
      </div>

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
  )
})
