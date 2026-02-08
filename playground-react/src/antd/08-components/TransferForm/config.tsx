import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/core'
import { ConfigForm, registerComponent } from '@moluoxixi/react'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 35：穿梭框 — ConfigForm + Schema
 *
 * 覆盖：
 * - 自定义 TransferPicker 组件注册
 * - 原生双栏穿梭组件
 * - 数据双向穿梭
 * - 搜索过滤
 * - 三种模式切换
 */
import React, { useState } from 'react'

setupAntd()

/** 工具：将 StatusTabs 的 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

/** 权限项接口 */
interface PermissionItem {
  key: string
  title: string
}

/** 操作标签 */
const ACTIONS = ['查看', '编辑', '删除', '审核', '导出']

/** 资源标签 */
const RESOURCES = ['用户', '订单', '商品', '报表']

/** 权限数据（20 项） */
const PERMISSIONS: PermissionItem[] = Array.from({ length: 20 }, (_, i) => ({
  key: `perm-${i + 1}`,
  title: `权限${String(i + 1).padStart(2, '0')} - ${ACTIONS[i % 5]}${RESOURCES[Math.floor(i / 5)]}`,
}))

// ========== 自定义组件：穿梭框选择器 ==========

/** 穿梭框选择器组件 Props */
interface TransferPickerProps {
  /** 已选权限 key 列表 */
  value?: string[]
  /** 值变更回调 */
  onChange?: (keys: string[]) => void
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readOnly?: boolean
  /** 穿梭框数据源 */
  dataSource?: PermissionItem[]
}

/** 列表样式 */
const LIST_STYLE: React.CSSProperties = { width: 320, height: 340, border: '1px solid #d9d9d9', borderRadius: 8, overflow: 'auto' }

/**
 * 穿梭框选择器自定义组件
 *
 * - 编辑态：原生双栏穿梭（支持搜索）
 * - 禁用态：原生双栏穿梭（disabled）
 * - 只读态：已选权限标签列表
 */
const TransferPicker = observer(({ value, onChange, disabled, readOnly, dataSource }: TransferPickerProps): React.ReactElement => {
  const selected = value ?? []
  const source = dataSource ?? PERMISSIONS
  const [leftSearch, setLeftSearch] = useState('')
  const [rightSearch, setRightSearch] = useState('')
  const [leftChecked, setLeftChecked] = useState<string[]>([])
  const [rightChecked, setRightChecked] = useState<string[]>([])

  /* 只读态：标签列表 */
  if (readOnly) {
    if (selected.length === 0) {
      return <span style={{ color: '#999' }}>—</span>
    }
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {selected.map((key) => {
          const perm = source.find(p => p.key === key)
          return <span key={key} style={{ display: 'inline-block', padding: '0 7px', fontSize: 12, background: '#e6f4ff', border: '1px solid #91caff', borderRadius: 4, color: '#1677ff' }}>{perm?.title ?? key}</span>
        })}
      </div>
    )
  }

  /* 编辑态 / 禁用态：双栏穿梭 */
  const leftItems = source.filter(p => !selected.includes(p.key) && p.title.includes(leftSearch))
  const rightItems = source.filter(p => selected.includes(p.key) && p.title.includes(rightSearch))

  /** 左→右 */
  const moveRight = (): void => {
    onChange?.([...selected, ...leftChecked])
    setLeftChecked([])
  }
  /** 右→左 */
  const moveLeft = (): void => {
    onChange?.(selected.filter(k => !rightChecked.includes(k)))
    setRightChecked([])
  }

  /** 切换勾选 */
  const toggle = (key: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>): void => {
    setList(list.includes(key) ? list.filter(k => k !== key) : [...list, key])
  }

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {/* 左侧：可选 */}
      <div style={LIST_STYLE}>
        <div style={{ padding: '4px 8px', borderBottom: '1px solid #f0f0f0', fontSize: 13, fontWeight: 500 }}>可选权限</div>
        <input value={leftSearch} onChange={e => setLeftSearch(e.target.value)} placeholder="搜索" disabled={disabled} style={{ width: 'calc(100% - 16px)', margin: '4px 8px', padding: '2px 8px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 12 }} />
        <div style={{ padding: '0 8px' }}>
          {leftItems.map(item => (
            <label key={item.key} style={{ display: 'flex', gap: 4, padding: '2px 0', fontSize: 12, cursor: disabled ? 'default' : 'pointer' }}>
              <input type="checkbox" checked={leftChecked.includes(item.key)} disabled={disabled} onChange={() => toggle(item.key, leftChecked, setLeftChecked)} />
              {item.title}
            </label>
          ))}
        </div>
      </div>
      {/* 中间：按钮 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button disabled={disabled || leftChecked.length === 0} onClick={moveRight} style={{ padding: '4px 12px', border: '1px solid #d9d9d9', borderRadius: 4, cursor: 'pointer', background: '#fff' }}>→</button>
        <button disabled={disabled || rightChecked.length === 0} onClick={moveLeft} style={{ padding: '4px 12px', border: '1px solid #d9d9d9', borderRadius: 4, cursor: 'pointer', background: '#fff' }}>←</button>
      </div>
      {/* 右侧：已选 */}
      <div style={LIST_STYLE}>
        <div style={{ padding: '4px 8px', borderBottom: '1px solid #f0f0f0', fontSize: 13, fontWeight: 500 }}>已选权限</div>
        <input value={rightSearch} onChange={e => setRightSearch(e.target.value)} placeholder="搜索" disabled={disabled} style={{ width: 'calc(100% - 16px)', margin: '4px 8px', padding: '2px 8px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 12 }} />
        <div style={{ padding: '0 8px' }}>
          {rightItems.map(item => (
            <label key={item.key} style={{ display: 'flex', gap: 4, padding: '2px 0', fontSize: 12, cursor: disabled ? 'default' : 'pointer' }}>
              <input type="checkbox" checked={rightChecked.includes(item.key)} disabled={disabled} onChange={() => toggle(item.key, rightChecked, setRightChecked)} />
              {item.title}
            </label>
          ))}
        </div>
      </div>
    </div>
  )
})

registerComponent('TransferPicker', TransferPicker, { defaultWrapper: 'FormItem' })

// ========== Schema & 初始值 ==========

/** 默认初始值 */
const INITIAL_VALUES: Record<string, unknown> = {
  roleName: '管理员',
  permissions: ['perm-1', 'perm-3', 'perm-5'],
}

/** 表单 Schema */
const schema: ISchema = {
  type: 'object',
  decoratorProps: {
    labelPosition: 'right',
    labelWidth: '120px',
    actions: { submit: '提交', reset: '重置' },
  },
  properties: {
    roleName: {
      type: 'string',
      title: '角色名称',
      required: true,
      component: 'Input',
      componentProps: { placeholder: '请输入角色名称', style: { width: 300 } },
    },
    permissions: {
      type: 'array',
      title: '权限分配',
      required: true,
      component: 'TransferPicker',
      componentProps: { dataSource: PERMISSIONS },
    },
  },
}

/**
 * 穿梭框表单 — ConfigForm + Schema
 *
 * 展示原生穿梭框权限分配、搜索过滤、三种模式切换
 */
export const TransferForm = observer((): React.ReactElement => (
  <div>
    <h2>穿梭框</h2>
    <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>原生 Transfer / 权限分配 / 搜索过滤 / 三种模式 — ConfigForm + Schema</p>
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
