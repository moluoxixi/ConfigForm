import type { FieldPattern } from '@moluoxixi/shared'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 45：字段级权限控制
 *
 * 覆盖：
 * - 基于角色的字段可见性
 * - 字段读写权限
 * - 动态权限切换
 * - 三种模式切换
 *
 * 所有字段使用 FormField + fieldProps。基于角色的可见性和读写权限通过 useEffect
 * 动态设置字段实例的 visible / pattern 属性，框架自动将权限状态传播到组件。
 */
import React, { useEffect, useState } from 'react'

setupAntd()

/** 角色类型 */
type Role = 'admin' | 'manager' | 'staff' | 'guest'

/** 角色选项 */
const ROLE_OPTIONS = [
  { label: '管理员', value: 'admin' },
  { label: '经理', value: 'manager' },
  { label: '员工', value: 'staff' },
  { label: '访客', value: 'guest' },
]

/** 字段定义 */
interface FieldDef {
  name: string
  label: string
  required?: boolean
}

const FIELD_DEFS: FieldDef[] = [
  { name: 'name', label: '姓名', required: true },
  { name: 'email', label: '邮箱' },
  { name: 'salary', label: '薪资' },
  { name: 'department', label: '部门' },
  { name: 'level', label: '职级' },
  { name: 'remark', label: '备注' },
]

/** 权限矩阵：字段名 → 角色 → 权限 */
const PERMISSION_MATRIX: Record<string, Record<Role, 'hidden' | 'readOnly' | 'editable'>> = {
  name: { admin: 'editable', manager: 'editable', staff: 'editable', guest: 'readOnly' },
  email: { admin: 'editable', manager: 'editable', staff: 'readOnly', guest: 'hidden' },
  salary: { admin: 'editable', manager: 'readOnly', staff: 'hidden', guest: 'hidden' },
  department: { admin: 'editable', manager: 'editable', staff: 'readOnly', guest: 'readOnly' },
  level: { admin: 'editable', manager: 'readOnly', staff: 'hidden', guest: 'hidden' },
  remark: { admin: 'editable', manager: 'editable', staff: 'editable', guest: 'hidden' },
}

/** 权限颜色映射（background + border） */
const PERM_STYLES: Record<string, { background: string; border: string }> = {
  editable: { background: '#f6ffed', border: '#b7eb8f' },
  readOnly: { background: '#fff7e6', border: '#ffd591' },
  hidden: { background: '#fff2f0', border: '#ffccc7' },
}

/** 根据字段定义生成 fieldProps */
function getFieldProps(d: FieldDef): Record<string, unknown> {
  const base: Record<string, unknown> = { label: d.label }
  if (d.required) base.required = true
  if (d.name === 'salary') {
    base.component = 'InputNumber'
    base.componentProps = { style: { width: '100%' } }
  }
  else if (d.name === 'remark') {
    base.component = 'Textarea'
  }
  else {
    base.component = 'Input'
  }
  return base
}

export const PermissionForm = observer((): React.ReactElement => {
  const [role, setRole] = useState<Role>('admin')

  const form = useCreateForm({
    initialValues: { name: '张三', email: 'zhangsan@company.com', salary: 25000, department: '技术部', level: 'P7', remark: '' },
  })

  /** 根据当前角色和表单模式应用字段权限 */
  useEffect(() => {
    FIELD_DEFS.forEach((d) => {
      const field = form.getField(d.name)
      if (!field) return
      const perm = PERMISSION_MATRIX[d.name]?.[role] ?? 'hidden'
      field.visible = perm !== 'hidden'
      if (form.pattern === 'editable') {
        field.pattern = (perm === 'readOnly' ? 'readOnly' : 'editable') as FieldPattern
      }
      else {
        field.pattern = form.pattern
      }
    })
  }, [role, form.pattern]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <h3>字段级权限控制</h3>
      <p style={{ color: '#666' }}>基于角色的字段可见性 + 读写权限矩阵</p>

      {/* 角色选择器（附加内容） */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
        <strong>当前角色：</strong>
        <div style={{ display: 'inline-flex', background: '#f5f5f5', borderRadius: 6, padding: 2 }}>
          {ROLE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRole(opt.value as Role)}
              style={{
                padding: '4px 12px',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 14,
                background: role === opt.value ? '#fff' : 'transparent',
                boxShadow: role === opt.value ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                color: role === opt.value ? '#1677ff' : '#666',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 权限矩阵展示（附加内容） */}
      <div style={{ marginBottom: 16, padding: 12, border: '1px solid #d9d9d9', borderRadius: 6 }}>
        <strong>
          权限矩阵（当前角色：
          {role}
          ）
        </strong>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          {FIELD_DEFS.map((d) => {
            const perm = PERMISSION_MATRIX[d.name]?.[role] ?? 'hidden'
            const style = PERM_STYLES[perm] ?? PERM_STYLES.hidden
            return (
              <span key={d.name} style={{ display: 'inline-block', padding: '0 7px', fontSize: 12, lineHeight: '20px', background: style.background, border: `1px solid ${style.border}`, borderRadius: 4 }}>
                {d.label}
                :
                {' '}
                {perm}
              </span>
            )
          })}
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
                {FIELD_DEFS.map(d => (
                  <FormField key={d.name} name={d.name} fieldProps={getFieldProps(d)} />
                ))}
                {<LayoutFormActions onReset={() => form.reset()} />}
              </form>
            </FormProvider>
          )
        }}
      </StatusTabs>
    </div>
  )
})
