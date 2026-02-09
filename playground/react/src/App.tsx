/**
 * React Playground 入口
 *
 * 从 @playground/shared 动态加载场景配置，通过 SceneRenderer 渲染。
 */
import type { SceneConfig } from '@playground/shared'
import type { DevToolsPluginAPI } from '@moluoxixi/plugin-devtools'
import { getSceneGroups, sceneRegistry } from '@playground/shared'
import { DevToolsPanel } from '@moluoxixi/react'
import { setupAntd } from '@moluoxixi/ui-antd'
import { registerComponent, registerDecorator } from '@moluoxixi/react'
import React, { useCallback, useEffect, useState } from 'react'
import { SceneRenderer } from './components/SceneRenderer'
import {
  CardDecorator,
  CodeEditor,
  ColorPicker,
  CronEditor,
  InlineDecorator,
  PreviewColorPicker,
  SignaturePad,
} from './components/custom'

/* 注册 Ant Design 基础组件 */
setupAntd()

/*
 * 注册自定义组件 — 覆盖所有注册模式：
 *
 * 1. 有 defaultDecorator（被 FormItem 包裹）
 * 2. 有 readPrettyComponent（阅读态替换为不同组件）
 * 3. 无 defaultDecorator（裸渲染，不被 FormItem 包裹）
 */
registerComponent('ColorPicker', ColorPicker, {
  defaultDecorator: 'FormItem',
  readPrettyComponent: PreviewColorPicker,
})
registerComponent('CronEditor', CronEditor, { defaultDecorator: 'FormItem' })
registerComponent('SignaturePad', SignaturePad)       /* 无装饰器，裸渲染 */
registerComponent('CodeEditor', CodeEditor)            /* 无装饰器，裸渲染 */

/* 注册自定义装饰器 */
registerDecorator('CardDecorator', CardDecorator)
registerDecorator('InlineDecorator', InlineDecorator)

const sceneGroups = getSceneGroups()
const totalScenes = sceneGroups.reduce((sum, g) => sum + g.items.length, 0)

export function App(): React.ReactElement {
  const [currentDemo, setCurrentDemo] = useState('BasicForm')
  const [sceneConfig, setSceneConfig] = useState<SceneConfig | null>(null)
  const [loading, setLoading] = useState(false)

  const loadScene = useCallback(async (name: string) => {
    const entry = sceneRegistry[name]
    if (!entry) { setSceneConfig(null); return }
    setSceneConfig(null)
    setLoading(true)
    try { setSceneConfig((await entry.loader()).default) }
    catch (e) { console.error(`加载场景 ${name} 失败:`, e); setSceneConfig(null) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadScene(currentDemo) }, [currentDemo, loadScene])

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginBottom: 4 }}>ConfigForm - React Playground</h1>
      <p style={{ color: '#666', marginBottom: 16, fontSize: 13 }}>
        基于 MobX 的响应式配置化表单 · {totalScenes} 个场景 · Ant Design · ConfigForm + SchemaField 递归渲染
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, padding: '8px 16px', background: '#f5f5f5', borderRadius: 8 }}>
        <span style={{ lineHeight: '32px', fontWeight: 600, color: '#333', fontSize: 13 }}>UI 组件库：</span>
        <span style={{ padding: '4px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600, background: '#1677ff', color: '#fff', border: '2px solid #1677ff' }}>
          Ant Design
        </span>
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        {/* 左侧导航 */}
        <div style={{ width: 280, flexShrink: 0, border: '1px solid #eee', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ maxHeight: 'calc(100vh - 180px)', overflow: 'auto', padding: 8 }}>
            {sceneGroups.map(group => (
              <div key={group.key} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#999', padding: '2px 4px' }}>{group.label}</div>
                {group.items.map(name => (
                  <button key={name} onClick={() => setCurrentDemo(name)}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '3px 8px',
                      border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12,
                      background: currentDemo === name ? '#1677ff' : 'transparent',
                      color: currentDemo === name ? '#fff' : '#333',
                      fontWeight: currentDemo === name ? 600 : 400, marginBottom: 1 }}>
                    {name}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* 右侧内容区 */}
        <div style={{ flex: 1, border: '1px solid #eee', borderRadius: 8, padding: 24, background: '#fff', minHeight: 400 }}>
          {sceneConfig
            ? <SceneRenderer key={currentDemo} config={sceneConfig} />
            : <div style={{ textAlign: 'center', color: '#999', padding: 40 }}>{loading ? '加载中...' : '请选择场景'}</div>}
        </div>
      </div>

      {/* DevTools 浮动面板 — 从全局 Hook 读取 API */}
      <DevToolsFloating />
    </div>
  )
}

/** DevTools 浮动面板包装器：从 window.__CONFIGFORM_DEVTOOLS_HOOK__ 获取 API */
function DevToolsFloating(): React.ReactElement | null {
  const [api, setApi] = useState<DevToolsPluginAPI | null>(null)

  useEffect(() => {
    const check = (): void => {
      const hook = (window as unknown as Record<string, unknown>).__CONFIGFORM_DEVTOOLS_HOOK__ as
        { forms: Map<string, DevToolsPluginAPI> } | undefined
      if (hook?.forms.size) {
        setApi(hook.forms.values().next().value!)
      }
    }
    check()
    const timer = setInterval(check, 500)
    return () => clearInterval(timer)
  }, [])

  if (!api) return null
  return <DevToolsPanel api={api} />
}
