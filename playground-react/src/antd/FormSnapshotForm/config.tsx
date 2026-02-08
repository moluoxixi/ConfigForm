import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/core'
import { ConfigForm } from '@moluoxixi/react'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 42：表单快照 — ConfigForm + Schema
 *
 * 覆盖：
 * - 表单字段定义（Input / Textarea）
 * - 三种模式切换
 *
 * 注：field.tsx 版本包含暂存草稿（localStorage）、恢复草稿、多版本管理等高级功能，
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
  title: '',
  description: '',
  category: '',
  priority: '',
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
    title: {
      type: 'string',
      title: '标题',
      required: true,
      component: 'Input',
    },
    description: {
      type: 'string',
      title: '描述',
      component: 'Textarea',
      componentProps: { rows: 3 },
    },
    category: {
      type: 'string',
      title: '分类',
      component: 'Input',
    },
    priority: {
      type: 'string',
      title: '优先级',
      component: 'Input',
    },
  },
}

/**
 * 表单快照 — ConfigForm + Schema
 *
 * 展示表单字段声明、三种模式切换
 */
export const FormSnapshotForm = observer((): React.ReactElement => (
  <div>
    <h2>表单快照</h2>
    <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>表单字段声明（Input / Textarea） / 三种模式 — ConfigForm + Schema</p>
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
