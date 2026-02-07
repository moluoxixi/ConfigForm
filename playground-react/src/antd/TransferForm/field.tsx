import { FormField, FormProvider, registerComponent, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'
import { Tag, Transfer, Typography } from 'antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 35：穿梭框
 *
 * 覆盖：
 * - antd Transfer 组件集成
 * - 数据双向穿梭
 * - 搜索过滤
 * - 三种模式切换
 */
import React from 'react'

const { Title, Paragraph } = Typography

setupAntd()

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

/** 穿梭框选择器组件 Props */
interface TransferPickerProps {
  value: string[]
  onChange: (keys: string[]) => void
  disabled: boolean
  readOnly: boolean
  dataSource: PermissionItem[]
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

  /* 只读态：Tag 标签列表 */
  if (readOnly) {
    if (selected.length === 0) {
      return <span style={{ color: '#999' }}>—</span>
    }
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {selected.map((key) => {
          const perm = dataSource.find(p => p.key === key)
          return <Tag key={key} color="blue">{perm?.title ?? key}</Tag>
        })}
      </div>
    )
  }

  /* 编辑态 / 禁用态：antd Transfer */
  return (
    <Transfer
      dataSource={dataSource}
      targetKeys={selected}
      onChange={keys => onChange(keys as string[])}
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

export const TransferForm = observer((): React.ReactElement => {
  const form = useCreateForm({
    initialValues: { roleName: '管理员', permissions: ['perm-1', 'perm-3', 'perm-5'] },
  })

  return (
    <div>
      <Title level={3}>穿梭框</Title>
      <Paragraph type="secondary">antd Transfer / 权限分配 / 搜索过滤 / 三种模式</Paragraph>
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
                <FormField name="roleName" fieldProps={{ label: '角色名称', required: true, component: 'Input', componentProps: { placeholder: '请输入角色名称', style: { width: 300 } } }} />
                <FormField name="permissions" fieldProps={{ label: '权限分配', required: true, component: 'TransferPicker', componentProps: { dataSource: PERMISSIONS } }} />
                {mode === 'editable' && <LayoutFormActions onReset={() => form.reset()} />}
              </form>
            </FormProvider>
          )
        }}
      </StatusTabs>
    </div>
  )
})
