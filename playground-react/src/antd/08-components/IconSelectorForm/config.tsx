import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/core'
import * as Icons from '@ant-design/icons'
import { ConfigForm, registerComponent } from '@moluoxixi/react'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 38：图标选择器 — ConfigForm + Schema
 *
 * 覆盖：
 * - 自定义 IconSelector 组件注册
 * - 图标网格选择
 * - 搜索过滤
 * - 选中高亮
 * - 三种模式切换
 */
import React, { useMemo, useState } from 'react'

setupAntd()

/** 工具：将 StatusTabs 的 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

/** 常用图标列表 */
const ICON_LIST = [
  'HomeOutlined', 'UserOutlined', 'SettingOutlined', 'SearchOutlined',
  'BellOutlined', 'HeartOutlined', 'StarOutlined', 'CheckCircleOutlined',
  'CloseCircleOutlined', 'InfoCircleOutlined', 'WarningOutlined', 'EditOutlined',
  'DeleteOutlined', 'PlusOutlined', 'MinusOutlined', 'MailOutlined',
  'PhoneOutlined', 'LockOutlined', 'UnlockOutlined', 'CloudOutlined',
  'DownloadOutlined', 'UploadOutlined', 'FileOutlined', 'FolderOutlined',
  'CopyOutlined', 'ShareAltOutlined', 'LinkOutlined', 'TeamOutlined',
  'CalendarOutlined', 'ClockCircleOutlined', 'DatabaseOutlined', 'ApiOutlined',
  'CodeOutlined', 'BugOutlined', 'RocketOutlined', 'ThunderboltOutlined',
  'FireOutlined', 'CrownOutlined', 'GiftOutlined', 'TrophyOutlined',
]

/** 渲染图标组件 */
function renderIcon(name: string, style?: React.CSSProperties): React.ReactElement | null {
  const IconComp = (Icons as Record<string, React.ComponentType<{ style?: React.CSSProperties }>>)[name]
  return IconComp ? <IconComp style={style} /> : null
}

// ========== 自定义组件：图标选择器 ==========

/** 图标选择器 Props */
interface IconSelectorProps {
  /** 当前选中的图标名称 */
  value?: string
  /** 值变更回调 */
  onChange?: (v: string) => void
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readOnly?: boolean
}

/**
 * 图标选择器组件
 *
 * - 编辑态：搜索框 + 图标网格 + 选中高亮
 * - 只读/禁用态：仅展示当前选中的图标
 */
const IconSelector = observer(({ value, onChange, disabled, readOnly }: IconSelectorProps): React.ReactElement => {
  const [search, setSearch] = useState('')
  const isEditable = !disabled && !readOnly

  const filteredIcons = useMemo(
    () => search ? ICON_LIST.filter(name => name.toLowerCase().includes(search.toLowerCase())) : ICON_LIST,
    [search],
  )

  return (
    <div>
      {/* 当前选中 */}
      <div style={{ marginBottom: 8 }}>
        <span>当前选中：</span>
        {value
          ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0 7px', fontSize: 14, background: '#e6f4ff', border: '1px solid #91caff', borderRadius: 4, color: '#1677ff' }}>{renderIcon(value)}{value}</span>
          : <span style={{ color: 'rgba(0,0,0,0.45)' }}>未选择</span>}
      </div>

      {/* 搜索和图标网格（仅编辑态） */}
      {isEditable && (
        <>
          <input
            placeholder="搜索图标名称"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 300, marginBottom: 8, padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: 6 }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 4, maxHeight: 300, overflow: 'auto', border: '1px solid #d9d9d9', borderRadius: 6, padding: 8 }}>
            {filteredIcons.map(name => (
              <div
                key={name}
                onClick={() => onChange?.(name)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: 8,
                  borderRadius: 4,
                  cursor: 'pointer',
                  background: value === name ? '#e6f4ff' : 'transparent',
                  border: value === name ? '1px solid #1677ff' : '1px solid transparent',
                }}
              >
                {renderIcon(name, { fontSize: 24 })}
                <span style={{ fontSize: 10, marginTop: 4, textAlign: 'center', wordBreak: 'break-all' }}>
                  {name.replace('Outlined', '')}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
})

registerComponent('IconSelector', IconSelector, { defaultWrapper: 'FormItem' })

// ========== Schema & 初始值 ==========

/** 默认初始值 */
const INITIAL_VALUES: Record<string, unknown> = {
  menuName: '首页',
  icon: 'HomeOutlined',
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
    menuName: {
      type: 'string',
      title: '菜单名称',
      required: true,
      component: 'Input',
      componentProps: { style: { width: 300 } },
    },
    icon: {
      type: 'string',
      title: '图标',
      required: true,
      component: 'IconSelector',
    },
  },
}

/**
 * 图标选择器表单 — ConfigForm + Schema
 *
 * 展示图标网格选择、搜索过滤、选中高亮、三种模式切换
 */
export const IconSelectorForm = observer((): React.ReactElement => (
  <div>
    <h2>图标选择器</h2>
    <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>@ant-design/icons 图标网格 / 搜索过滤 / 选中高亮 — ConfigForm + Schema</p>
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
