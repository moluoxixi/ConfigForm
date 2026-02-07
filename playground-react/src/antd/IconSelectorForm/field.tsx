import type { FieldInstance } from '@moluoxixi/core'
import * as Icons from '@ant-design/icons'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
import { Form, Input, Tag, Typography } from 'antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 38：图标选择器
 *
 * 覆盖：
 * - 图标网格选择
 * - 搜索过滤
 * - 选中高亮
 * - 三种模式切换
 */
import React, { useEffect, useMemo, useState } from 'react'

const { Title, Paragraph, Text } = Typography

setupAntd()

/** 常用图标列表 */
const ICON_LIST = [
  'HomeOutlined',
  'UserOutlined',
  'SettingOutlined',
  'SearchOutlined',
  'BellOutlined',
  'HeartOutlined',
  'StarOutlined',
  'CheckCircleOutlined',
  'CloseCircleOutlined',
  'InfoCircleOutlined',
  'WarningOutlined',
  'EditOutlined',
  'DeleteOutlined',
  'PlusOutlined',
  'MinusOutlined',
  'MailOutlined',
  'PhoneOutlined',
  'LockOutlined',
  'UnlockOutlined',
  'CloudOutlined',
  'DownloadOutlined',
  'UploadOutlined',
  'FileOutlined',
  'FolderOutlined',
  'CopyOutlined',
  'ShareAltOutlined',
  'LinkOutlined',
  'TeamOutlined',
  'CalendarOutlined',
  'ClockCircleOutlined',
  'DatabaseOutlined',
  'ApiOutlined',
  'CodeOutlined',
  'BugOutlined',
  'RocketOutlined',
  'ThunderboltOutlined',
  'FireOutlined',
  'CrownOutlined',
  'GiftOutlined',
  'TrophyOutlined',
]

/** 渲染图标 */
function renderIcon(name: string, style?: React.CSSProperties): React.ReactElement | null {
  const IconComp = (Icons as Record<string, React.ComponentType<{ style?: React.CSSProperties }>>)[name]
  return IconComp ? <IconComp style={style} /> : null
}

export const IconSelectorForm = observer((): React.ReactElement => {
  const [search, setSearch] = useState('')

  const form = useCreateForm({ initialValues: { menuName: '首页', icon: 'HomeOutlined' } })

  useEffect(() => {
    form.createField({ name: 'menuName', label: '菜单名称', required: true })
    form.createField({ name: 'icon', label: '图标', required: true })
  }, [])

  const filteredIcons = useMemo(
    () => search ? ICON_LIST.filter(name => name.toLowerCase().includes(search.toLowerCase())) : ICON_LIST,
    [search],
  )

  return (
    <div>
      <Title level={3}>图标选择器</Title>
      <Paragraph type="secondary">@ant-design/icons 图标网格 / 搜索过滤 / 选中高亮</Paragraph>
      <StatusTabs>
        {({ mode }) => {
          form.pattern = mode
          return (
            <FormProvider form={form}>
              <FormField name="menuName">
                {(field: FieldInstance) => (
                  <Form.Item label={field.label} required={field.required}>
                    <Input value={(field.value as string) ?? ''} onChange={e => field.setValue(e.target.value)} disabled={mode === 'disabled'} readOnly={mode === 'readOnly'} style={{ width: 300 }} />
                  </Form.Item>
                )}
              </FormField>

              <FormField name="icon">
                {(field: FieldInstance) => (
                  <Form.Item label={field.label} required={field.required}>
                    {/* 当前选中 */}
                    <div style={{ marginBottom: 8 }}>
                      <Text>当前选中：</Text>
                      {(field.value as string)
                        ? (
                            <Tag icon={renderIcon(field.value as string)} color="blue" style={{ fontSize: 14 }}>
                              {field.value as string}
                            </Tag>
                          )
                        : (
                            <Text type="secondary">未选择</Text>
                          )}
                    </div>

                    {mode === 'editable' && (
                      <>
                        <Input
                          placeholder="搜索图标名称"
                          value={search}
                          onChange={e => setSearch(e.target.value)}
                          style={{ width: 300, marginBottom: 8 }}
                          allowClear
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 4, maxHeight: 300, overflow: 'auto', border: '1px solid #d9d9d9', borderRadius: 6, padding: 8 }}>
                          {filteredIcons.map(name => (
                            <div
                              key={name}
                              onClick={() => field.setValue(name)}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                padding: 8,
                                borderRadius: 4,
                                cursor: 'pointer',
                                background: field.value === name ? '#e6f4ff' : 'transparent',
                                border: field.value === name ? '1px solid #1677ff' : '1px solid transparent',
                              }}
                            >
                              {renderIcon(name, { fontSize: 24 })}
                              <Text style={{ fontSize: 10, marginTop: 4, textAlign: 'center', wordBreak: 'break-all' }}>
                                {name.replace('Outlined', '')}
                              </Text>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </Form.Item>
                )}
              </FormField>
            </FormProvider>
          )
        }}
      </StatusTabs>
    </div>
  )
})
