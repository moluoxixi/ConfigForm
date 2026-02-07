import type { ArrayFieldInstance, FieldInstance } from '@moluoxixi/core'
import type { FieldPattern } from '@moluoxixi/shared'
import { DeleteOutlined, PhoneOutlined, PlusOutlined } from '@ant-design/icons'
import { FormArrayField, FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
import {
  Button,
  Card,
  Input,
  Space,
  Tag,
  Typography,
} from 'antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 17：对象数组嵌套
 *
 * 覆盖：
 * - 数组中嵌套对象（联系人 → {name, phones: [...]}）
 * - 数组中嵌套数组（联系人 → 多个电话号码）
 * - 多层嵌套操作
 * - 三种模式切换
 */
import React, { useEffect } from 'react'

const { Title, Paragraph, Text } = Typography

setupAntd()

/** 联系人模板 */
const CONTACT_TEMPLATE = {
  name: '',
  role: '',
  phones: [{ number: '', label: '手机' }],
}

/** 电话模板 */
const PHONE_TEMPLATE = { number: '', label: '手机' }

/**
 * 电话子项
 */
const PhoneItem = observer(({
  contactIdx,
  phoneIdx,
  phoneArray,
  pattern,
}: {
  contactIdx: number
  phoneIdx: number
  phoneArray: ArrayFieldInstance
  pattern: FieldPattern
}): React.ReactElement => {
  const isEditable = pattern === 'editable'
  const basePath = `contacts.${contactIdx}.phones.${phoneIdx}`

  return (
    <Space size={4} style={{ width: '100%', marginBottom: 4 }}>
      <PhoneOutlined style={{ color: '#999' }} />
      <FormField name={`${basePath}.label`}>
        {(field: FieldInstance) => (
          <Input
            value={(field.value as string) ?? ''}
            onChange={e => field.setValue(e.target.value)}
            placeholder="标签"
            size="small"
            style={{ width: 80 }}
            disabled={pattern === 'disabled'}
            readOnly={pattern === 'readOnly'}
          />
        )}
      </FormField>
      <FormField name={`${basePath}.number`}>
        {(field: FieldInstance) => (
          <Input
            value={(field.value as string) ?? ''}
            onChange={e => field.setValue(e.target.value)}
            placeholder="电话号码"
            size="small"
            style={{ width: 180 }}
            disabled={pattern === 'disabled'}
            readOnly={pattern === 'readOnly'}
          />
        )}
      </FormField>
      {isEditable && (
        <Button
          size="small"
          danger
          icon={<DeleteOutlined />}
          disabled={!phoneArray.canRemove}
          onClick={() => phoneArray.remove(phoneIdx)}
        />
      )}
    </Space>
  )
})

/**
 * 联系人卡片
 */
const ContactCard = observer(({
  index,
  arrayField,
  pattern,
}: {
  index: number
  arrayField: ArrayFieldInstance
  pattern: FieldPattern
}): React.ReactElement => {
  const isEditable = pattern === 'editable'
  const basePath = `contacts.${index}`

  return (
    <Card
      size="small"
      title={(
        <span>
          联系人 #
          {index + 1}
        </span>
      )}
      extra={
        isEditable
          ? (
              <Button size="small" danger icon={<DeleteOutlined />} disabled={!arrayField.canRemove} onClick={() => arrayField.remove(index)}>
                删除
              </Button>
            )
          : null
      }
      style={{ marginBottom: 12 }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space>
          <FormField name={`${basePath}.name`}>
            {(field: FieldInstance) => (
              <Input
                value={(field.value as string) ?? ''}
                onChange={e => field.setValue(e.target.value)}
                placeholder="姓名"
                addonBefore="姓名"
                disabled={pattern === 'disabled'}
                readOnly={pattern === 'readOnly'}
              />
            )}
          </FormField>
          <FormField name={`${basePath}.role`}>
            {(field: FieldInstance) => (
              <Input
                value={(field.value as string) ?? ''}
                onChange={e => field.setValue(e.target.value)}
                placeholder="角色"
                addonBefore="角色"
                disabled={pattern === 'disabled'}
                readOnly={pattern === 'readOnly'}
              />
            )}
          </FormField>
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
                {isEditable && (
                  <Button
                    size="small"
                    type="dashed"
                    icon={<PlusOutlined />}
                    disabled={!phoneArray.canAdd}
                    onClick={() => phoneArray.push({ ...PHONE_TEMPLATE })}
                  >
                    添加电话
                  </Button>
                )}
              </div>
              {((phoneArray.value as unknown[]) ?? []).map((_: unknown, phoneIdx: number) => (
                <PhoneItem
                  key={phoneIdx}
                  contactIdx={index}
                  phoneIdx={phoneIdx}
                  phoneArray={phoneArray}
                  pattern={pattern}
                />
              ))}
            </div>
          )}
        </FormArrayField>
      </Space>
    </Card>
  )
})

/**
 * 对象数组嵌套示例
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

  useEffect(() => {
    form.createField({ name: 'teamName', label: '团队名称', required: true })
  }, [])

  return (
    <div>
      <Title level={3}>对象数组嵌套</Title>
      <Paragraph type="secondary">
        联系人数组 → 每人含嵌套电话数组（多层增删）
      </Paragraph>

      <StatusTabs resultTitle="提交结果（嵌套结构）">
        {({ mode }) => {
          form.pattern = mode
          return (
            <FormProvider form={form}>
              <>
                <FormField name="teamName">
                  {(field: FieldInstance) => (
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                        {field.label}
                        {' '}
                        *
                      </label>
                      <Input
                        value={(field.value as string) ?? ''}
                        onChange={e => field.setValue(e.target.value)}
                        style={{ width: 300 }}
                        disabled={mode === 'disabled'}
                        readOnly={mode === 'readOnly'}
                      />
                    </div>
                  )}
                </FormField>

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
                      {((arrayField.value as unknown[]) ?? []).map((_: unknown, idx: number) => (
                        <ContactCard key={idx} index={idx} arrayField={arrayField} pattern={mode} />
                      ))}
                    </div>
                  )}
                </FormArrayField>
              </>
            </FormProvider>
          )
        }}
      </StatusTabs>
    </div>
  )
})
