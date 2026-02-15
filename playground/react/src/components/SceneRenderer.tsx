/**
 * 场景渲染器
 *
 * 仅负责通用场景渲染（标题、变体切换、三态切换、ConfigForm）。
 * 场景特定能力（如 i18n 运行时与语言切换）在外层注入，避免通用渲染器耦合业务逻辑。
 */
import type { FieldPattern, FormPlugin, ISchema } from '@moluoxixi/core'
import type { SceneConfig } from '@playground/shared'
import { devToolsPlugin } from '@moluoxixi/plugin-devtools'
import { ConfigForm } from '@moluoxixi/react'
import { StatusTabs } from '@moluoxixi/ui-antd'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

/** DevTools 插件单例（所有场景共用，避免重复创建） */
const devTools = devToolsPlugin({ formId: 'playground' })

/** 注入 pattern 到 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return {
    ...s,
    pattern: mode,
    decoratorProps: { ...s.decoratorProps, pattern: mode },
  }
}

export interface SceneRendererProps {
  config: SceneConfig
  title?: string
  description?: string
  extraPlugins?: FormPlugin[]
  headerExtra?: React.ReactNode
}

interface SceneFormProps {
  config: SceneConfig
  schema: ISchema
  mode: FieldPattern
  extraPlugins?: FormPlugin[]
  showResult: (data: Record<string, unknown>) => void
  showErrors: (errors: Array<{ path: string, message: string }>) => void
}

function SceneForm({ config, schema, mode, extraPlugins, showResult, showErrors }: SceneFormProps): React.ReactElement {
  useEffect(() => {
    showErrors([])
  }, [mode, showErrors])

  const handleReset = useCallback(() => {
    showErrors([])
  }, [showErrors])

  return (
    <ConfigForm
      schema={withMode(schema, mode)}
      initialValues={config.initialValues}
      formConfig={{
        effects: config.effects,
        plugins: [...(config.plugins ?? []), ...(extraPlugins ?? []), devTools],
      }}
      onSubmit={showResult}
      onSubmitFailed={errors => showErrors(errors)}
      onReset={handleReset}
    />
  )
}

export const SceneRenderer = observer(({ config, title, description, extraPlugins, headerExtra }: SceneRendererProps): React.ReactElement => {
  const variants = config.schemaVariants
  const [variantValue, setVariantValue] = useState(variants?.defaultValue ?? '')

  /** 当前使用的 schema（有变体时动态生成，否则使用静态 schema） */
  const currentSchema = useMemo<ISchema>(() => {
    if (variants && variantValue) {
      return variants.factory(variantValue)
    }
    return config.schema
  }, [config.schema, variants, variantValue])

  const content = (
    <div>
      <h2>{title ?? config.title}</h2>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>
        {description ?? config.description}
      </p>

      {headerExtra}

      {/* Schema 变体切换器（如布局切换） */}
      {variants && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#555' }}>
            {variants.label}
            ：
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            {variants.options.map(opt => (
              <button
                key={opt.value}
                onClick={() => setVariantValue(opt.value)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                  border: variantValue === opt.value ? '2px solid #1677ff' : '1px solid #d9d9d9',
                  background: variantValue === opt.value ? '#e6f4ff' : '#fff',
                  color: variantValue === opt.value ? '#1677ff' : '#333',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <StatusTabs>
        {({ mode, showResult, showErrors }) => (
          <SceneForm
            config={config}
            schema={currentSchema}
            mode={mode}
            extraPlugins={extraPlugins}
            showResult={showResult}
            showErrors={showErrors}
          />
        )}
      </StatusTabs>
    </div>
  )
  return content
})
