/**
 * 场景渲染器
 *
 * 使用 ConfigForm + SchemaField 递归渲染 schema.properties。
 * StatusTabs 提供编辑态/阅读态/禁用态三态切换。
 * 当场景配置包含 schemaVariants 时，渲染变体切换 UI（如布局切换）。
 */
import type { ISchema } from '@moluoxixi/core'
import type { FieldPattern } from '@moluoxixi/core'
import type { SceneConfig } from '@playground/shared'
import { ConfigForm } from '@moluoxixi/react'
import { devToolsPlugin } from '@moluoxixi/plugin-devtools'
import { StatusTabs } from '@moluoxixi/ui-antd'
import { observer } from 'mobx-react-lite'
import React, { useMemo, useState } from 'react'

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
}

export const SceneRenderer = observer(({ config }: SceneRendererProps): React.ReactElement => {
  const variants = config.schemaVariants
  const [variantValue, setVariantValue] = useState(variants?.defaultValue ?? '')

  /** 当前使用的 schema（有变体时动态生成，否则使用静态 schema） */
  const currentSchema = useMemo<ISchema>(() => {
    if (variants && variantValue) {
      return variants.factory(variantValue)
    }
    return config.schema
  }, [config.schema, variants, variantValue])

  return (
    <div>
      <h2>{config.title}</h2>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>
        {config.description}
      </p>

      {/* Schema 变体切换器（如布局切换） */}
      {variants && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#555' }}>{variants.label}：</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {variants.options.map(opt => (
              <button
                key={opt.value}
                onClick={() => setVariantValue(opt.value)}
                style={{
                  padding: '4px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 500,
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
          <ConfigForm
            schema={withMode(currentSchema, mode)}
            initialValues={config.initialValues}
            formConfig={{
              effects: config.effects,
              plugins: [...(config.plugins ?? []), devTools],
            }}
            onSubmit={showResult}
            onSubmitFailed={errors => showErrors(errors)}
          />
        )}
      </StatusTabs>
    </div>
  )
})
