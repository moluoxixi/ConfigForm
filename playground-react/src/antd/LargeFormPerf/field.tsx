/**
 * 大表单性能测试 — Field 模式
 *
 * 使用 FormProvider + FormField 批量渲染大量字段，测试渲染性能。
 * 支持切换 50/100/200 个字段，记录渲染耗时。
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/react';
import { LayoutFormActions, setupAntd, StatusTabs } from '@moluoxixi/ui-antd';

setupAntd();

/** 字段数量选项 */
const FIELD_COUNT_OPTIONS = [50, 100, 200];

/** 字段定义 */
interface FieldDef {
  name: string;
  label: string;
  component: string;
  required?: boolean;
}

/** 根据字段数量生成字段定义列表 */
function buildFieldDefs(count: number): FieldDef[] {
  const defs: FieldDef[] = [];
  for (let i = 0; i < count; i++) {
    const component = i % 4 === 0 ? 'InputNumber' : i % 4 === 1 ? 'Switch' : i % 4 === 2 ? 'DatePicker' : 'Input';
    defs.push({
      name: `field_${i}`,
      label: `字段 ${i + 1}`,
      component,
      required: i % 10 === 0,
    });
  }
  return defs;
}

/** 根据字段数量生成初始值 */
function getInitialValues(count: number): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (let i = 0; i < count; i++) {
    const type = i % 4;
    values[`field_${i}`] = type === 0 ? 0 : type === 1 ? false : '';
  }
  return values;
}

/**
 * 大表单性能测试（Field 版）
 *
 * 使用 FormProvider + FormField 批量渲染，测试大量字段渲染性能。
 */
export const LargeFormPerf = observer((): React.ReactElement => {
  const [fieldCount, setFieldCount] = useState(50);
  const [renderTime, setRenderTime] = useState(0);
  const startTimeRef = useRef(0);

  const form = useCreateForm({ initialValues: getInitialValues(fieldCount) });

  /** 字段定义列表 */
  const fieldDefs = useMemo(() => buildFieldDefs(fieldCount), [fieldCount]);

  /** 切换字段数量时重建初始值并测量渲染时间 */
  useEffect(() => {
    startTimeRef.current = performance.now();
    form.setValues(getInitialValues(fieldCount));
    requestAnimationFrame(() => {
      setRenderTime(Math.round(performance.now() - startTimeRef.current));
    });
  }, [fieldCount]);

  return (
    <div>
      <h2>大表单性能</h2>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>
        {fieldCount} 个字段性能测试 — FormField 批量渲染
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
        {({ mode, showResult, showErrors }) => {
          form.pattern = mode;
          return (
            <FormProvider key={fieldCount} form={form}>
              {fieldDefs.map(f => (
                <FormField
                  key={f.name}
                  name={f.name}
                  fieldProps={{ label: f.label, component: f.component, ...(f.required ? { required: true } : {}) }}
                />
              ))}
              <LayoutFormActions onSubmit={showResult} onSubmitFailed={showErrors} />
            </FormProvider>
          );
        }}
      </StatusTabs>
    </div>
  );
});
