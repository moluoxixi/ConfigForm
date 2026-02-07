/**
 * 场景 17：对象数组嵌套 (Field 版)
 *
 * 覆盖：
 * - 数组中嵌套对象（联系人 → {name, phones: [...]}）
 * - 数组中嵌套数组（联系人 → 多个电话号码）
 * - 多层嵌套操作
 * - 三种模式切换
 *
 * FormField + fieldProps 实现（简单字段用 fieldProps，嵌套数组用 FormArrayField）
 */
import type { ArrayFieldInstance } from '@moluoxixi/core'
import React from 'react'
import { observer } from 'mobx-react-lite'
import { DeleteOutlined, PhoneOutlined, PlusOutlined } from '@ant-design/icons'
import { FormArrayField, FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'
import { Button, Card, Space, Tag, Typography } from 'antd'

const { Title, Paragraph, Text } = Typography

setupAntd()

/** 联系人模板 */
const CONTACT_TEMPLATE = { name: '', role: '', phones: [{ number: '', label: '手机' }] }

/** 电话模板 */
const PHONE_TEMPLATE = { number: '', label: '手机' }

/**
 * 对象数组嵌套示例（Field 版）
 */
export const ObjectArrayNestedForm = observer((): React.ReactElement => {
  const form = useCreateForm({
    initialValues: {
      teamName: '开发团队',
      contacts: [
        { name: '张三', role: '负责人', phones: [{ number: '13800138001', label: '手机' }] },
        { name: '李四', role: '成员', phones: [{ number: '13800138002', label: '手机' }, { number: '010-12345678', label: '座机' }] },
      ],
    },
  })

  return (
    <div>
      <Title level={3}>对象数组嵌套 (Field 版)</Title>
      <Paragraph type="secondary">
        联系人数组 → 每人含嵌套电话数组（多层增删） —— FormField + fieldProps 实现
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
                {/* 团队名称：使用 fieldProps */}
                <FormField name="teamName" fieldProps={{ label: '团队名称', required: true, component: 'Input', componentProps: { style: { width: 300 } } }} />

                {/* 联系人列表 */}
                <FormArrayField
                  name="contacts"
                  fieldProps={{ minItems: 1, maxItems: 10, itemTemplate: () => ({ ...CONTACT_TEMPLATE }) }}
                >
                  {(arrayField: ArrayFieldInstance) => (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <Space>
                          <Text strong>团队成员</Text>
                          <Tag>
                            {((arrayField.value as unknown[]) ?? []).length}
                            /10
                          </Tag>
                        </Space>
                        {mode === 'editable' && (
                          <Button type="primary" icon={<PlusOutlined />} disabled={!arrayField.canAdd} onClick={() => arrayField.push({ ...CONTACT_TEMPLATE })}>
                            添加联系人
                          </Button>
                        )}
                      </div>

                      {((arrayField.value as unknown[]) ?? []).map((_: unknown, idx: number) => {
                        const basePath = `contacts.${idx}`
                        return (
                          <Card
                            key={idx}
                            size="small"
                            title={`联系人 #${idx + 1}`}
                            extra={mode === 'editable'
                              ? <Button size="small" danger icon={<DeleteOutlined />} disabled={!arrayField.canRemove} onClick={() => arrayField.remove(idx)}>删除</Button>
                              : null}
                            style={{ marginBottom: 12 }}
                          >
                            <Space direction="vertical" style={{ width: '100%' }}>
                              <Space>
                                <FormField name={`${basePath}.name`} fieldProps={{ component: 'Input', componentProps: { placeholder: '姓名', addonBefore: '姓名' } }} />
                                <FormField name={`${basePath}.role`} fieldProps={{ component: 'Input', componentProps: { placeholder: '角色', addonBefore: '角色' } }} />
                              </Space>

                              {/* 嵌套电话数组 */}
                              <FormArrayField
                                name={`${basePath}.phones`}
                                fieldProps={{ minItems: 1, maxItems: 5, itemTemplate: () => ({ ...PHONE_TEMPLATE }) }}
                              >
                                {(phoneArray: ArrayFieldInstance) => (
                                  <div style={{ padding: '8px 12px', background: '#fafafa', borderRadius: 4 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                      <Text type="secondary" style={{ fontSize: 12 }}>
                                        电话列表
                                        {' '}
                                        <Tag>
                                          {((phoneArray.value as unknown[]) ?? []).length}
                                          /5
                                        </Tag>
                                      </Text>
                                      {mode === 'editable' && (
                                        <Button size="small" type="dashed" icon={<PlusOutlined />} disabled={!phoneArray.canAdd} onClick={() => phoneArray.push({ ...PHONE_TEMPLATE })}>
                                          添加电话
                                        </Button>
                                      )}
                                    </div>
                                    {((phoneArray.value as unknown[]) ?? []).map((_p: unknown, phoneIdx: number) => {
                                      const phonePath = `${basePath}.phones.${phoneIdx}`
                                      return (
                                        <Space key={phoneIdx} size={4} style={{ width: '100%', marginBottom: 4 }}>
                                          <PhoneOutlined style={{ color: '#999' }} />
                                          <FormField name={`${phonePath}.label`} fieldProps={{ component: 'Input', componentProps: { placeholder: '标签', size: 'small', style: { width: 80 } } }} />
                                          <FormField name={`${phonePath}.number`} fieldProps={{ component: 'Input', componentProps: { placeholder: '电话号码', size: 'small', style: { width: 180 } } }} />
                                          {mode === 'editable' && (
                                            <Button size="small" danger icon={<DeleteOutlined />} disabled={!phoneArray.canRemove} onClick={() => phoneArray.remove(phoneIdx)} />
                                          )}
                                        </Space>
                                      )
                                    })}
                                  </div>
                                )}
                              </FormArrayField>
                            </Space>
                          </Card>
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
