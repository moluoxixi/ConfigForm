/**
 * 场景 2：表单布局 (Field 版)
 *
 * 覆盖：
 * - 水平布局 / 垂直布局 / 行内布局 / 栅格布局
 * - 三种模式切换
 *
 * FormField + fieldProps 实现，手动通过 antd Row/Col 实现栅格布局。
 */
import React, { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'

setupAntd()

/** 布局类型 */
type LayoutType = 'horizontal' | 'vertical' | 'inline' | 'grid-2col' | 'grid-3col'

/** 布局选项 */
const LAYOUT_OPTIONS: Array<{ label: string, value: LayoutType }> = [
  { label: '水平布局', value: 'horizontal' },
  { label: '垂直布局', value: 'vertical' },
  { label: '行内布局', value: 'inline' },
  { label: '栅格两列', value: 'grid-2col' },
  { label: '栅格三列', value: 'grid-3col' },
]

/** 所有字段定义 */
const FIELDS = [
  { name: 'name', label: '姓名', required: true, component: 'Input', componentProps: { placeholder: '请输入姓名' } },
  { name: 'email', label: '邮箱', required: true, component: 'Input', componentProps: { placeholder: '请输入邮箱' }, rules: [{ format: 'email' as const, message: '请输入有效邮箱' }] },
  { name: 'phone', label: '手机号', component: 'Input', componentProps: { placeholder: '请输入手机号' } },
  { name: 'department', label: '部门', component: 'Select', componentProps: { placeholder: '请选择部门' }, dataSource: [{ label: '技术部', value: 'tech' }, { label: '产品部', value: 'product' }, { label: '设计部', value: 'design' }, { label: '运营部', value: 'operation' }] },
  { name: 'role', label: '职位', component: 'Input', componentProps: { placeholder: '请输入职位' } },
  { name: 'joinDate', label: '入职日期', component: 'DatePicker', componentProps: { placeholder: '请选择日期' } },
]

/**
 * 表单布局示例（Field 版）
 */
export const LayoutForm = observer((): React.ReactElement => {
  const [layoutType, setLayoutType] = useState<LayoutType>('horizontal')

  const form = useCreateForm({
    initialValues: { name: '', email: '', phone: '', department: undefined, role: '', joinDate: '' },
  })

  /** 渲染字段列表 */
  const renderFields = (): React.ReactElement => {
    /* 栅格两列 */
    if (layoutType === 'grid-2col') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {FIELDS.map(f => (
            <div key={f.name}>
              <FormField name={f.name} fieldProps={f as any} />
            </div>
          ))}
        </div>
      )
    }

    /* 栅格三列 */
    if (layoutType === 'grid-3col') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          {FIELDS.map(f => (
            <div key={f.name}>
              <FormField name={f.name} fieldProps={f as any} />
            </div>
          ))}
        </div>
      )
    }

    /* 行内 / 水平 / 垂直 */
    const isInline = layoutType === 'inline'
    return (
      <div style={isInline ? { display: 'flex', flexWrap: 'wrap', gap: 16 } : undefined}>
        {FIELDS.map(f => (
          <div key={f.name} style={isInline ? { minWidth: 200 } : undefined}>
            <FormField name={f.name} fieldProps={f as any} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <h3>表单布局 (Field 版)</h3>
      <p style={{ color: '#666' }}>
        水平布局 / 垂直布局 / 行内布局 / 栅格两列 / 栅格三列 —— FormField + fieldProps 实现
      </p>

      <div style={{ marginBottom: 16 }}>
        <strong style={{ marginRight: 12 }}>布局类型：</strong>
        <div style={{ display: 'inline-flex', background: '#f5f5f5', borderRadius: 6, padding: 2 }}>
          {LAYOUT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setLayoutType(opt.value)}
              style={{
                padding: '4px 12px',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 14,
                background: layoutType === opt.value ? '#fff' : 'transparent',
                boxShadow: layoutType === opt.value ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                color: layoutType === opt.value ? '#1677ff' : '#666',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <StatusTabs>
        {({ mode, showResult, showErrors }) => {
          form.pattern = mode
          return (
            <FormProvider form={form}>
                {renderFields()}
                <LayoutFormActions onSubmit={showResult} onSubmitFailed={showErrors} />
            </FormProvider>
          )
        }}
      </StatusTabs>
    </div>
  )
})
