import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/core'
import { ConfigForm } from '@moluoxixi/react'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 48：打印、导出 — ConfigForm + Schema
 *
 * 覆盖：
 * - 表单字段定义（Input / InputNumber / Textarea）
 * - 三种模式切换
 *
 * 注：field.tsx 版本包含打印预览（window.print）、导出 JSON、导出 CSV 等高级功能，
 * 此 Schema 版本仅覆盖字段声明与提交流程。
 */
import React from 'react'

setupAntd()

/** 工具：将 StatusTabs 的 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

/** 默认初始值 */
const INITIAL_VALUES: Record<string, unknown> = {
  orderNo: 'ORD-20260207-001',
  customer: '张三',
  amount: 9999,
  date: '2026-02-07',
  address: '北京市朝阳区',
  remark: '加急处理',
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
    orderNo: {
      type: 'string',
      title: '订单号',
      component: 'Input',
    },
    customer: {
      type: 'string',
      title: '客户名称',
      component: 'Input',
    },
    amount: {
      type: 'number',
      title: '金额',
      componentProps: { style: { width: '100%' } },
    },
    date: {
      type: 'string',
      title: '日期',
      component: 'Input',
    },
    address: {
      type: 'string',
      title: '地址',
      component: 'Input',
    },
    remark: {
      type: 'string',
      title: '备注',
      component: 'Textarea',
      componentProps: { rows: 2 },
    },
  },
}

/**
 * 打印、导出表单 — ConfigForm + Schema
 *
 * 展示表单字段声明、三种模式切换
 */
export const PrintExportForm = observer((): React.ReactElement => (
  <div>
    <h2>打印、导出</h2>
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
