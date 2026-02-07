/**
 * React Playground 入口
 *
 * 48 个场景，Config（Schema 驱动）/ Field（自定义渲染）两种模式
 * 目录结构：antd/XxxForm/config.tsx + field.tsx
 */
import React, { lazy, Suspense, useState } from 'react'

/* ======================== 场景分组（Config / Field 共用） ======================== */

const sceneGroups = [
  {
    title: '基础场景',
    items: [
      { key: 'basic', label: '1. 基础表单' },
      { key: 'layout', label: '2. 表单布局' },
      { key: 'basic-validation', label: '3. 必填与格式验证' },
      { key: 'default-value', label: '4. 默认值' },
    ],
  },
  {
    title: '联动场景',
    items: [
      { key: 'visibility-linkage', label: '5. 显隐联动' },
      { key: 'value-linkage', label: '6. 值联动' },
      { key: 'property-linkage', label: '7. 属性联动' },
      { key: 'cascade-select', label: '8. 级联选择' },
      { key: 'computed-field', label: '9. 计算字段' },
      { key: 'conditional-required', label: '10. 条件必填' },
    ],
  },
  {
    title: '验证场景',
    items: [
      { key: 'custom-validation', label: '11. 自定义验证' },
      { key: 'async-validation', label: '12. 异步验证' },
      { key: 'cross-field-validation', label: '13. 跨字段验证' },
    ],
  },
  {
    title: '复杂数据',
    items: [
      { key: 'nested-object', label: '14. 嵌套对象' },
      { key: 'array-field', label: '15. 数组字段' },
      { key: 'editable-table', label: '16. 可编辑表格' },
      { key: 'object-array-nested', label: '17. 对象数组嵌套' },
    ],
  },
  {
    title: '数据源',
    items: [
      { key: 'async-options', label: '18. 异步选项' },
      { key: 'dependent-datasource', label: '19. 依赖数据源' },
      { key: 'paginated-search', label: '20. 分页搜索' },
    ],
  },
  {
    title: '布局分组',
    items: [
      { key: 'step-form', label: '21. 分步表单' },
      { key: 'tab-group', label: '22. 标签页分组' },
      { key: 'collapse-group', label: '23. 折叠面板' },
      { key: 'card-group', label: '24. 卡片分组' },
    ],
  },
  {
    title: '动态表单',
    items: [
      { key: 'dynamic-field', label: '25. 动态增删字段' },
      { key: 'dynamic-schema', label: '26. 动态 Schema' },
      { key: 'template-reuse', label: '27. 模板复用' },
    ],
  },
  {
    title: '复杂组件',
    items: [
      { key: 'rich-text', label: '28. 富文本编辑器' },
      { key: 'file-upload', label: '29. 文件上传' },
      { key: 'map-picker', label: '30. 地图选点' },
      { key: 'color-picker', label: '31. 颜色选择器' },
      { key: 'code-editor', label: '32. 代码编辑器' },
      { key: 'json-editor', label: '33. JSON 编辑器' },
      { key: 'signature-pad', label: '34. 手写签名' },
      { key: 'transfer', label: '35. 穿梭框' },
      { key: 'tree-select', label: '36. 树形选择' },
      { key: 'markdown-editor', label: '37. Markdown' },
      { key: 'icon-selector', label: '38. 图标选择器' },
      { key: 'cron-editor', label: '39. Cron 编辑器' },
    ],
  },
  {
    title: '表单状态',
    items: [
      { key: 'data-transform', label: '40. 数据转换' },
      { key: 'multi-form', label: '41. 多表单协作' },
      { key: 'form-snapshot', label: '42. 表单快照' },
      { key: 'undo-redo', label: '43. 撤销重做' },
      { key: 'lifecycle', label: '44. 生命周期' },
    ],
  },
  {
    title: '其他能力',
    items: [
      { key: 'permission', label: '45. 字段权限' },
      { key: 'i18n', label: '46. 国际化' },
      { key: 'form-diff', label: '47. 表单比对' },
      { key: 'print-export', label: '48. 打印导出' },
    ],
  },
]

/* ======================== 动态导入 ======================== */

const sceneMap: Record<string, string> = {
  'basic': 'BasicForm',
  'layout': 'LayoutForm',
  'basic-validation': 'BasicValidationForm',
  'default-value': 'DefaultValueForm',
  'visibility-linkage': 'VisibilityLinkageForm',
  'value-linkage': 'ValueLinkageForm',
  'property-linkage': 'PropertyLinkageForm',
  'cascade-select': 'CascadeSelectForm',
  'computed-field': 'ComputedFieldForm',
  'conditional-required': 'ConditionalRequiredForm',
  'custom-validation': 'CustomValidationForm',
  'async-validation': 'AsyncValidationForm',
  'cross-field-validation': 'CrossFieldValidationForm',
  'nested-object': 'NestedObjectForm',
  'array-field': 'ArrayFieldForm',
  'editable-table': 'EditableTableForm',
  'object-array-nested': 'ObjectArrayNestedForm',
  'async-options': 'AsyncOptionsForm',
  'dependent-datasource': 'DependentDataSourceForm',
  'paginated-search': 'PaginatedSearchForm',
  'step-form': 'StepForm',
  'tab-group': 'TabGroupForm',
  'collapse-group': 'CollapseGroupForm',
  'card-group': 'CardGroupForm',
  'dynamic-field': 'DynamicFieldForm',
  'dynamic-schema': 'DynamicSchemaForm',
  'template-reuse': 'TemplateReuseForm',
  'rich-text': 'RichTextForm',
  'file-upload': 'FileUploadForm',
  'map-picker': 'MapPickerForm',
  'color-picker': 'ColorPickerForm',
  'code-editor': 'CodeEditorForm',
  'json-editor': 'JsonEditorForm',
  'signature-pad': 'SignaturePadForm',
  'transfer': 'TransferForm',
  'tree-select': 'TreeSelectForm',
  'markdown-editor': 'MarkdownEditorForm',
  'icon-selector': 'IconSelectorForm',
  'cron-editor': 'CronEditorForm',
  'data-transform': 'DataTransformForm',
  'multi-form': 'MultiFormForm',
  'form-snapshot': 'FormSnapshotForm',
  'undo-redo': 'UndoRedoForm',
  'lifecycle': 'LifecycleForm',
  'permission': 'PermissionForm',
  'i18n': 'I18nForm',
  'form-diff': 'FormDiffForm',
  'print-export': 'PrintExportForm',
}

const configModules = import.meta.glob('./antd/*/config.tsx') as Record<string, () => Promise<any>>
const fieldModules = import.meta.glob('./antd/*/field.tsx') as Record<string, () => Promise<any>>

function getComponent(key: string, mode: 'config' | 'field'): React.LazyExoticComponent<React.ComponentType> | null {
  const folder = sceneMap[key]
  if (!folder)
    return null
  const modules = mode === 'config' ? configModules : fieldModules
  const path = `./antd/${folder}/${mode}.tsx`
  const loader = modules[path]
  if (!loader)
    return null
  return lazy(() => loader().then((m: any) => ({ default: m[folder] ?? m.default ?? Object.values(m)[0] })))
}

/* ======================== 主组件 ======================== */

export function App(): React.ReactElement {
  const [currentDemo, setCurrentDemo] = useState('basic')
  const [navMode, setNavMode] = useState<'config' | 'field'>('config')
  const CurrentComponent = getComponent(currentDemo, navMode)

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginBottom: 4 }}>ConfigForm - React Playground</h1>
      <p style={{ color: '#666', marginBottom: 16, fontSize: 13 }}>
        基于 MobX 的响应式配置化表单 · 48 个场景 · Ant Design · Config（Schema 驱动） / Field（自定义渲染）
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
              style={{
                flex: 1,
                padding: '10px 0',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                background: navMode === 'config' ? '#1677ff' : '#f5f5f5',
                color: navMode === 'config' ? '#fff' : '#666',
              }}
            >
              Config 模式
            </button>
            <button
              onClick={() => setNavMode('field')}
              style={{
                flex: 1,
                padding: '10px 0',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                background: navMode === 'field' ? '#52c41a' : '#f5f5f5',
                color: navMode === 'field' ? '#fff' : '#666',
              }}
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
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '3px 8px',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: 12,
                      background: currentDemo === item.key ? '#1677ff' : 'transparent',
                      color: currentDemo === item.key ? '#fff' : '#333',
                      fontWeight: currentDemo === item.key ? 600 : 400,
                      marginBottom: 1,
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
