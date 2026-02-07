import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'
import { ConfigForm } from '@moluoxixi/react'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
import { Typography } from 'antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 45：字段级权限控制 — ConfigForm + Schema
 *
 * 覆盖：
 * - 表单字段定义（Input / InputNumber / Textarea）
 * - 三种模式切换
 *
 * 注：field.tsx 版本包含基于角色的字段可见性、读写权限矩阵、动态权限切换等高级功能，
 * 此 Schema 版本仅覆盖字段声明与提交流程。
 */
import React from 'react'

const { Title, Paragraph } = Typography

setupAntd()

/** 工具：将 StatusTabs 的 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

/** 默认初始值 */
const INITIAL_VALUES: Record<string, unknown> = {
  name: '张三',
  email: 'zhangsan@company.com',
  salary: 25000,
  department: '技术部',
  level: 'P7',
  remark: '',
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
      required: true,
      component: 'Input',
    },
    email: {
      type: 'string',
      title: '邮箱',
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
    level: {
      type: 'string',
      title: '职级',
      component: 'Input',
    },
    remark: {
      type: 'string',
      title: '备注',
      component: 'Textarea',
    },
  },
}

/**
 * 字段级权限控制 — ConfigForm + Schema
 *
 * 展示表单字段声明、三种模式切换
 */
export const PermissionForm = observer((): React.ReactElement => (
  <div>
    <Title level={3}>字段级权限控制</Title>
    <Paragraph type="secondary">表单字段声明（Input / InputNumber / Textarea） / 三种模式 — ConfigForm + Schema</Paragraph>
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
