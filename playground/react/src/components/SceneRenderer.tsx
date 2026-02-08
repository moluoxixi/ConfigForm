/**
 * 场景渲染器
 *
 * 根据 SceneConfig 通用渲染 Config / Field 两种模式。
 * App 只需传入 config 和 mode，无需关心渲染细节。
 */
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/core'
import type { SceneConfig } from '@playground/shared'
import { ConfigForm, FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs } from '@moluoxixi/ui-antd'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'

/** 注入 pattern 到 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

/** Field 模式渲染器 */
const FieldScene = observer(({ config }: { config: SceneConfig }): React.ReactElement => {
  const labelWidth = (config.schema.decoratorProps?.labelWidth as string) ?? '120px'
  const form = useCreateForm({ labelWidth, initialValues: { ...config.initialValues } })

  return (
    <StatusTabs>
      {({ mode, showResult, showErrors }) => {
        form.pattern = mode
        return (
          <FormProvider form={form}>
            {config.fields.map(f => (
              <FormField
                key={f.name}
                name={f.name}
                fieldProps={{
                  label: f.label,
                  required: f.required,
                  component: f.component,
                  componentProps: f.componentProps,
                  dataSource: f.dataSource,
                  rules: f.rules,
                  description: f.description,
                }}
              />
            ))}
            <LayoutFormActions onSubmit={showResult} onSubmitFailed={showErrors} />
          </FormProvider>
        )
      }}
    </StatusTabs>
  )
})

/** 场景渲染器主组件 */
export interface SceneRendererProps {
  config: SceneConfig
  mode: 'config' | 'field'
}

export const SceneRenderer = observer(({ config, mode }: SceneRendererProps): React.ReactElement => {
  return (
    <div>
      <h2>{config.title}{mode === 'field' ? '（Field 版）' : ''}</h2>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>
        {config.description}{mode === 'field' ? ' — FormField + fieldProps 实现' : ''}
      </p>

      {mode === 'config' ? (
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
      ) : (
        <FieldScene config={config} />
      )}
    </div>
  )
})
