/**
 * 场景 38：图标选择器
 *
 * 覆盖：
 * - 图标网格选择
 * - 搜索过滤
 * - 选中高亮
 * - 三种模式切换
 *
 * 自定义 IconSelector 组件注册后，在 fieldProps 中通过 component: 'IconSelector' 引用。
 */
import React, { useMemo, useState } from 'react'
import * as Icons from '@ant-design/icons'
import { observer } from 'mobx-react-lite'
import { FormField, FormProvider, registerComponent, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'

setupAntd()

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
          ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0 7px', fontSize: 14, lineHeight: '22px', background: '#e6f4ff', color: '#1677ff', border: '1px solid #91caff', borderRadius: 4 }}>
              {renderIcon(value)}
              {value}
            </span>
          )
          : <span style={{ color: '#999' }}>未选择</span>}
      </div>

      {/* 搜索和图标网格（仅编辑态） */}
      {isEditable && (
        <>
          <input
            placeholder="搜索图标名称"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 300, marginBottom: 8, padding: '4px 11px', borderRadius: 6, border: '1px solid #d9d9d9', outline: 'none' }}
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

// ========== 表单组件 ==========

/**
 * 图标选择器表单
 *
 * 展示图标网格选择、搜索过滤、选中高亮、三种模式切换
 */
export const IconSelectorForm = observer((): React.ReactElement => {
  const form = useCreateForm({ initialValues: { menuName: '首页', icon: 'HomeOutlined' } })

  return (
    <div>
      <h3>图标选择器</h3>
      <p style={{ color: '#666' }}>@ant-design/icons 图标网格 / 搜索过滤 / 选中高亮</p>
      <StatusTabs>
        {({ mode, showResult, showErrors }) => {
          form.pattern = mode
          return (
            <FormProvider form={form}>
                <FormField name="menuName" fieldProps={{ label: '菜单名称', required: true, component: 'Input', componentProps: { style: { width: 300 } } }} />
                <FormField name="icon" fieldProps={{ label: '图标', required: true, component: 'IconSelector' }} />
                <LayoutFormActions onSubmit={showResult} onSubmitFailed={showErrors} />
            </FormProvider>
          )
        }}
      </StatusTabs>
    </div>
  )
})
