import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/core'
import { ConfigForm } from '@moluoxixi/react'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 47：表单比对 — ConfigForm + Schema
 *
 * 覆盖：
 * - 表单字段定义（Input / InputNumber / Textarea）
 * - 三种模式切换
 *
 * 注：field.tsx 版本包含变更高亮、原始值 vs 当前值比对等高级功能，
 * 此 Schema 版本仅覆盖字段声明与提交流程。
 */
import React from 'react'

setupAntd()

/** 工具：将 StatusTabs 的 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

/** 默认初始值（模拟从数据库加载） */
const INITIAL_VALUES: Record<string, unknown> = {
  name: '张三',
  email: 'zhangsan@company.com',
  phone: '13800138000',
  salary: 25000,
  department: '技术部',
  bio: '5 年前端开发经验',
}

/** 表单 Schema */
const schema: ISchema = {
  type: 'object',
  decoratorProps: {
    labelPosition: 'right',
    labelWidth: '120px',
    actions: { submit: '提交', reset: '重置' },
  },
  properties: {
    name: {
      type: 'string',
      title: '姓名',
      component: 'Input',
    },
    email: {
      type: 'string',
      title: '邮箱',
      component: 'Input',
    },
    phone: {
      type: 'string',
      title: '电话',
      component: 'Input',
    },
    salary: {
      type: 'number',
      title: '薪资',
      componentProps: { style: { width: '100%' } },
    },
    department: {
      type: 'string',
      title: '部门',
      component: 'Input',
    },
    bio: {
      type: 'string',
      title: '简介',
      component: 'Textarea',
      componentProps: { rows: 2 },
    },
  },
}

/**
 * 表单比对 — ConfigForm + Schema
 *
 * 展示表单字段声明、三种模式切换
 */
export const FormDiffForm = observer((): React.ReactElement => (
  <div>
    <h2>表单比对</h2>
    <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>表单字段声明（Input / InputNumber / Textarea） / 三种模式 — ConfigForm + Schema</p>
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
))
