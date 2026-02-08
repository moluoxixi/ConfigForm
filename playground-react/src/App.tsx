/**
 * React Playground 入口
 *
 * 56 个场景，Config（Schema 驱动）/ Field（自定义渲染）两种模式
 * 使用 import.meta.glob 自动扫描 antd/ 下所有示例
 */
import React, { lazy, Suspense, useMemo, useState } from 'react'

/* ======================== 场景分组（Config / Field 共用，key 直接用文件夹名） ======================== */

const sceneGroups = [
  {
    title: '基础场景',
    items: [
      { key: 'BasicForm', label: '1. 基础表单' },
      { key: 'LayoutForm', label: '2. 表单布局' },
      { key: 'BasicValidationForm', label: '3. 必填与格式验证' },
      { key: 'DefaultValueForm', label: '4. 默认值' },
    ],
  },
  {
    title: '联动场景',
    items: [
      { key: 'VisibilityLinkageForm', label: '5. 显隐联动' },
      { key: 'ValueLinkageForm', label: '6. 值联动' },
      { key: 'PropertyLinkageForm', label: '7. 属性联动' },
      { key: 'CascadeSelectForm', label: '8. 级联选择' },
      { key: 'ComputedFieldForm', label: '9. 计算字段' },
      { key: 'ConditionalRequiredForm', label: '10. 条件必填' },
    ],
  },
  {
    title: '验证场景',
    items: [
      { key: 'CustomValidationForm', label: '11. 自定义验证' },
      { key: 'AsyncValidationForm', label: '12. 异步验证' },
      { key: 'CrossFieldValidationForm', label: '13. 跨字段验证' },
    ],
  },
  {
    title: '复杂数据',
    items: [
      { key: 'NestedObjectForm', label: '14. 嵌套对象' },
      { key: 'ArrayFieldForm', label: '15. 数组字段' },
      { key: 'EditableTableForm', label: '16. 可编辑表格' },
      { key: 'ObjectArrayNestedForm', label: '17. 对象数组嵌套' },
    ],
  },
  {
    title: '数据源',
    items: [
      { key: 'AsyncOptionsForm', label: '18. 异步选项' },
      { key: 'DependentDataSourceForm', label: '19. 依赖数据源' },
      { key: 'PaginatedSearchForm', label: '20. 分页搜索' },
    ],
  },
  {
    title: '布局分组',
    items: [
      { key: 'StepForm', label: '21. 分步表单' },
      { key: 'TabGroupForm', label: '22. 标签页分组' },
      { key: 'CollapseGroupForm', label: '23. 折叠面板' },
      { key: 'CardGroupForm', label: '24. 卡片分组' },
    ],
  },
  {
    title: '动态表单',
    items: [
      { key: 'DynamicFieldForm', label: '25. 动态增删字段' },
      { key: 'DynamicSchemaForm', label: '26. 动态 Schema' },
      { key: 'TemplateReuseForm', label: '27. 模板复用' },
    ],
  },
  {
    title: '复杂组件',
    items: [
      { key: 'RichTextForm', label: '28. 富文本编辑器' },
      { key: 'FileUploadForm', label: '29. 文件上传' },
      { key: 'MapPickerForm', label: '30. 地图选点' },
      { key: 'ColorPickerForm', label: '31. 颜色选择器' },
      { key: 'CodeEditorForm', label: '32. 代码编辑器' },
      { key: 'JsonEditorForm', label: '33. JSON 编辑器' },
      { key: 'SignaturePadForm', label: '34. 手写签名' },
      { key: 'TransferForm', label: '35. 穿梭框' },
      { key: 'TreeSelectForm', label: '36. 树形选择' },
      { key: 'MarkdownEditorForm', label: '37. Markdown' },
      { key: 'IconSelectorForm', label: '38. 图标选择器' },
      { key: 'CronEditorForm', label: '39. Cron 编辑器' },
    ],
  },
  {
    title: '表单状态',
    items: [
      { key: 'DataTransformForm', label: '40. 数据转换' },
      { key: 'MultiFormForm', label: '41. 多表单协作' },
      { key: 'FormSnapshotForm', label: '42. 表单快照' },
      { key: 'UndoRedoForm', label: '43. 撤销重做' },
      { key: 'LifecycleForm', label: '44. 生命周期' },
    ],
  },
  {
    title: '其他能力',
    items: [
      { key: 'PermissionForm', label: '45. 字段权限' },
      { key: 'I18nForm', label: '46. 国际化' },
      { key: 'FormDiffForm', label: '47. 表单比对' },
      { key: 'PrintExportForm', label: '48. 打印导出' },
    ],
  },
  {
    title: '扩展场景',
    items: [
      { key: 'GridLayoutForm', label: '49. Grid 栅格布局' },
      { key: 'EffectsForm', label: '50. Effects 副作用' },
      { key: 'LargeFormPerf', label: '51. 大表单性能' },
      { key: 'CustomDecoratorForm', label: '52. 自定义装饰器' },
      { key: 'SchemaExpressionForm', label: '53. Schema 表达式' },
      { key: 'OneOfSchemaForm', label: '54. oneOf 联合 Schema' },
      { key: 'SSRCompatForm', label: '55. SSR 兼容性' },
      { key: 'VirtualScrollForm', label: '56. 虚拟滚动' },
    ],
  },
]

const totalScenes = sceneGroups.reduce((sum, g) => sum + g.items.length, 0)

/* ======================== import.meta.glob 自动扫描 ======================== */

const configModules = import.meta.glob('./antd/*/config.tsx') as Record<string, () => Promise<any>>
const fieldModules = import.meta.glob('./antd/*/field.tsx') as Record<string, () => Promise<any>>

/** 从 glob 路径中提取文件夹名 */
function extractName(path: string): string {
  return path.match(/\/antd\/(\w+)\/(config|field)\.tsx$/)?.[1] ?? ''
}

/** 构建 { FolderName: loader } 映射 */
function buildLoaderMap(glob: Record<string, () => Promise<any>>): Record<string, () => Promise<any>> {
  const map: Record<string, () => Promise<any>> = {}
  for (const [path, loader] of Object.entries(glob)) {
    const name = extractName(path)
    if (name) map[name] = loader
  }
  return map
}

const configLoaders = buildLoaderMap(configModules)
const fieldLoaders = buildLoaderMap(fieldModules)

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
        基于 MobX 的响应式配置化表单 · {totalScenes} 个场景 · Ant Design · Config（Schema 驱动） / Field（自定义渲染）
      </p>

      {/* UI 库标识 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, padding: '8px 16px', background: '#f5f5f5', borderRadius: 8 }}>
        <span style={{ lineHeight: '32px', fontWeight: 600, color: '#333', fontSize: 13 }}>UI 组件库：</span>
        <span style={{ padding: '4px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600, background: '#1677ff', color: '#fff', border: '2px solid #1677ff' }}>
          Ant Design
        </span>
      </div>

      {/* 主体：左侧导航 + 右侧内容 */}
      <div style={{ display: 'flex', gap: 16 }}>
        {/* 左侧导航 */}
        <div style={{ width: 280, flexShrink: 0, border: '1px solid #eee', borderRadius: 8, overflow: 'hidden' }}>
          {/* Config / Field Tab 切换 */}
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

          {/* 场景列表 */}
          <div style={{ maxHeight: 'calc(100vh - 220px)', overflow: 'auto', padding: 8 }}>
            {sceneGroups.map(group => (
              <div key={group.title} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#999', padding: '2px 4px' }}>{group.title}</div>
                {group.items.map(item => (
                  <button
                    key={item.key}
                    onClick={() => setCurrentDemo(item.key)}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left', padding: '3px 8px',
                      border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12,
                      background: currentDemo === item.key ? '#1677ff' : 'transparent',
                      color: currentDemo === item.key ? '#fff' : '#333',
                      fontWeight: currentDemo === item.key ? 600 : 400, marginBottom: 1,
                    }}
                  >
                    {item.label}
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
