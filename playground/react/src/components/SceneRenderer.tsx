/**
 * 场景渲染器
 *
 * 仅负责通用场景渲染（标题、变体切换、三态切换、ConfigForm）。
 * 场景特定能力（如 i18n 运行时与语言切换）在外层注入，避免通用渲染器耦合业务逻辑。
 */
import type { FieldPattern, FormPlugin, ISchema } from '@moluoxixi/core'
import type { SceneConfig } from '@playground/shared'
import { devToolsPlugin } from '@moluoxixi/plugin-devtools'
import { ConfigForm } from '@moluoxixi/ui-basic-react'
import { resolveSceneSchema } from '@playground/shared'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

interface StatusTabsRenderContext {
  mode: FieldPattern
  showResult: (values: Record<string, unknown>) => void
  showErrors: (errors: unknown[]) => void
}

type StatusTabsComponent = React.ComponentType<{
  children: (ctx: StatusTabsRenderContext) => React.ReactNode
}>

/**
 * SceneRendererProps??????
 * ???`playground/react/src/components/SceneRenderer.tsx:16`?
 * ??????????????????????????????
 */
interface SceneRendererProps {
  config: SceneConfig
  title?: string
  description?: string
  extraPlugins?: FormPlugin[]
  headerExtra?: React.ReactNode
  style?: React.CSSProperties
  StatusTabs: StatusTabsComponent
}

/**
 * SceneFormProps??????
 * ???`playground/react/src/components/SceneRenderer.tsx:25`?
 * ??????????????????????????????
 */
interface SceneFormProps {
  config: SceneConfig
  schema: ISchema
  mode: FieldPattern
  extraPlugins?: FormPlugin[]
  showResult: (values: Record<string, unknown>) => void
  showErrors: (errors: unknown[]) => void
  formClassName?: string
  formStyle?: React.CSSProperties
}

/**
 * DevTools 插件实例（每个 SceneForm 独立，避免切换 UI 时旧实例注销新表单）
 * Scene Form：负责编排该能力的主流程。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Scene Form 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function SceneForm({
  config,
  schema,
  mode,
  extraPlugins,
  showResult,
  showErrors,
  formClassName,
  formStyle,
}: SceneFormProps): React.ReactElement {
  const devTools = useMemo(() => devToolsPlugin(), [])

  useEffect(() => {
    showErrors([])
  }, [mode, showErrors])

  const handleReset = useCallback(() => {
    showErrors([])
  }, [showErrors])

  return (
    <ConfigForm
      schema={schema}
      pattern={mode}
      initialValues={config.initialValues}
      effects={config.effects}
      plugins={[...(config.plugins ?? []), ...(extraPlugins ?? []), devTools]}
      className={formClassName}
      style={formStyle}
      onSubmit={showResult}
      onSubmitFailed={errors => showErrors(errors)}
      onReset={handleReset}
    >
    </ConfigForm>
  )
}

export const SceneRenderer = observer(({
  config,
  title,
  description,
  extraPlugins,
  headerExtra,
  style,
  StatusTabs: StatusTabsComponent,
}: SceneRendererProps): React.ReactElement => {
  const variants = config.schemaVariants
  const layout = config.layout ?? {}
  const isFullscreenScene = layout.mode === 'fullscreen'
  const showHeader = !layout.hideHeader
  const showDescription = !layout.hideDescription
  const showHeaderExtra = !layout.hideHeaderExtra
  const showVariants = !layout.hideVariants && Boolean(variants)
  const showStatusTabs = !layout.hideStatusTabs
  const [variantValue, setVariantValue] = useState(variants?.defaultValue ?? '')

  /** 当前使用的 schema（有变体时动态生成，否则使用静态 schema） */
  const currentSchema = useMemo<ISchema>(() => {
    return resolveSceneSchema(config, variantValue)
  }, [config, variantValue])

  const handleResult = useCallback(() => {}, [])
  const handleErrors = useCallback(() => {}, [])
  const formClassName = isFullscreenScene ? 'cf-playground-fullscreen-form' : undefined
  const formStyle = isFullscreenScene
    ? { flex: 1, minHeight: 0, height: '100%', display: 'flex', flexDirection: 'column' }
    : undefined

  return (
    <div style={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', ...style }}>
      {showHeader && <h2>{title ?? config.title}</h2>}
      {showDescription && (
        <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>
          {description ?? config.description}
        </p>
      )}

      {showHeaderExtra ? headerExtra : null}

      {/* Schema 变体切换器（如布局切换） */}
      {showVariants && (
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

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {showStatusTabs
          ? (
              <StatusTabsComponent>
                {({ mode, showResult, showErrors }) => (
                  <div data-configform-print-root="true" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                    <SceneForm
                      config={config}
                      schema={currentSchema}
                      mode={mode}
                      extraPlugins={extraPlugins}
                      showResult={showResult}
                      showErrors={showErrors}
                      formClassName={formClassName}
                      formStyle={formStyle}
                    />
                  </div>
                )}
              </StatusTabsComponent>
            )
          : (
              <div data-configform-print-root="true" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                <SceneForm
                  config={config}
                  schema={currentSchema}
                  mode="edit"
                  extraPlugins={extraPlugins}
                  showResult={handleResult}
                  showErrors={handleErrors}
                  formClassName={formClassName}
                  formStyle={formStyle}
                />
              </div>
            )}
      </div>
    </div>
  )
})
