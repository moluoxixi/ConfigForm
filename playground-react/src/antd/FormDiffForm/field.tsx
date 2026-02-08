import { FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 47：表单比对
 *
 * 覆盖：
 * - 变更高亮（修改过的字段标记）
 * - 原始值 vs 当前值比对
 * - 变更摘要
 * - 三种模式切换
 */
import React, { useEffect, useMemo, useState } from 'react'

setupAntd()

/** 字段定义接口 */
interface FieldDef {
  name: string
  label: string
  type: 'text' | 'number' | 'textarea'
}

/** 字段定义 */
const FIELD_DEFS: FieldDef[] = [
  { name: 'name', label: '姓名', type: 'text' },
  { name: 'email', label: '邮箱', type: 'text' },
  { name: 'phone', label: '电话', type: 'text' },
  { name: 'salary', label: '薪资', type: 'number' },
  { name: 'department', label: '部门', type: 'text' },
  { name: 'bio', label: '简介', type: 'textarea' },
]

/** 原始值（模拟从数据库加载） */
const ORIGINAL_VALUES: Record<string, unknown> = {
  name: '张三',
  email: 'zhangsan@company.com',
  phone: '13800138000',
  salary: 25000,
  department: '技术部',
  bio: '5 年前端开发经验',
}

/** 根据字段定义生成 fieldProps */
function getFieldProps(d: FieldDef): Record<string, unknown> {
  const base: Record<string, unknown> = { label: d.label }
  if (d.type === 'number') {
    base.component = 'InputNumber'
    base.componentProps = { style: { width: '100%' } }
  }
  else if (d.type === 'textarea') {
    base.component = 'Textarea'
    base.componentProps = { rows: 2 }
  }
  else {
    base.component = 'Input'
  }
  return base
}

export const FormDiffForm = observer((): React.ReactElement => {
  const [currentValues, setCurrentValues] = useState<Record<string, unknown>>({ ...ORIGINAL_VALUES })

  const form = useCreateForm({ initialValues: { ...ORIGINAL_VALUES } })

  /** 订阅表单值变化，同步到 currentValues 用于 diff 比较 */
  useEffect(() => {
    const unsub = form.onValuesChange((values: Record<string, unknown>) => setCurrentValues({ ...values }))
    return unsub
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /** 判断字段是否已变更 */
  const isChanged = (name: string): boolean =>
    String(ORIGINAL_VALUES[name] ?? '') !== String(currentValues[name] ?? '')

  /** 变更字段列表 */
  const changedFields = useMemo(
    () => FIELD_DEFS.filter(d => String(ORIGINAL_VALUES[d.name] ?? '') !== String(currentValues[d.name] ?? '')),
    [currentValues],
  )

  return (
    <div>
      <h3>表单比对</h3>
      <p style={{ color: '#666' }}>变更高亮 / 原始值 vs 当前值 / 变更摘要</p>

      {/* 变更摘要（附加内容） */}
      <div style={{ marginBottom: 16, padding: 12, border: '1px solid #d9d9d9', borderRadius: 6 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <strong>变更摘要：</strong>
          {changedFields.length === 0
            ? <span style={{ display: 'inline-block', padding: '0 7px', fontSize: 12, lineHeight: '20px', background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4 }}>无变更</span>
            : (
                <>
                  <span style={{ display: 'inline-block', padding: '0 7px', fontSize: 12, lineHeight: '20px', background: '#fff7e6', border: '1px solid #ffd591', borderRadius: 4 }}>
                    {changedFields.length}
                    {' '}
                    个字段已修改
                  </span>
                  {changedFields.map(d => <span key={d.name} style={{ display: 'inline-block', padding: '0 7px', fontSize: 12, lineHeight: '20px', background: '#fff2f0', border: '1px solid #ffccc7', borderRadius: 4 }}>{d.label}</span>)}
                </>
              )}
        </div>
      </div>

      <StatusTabs>
        {({ mode, showResult, showErrors }) => {
          form.pattern = mode
          return (
            <FormProvider form={form}>
              <form onSubmit={async (e: React.FormEvent) => {
                e.preventDefault()
                const res = await form.submit()
                if (res.errors.length > 0) showErrors(res.errors)
                else showResult(res.values)
              }} noValidate>
                {FIELD_DEFS.map((d) => {
                  const changed = isChanged(d.name)
                  return (
                    <div
                      key={d.name}
                      style={{
                        background: changed ? '#fffbe6' : undefined,
                        padding: changed ? '4px 8px' : undefined,
                        borderRadius: 4,
                        marginBottom: changed ? 4 : undefined,
                      }}
                    >
                      <FormField name={d.name} fieldProps={getFieldProps(d)} />
                      {changed && (
                        <div style={{ color: '#faad14', fontSize: 12, marginTop: -8, marginBottom: 8, paddingLeft: 8 }}>
                          原始值: {String(ORIGINAL_VALUES[d.name] ?? '—')}
                        </div>
                      )}
                    </div>
                  )
                })}
                {<LayoutFormActions onReset={() => form.reset()} />}
              </form>
            </FormProvider>
          )
        }}
      </StatusTabs>
    </div>
  )
})
