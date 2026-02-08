import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'
import { ConfigForm, registerComponent } from '@moluoxixi/react'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 36：树形选择 — ConfigForm + Schema
 *
 * 覆盖：
 * - 自定义 DepartmentTreeSelect 组件注册
 * - antd TreeSelect 组件集成
 * - 多选 / 单选
 * - 三种模式切换
 */
import React from 'react'

setupAntd()

/** 工具：将 StatusTabs 的 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

/** 组织树数据 */
const TREE_DATA = [
  { title: '总公司', value: 'root', children: [
    { title: '技术中心', value: 'tech', children: [
      { title: '前端组', value: 'frontend' },
      { title: '后端组', value: 'backend' },
      { title: '测试组', value: 'qa' },
    ] },
    { title: '产品中心', value: 'product', children: [
      { title: '产品设计', value: 'pd' },
      { title: '用户研究', value: 'ux' },
    ] },
    { title: '运营中心', value: 'operation', children: [
      { title: '市场部', value: 'market' },
      { title: '客服部', value: 'service' },
    ] },
  ] },
]

// ========== 自定义组件：部门树选择器 ==========

/** 部门树选择器 Props */
interface DepartmentTreeSelectProps {
  /** 选中的值（单选为 string，多选为 string[]） */
  value?: string | string[]
  /** 值变更回调 */
  onChange?: (v: string | string[]) => void
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readOnly?: boolean
  /** 是否多选模式 */
  multiple?: boolean
}

/**
 * 部门树选择器组件
 *
 * - 编辑态：TreeSelect 单选/多选
 * - 只读/禁用态：Tag 展示选中值
 *
 * 通过 multiple prop 切换单选/多选模式
 */
const DepartmentTreeSelect = observer(({ value, onChange, disabled, readOnly, multiple }: DepartmentTreeSelectProps): React.ReactElement => {
  const isEditable = !disabled && !readOnly

  /* 只读/禁用态：Tag 展示 */
  if (!isEditable) {
    if (multiple) {
      const values = (value as string[]) ?? []
      return values.length > 0
        ? <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>{values.map(v => <span key={v} style={{ display: 'inline-block', padding: '0 7px', fontSize: 12, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4, color: '#52c41a' }}>{v}</span>)}</div>
        : <span>—</span>
    }
    return <span style={{ display: 'inline-block', padding: '0 7px', fontSize: 12, background: '#e6f4ff', border: '1px solid #91caff', borderRadius: 4, color: '#1677ff' }}>{(value as string) ?? '—'}</span>
  }

  /* 编辑态：多选 TreeSelect */
  if (multiple) {
    return (
      <TreeSelect
        value={(value as string[]) ?? []}
        onChange={v => onChange?.(v)}
        treeData={TREE_DATA}
        placeholder="请选择可访问部门"
        style={{ width: '100%' }}
        treeDefaultExpandAll
        treeCheckable
        showCheckedStrategy={TreeSelect.SHOW_CHILD}
        disabled={disabled}
      />
    )
  }

  /* 编辑态：单选 TreeSelect */
  return (
    <TreeSelect
      value={(value as string) ?? undefined}
      onChange={v => onChange?.(v)}
      treeData={TREE_DATA}
      placeholder="请选择部门"
      style={{ width: 300 }}
      treeDefaultExpandAll
      disabled={disabled}
    />
  )
})

registerComponent('DepartmentTreeSelect', DepartmentTreeSelect, { defaultWrapper: 'FormItem' })

// ========== Schema & 初始值 ==========

/** 默认初始值 */
const INITIAL_VALUES: Record<string, unknown> = {
  memberName: '',
  department: undefined,
  accessDepts: [],
}

/** 表单 Schema */
const schema: ISchema = {
  type: 'object',
  decoratorProps: {
    labelPosition: 'right',
    labelWidth: '160px',
    actions: { submit: '提交', reset: '重置' },
  },
  properties: {
    memberName: {
      type: 'string',
      title: '成员姓名',
      required: true,
      component: 'Input',
      componentProps: { style: { width: 300 } },
    },
    department: {
      type: 'string',
      title: '所属部门',
      required: true,
      component: 'DepartmentTreeSelect',
    },
    accessDepts: {
      type: 'array',
      title: '可访问部门（多选）',
      component: 'DepartmentTreeSelect',
      componentProps: { multiple: true },
    },
  },
}

/**
 * 树形选择表单 — ConfigForm + Schema
 *
 * 展示单选/多选树形选择、组织树结构、三种模式切换
 */
export const TreeSelectForm = observer((): React.ReactElement => (
  <div>
    <h2>树形选择</h2>
    <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>antd TreeSelect / 单选 + 多选 / 组织树结构 / 三种模式 — ConfigForm + Schema</p>
    <StatusTabs>
      {({ mode, showResult, showErrors }) => (
        <ConfigForm
          schema={withMode(schema, mode)}
          initialValues={INITIAL_VALUES}
          onSubmit={showResult}
          onSubmitFailed={errors => showErrors(errors)}
        />
      )}
    </StatusTabs>
  </div>
))
