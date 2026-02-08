/**
 * React Playground 入口
 *
 * 从 playground-shared 动态加载场景配置，通用渲染 Config/Field 模式。
 * 无需为每个场景编写独立的 config.tsx / field.tsx 文件。
 */
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/core'
import type { SceneConfig, FieldConfig } from '@moluoxixi/playground-shared'
import { getSceneGroups, sceneRegistry } from '@moluoxixi/playground-shared'
import { ConfigForm, FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

setupAntd()

const sceneGroups = getSceneGroups()
const totalScenes = sceneGroups.reduce((sum, g) => sum + g.items.length, 0)

/** 工具：将 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

/* ======================== 通用 Field 渲染器 ======================== */

interface FieldSceneProps {
  fields: FieldConfig[]
  initialValues: Record<string, unknown>
  labelWidth?: string
}

const FieldScene = observer(({ fields, initialValues, labelWidth = '120px' }: FieldSceneProps): React.ReactElement => {
  const form = useCreateForm({ labelWidth, initialValues: { ...initialValues } })

  return (
    <StatusTabs>
      {({ mode, showResult, showErrors }) => {
        form.pattern = mode
        return (
          <FormProvider form={form}>
            {fields.map(f => (
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

/* ======================== 主组件 ======================== */

export function App(): React.ReactElement {
  const [currentDemo, setCurrentDemo] = useState('BasicForm')
  const [navMode, setNavMode] = useState<'config' | 'field'>('config')
  const [sceneConfig, setSceneConfig] = useState<SceneConfig | null>(null)
  const [loading, setLoading] = useState(false)

  /** 加载场景配置 */
  const loadScene = useCallback(async (name: string) => {
    const entry = sceneRegistry[name]
    if (!entry) { setSceneConfig(null); return }
    setLoading(true)
    try {
      const mod = await entry.loader()
      setSceneConfig(mod.default)
    }
    catch (e) {
      console.error(`加载场景 ${name} 失败:`, e)
      setSceneConfig(null)
    }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadScene(currentDemo) }, [currentDemo, loadScene])

  const labelWidth = useMemo(() =>
    (sceneConfig?.schema.decoratorProps?.labelWidth as string) ?? '120px'
  , [sceneConfig])

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginBottom: 4 }}>ConfigForm - React Playground</h1>
      <p style={{ color: '#666', marginBottom: 16, fontSize: 13 }}>
        基于 MobX 的响应式配置化表单 · {totalScenes} 个场景 · Ant Design · Config / Field
      </p>

      {/* UI 库标识 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, padding: '8px 16px', background: '#f5f5f5', borderRadius: 8 }}>
        <span style={{ lineHeight: '32px', fontWeight: 600, color: '#333', fontSize: 13 }}>UI 组件库：</span>
        <span style={{ padding: '4px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600, background: '#1677ff', color: '#fff', border: '2px solid #1677ff' }}>
          Ant Design
        </span>
      </div>

      {/* 主体 */}
      <div style={{ display: 'flex', gap: 16 }}>
        {/* 左侧导航 */}
        <div style={{ width: 280, flexShrink: 0, border: '1px solid #eee', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
            <button
              onClick={() => setNavMode('config')}
              style={{ flex: 1, padding: '10px 0', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none',
                background: navMode === 'config' ? '#1677ff' : '#f5f5f5', color: navMode === 'config' ? '#fff' : '#666' }}
            >
              Config 模式
            </button>
            <button
              onClick={() => setNavMode('field')}
              style={{ flex: 1, padding: '10px 0', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none',
                background: navMode === 'field' ? '#52c41a' : '#f5f5f5', color: navMode === 'field' ? '#fff' : '#666' }}
            >
              Field 模式
            </button>
          </div>

          <div style={{ maxHeight: 'calc(100vh - 220px)', overflow: 'auto', padding: 8 }}>
            {sceneGroups.map(group => (
              <div key={group.key} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#999', padding: '2px 4px' }}>{group.label}</div>
                {group.items.map(name => (
                  <button
                    key={name}
                    onClick={() => setCurrentDemo(name)}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left', padding: '3px 8px',
                      border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12,
                      background: currentDemo === name ? '#1677ff' : 'transparent',
                      color: currentDemo === name ? '#fff' : '#333',
                      fontWeight: currentDemo === name ? 600 : 400, marginBottom: 1,
                    }}
                  >
                    {name}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* 右侧内容区 */}
        <div style={{ flex: 1, border: '1px solid #eee', borderRadius: 8, padding: 24, background: '#fff', minHeight: 400 }}>
          {sceneConfig ? (
            <div key={`${navMode}-${currentDemo}`}>
              <h2>{sceneConfig.title}{navMode === 'field' ? '（Field 版）' : ''}</h2>
              <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>
                {sceneConfig.description}{navMode === 'field' ? ' — FormField + fieldProps 实现' : ''}
              </p>

              {navMode === 'config' ? (
                <StatusTabs>
                  {({ mode, showResult, showErrors }) => (
                    <ConfigForm
                      schema={withMode(sceneConfig.schema, mode)}
                      initialValues={sceneConfig.initialValues}
                      onSubmit={showResult}
                      onSubmitFailed={errors => showErrors(errors)}
                    />
                  )}
                </StatusTabs>
              ) : (
                <FieldScene
                  fields={sceneConfig.fields}
                  initialValues={sceneConfig.initialValues}
                  labelWidth={labelWidth}
                />
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#999', padding: 40 }}>
              {loading ? '加载中...' : '请选择场景'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
