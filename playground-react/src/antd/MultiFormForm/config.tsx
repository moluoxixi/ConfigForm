import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'
import { ConfigForm } from '@moluoxixi/react'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 41：多表单协作 — ConfigForm + Schema
 *
 * 覆盖：
 * - 主表单（订单信息）与子表单（联系人信息）合并为单一 Schema
 * - 三种模式切换
 *
 * 注：field.tsx 版本包含两个独立表单联合提交、跨表单值联动、弹窗表单等高级功能，
 * 此 Schema 版本将所有字段合并为一个 Schema 进行演示。
 */
import React from 'react'

setupAntd()

/** 工具：将 StatusTabs 的 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

/** 默认初始值（主表单 + 子表单合并） */
const INITIAL_VALUES: Record<string, unknown> = {
  orderName: '',
  customer: '',
  total: 0,
  contactName: '',
  contactPhone: '',
  contactEmail: '',
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
    /* ---- 订单信息 ---- */
    orderName: {
      type: 'string',
      title: '订单名称',
      required: true,
      component: 'Input',
    },
    customer: {
      type: 'string',
      title: '客户名称',
      required: true,
      component: 'Input',
    },
    total: {
      type: 'number',
      title: '订单金额',
      required: true,
      componentProps: { min: 0, style: { width: '100%' } },
    },

    /* ---- 联系人信息 ---- */
    contactName: {
      type: 'string',
      title: '联系人',
      required: true,
      component: 'Input',
    },
    contactPhone: {
      type: 'string',
      title: '联系电话',
      required: true,
      component: 'Input',
      rules: [{ format: 'phone', message: '无效手机号' }],
    },
    contactEmail: {
      type: 'string',
      title: '邮箱',
      component: 'Input',
      rules: [{ format: 'email', message: '无效邮箱' }],
    },
  },
}

/**
 * 多表单协作 — ConfigForm + Schema
 *
 * 展示订单信息 + 联系人信息合并表单、三种模式切换
 */
export const MultiFormForm = observer((): React.ReactElement => (
  <div>
    <h2>多表单协作</h2>
    <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>订单信息 + 联系人信息合并表单 / 三种模式 — ConfigForm + Schema</p>
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
