/**
 * React Playground 入口
 *
 * 从 @playground/shared 动态加载场景配置，通过 SceneRenderer 渲染。
 */
import type { SceneConfig } from '@playground/shared'
import { getSceneGroups, sceneRegistry } from '@playground/shared'
import { setupAntd } from '@moluoxixi/ui-antd'
import { registerComponent, registerDecorator } from '@moluoxixi/react'
import React, { useCallback, useEffect, useState } from 'react'
import { SceneRenderer } from './components/SceneRenderer'
import {
  CardDecorator,
  CodeEditor,
  ColorPicker,
  CronEditor,
  IconSelector,
  InlineDecorator,
  JsonEditor,
  MarkdownEditor,
  RichTextEditor,
  SignaturePad,
} from './components/custom'

/* 注册 Ant Design 基础组件 */
setupAntd()

/* 注册 playground 自定义组件（演示自定义组件能力） */
registerComponent('ColorPicker', ColorPicker, { defaultDecorator: 'FormItem' })
registerComponent('CodeEditor', CodeEditor, { defaultDecorator: 'FormItem' })
registerComponent('JsonEditor', JsonEditor, { defaultDecorator: 'FormItem' })
registerComponent('CronEditor', CronEditor, { defaultDecorator: 'FormItem' })
registerComponent('SignaturePad', SignaturePad, { defaultDecorator: 'FormItem' })
registerComponent('MarkdownEditor', MarkdownEditor, { defaultDecorator: 'FormItem' })
registerComponent('RichTextEditor', RichTextEditor, { defaultDecorator: 'FormItem' })
registerComponent('IconSelector', IconSelector, { defaultDecorator: 'FormItem' })

/* 注册自定义装饰器（演示自定义 decorator 替代默认 FormItem） */
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
    </div>
  )
}
