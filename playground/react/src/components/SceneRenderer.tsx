/**
 * 场景渲染器
 *
 * 使用 ConfigForm + SchemaField 递归渲染 schema.properties。
 * StatusTabs 提供编辑态/阅读态/禁用态三态切换。
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
}

export const SceneRenderer = observer(({ config }: SceneRendererProps): React.ReactElement => {
  return (
    <div>
      <h2>{config.title}</h2>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>
        {config.description}
      </p>

      <StatusTabs>
        {({ mode, showResult, showErrors }) => (
          <ConfigForm
            schema={withMode(config.schema, mode)}
            initialValues={config.initialValues}
            onSubmit={showResult}
            onSubmitFailed={errors => showErrors(errors)}
          />
        )}
      </StatusTabs>
    </div>
  )
})
