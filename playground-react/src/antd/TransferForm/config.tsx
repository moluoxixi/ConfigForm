import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'
import { ConfigForm, registerComponent } from '@moluoxixi/react'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
import { Tag, Transfer, Typography } from 'antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 35：穿梭框 — ConfigForm + Schema
 *
 * 覆盖：
 * - 自定义 TransferPicker 组件注册
 * - antd Transfer 组件集成
 * - 数据双向穿梭
 * - 搜索过滤
 * - 三种模式切换
 */
import React from 'react'

const { Title, Paragraph } = Typography

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

/**
 * 穿梭框选择器自定义组件
 *
 * - 编辑态：antd Transfer（双栏穿梭，支持搜索）
 * - 禁用态：antd Transfer（disabled）
 * - 只读态：已选权限 Tag 标签列表
 */
const TransferPicker = observer(({ value, onChange, disabled, readOnly, dataSource }: TransferPickerProps): React.ReactElement => {
  const selected = value ?? []
  const source = dataSource ?? PERMISSIONS

  /* 只读态：Tag 标签列表 */
  if (readOnly) {
    if (selected.length === 0) {
      return <span style={{ color: '#999' }}>—</span>
    }
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {selected.map((key) => {
          const perm = source.find(p => p.key === key)
          return <Tag key={key} color="blue">{perm?.title ?? key}</Tag>
        })}
      </div>
    )
  }

  /* 编辑态 / 禁用态：antd Transfer */
  return (
    <Transfer
      dataSource={source}
      targetKeys={selected}
      onChange={keys => onChange?.(keys as string[])}
      render={item => item.title}
      showSearch
      listStyle={{ width: 320, height: 340 }}
      titles={['可选权限', '已选权限']}
      disabled={disabled}
      filterOption={(input, item) => (item?.title ?? '').includes(input)}
    />
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
 * 展示 antd Transfer 权限分配、搜索过滤、三种模式切换
 */
export const TransferForm = observer((): React.ReactElement => (
  <div>
    <Title level={3}>穿梭框</Title>
    <Paragraph type="secondary">antd Transfer / 权限分配 / 搜索过滤 / 三种模式 — ConfigForm + Schema</Paragraph>
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
