/**
 * 场景 15：数组字段 (Field 版)
 *
 * 覆盖：
 * - 动态增删项（push / remove）
 * - 排序（moveUp / moveDown）
 * - 复制项（duplicate）
 * - 最大 / 最小数量限制
 * - 三种模式切换
 *
 * FormField + fieldProps 实现（简单字段用 fieldProps，数组部分用 FormArrayField）
 */
import type { ArrayFieldInstance } from '@moluoxixi/core'
import React from 'react'
import { observer } from 'mobx-react-lite'
import { FormArrayField, FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'
import { ArrowDownOutlined, ArrowUpOutlined, CopyOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Space, Tag, Typography } from 'antd'

const { Title, Paragraph, Text } = Typography

setupAntd()

/** 数组限制 */
const MIN_ITEMS = 1
const MAX_ITEMS = 8

/** 联系人模板 */
const CONTACT_TEMPLATE = { name: '', phone: '', email: '' }

/**
 * 数组字段示例（Field 版）
 */
export const ArrayFieldForm = observer((): React.ReactElement => {
  const form = useCreateForm({
    initialValues: {
      groupName: '默认分组',
      contacts: [{ ...CONTACT_TEMPLATE }],
    },
  })

  return (
    <div>
      <Title level={3}>数组字段 (Field 版)</Title>
      <Paragraph type="secondary">
        增删 / 排序 / 复制 / min=
        {MIN_ITEMS}
        {' '}
        max=
        {MAX_ITEMS}
        {' '}
        数量限制 —— FormField + fieldProps 实现
      </Paragraph>

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
                {/* 分组名称：使用 fieldProps */}
                <FormField name="groupName" fieldProps={{
                  label: '分组名称',
                  required: true,
                  component: 'Input',
                  componentProps: { placeholder: '请输入分组名称', style: { width: 300 } },
                }}
                />

                {/* 联系人列表：使用 FormArrayField */}
                <FormArrayField
                  name="contacts"
                  fieldProps={{ minItems: MIN_ITEMS, maxItems: MAX_ITEMS, itemTemplate: () => ({ ...CONTACT_TEMPLATE }) }}
                >
                  {(arrayField: ArrayFieldInstance) => (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <Space>
                          <Text strong>联系人列表</Text>
                          <Tag>
                            {((arrayField.value as unknown[]) ?? []).length}
                            /
                            {MAX_ITEMS}
                          </Tag>
                        </Space>
                        {mode === 'editable' && (
                          <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            size="small"
                            disabled={!arrayField.canAdd}
                            onClick={() => arrayField.push({ ...CONTACT_TEMPLATE })}
                          >
                            添加联系人
                          </Button>
                        )}
                      </div>

                      {/* 表头 */}
                      <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 1fr auto', gap: 8, padding: '8px 12px', background: '#f0f0f0', borderRadius: '4px 4px 0 0', fontWeight: 600, fontSize: 13 }}>
                        <span>#</span>
                        <span>姓名</span>
                        <span>电话</span>
                        <span>邮箱</span>
                        {mode === 'editable' && <span>操作</span>}
                      </div>

                      {/* 行数据：每行子字段使用 fieldProps */}
                      {((arrayField.value as unknown[]) ?? []).map((_: unknown, idx: number) => {
                        const total = ((arrayField.value as unknown[]) ?? []).length
                        const basePath = `contacts.${idx}`
                        return (
                          <div
                            key={idx}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '40px 1fr 1fr 1fr auto',
                              gap: 8,
                              alignItems: 'center',
                              padding: '8px 12px',
                              background: idx % 2 === 0 ? '#fafafa' : '#fff',
                              borderRadius: 4,
                            }}
                          >
                            <Text type="secondary">
                              #
                              {idx + 1}
                            </Text>
                            <FormField name={`${basePath}.name`} fieldProps={{ component: 'Input', componentProps: { placeholder: '姓名', size: 'small' } }} />
                            <FormField name={`${basePath}.phone`} fieldProps={{ component: 'Input', componentProps: { placeholder: '电话', size: 'small' } }} />
                            <FormField name={`${basePath}.email`} fieldProps={{ component: 'Input', componentProps: { placeholder: '邮箱', size: 'small' } }} />
                            {mode === 'editable' && (
                              <Space size={4}>
                                <Button size="small" icon={<ArrowUpOutlined />} disabled={idx === 0} onClick={() => arrayField.moveUp(idx)} />
                                <Button size="small" icon={<ArrowDownOutlined />} disabled={idx === total - 1} onClick={() => arrayField.moveDown(idx)} />
                                <Button size="small" icon={<CopyOutlined />} disabled={!arrayField.canAdd} onClick={() => arrayField.duplicate(idx)} />
                                <Button size="small" danger icon={<DeleteOutlined />} disabled={!arrayField.canRemove} onClick={() => arrayField.remove(idx)} />
                              </Space>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </FormArrayField>
                {mode === 'editable' && <LayoutFormActions onReset={() => form.reset()} />}
              </form>
            </FormProvider>
          )
        }}
      </StatusTabs>
    </div>
  )
})
