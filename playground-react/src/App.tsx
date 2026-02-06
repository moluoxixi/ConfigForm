/**
 * React Playground 入口
 *
 * 48 个场景，分 config（Schema 驱动）和 field（自定义渲染）两种模式
 */
import React, { useState, Suspense, lazy } from 'react';

/* ======================== 场景分类 ======================== */

type DemoName =
  /* config 模式（1-27） */
  | 'basic' | 'layout' | 'basic-validation' | 'default-value'
  | 'visibility-linkage' | 'value-linkage' | 'property-linkage' | 'cascade-select' | 'computed-field' | 'conditional-required'
  | 'custom-validation' | 'async-validation' | 'cross-field-validation'
  | 'nested-object' | 'array-field' | 'editable-table' | 'object-array-nested'
  | 'async-options' | 'dependent-datasource' | 'paginated-search'
  | 'step-form' | 'tab-group' | 'collapse-group' | 'card-group'
  | 'dynamic-field' | 'dynamic-schema' | 'template-reuse'
  /* field 模式（28-48） */
  | 'rich-text' | 'file-upload' | 'map-picker' | 'color-picker' | 'code-editor' | 'json-editor' | 'signature-pad'
  | 'transfer' | 'tree-select' | 'markdown-editor' | 'icon-selector' | 'cron-editor'
  | 'data-transform' | 'multi-form' | 'form-snapshot' | 'undo-redo' | 'lifecycle'
  | 'permission' | 'i18n' | 'form-diff' | 'print-export';

/** 场景分组 */
const demoGroups = [
  {
    title: '📋 基础场景（Config 模式）',
    items: [
      { key: 'basic' as DemoName, label: '1. 基础表单' },
      { key: 'layout' as DemoName, label: '2. 表单布局' },
      { key: 'basic-validation' as DemoName, label: '3. 必填与格式验证' },
      { key: 'default-value' as DemoName, label: '4. 默认值' },
    ],
  },
  {
    title: '🔗 联动场景',
    items: [
      { key: 'visibility-linkage' as DemoName, label: '5. 显隐联动' },
      { key: 'value-linkage' as DemoName, label: '6. 值联动' },
      { key: 'property-linkage' as DemoName, label: '7. 属性联动' },
      { key: 'cascade-select' as DemoName, label: '8. 级联选择' },
      { key: 'computed-field' as DemoName, label: '9. 计算字段' },
      { key: 'conditional-required' as DemoName, label: '10. 条件必填' },
    ],
  },
  {
    title: '✅ 验证场景',
    items: [
      { key: 'custom-validation' as DemoName, label: '11. 自定义验证' },
      { key: 'async-validation' as DemoName, label: '12. 异步验证' },
      { key: 'cross-field-validation' as DemoName, label: '13. 跨字段验证' },
    ],
  },
  {
    title: '📦 复杂数据',
    items: [
      { key: 'nested-object' as DemoName, label: '14. 嵌套对象' },
      { key: 'array-field' as DemoName, label: '15. 数组字段' },
      { key: 'editable-table' as DemoName, label: '16. 可编辑表格' },
      { key: 'object-array-nested' as DemoName, label: '17. 对象数组嵌套' },
    ],
  },
  {
    title: '🌐 数据源',
    items: [
      { key: 'async-options' as DemoName, label: '18. 异步选项' },
      { key: 'dependent-datasource' as DemoName, label: '19. 依赖数据源' },
      { key: 'paginated-search' as DemoName, label: '20. 分页搜索' },
    ],
  },
  {
    title: '📐 布局分组',
    items: [
      { key: 'step-form' as DemoName, label: '21. 分步表单' },
      { key: 'tab-group' as DemoName, label: '22. 标签页分组' },
      { key: 'collapse-group' as DemoName, label: '23. 折叠面板' },
      { key: 'card-group' as DemoName, label: '24. 卡片分组' },
    ],
  },
  {
    title: '⚡ 动态表单',
    items: [
      { key: 'dynamic-field' as DemoName, label: '25. 动态增删字段' },
      { key: 'dynamic-schema' as DemoName, label: '26. 动态 Schema' },
      { key: 'template-reuse' as DemoName, label: '27. 模板复用' },
    ],
  },
  {
    title: '🧩 复杂组件（Field 模式）',
    items: [
      { key: 'rich-text' as DemoName, label: '28. 富文本编辑器' },
      { key: 'file-upload' as DemoName, label: '29. 文件上传' },
      { key: 'map-picker' as DemoName, label: '30. 地图选点' },
      { key: 'color-picker' as DemoName, label: '31. 颜色选择器' },
      { key: 'code-editor' as DemoName, label: '32. 代码编辑器' },
      { key: 'json-editor' as DemoName, label: '33. JSON 编辑器' },
      { key: 'signature-pad' as DemoName, label: '34. 手写签名' },
      { key: 'transfer' as DemoName, label: '35. 穿梭框' },
      { key: 'tree-select' as DemoName, label: '36. 树形选择' },
      { key: 'markdown-editor' as DemoName, label: '37. Markdown' },
      { key: 'icon-selector' as DemoName, label: '38. 图标选择器' },
      { key: 'cron-editor' as DemoName, label: '39. Cron 编辑器' },
    ],
  },
  {
    title: '🔄 表单状态',
    items: [
      { key: 'data-transform' as DemoName, label: '40. 数据转换' },
      { key: 'multi-form' as DemoName, label: '41. 多表单协作' },
      { key: 'form-snapshot' as DemoName, label: '42. 表单快照' },
      { key: 'undo-redo' as DemoName, label: '43. 撤销重做' },
      { key: 'lifecycle' as DemoName, label: '44. 生命周期' },
    ],
  },
  {
    title: '🛡️ 其他能力',
    items: [
      { key: 'permission' as DemoName, label: '45. 字段权限' },
      { key: 'i18n' as DemoName, label: '46. 国际化' },
      { key: 'form-diff' as DemoName, label: '47. 表单比对' },
      { key: 'print-export' as DemoName, label: '48. 打印导出' },
    ],
  },
];

/* ======================== 懒加载映射 ======================== */

const componentMap: Record<DemoName, React.LazyExoticComponent<React.ComponentType>> = {
  /* config 模式 */
  'basic': lazy(() => import('./antd/config/BasicForm').then((m) => ({ default: m.BasicForm }))),
  'layout': lazy(() => import('./antd/config/LayoutForm').then((m) => ({ default: m.LayoutForm }))),
  'basic-validation': lazy(() => import('./antd/config/BasicValidationForm').then((m) => ({ default: m.BasicValidationForm }))),
  'default-value': lazy(() => import('./antd/config/DefaultValueForm').then((m) => ({ default: m.DefaultValueForm }))),
  'visibility-linkage': lazy(() => import('./antd/config/VisibilityLinkageForm').then((m) => ({ default: m.VisibilityLinkageForm }))),
  'value-linkage': lazy(() => import('./antd/config/ValueLinkageForm').then((m) => ({ default: m.ValueLinkageForm }))),
  'property-linkage': lazy(() => import('./antd/config/PropertyLinkageForm').then((m) => ({ default: m.PropertyLinkageForm }))),
  'cascade-select': lazy(() => import('./antd/config/CascadeSelectForm').then((m) => ({ default: m.CascadeSelectForm }))),
  'computed-field': lazy(() => import('./antd/config/ComputedFieldForm').then((m) => ({ default: m.ComputedFieldForm }))),
  'conditional-required': lazy(() => import('./antd/config/ConditionalRequiredForm').then((m) => ({ default: m.ConditionalRequiredForm }))),
  'custom-validation': lazy(() => import('./antd/config/CustomValidationForm').then((m) => ({ default: m.CustomValidationForm }))),
  'async-validation': lazy(() => import('./antd/config/AsyncValidationForm').then((m) => ({ default: m.AsyncValidationForm }))),
  'cross-field-validation': lazy(() => import('./antd/config/CrossFieldValidationForm').then((m) => ({ default: m.CrossFieldValidationForm }))),
  'nested-object': lazy(() => import('./antd/config/NestedObjectForm').then((m) => ({ default: m.NestedObjectForm }))),
  'array-field': lazy(() => import('./antd/config/ArrayFieldForm').then((m) => ({ default: m.ArrayFieldForm }))),
  'editable-table': lazy(() => import('./antd/config/EditableTableForm').then((m) => ({ default: m.EditableTableForm }))),
  'object-array-nested': lazy(() => import('./antd/config/ObjectArrayNestedForm').then((m) => ({ default: m.ObjectArrayNestedForm }))),
  'async-options': lazy(() => import('./antd/config/AsyncOptionsForm').then((m) => ({ default: m.AsyncOptionsForm }))),
  'dependent-datasource': lazy(() => import('./antd/config/DependentDataSourceForm').then((m) => ({ default: m.DependentDataSourceForm }))),
  'paginated-search': lazy(() => import('./antd/config/PaginatedSearchForm').then((m) => ({ default: m.PaginatedSearchForm }))),
  'step-form': lazy(() => import('./antd/config/StepForm').then((m) => ({ default: m.StepForm }))),
  'tab-group': lazy(() => import('./antd/config/TabGroupForm').then((m) => ({ default: m.TabGroupForm }))),
  'collapse-group': lazy(() => import('./antd/config/CollapseGroupForm').then((m) => ({ default: m.CollapseGroupForm }))),
  'card-group': lazy(() => import('./antd/config/CardGroupForm').then((m) => ({ default: m.CardGroupForm }))),
  'dynamic-field': lazy(() => import('./antd/config/DynamicFieldForm').then((m) => ({ default: m.DynamicFieldForm }))),
  'dynamic-schema': lazy(() => import('./antd/config/DynamicSchemaForm').then((m) => ({ default: m.DynamicSchemaForm }))),
  'template-reuse': lazy(() => import('./antd/config/TemplateReuseForm').then((m) => ({ default: m.TemplateReuseForm }))),
  /* field 模式 */
  'rich-text': lazy(() => import('./antd/field/RichTextForm').then((m) => ({ default: m.RichTextForm }))),
  'file-upload': lazy(() => import('./antd/field/FileUploadForm').then((m) => ({ default: m.FileUploadForm }))),
  'map-picker': lazy(() => import('./antd/field/MapPickerForm').then((m) => ({ default: m.MapPickerForm }))),
  'color-picker': lazy(() => import('./antd/field/ColorPickerForm').then((m) => ({ default: m.ColorPickerForm }))),
  'code-editor': lazy(() => import('./antd/field/CodeEditorForm').then((m) => ({ default: m.CodeEditorForm }))),
  'json-editor': lazy(() => import('./antd/field/JsonEditorForm').then((m) => ({ default: m.JsonEditorForm }))),
  'signature-pad': lazy(() => import('./antd/field/SignaturePadForm').then((m) => ({ default: m.SignaturePadForm }))),
  'transfer': lazy(() => import('./antd/field/TransferForm').then((m) => ({ default: m.TransferForm }))),
  'tree-select': lazy(() => import('./antd/field/TreeSelectForm').then((m) => ({ default: m.TreeSelectForm }))),
  'markdown-editor': lazy(() => import('./antd/field/MarkdownEditorForm').then((m) => ({ default: m.MarkdownEditorForm }))),
  'icon-selector': lazy(() => import('./antd/field/IconSelectorForm').then((m) => ({ default: m.IconSelectorForm }))),
  'cron-editor': lazy(() => import('./antd/field/CronEditorForm').then((m) => ({ default: m.CronEditorForm }))),
  'data-transform': lazy(() => import('./antd/field/DataTransformForm').then((m) => ({ default: m.DataTransformForm }))),
  'multi-form': lazy(() => import('./antd/field/MultiFormForm').then((m) => ({ default: m.MultiFormForm }))),
  'form-snapshot': lazy(() => import('./antd/field/FormSnapshotForm').then((m) => ({ default: m.FormSnapshotForm }))),
  'undo-redo': lazy(() => import('./antd/field/UndoRedoForm').then((m) => ({ default: m.UndoRedoForm }))),
  'lifecycle': lazy(() => import('./antd/field/LifecycleForm').then((m) => ({ default: m.LifecycleForm }))),
  'permission': lazy(() => import('./antd/field/PermissionForm').then((m) => ({ default: m.PermissionForm }))),
  'i18n': lazy(() => import('./antd/field/I18nForm').then((m) => ({ default: m.I18nForm }))),
  'form-diff': lazy(() => import('./antd/field/FormDiffForm').then((m) => ({ default: m.FormDiffForm }))),
  'print-export': lazy(() => import('./antd/field/PrintExportForm').then((m) => ({ default: m.PrintExportForm }))),
};

/* ======================== 主组件 ======================== */

export function App(): React.ReactElement {
  const [currentDemo, setCurrentDemo] = useState<DemoName>('basic');
  const CurrentComponent = componentMap[currentDemo];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginBottom: 4 }}>ConfigForm - React Playground</h1>
      <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>
        基于 MobX 的响应式配置化表单 · 48 个场景 · Ant Design · 每个场景支持编辑 / 只读 / 禁用模式切换
      </p>

      {/* UI 库标识 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, padding: '12px 16px', background: '#f5f5f5', borderRadius: 8 }}>
        <span style={{ lineHeight: '32px', fontWeight: 600, color: '#333' }}>UI 组件库：</span>
        <span style={{ padding: '6px 20px', borderRadius: 6, fontSize: 14, fontWeight: 600, background: '#1677ff', color: '#fff' }}>
          Ant Design
        </span>
      </div>

      {/* 场景导航 */}
      <div style={{ maxHeight: 400, overflow: 'auto', marginBottom: 12, border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
        {demoGroups.map((group) => (
          <div key={group.title} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#666', marginBottom: 6 }}>{group.title}</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {group.items.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setCurrentDemo(item.key)}
                  style={{
                    padding: '4px 10px',
                    border: `1px solid ${currentDemo === item.key ? '#1677ff' : '#ddd'}`,
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 12,
                    background: currentDemo === item.key ? '#1677ff' : '#fff',
                    color: currentDemo === item.key ? '#fff' : '#333',
                    fontWeight: currentDemo === item.key ? 600 : 400,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 内容区 */}
      <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 24, background: '#fff' }}>
        <Suspense fallback={<div style={{ textAlign: 'center', color: '#999', padding: 40 }}>加载中...</div>}>
          <CurrentComponent key={currentDemo} />
        </Suspense>
      </div>
    </div>
  );
}
