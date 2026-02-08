/**
 * React Playground 入口
 *
 * 使用 import.meta.glob 自动扫描 antd/{group}/{demo}/config|field.tsx
 * 无需硬编码示例列表，新增示例只需创建文件夹即可自动出现
 */
import React, { lazy, Suspense, useMemo, useState } from 'react'

/* ======================== 分组标题映射 ======================== */

const GROUP_LABELS: Record<string, string> = {
  '01-basic': '基础场景',
  '02-linkage': '联动场景',
  '03-validation': '验证场景',
  '04-complex-data': '复杂数据',
  '05-datasource': '数据源',
  '06-layout': '布局分组',
  '07-dynamic': '动态表单',
  '08-components': '复杂组件',
  '09-state': '表单状态',
  '10-misc': '其他能力',
  '11-advanced': '扩展场景',
}

/* ======================== import.meta.glob 自动扫描 ======================== */

/**
 * 两层 glob：antd/{group}/{demo}/config|field.tsx
 * 路径示例：./antd/01-basic/BasicForm/config.tsx
 */
const configModules = import.meta.glob('./antd/*/*/config.tsx') as Record<string, () => Promise<any>>
const fieldModules = import.meta.glob('./antd/*/*/field.tsx') as Record<string, () => Promise<any>>

/** 从 glob 路径解析分组和示例名 */
function parseGlobPath(path: string): { group: string, name: string } | null {
  const m = path.match(/\/(\d{2}-[\w-]+)\/([\w]+)\/(config|field)\.tsx$/)
  return m ? { group: m[1], name: m[2] } : null
}

/** 构建 { DemoName: loader } 映射 */
function buildLoaderMap(glob: Record<string, () => Promise<any>>): Record<string, () => Promise<any>> {
  const map: Record<string, () => Promise<any>> = {}
  for (const [path, loader] of Object.entries(glob)) {
    const parsed = parseGlobPath(path)
    if (parsed) map[parsed.name] = loader
  }
  return map
}

/** 从 glob 结果自动生成分组列表 */
function buildSceneGroups(glob: Record<string, () => Promise<any>>): Array<{ key: string, label: string, items: string[] }> {
  const groupMap = new Map<string, Set<string>>()

  for (const path of Object.keys(glob)) {
    const parsed = parseGlobPath(path)
    if (parsed) {
      if (!groupMap.has(parsed.group)) groupMap.set(parsed.group, new Set())
      groupMap.get(parsed.group)!.add(parsed.name)
    }
  }

  return Array.from(groupMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, names]) => ({
      key,
      label: GROUP_LABELS[key] ?? key,
      items: Array.from(names).sort(),
    }))
}

const configLoaders = buildLoaderMap(configModules)
const fieldLoaders = buildLoaderMap(fieldModules)
const sceneGroups = buildSceneGroups({ ...configModules, ...fieldModules })
const totalScenes = sceneGroups.reduce((sum, g) => sum + g.items.length, 0)

function getComponent(key: string, mode: 'config' | 'field'): React.LazyExoticComponent<React.ComponentType> | null {
  const loaders = mode === 'config' ? configLoaders : fieldLoaders
  const loader = loaders[key]
  if (!loader) return null
  return lazy(() => loader().then((m: any) => ({ default: m[key] ?? m.default ?? Object.values(m)[0] })))
}

/* ======================== 主组件 ======================== */

export function App(): React.ReactElement {
  const [currentDemo, setCurrentDemo] = useState('BasicForm')
  const [navMode, setNavMode] = useState<'config' | 'field'>('config')
  const CurrentComponent = useMemo(() => getComponent(currentDemo, navMode), [currentDemo, navMode])

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

          {/* 场景列表（从 glob 自动生成） */}
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
          <Suspense fallback={<div style={{ textAlign: 'center', color: '#999', padding: 40 }}>加载中...</div>}>
            {CurrentComponent ? <CurrentComponent key={`${navMode}-${currentDemo}`} /> : <div style={{ textAlign: 'center', color: '#999', padding: 40 }}>请选择场景</div>}
          </Suspense>
        </div>
      </div>
    </div>
  )
}
