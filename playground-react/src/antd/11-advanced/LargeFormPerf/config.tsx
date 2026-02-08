import type { ISchema } from '@moluoxixi/schema';
import type { FieldPattern } from '@moluoxixi/core';
import { ConfigForm } from '@moluoxixi/react';
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd';
import { observer } from 'mobx-react-lite';
/**
 * 场景 51：大表单性能（Ant Design 版）
 *
 * 动态生成 N 个字段的 schema，测试大表单渲染性能。
 * 支持切换 50/100/200 个字段，记录渲染耗时。
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';

setupAntd();

/** 字段数量选项 */
const FIELD_COUNT_OPTIONS = [50, 100, 200];

/** 将 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } };
}

/**
 * 大表单性能示例
 *
 * 动态生成大量字段 schema，测试渲染性能。
 */
export const LargeFormPerf = observer((): React.ReactElement => {
  const [fieldCount, setFieldCount] = useState(50);
  const [renderTime, setRenderTime] = useState(0);
  const startTimeRef = useRef(0);

  /** 根据字段数量动态生成 schema */
  const schema = useMemo<ISchema>(() => {
    startTimeRef.current = performance.now();
    const properties: Record<string, ISchema> = {};
    for (let i = 0; i < fieldCount; i++) {
      const type = i % 4 === 0 ? 'number' : i % 4 === 1 ? 'boolean' : i % 4 === 2 ? 'date' : 'string';
      properties[`field_${i}`] = {
        type,
        title: `字段 ${i + 1}`,
        default: type === 'number' ? 0 : type === 'boolean' ? false : '',
        ...(i % 10 === 0 ? { required: true } : {}),
      };
    }
    return {
      type: 'object',
      decoratorProps: { labelPosition: 'left', labelWidth: '100px', actions: { submit: '提交', reset: '重置' } },
      properties,
    };
  }, [fieldCount]);

  /** 测量渲染耗时 */
  useEffect(() => {
    requestAnimationFrame(() => {
      setRenderTime(Math.round(performance.now() - startTimeRef.current));
    });
  }, [fieldCount]);

  return (
    <div>
      <h2>大表单性能</h2>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>
        {fieldCount} 个字段性能测试，动态切换字段数量，记录渲染耗时
      </p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {FIELD_COUNT_OPTIONS.map(n => (
          <button
            key={n}
            type="button"
            style={{
              padding: '4px 16px',
              border: fieldCount === n ? '1px solid #1677ff' : '1px solid #d9d9d9',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 14,
              background: fieldCount === n ? '#1677ff' : '#fff',
              color: fieldCount === n ? '#fff' : 'inherit',
            }}
            onClick={() => setFieldCount(n)}
          >
            {n} 个
          </button>
        ))}
        <span style={{ lineHeight: '32px', marginLeft: 8, color: '#666', fontSize: 13 }}>
          渲染耗时: <b>{renderTime}ms</b>
        </span>
      </div>
      <StatusTabs>
        {({ mode, showResult, showErrors }) => (
          <ConfigForm
            key={fieldCount}
            schema={withMode(schema, mode)}
            onSubmit={showResult}
            onSubmitFailed={errors => showErrors(errors)}
          />
        )}
      </StatusTabs>
    </div>
  );
});
