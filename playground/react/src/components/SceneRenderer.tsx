/**
 * 场景渲染器
 *
 * Config / Field 模式都使用 ConfigForm + 同一份 schema 渲染。
 * ConfigForm 内部通过 SchemaField 递归渲染 schema.properties，
 * 与 Formily 的 RecursionField 机制一致。
 */
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/core'
import type { SceneConfig } from '@playground/shared'
import { ConfigForm } from '@moluoxixi/react'
import { StatusTabs } from '@moluoxixi/ui-antd'
import { observer } from 'mobx-react-lite'
import React from 'react'

/** 注入 pattern 到 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

export interface SceneRendererProps {
  config: SceneConfig
  mode: 'config' | 'field'
}

export const SceneRenderer = observer(({ config, mode }: SceneRendererProps): React.ReactElement => {
  return (
    <div>
      <h2>{config.title}{mode === 'field' ? '（Field 版）' : ''}</h2>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>
        {config.description}{mode === 'field' ? ' — FormProvider + SchemaField 实现' : ''}
      </p>

      <StatusTabs>
        {({ mode: tabMode, showResult, showErrors }) => (
          <ConfigForm
            schema={withMode(config.schema, tabMode)}
            initialValues={config.initialValues}
            onSubmit={showResult}
            onSubmitFailed={errors => showErrors(errors)}
          />
        )}
      </StatusTabs>
    </div>
  )
})
