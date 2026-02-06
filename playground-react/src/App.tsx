import React, { useState, Suspense, lazy } from 'react';

type DemoName =
  | 'basic' | 'linkage' | 'validation' | 'datasource' | 'array' | 'step' | 'dynamic-schema'
  | 'custom-field' | 'field-linkage' | 'array-field' | 'data-process' | 'lifecycle' | 'multi-form' | 'preview-mode';

const demoGroups = [
  {
    title: '📋 纯配置模式（Schema 驱动）',
    items: [
      { key: 'basic' as DemoName, label: '基础表单' },
      { key: 'linkage' as DemoName, label: '字段联动' },
      { key: 'validation' as DemoName, label: '全场景验证' },
      { key: 'datasource' as DemoName, label: '数据源/异步' },
      { key: 'array' as DemoName, label: '数组/表格字段' },
      { key: 'step' as DemoName, label: '分步表单+布局' },
      { key: 'dynamic-schema' as DemoName, label: '动态Schema' },
    ],
  },
  {
    title: '🧩 Field 组件模式（自定义渲染）',
    items: [
      { key: 'custom-field' as DemoName, label: '自定义组件' },
      { key: 'field-linkage' as DemoName, label: '级联联动' },
      { key: 'array-field' as DemoName, label: '可编辑表格' },
      { key: 'data-process' as DemoName, label: '数据处理' },
      { key: 'lifecycle' as DemoName, label: '生命周期/事件' },
      { key: 'multi-form' as DemoName, label: '多表单协作' },
      { key: 'preview-mode' as DemoName, label: '模式切换' },
    ],
  },
];

/** 懒加载组件映射 */
const componentMap: Record<DemoName, React.LazyExoticComponent<React.ComponentType>> = {
  'basic': lazy(() => import('./antd/config/BasicForm').then((m) => ({ default: m.BasicForm }))),
  'linkage': lazy(() => import('./antd/config/LinkageForm').then((m) => ({ default: m.LinkageForm }))),
  'validation': lazy(() => import('./antd/config/ValidationForm').then((m) => ({ default: m.ValidationForm }))),
  'datasource': lazy(() => import('./antd/config/DataSourceForm').then((m) => ({ default: m.DataSourceForm }))),
  'array': lazy(() => import('./antd/config/ArrayForm').then((m) => ({ default: m.ArrayForm }))),
  'step': lazy(() => import('./antd/config/StepForm').then((m) => ({ default: m.StepForm }))),
  'dynamic-schema': lazy(() => import('./antd/config/DynamicSchemaForm').then((m) => ({ default: m.DynamicSchemaForm }))),
  'custom-field': lazy(() => import('./antd/field/CustomFieldForm').then((m) => ({ default: m.CustomFieldForm }))),
  'field-linkage': lazy(() => import('./antd/field/FieldLinkageForm').then((m) => ({ default: m.FieldLinkageForm }))),
  'array-field': lazy(() => import('./antd/field/ArrayFieldForm').then((m) => ({ default: m.ArrayFieldForm }))),
  'data-process': lazy(() => import('./antd/field/DataProcessForm').then((m) => ({ default: m.DataProcessForm }))),
  'lifecycle': lazy(() => import('./antd/field/LifecycleForm').then((m) => ({ default: m.LifecycleForm }))),
  'multi-form': lazy(() => import('./antd/field/MultiFormForm').then((m) => ({ default: m.MultiFormForm }))),
  'preview-mode': lazy(() => import('./antd/field/PreviewModeForm').then((m) => ({ default: m.PreviewModeForm }))),
};

export function App() {
  const [currentDemo, setCurrentDemo] = useState<DemoName>('basic');
  const CurrentComponent = componentMap[currentDemo];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginBottom: 4 }}>ConfigForm - React Playground</h1>
      <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>
        基于 MobX 的响应式配置化表单 · 14 个场景 · Ant Design
      </p>

      {/* UI 库标识 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, padding: '12px 16px', background: '#f5f5f5', borderRadius: 8 }}>
        <span style={{ lineHeight: '32px', fontWeight: 600, color: '#333' }}>UI 组件库：</span>
        <span style={{ padding: '6px 20px', borderRadius: 6, fontSize: 14, fontWeight: 600, background: '#1677ff', color: '#fff', border: '2px solid #1677ff' }}>
          🐜 Ant Design
        </span>
      </div>

      {/* 场景导航 */}
      {demoGroups.map((group) => (
        <div key={group.title} style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#666', marginBottom: 6 }}>{group.title}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {group.items.map((item) => (
              <button
                key={item.key}
                onClick={() => setCurrentDemo(item.key)}
                style={{
                  padding: '6px 14px',
                  border: `1px solid ${currentDemo === item.key ? '#1677ff' : '#ddd'}`,
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 13,
                  background: currentDemo === item.key ? '#1677ff' : '#fff',
                  color: currentDemo === item.key ? '#fff' : '#333',
                  fontWeight: currentDemo === item.key ? 600 : 400,
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* 内容区 */}
      <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 24, background: '#fff', marginTop: 12 }}>
        <Suspense fallback={<div style={{ textAlign: 'center', color: '#999', padding: 40 }}>加载中...</div>}>
          <CurrentComponent key={currentDemo} />
        </Suspense>
      </div>
    </div>
  );
}
