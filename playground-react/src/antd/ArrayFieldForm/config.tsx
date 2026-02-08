import type { ArrayFieldInstance, FieldInstance } from '@moluoxixi/core'
import type { FieldPattern } from '@moluoxixi/core'
import { ArrowDownOutlined, ArrowUpOutlined, CopyOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { FormArrayField, FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 15：数组字段
 *
 * 覆盖：
 * - 动态增删项（push / remove）
 * - 排序（moveUp / moveDown）
 * - 复制项（duplicate）
 * - 最大 / 最小数量限制
 * - 三种模式切换
 */
import React, { useEffect } from 'react'

setupAntd()

/** 数组限制 */
const MIN_ITEMS = 1
const MAX_ITEMS = 8

/** 联系人模板 */
const CONTACT_TEMPLATE = { name: '', phone: '', email: '' }

/**
 * 单行联系人
 */
const ContactRow = observer(({
  index,
  arrayField,
  pattern,
}: {
  index: number
  arrayField: ArrayFieldInstance
  pattern: FieldPattern
}): React.ReactElement => {
  const total = ((arrayField.value as unknown[]) ?? []).length
  const basePath = `contacts.${index}`
  const isEditable = pattern === 'editable'

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '40px 1fr 1fr 1fr auto',
        gap: 8,
        alignItems: 'center',
        padding: '8px 12px',
        background: index % 2 === 0 ? '#fafafa' : '#fff',
        borderRadius: 4,
      }}
    >
      <span style={{ color: 'rgba(0,0,0,0.45)' }}>
        #
        {index + 1}
      </span>
      <FormField name={`${basePath}.name`}>
        {(field: FieldInstance) => (
          <input
            value={(field.value as string) ?? ''}
            onChange={e => field.setValue(e.target.value)}
            placeholder="姓名"
            size="small"
            disabled={pattern === 'disabled'}
            readOnly={pattern === 'readOnly'}
          />
        )}
      </FormField>
      <FormField name={`${basePath}.phone`}>
        {(field: FieldInstance) => (
          <input
            value={(field.value as string) ?? ''}
            onChange={e => field.setValue(e.target.value)}
            placeholder="电话"
            size="small"
            disabled={pattern === 'disabled'}
            readOnly={pattern === 'readOnly'}
          />
        )}
      </FormField>
      <FormField name={`${basePath}.email`}>
        {(field: FieldInstance) => (
          <input
            value={(field.value as string) ?? ''}
            onChange={e => field.setValue(e.target.value)}
            placeholder="邮箱"
            size="small"
            disabled={pattern === 'disabled'}
            readOnly={pattern === 'readOnly'}
          />
        )}
      </FormField>
      {isEditable && (
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <button style={{ padding: '0 8px', height: 24, fontSize: 12, background: '#fff', border: '1px solid #d9d9d9', borderRadius: 4, cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }} disabled={index === 0} onClick={() => arrayField.moveUp(index)}>{<ArrowUpOutlined />}</button>
          <button style={{ padding: '0 8px', height: 24, fontSize: 12, background: '#fff', border: '1px solid #d9d9d9', borderRadius: 4, cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }} disabled={index === total - 1} onClick={() => arrayField.moveDown(index)}>{<ArrowDownOutlined />}</button>
          <button style={{ padding: '0 8px', height: 24, fontSize: 12, background: '#fff', border: '1px solid #d9d9d9', borderRadius: 4, cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }} disabled={!arrayField.canAdd} onClick={() => arrayField.duplicate(index)}>{<CopyOutlined />}</button>
          <button style={{ padding: '0 8px', height: 24, fontSize: 12, background: '#fff', color: '#ff4d4f', border: '1px solid #ff4d4f', borderRadius: 4, cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }} disabled={!arrayField.canRemove} onClick={() => arrayField.remove(index)}>{<DeleteOutlined />}</button>
        </div>
      )}
    </div>
  )
})

/**
 * 数组字段示例
 */
export const ArrayFieldForm = observer((): React.ReactElement => {
  const form = useCreateForm({
    initialValues: {
      groupName: '默认分组',
      contacts: [{ ...CONTACT_TEMPLATE }],
    },
  })

  useEffect(() => {
    form.createField({ name: 'groupName', label: '分组名称', required: true })
  }, [])

  return (
    <div>
      <h2>数组字段</h2>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>
        增删 / 排序 / 复制 / min=
        {MIN_ITEMS}
        {' '}
        max=
        {MAX_ITEMS}
        {' '}
        数量限制
      </p>

      <StatusTabs>
        {({ mode }) => {
          form.pattern = mode
          return (
            <FormProvider form={form}>
              <>
                {/* 分组名称 */}
                <FormField name="groupName">
                  {(field: FieldInstance) => (
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                        {field.label}
                        {' '}
                        <span style={{ color: 'red' }}>*</span>
                      </label>
                      <input
                        value={(field.value as string) ?? ''}
                        onChange={e => field.setValue(e.target.value)}
                        onBlur={() => {
                          field.blur()
                          field.validate('blur').catch(() => {})
                        }}
                        placeholder="请输入分组名称"
                        style={{ width: 300 }}
                        disabled={mode === 'disabled'}
                        readOnly={mode === 'readOnly'}
                        
                      />
                      {field.errors.length > 0 && (
                        <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}>{field.errors[0].message}</div>
                      )}
                    </div>
                  )}
                </FormField>

                {/* 联系人列表 */}
                <FormArrayField
                  name="contacts"
                  fieldProps={{ minItems: MIN_ITEMS, maxItems: MAX_ITEMS, itemTemplate: () => ({ ...CONTACT_TEMPLATE }) }}
                >
                  {(arrayField: ArrayFieldInstance) => (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <strong>联系人列表</strong>
                          <span style={{ display: 'inline-block', padding: '0 7px', fontSize: 12, background: '#f0f0f0', border: '1px solid #d9d9d9', borderRadius: 4 }}>
                            {((arrayField.value as unknown[]) ?? []).length}
                            /
                            {MAX_ITEMS}
                          </span>
                        </div>
                        {mode === 'editable' && (
                          <button style={{ padding: '0 8px', height: 24, fontSize: 12, background: '#1677ff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }} disabled={!arrayField.canAdd} onClick={() => arrayField.push({ ...CONTACT_TEMPLATE })}><PlusOutlined />
                            添加联系人
                          </button>
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

                      {((arrayField.value as unknown[]) ?? []).map((_: unknown, idx: number) => (
                        <ContactRow key={idx} index={idx} arrayField={arrayField} pattern={mode} />
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
