import type { ArrayFieldInstance, FieldInstance } from '@moluoxixi/core'
import type { FieldPattern } from '@moluoxixi/shared'
import { DeleteOutlined, PhoneOutlined, PlusOutlined } from '@ant-design/icons'
import { FormArrayField, FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
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
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', width: '100%', marginBottom: 4 }}>
      <PhoneOutlined style={{ color: '#999' }} />
      <FormField name={`${basePath}.label`}>
        {(field: FieldInstance) => (
          <input
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
          <input
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
        <button style={{ padding: '0 8px', height: 24, fontSize: 12, background: '#fff', color: '#ff4d4f', border: '1px solid #ff4d4f', borderRadius: 4, cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }} disabled={!phoneArray.canRemove} onClick={() => phoneArray.remove(phoneIdx)}>{<DeleteOutlined />}</button>
      )}
    </div>
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
    <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, marginBottom: 12 }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', borderBottom: '1px solid #f0f0f0' }}><span style={{ fontWeight: 500 }}>{(
        <span>
          联系人 #
          {index + 1}
        </span>
      )}</span>{
        isEditable
          ? (
              <button style={{ padding: '0 8px', height: 24, fontSize: 12, background: '#fff', color: '#ff4d4f', border: '1px solid #ff4d4f', borderRadius: 4, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }} disabled={!arrayField.canRemove} onClick={() => arrayField.remove(index)}>{<DeleteOutlined />} 
                删除
              </button>
            )
          : null
      }</div><div style={{ padding: 16 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <FormField name={`${basePath}.name`}>
            {(field: FieldInstance) => (
              <input
                value={(field.value as string) ?? ''}
                onChange={e => field.setValue(e.target.value)}
                placeholder="姓名"
                placeholder="姓名"
                disabled={pattern === 'disabled'}
                readOnly={pattern === 'readOnly'}
              />
            )}
          </FormField>
          <FormField name={`${basePath}.role`}>
            {(field: FieldInstance) => (
              <input
                value={(field.value as string) ?? ''}
                onChange={e => field.setValue(e.target.value)}
                placeholder="角色"
                placeholder="角色"
                disabled={pattern === 'disabled'}
                readOnly={pattern === 'readOnly'}
              />
            )}
          </FormField>
        </div>

        {/* 嵌套电话数组 */}
        <FormArrayField
          name={`${basePath}.phones`}
          fieldProps={{ minItems: 1, maxItems: 5, itemTemplate: () => ({ ...PHONE_TEMPLATE }) }}
        >
          {(phoneArray: ArrayFieldInstance) => (
            <div style={{ padding: '8px 12px', background: '#fafafa', borderRadius: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>
                  电话列表
                  {' '}
                  <span style={{ display: 'inline-block', padding: '0 7px', fontSize: 12, background: '#f0f0f0', border: '1px solid #d9d9d9', borderRadius: 4 }}>
                    {((phoneArray.value as unknown[]) ?? []).length}
                    /5
                  </span>
                </span>
                {isEditable && (
                  <button style={{ padding: '0 8px', height: 24, fontSize: 12, background: '#fff', border: '1px dashed #d9d9d9', borderRadius: 4, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }} disabled={!phoneArray.canAdd} onClick={() => phoneArray.push({ ...PHONE_TEMPLATE })}><PlusOutlined />
                    添加电话
                  </button>
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
      </div>
    </div></div>
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
      <h2>对象数组嵌套</h2>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>
        联系人数组 → 每人含嵌套电话数组（多层增删）
      </p>

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
                      <input
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
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <strong>团队成员</strong>
                          <span style={{ display: 'inline-block', padding: '0 7px', fontSize: 12, background: '#f0f0f0', border: '1px solid #d9d9d9', borderRadius: 4 }}>
                            {((arrayField.value as unknown[]) ?? []).length}
                            /10
                          </span>
                        </div>
                        {mode === 'editable' && (
                          <button style={{ padding: '4px 12px', fontSize: 14, background: '#1677ff', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }} disabled={!arrayField.canAdd} onClick={() => arrayField.push({ ...CONTACT_TEMPLATE })}><PlusOutlined />
                            添加联系人
                          </button>
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
