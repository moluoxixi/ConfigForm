/**
 * 场景 56：虚拟滚动（Ant Design 版）
 *
 * 纯 CSS + 定位实现虚拟滚动大列表表单。
 * 仅渲染可视区域内的行，支持批量添加和删除操作。
 */
import React, { useCallback, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { createForm } from '@moluoxixi/core';
import type { FieldPattern } from '@moluoxixi/core';
import { FormProvider } from '@moluoxixi/react';
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd';

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

/**
 * 虚拟滚动示例
 *
 * 使用 CSS 定位实现虚拟滚动，仅渲染可视区域内的行。
 */
export const VirtualScrollForm = observer((): React.ReactElement => {
  const [items, setItems] = useState<RowItem[]>(() =>
    Array.from({ length: 100 }, (_, i) => ({
      name: `用户 ${i + 1}`,
      email: `user${i + 1}@example.com`,
    })),
  );
  const [scrollTop, setScrollTop] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [form] = useState(() => createForm({
    initialValues: { items },
  }));

  /** 计算可视区域内的行 */
  const totalHeight = items.length * ROW_HEIGHT;
  const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER);
  const visibleCount = Math.ceil(CONTAINER_HEIGHT / ROW_HEIGHT) + BUFFER * 2;
  const end = Math.min(items.length, start + visibleCount);
  const visibleItems: Array<{ index: number; offset: number; data: RowItem }> = [];
  for (let i = start; i < end; i++) {
    visibleItems.push({ index: i, offset: i * ROW_HEIGHT, data: items[i] });
  }

  /** 滚动事件处理 */
  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>): void => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  /** 更新单个项 */
  const updateItem = useCallback((index: number, field: keyof RowItem, value: string): void => {
    setItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }, []);

  /** 批量添加数据 */
  const addBatch = useCallback((count: number): void => {
    setItems(prev => {
      const base = prev.length;
      const newItems = Array.from({ length: count }, (_, i) => ({
        name: `用户 ${base + i + 1}`,
        email: `user${base + i + 1}@example.com`,
      }));
      return [...prev, ...newItems];
    });
  }, []);

  /** 删除单项 */
  const removeItem = useCallback((index: number): void => {
    setItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  /** 清空所有数据 */
  const clearAll = useCallback((): void => {
    setItems([]);
  }, []);

  /** 提交处理 */
  const handleSubmit = async (showResult: (data: Record<string, unknown>) => void, showErrors: (errors: unknown[]) => void): Promise<void> => {
    form.setFieldValue('items', items);
    const res = await form.submit();
    if (res.errors.length > 0) {
      showErrors(res.errors);
    } else {
      showResult({ items });
    }
  };

  return (
    <div>
      <h2>虚拟滚动</h2>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>
        虚拟滚动大列表 — CSS 定位实现，仅渲染可视区域内的行
      </p>
      <StatusTabs>
        {({ mode, showResult, showErrors }) => {
          form.pattern = mode as FieldPattern;
          return (
            <FormProvider form={form}>
              <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#666' }}>共 {items.length} 条数据 · 容器高400px · 行高 48px</span>
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
                <div style={{ height: totalHeight, position: 'relative' }}>
                  {visibleItems.map(item => (
                    <div
                      key={item.index}
                      style={{
                        position: 'absolute',
                        top: item.offset,
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
                      <span style={{ width: 40, color: '#999', fontSize: 12 }}>#{item.index + 1}</span>
                      <input
                        value={item.data.name}
                        placeholder="姓名"
                        disabled={mode !== 'editable'}
                        readOnly={mode === 'readOnly'}
                        style={{ flex: 1, padding: '2px 8px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13, outline: 'none' }}
                        onChange={e => updateItem(item.index, 'name', e.target.value)}
                      />
                      <input
                        value={item.data.email}
                        placeholder="邮箱"
                        disabled={mode !== 'editable'}
                        readOnly={mode === 'readOnly'}
                        style={{ flex: 1, padding: '2px 8px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13, outline: 'none' }}
                        onChange={e => updateItem(item.index, 'email', e.target.value)}
                      />
                      {mode === 'editable' && (
                        <button
                          type="button"
                          style={{ padding: '2px 8px', border: '1px solid #ff4d4f', borderRadius: 4, cursor: 'pointer', fontSize: 13, background: '#fff', color: '#ff4d4f' }}
                          onClick={() => removeItem(item.index)}
                        >
                          删
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {mode === 'editable' && (
                <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    style={{ padding: '4px 15px', background: '#1677ff', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                    onClick={() => handleSubmit(showResult, showErrors)}
                  >
                    提交
                  </button>
                  <button
                    type="button"
                    style={{ padding: '4px 15px', background: '#fff', border: '1px solid #d9d9d9', borderRadius: 6, cursor: 'pointer' }}
                    onClick={() => form.reset()}
                  >
                    重置
                  </button>
                </div>
              )}
            </FormProvider>
          );
        }}
      </StatusTabs>
    </div>
  );
});
