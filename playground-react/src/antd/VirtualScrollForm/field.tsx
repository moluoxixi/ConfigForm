/**
 * 虚拟滚动 — Field 模式
 *
 * 使用 FormProvider + FormArrayField + FormField + CSS 虚拟滚动实现大列表表单。
 * 仅渲染可视区域内的行，每行使用 FormField + fieldProps 声明式渲染。
 * 框架自动处理三种模式（editable / disabled / readOnly），无需手动 mode 判断。
 */
import React, { useCallback, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import type { ArrayFieldInstance } from '@moluoxixi/core';
import { FormArrayField, FormField, FormProvider, useCreateForm } from '@moluoxixi/react';
import { LayoutFormActions, setupAntd, StatusTabs } from '@moluoxixi/ui-antd';

setupAntd();

/** 虚拟滚动常量 */
const ROW_HEIGHT = 48;
const BUFFER = 5;
const CONTAINER_HEIGHT = 400;

/** 行数据类型 */
interface RowItem {
  name: string;
  email: string;
}

/** 根据滚动位置计算可视区域内的行索引和偏移 */
function computeVisibleItems(allItems: unknown[], scrollTopVal: number): Array<{ index: number; offset: number }> {
  const start = Math.max(0, Math.floor(scrollTopVal / ROW_HEIGHT) - BUFFER);
  const visibleCount = Math.ceil(CONTAINER_HEIGHT / ROW_HEIGHT) + BUFFER * 2;
  const end = Math.min(allItems.length, start + visibleCount);

  const result: Array<{ index: number; offset: number }> = [];
  for (let i = start; i < end; i++) {
    result.push({ index: i, offset: i * ROW_HEIGHT });
  }
  return result;
}

/**
 * 虚拟滚动（Field 版）
 *
 * 使用 FormProvider + FormArrayField + FormField + CSS 虚拟滚动实现大列表表单。
 */
export const VirtualScrollForm = observer((): React.ReactElement => {
  const form = useCreateForm({
    initialValues: {
      items: Array.from({ length: 100 }, (_, i) => ({
        name: `用户 ${i + 1}`,
        email: `user${i + 1}@example.com`,
      })),
    },
  });

  const [scrollTop, setScrollTop] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  /** 滚动事件处理 */
  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>): void => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  /** 批量添加数据 */
  const addBatch = useCallback((count: number): void => {
    const current = (form.getFieldValue('items') ?? []) as RowItem[];
    const base = current.length;
    const newItems = [...current, ...Array.from({ length: count }, (_, i) => ({
      name: `用户 ${base + i + 1}`,
      email: `user${base + i + 1}@example.com`,
    }))];
    form.setFieldValue('items', newItems);
  }, [form]);

  /** 清空所有数据 */
  const clearAll = useCallback((): void => {
    form.setFieldValue('items', []);
  }, [form]);

  return (
    <div>
      <h2>虚拟滚动</h2>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>
        虚拟滚动大列表 — FormField + FormArrayField + CSS 虚拟滚动实现
      </p>
      <StatusTabs>
        {({ mode, showResult, showErrors }) => {
          form.pattern = mode;
          return (
            <FormProvider form={form}>
              <FormArrayField
                name="items"
                fieldProps={{ itemTemplate: () => ({ name: '', email: '' }) }}
              >
                {(arrayField: ArrayFieldInstance) => {
                  const allItems = (arrayField.value as unknown[]) ?? [];
                  const visibleItems = computeVisibleItems(allItems, scrollTop);
                  return (
                    <>
                      <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, color: '#666' }}>共 {allItems.length} 条数据 · 容器高400px · 行高 48px</span>
                        <div style={{ display: 'inline-flex', gap: 8 }}>
                          <button type="button" style={{ padding: '2px 12px', border: '1px solid #d9d9d9', borderRadius: 4, cursor: 'pointer', fontSize: 13, background: '#fff' }} onClick={() => addBatch(50)}>+50 条</button>
                          <button type="button" style={{ padding: '2px 12px', border: '1px solid #d9d9d9', borderRadius: 4, cursor: 'pointer', fontSize: 13, background: '#fff' }} onClick={() => addBatch(100)}>+100 条</button>
                          <button type="button" style={{ padding: '2px 12px', border: '1px solid #ff4d4f', borderRadius: 4, cursor: 'pointer', fontSize: 13, background: '#fff', color: '#ff4d4f' }} onClick={clearAll}>清空</button>
                        </div>
                      </div>
                      <div
                        ref={scrollContainerRef}
                        style={{ height: CONTAINER_HEIGHT, overflowY: 'auto', border: '1px solid #e8e8e8', borderRadius: 6 }}
                        onScroll={onScroll}
                      >
                        <div style={{ height: allItems.length * ROW_HEIGHT, position: 'relative' }}>
                          {visibleItems.map(vis => (
                            <div
                              key={vis.index}
                              style={{
                                position: 'absolute',
                                top: vis.offset,
                                left: 0,
                                right: 0,
                                height: ROW_HEIGHT,
                                padding: '8px 12px',
                                display: 'flex',
                                gap: 8,
                                alignItems: 'center',
                                borderBottom: '1px solid #f0f0f0',
                              }}
                            >
                              <span style={{ width: 40, color: '#999', fontSize: 12 }}>#{vis.index + 1}</span>
                              <FormField name={`items.${vis.index}.name`} fieldProps={{ component: 'Input', componentProps: { placeholder: '姓名', size: 'small', style: { flex: 1 } } }} />
                              <FormField name={`items.${vis.index}.email`} fieldProps={{ component: 'Input', componentProps: { placeholder: '邮箱', size: 'small', style: { flex: 1 } } }} />
                              <button
                                type="button"
                                style={{ padding: '2px 8px', border: '1px solid #ff4d4f', borderRadius: 4, cursor: 'pointer', fontSize: 13, background: '#fff', color: '#ff4d4f' }}
                                onClick={() => arrayField.remove(vis.index)}
                              >
                                删
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  );
                }}
              </FormArrayField>
              <LayoutFormActions onSubmit={showResult} onSubmitFailed={showErrors} />
            </FormProvider>
          );
        }}
      </StatusTabs>
    </div>
  );
});
