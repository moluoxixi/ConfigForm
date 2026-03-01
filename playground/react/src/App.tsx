import type { FormPlugin } from '@moluoxixi/core'
import type { DevToolsPluginAPI } from '@moluoxixi/plugin-devtools'
/**
 * React Playground 入口
 *
 * 从 @playground/shared 动态加载场景配置，通过 SceneRenderer 渲染。
 */
import type { SceneConfig } from '@playground/shared'
import { DevToolsPanel } from '@moluoxixi/plugin-devtools-react'
import { setupLowerCodeDesigner } from '@moluoxixi/plugin-lower-code-react'
import { registerComponent, registerDecorator } from '@moluoxixi/react'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
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
import { useI18nFeature } from './examples/11-misc/useI18nFeature'
import { usePrintExportFeature } from './examples/11-misc/usePrintExportFeature'

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
setupLowerCodeDesigner()

/* 注册自定义装饰器 */
registerDecorator('CardDecorator', CardDecorator)
registerDecorator('InlineDecorator', InlineDecorator)

/**
 * scene Groups：定义该模块复用的常量配置。
 * 所属模块：`playground/react/src/App.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const sceneGroups = getSceneGroups()
/**
 * total Scenes：定义该模块复用的常量配置。
 * 所属模块：`playground/react/src/App.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const totalScenes = sceneGroups.reduce((sum, g) => sum + g.items.length, 0)

/**
 * App：封装该模块的核心渲染与交互逻辑。
 * 所属模块：`playground/react/src/App.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
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

  const i18nFeature = useI18nFeature(sceneConfig)
  const printExportFeature = usePrintExportFeature(currentDemo)

  const scenePlugins = useMemo<FormPlugin[]>(() => {
    const plugins: FormPlugin[] = []
    if (i18nFeature.plugin)
      plugins.push(i18nFeature.plugin)
    if (printExportFeature.plugins?.length)
      plugins.push(...printExportFeature.plugins)
    return plugins
  }, [i18nFeature.plugin, printExportFeature.plugins])

  const sceneHeaderExtra = useMemo(() => {
    if (!i18nFeature.headerExtra)
      return undefined
    return (
      <>
        {i18nFeature.headerExtra}
      </>
    )
  }, [i18nFeature.headerExtra])

  const isFullScreenScene = sceneConfig?.layout?.mode === 'fullscreen'

  return (
    <div style={{ width: '100vw', margin: 0, padding: 16, fontFamily: 'system-ui, sans-serif', height: '100vh', minHeight: 0, minWidth: 0, flex: '1 1 auto', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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

      <div style={{ display: 'flex', gap: 16, minWidth: 0, flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* 左侧导航 */}
        <div style={{ width: 280, flexShrink: 0, border: '1px solid #eee', borderRadius: 8, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', padding: 8 }}>
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
        <div style={{ flex: 1, minWidth: 0, minHeight: 0, border: '1px solid #eee', borderRadius: 8, padding: isFullScreenScene ? 0 : 24, background: '#fff', display: 'flex', flexDirection: 'column', overflow: isFullScreenScene ? 'hidden' : 'auto' }}>
          {sceneConfig
            ? (
                <SceneRenderer
                  key={currentDemo}
                  config={sceneConfig}
                  title={i18nFeature.title}
                  description={i18nFeature.description}
                  extraPlugins={scenePlugins}
                  headerExtra={sceneHeaderExtra}
                  style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
                  StatusTabs={StatusTabs}
                />
              )
            : (
                <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#999', padding: 40 }}>
                  {loading ? '加载中...' : '请选择场景'}
                </div>
              )}
        </div>
      </div>

      {/* DevTools 浮动面板 — 从全局 Hook 读取 API */}
      <DevToolsFloating />
    </div>
  )
}

/**
 * 确保全局 Hook 存在（与 plugin 中的 ensureGlobalHook 逻辑一致）
 * @returns} 返回对象结构，其字段布局遵循当前模块约定。
 */
function getOrCreateHook(): { forms: Map<string, DevToolsPluginAPI>, onChange: (fn: (forms: Map<string, DevToolsPluginAPI>) => void) => () => void } {
  const g = window as unknown as Record<string, unknown>
  if (!g.__CONFIGFORM_DEVTOOLS_HOOK__) {
    const listeners = new Set<(forms: Map<string, DevToolsPluginAPI>) => void>()
    g.__CONFIGFORM_DEVTOOLS_HOOK__ = {
      forms: new Map(),
      /**
       * register：封装该模块的核心渲染与交互逻辑。
       * 所属模块：`playground/react/src/App.tsx`。
       * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
       * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
       * @param id 参数 `id`用于提供唯一标识，确保操作可以精确命中对象。
       * @param api 参数 `api`用于提供当前函数执行所需的输入信息。
       */
      register(id: string, api: DevToolsPluginAPI) {
        const hook = g.__CONFIGFORM_DEVTOOLS_HOOK__ as { forms: Map<string, DevToolsPluginAPI> }
        hook.forms.set(id, api)
        listeners.forEach(fn => fn(hook.forms))
      },
      /**
       * unregister：封装该模块的核心渲染与交互逻辑。
       * 所属模块：`playground/react/src/App.tsx`。
       * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
       * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
       * @param id 参数 `id`用于提供唯一标识，确保操作可以精确命中对象。
       */
      unregister(id: string) {
        const hook = g.__CONFIGFORM_DEVTOOLS_HOOK__ as { forms: Map<string, DevToolsPluginAPI> }
        hook.forms.delete(id)
        listeners.forEach(fn => fn(hook.forms))
      },
      /**
       * on Change：封装该模块的核心渲染与交互逻辑。
       * 所属模块：`playground/react/src/App.tsx`。
       * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
       * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
       * @param fn 参数 `fn`用于提供当前函数执行所需的输入信息。
       * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
       */
      onChange(fn: (forms: Map<string, DevToolsPluginAPI>) => void) {
        listeners.add(fn)
        return () => listeners.delete(fn)
      },
    }
  }
  return g.__CONFIGFORM_DEVTOOLS_HOOK__ as ReturnType<typeof getOrCreateHook>
}

/**
 * DevTools 浮动面板包装器：通过全局 Hook 的 onChange 事件驱动更新（零轮询）
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
function DevToolsFloating(): React.ReactElement | null {
  const [api, setApi] = useState<DevToolsPluginAPI | null>(null)

  useEffect(() => {
    const hook = getOrCreateHook()
    let disposed = false
    const update = (forms: Map<string, DevToolsPluginAPI>): void => {
      const nextApi = forms.size > 0 ? forms.values().next().value! : null
      Promise.resolve().then(() => {
        if (!disposed)
          setApi(nextApi)
      })
      }
    update(hook.forms)
    const unsubscribe = hook.onChange(update)
    return () => {
      disposed = true
      unsubscribe()
    }
  }, [])

  if (!api)
    return null
  return <DevToolsPanel api={api} />
}
