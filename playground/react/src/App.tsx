import type { DevToolsPluginAPI } from '@moluoxixi/plugin-devtools'
import type { FormPlugin } from '@moluoxixi/core'
/**
 * React Playground 入口
 *
 * 从 @playground/shared 动态加载场景配置，通过 SceneRenderer 渲染。
 */
import type { SceneConfig } from '@playground/shared'
import { DevToolsPanel } from '@moluoxixi/plugin-devtools-react'
import { createReactMessageI18nRuntime } from '@moluoxixi/plugin-i18n-react'
import { registerComponent, registerDecorator } from '@moluoxixi/react'
import { setupAntd } from '@moluoxixi/ui-antd'
import { getSceneGroups, sceneRegistry } from '@playground/shared'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CardDecorator,
  CodeEditor,
  ColorPicker,
  CronEditor,
  InlineDecorator,
  PreviewColorPicker,
  SignaturePad,
} from './components/custom'
import { SceneRenderer } from './components/SceneRenderer'

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
registerComponent('SignaturePad', SignaturePad) /* 无装饰器，裸渲染 */
registerComponent('CodeEditor', CodeEditor) /* 无装饰器，裸渲染 */

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
    if (!entry) {
      setSceneConfig(null)
      return
    }
    setSceneConfig(null)
    setLoading(true)
    try {
      setSceneConfig((await entry.loader()).default)
    }
    catch (e) {
      console.error(`加载场景 ${name} 失败:`, e)
      setSceneConfig(null)
    }
    finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadScene(currentDemo)
  }, [currentDemo, loadScene])

  const i18nConfig = sceneConfig?.i18n
  const i18nRuntime = useMemo(() => {
    if (!i18nConfig)
      return undefined
    return createReactMessageI18nRuntime({
      messages: i18nConfig.messages,
      locale: i18nConfig.defaultLocale,
    })
  }, [i18nConfig])
  const [locale, setLocale] = useState('')

  useEffect(() => {
    if (!i18nRuntime) {
      setLocale('')
      return
    }
    setLocale(i18nRuntime.getLocale())
    return i18nRuntime.subscribeLocale(setLocale)
  }, [i18nRuntime])

  const localeOptions = useMemo(() => {
    if (!i18nConfig)
      return []
    if (sceneConfig?.localeOptions && sceneConfig.localeOptions.length > 0)
      return sceneConfig.localeOptions
    return Object.keys(i18nConfig.messages).map(key => ({ label: key, value: key }))
  }, [i18nConfig, sceneConfig?.localeOptions])

  const translateText = useCallback((value: string): string => {
    if (!i18nRuntime)
      return value
    if (!value.startsWith('$t:'))
      return value
    return i18nRuntime.t(value.slice(3))
  }, [i18nRuntime, locale])

  const sceneTitle = useMemo(() => {
    if (!sceneConfig)
      return ''
    return translateText(sceneConfig.title)
  }, [sceneConfig, translateText])
  const sceneDescription = useMemo(() => {
    if (!sceneConfig)
      return ''
    return translateText(sceneConfig.description)
  }, [sceneConfig, translateText])

  const scenePlugins = useMemo<FormPlugin[]>(() => {
    return i18nRuntime ? [i18nRuntime.plugin] : []
  }, [i18nRuntime])
  const localeSwitcher = i18nRuntime && localeOptions.length > 0
    ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#555' }}>
            语言：
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            {localeOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => void i18nRuntime.setLocale(opt.value)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                  border: locale === opt.value ? '2px solid #1677ff' : '1px solid #d9d9d9',
                  background: locale === opt.value ? '#e6f4ff' : '#fff',
                  color: locale === opt.value ? '#1677ff' : '#333',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )
    : undefined

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginBottom: 4 }}>ConfigForm - React Playground</h1>
      <p style={{ color: '#666', marginBottom: 16, fontSize: 13 }}>
        基于 MobX 的响应式配置化表单 ·
        {' '}
        {totalScenes}
        {' '}
        个场景 · Ant Design · ConfigForm + SchemaField 递归渲染
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
                  <button
                    key={name}
                    onClick={() => setCurrentDemo(name)}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '3px 8px', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, background: currentDemo === name ? '#1677ff' : 'transparent', color: currentDemo === name ? '#fff' : '#333', fontWeight: currentDemo === name ? 600 : 400, marginBottom: 1 }}
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
          {sceneConfig
            ? (
                <SceneRenderer
                  key={currentDemo}
                  config={sceneConfig}
                  title={sceneTitle}
                  description={sceneDescription}
                  extraPlugins={scenePlugins}
                  headerExtra={localeSwitcher}
                />
              )
            : <div style={{ textAlign: 'center', color: '#999', padding: 40 }}>{loading ? '加载中...' : '请选择场景'}</div>}
        </div>
      </div>

      {/* DevTools 浮动面板 — 从全局 Hook 读取 API */}
      <DevToolsFloating />
    </div>
  )
}

/** 确保全局 Hook 存在（与 plugin 中的 ensureGlobalHook 逻辑一致） */
function getOrCreateHook(): { forms: Map<string, DevToolsPluginAPI>, onChange: (fn: (forms: Map<string, DevToolsPluginAPI>) => void) => () => void } {
  const g = window as unknown as Record<string, unknown>
  if (!g.__CONFIGFORM_DEVTOOLS_HOOK__) {
    const listeners = new Set<(forms: Map<string, DevToolsPluginAPI>) => void>()
    g.__CONFIGFORM_DEVTOOLS_HOOK__ = {
      forms: new Map(),
      register(id: string, api: DevToolsPluginAPI) {
        const hook = g.__CONFIGFORM_DEVTOOLS_HOOK__ as { forms: Map<string, DevToolsPluginAPI> }
        hook.forms.set(id, api)
        listeners.forEach(fn => fn(hook.forms))
      },
      unregister(id: string) {
        const hook = g.__CONFIGFORM_DEVTOOLS_HOOK__ as { forms: Map<string, DevToolsPluginAPI> }
        hook.forms.delete(id)
        listeners.forEach(fn => fn(hook.forms))
      },
      onChange(fn: (forms: Map<string, DevToolsPluginAPI>) => void) {
        listeners.add(fn)
        return () => listeners.delete(fn)
      },
    }
  }
  return g.__CONFIGFORM_DEVTOOLS_HOOK__ as ReturnType<typeof getOrCreateHook>
}

/** DevTools 浮动面板包装器：通过全局 Hook 的 onChange 事件驱动更新（零轮询） */
function DevToolsFloating(): React.ReactElement | null {
  const [api, setApi] = useState<DevToolsPluginAPI | null>(null)

  useEffect(() => {
    const hook = getOrCreateHook()
    const update = (forms: Map<string, DevToolsPluginAPI>): void => {
      setApi(forms.size > 0 ? forms.values().next().value! : null)
    }
    update(hook.forms)
    return hook.onChange(update)
  }, [])

  if (!api)
    return null
  return <DevToolsPanel api={api} />
}
