import type { FieldInstance } from '@moluoxixi/core'
import type { FieldPattern } from '@moluoxixi/core'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 25：动态增删字段
 *
 * 覆盖：
 * - 运行时动态添加字段
 * - 运行时移除字段
 * - 动态字段参与验证和提交
 * - 三种模式切换
 */
import React, { useCallback, useEffect, useState } from 'react'

setupAntd()

/** 可添加的字段类型 */
const FIELD_TYPE_OPTIONS = [
  { label: '文本', value: 'text' },
  { label: '数字', value: 'number' },
  { label: '选择', value: 'select' },
  { label: '开关', value: 'switch' },
]

/** 动态字段信息 */
interface DynamicFieldInfo {
  id: string
  name: string
  label: string
  fieldType: string
}

/** 计数器 */
let fieldCounter = 0

export const DynamicFieldForm = observer((): React.ReactElement => {
  const [dynamicFields, setDynamicFields] = useState<DynamicFieldInfo[]>([])
  const [newFieldLabel, setNewFieldLabel] = useState('')
  const [newFieldType, setNewFieldType] = useState('text')

  const form = useCreateForm({ initialValues: { title: '' } })

  useEffect(() => {
    form.createField({ name: 'title', label: '表单标题', required: true })
  }, [])

  /** 添加字段 */
  const addField = useCallback((): void => {
    if (!newFieldLabel.trim())
      return
    fieldCounter += 1
    const id = `dynamic_${fieldCounter}`
    const info: DynamicFieldInfo = { id, name: id, label: newFieldLabel.trim(), fieldType: newFieldType }

    form.createField({
      name: id,
      label: info.label,
      required: false,
    })

    setDynamicFields(prev => [...prev, info])
    setNewFieldLabel('')
  }, [newFieldLabel, newFieldType, form])

  /** 移除字段 */
  const removeField = useCallback((id: string): void => {
    form.removeField(id)
    setDynamicFields(prev => prev.filter(f => f.id !== id))
  }, [form])

  /** 渲染动态字段组件 */
  const renderDynamicField = (field: FieldInstance, fieldType: string, mode: FieldPattern): React.ReactElement => {
    if (fieldType === 'select') {
      return (
        <select
          value={(field.value as string) ?? undefined}
          onChange={v => field.setValue(v)}
          options={[{ label: '选项 A', value: 'a' }, { label: '选项 B', value: 'b' }, { label: '选项 C', value: 'c' }]}
          placeholder="请选择"
          style={{ width: '100%' }}
          disabled={mode === 'disabled'}
        />
      )
    }
    return (
      <input
        value={(field.value as string) ?? ''}
        onChange={e => field.setValue(e.target.value)}
        placeholder={`请输入${field.label}`}
        disabled={mode === 'disabled'}
        readOnly={mode === 'readOnly'}
      />
    )
  }

  return (
    <div>
      <h2>动态增删字段</h2>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>运行时添加 / 移除字段 / 动态字段参与验证提交</p>

      <StatusTabs>
        {({ mode }) => {
          form.pattern = mode
          return (
            <FormProvider form={form}>
              <>
                {/* 添加字段面板 */}
                {mode === 'editable' && (
                  <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, marginBottom: 16 }}><div style={{ padding: '8px 16px', borderBottom: '1px solid #f0f0f0', fontWeight: 500 }}>添加新字段</div><div style={{ padding: 16 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        value={newFieldLabel}
                        onChange={e => setNewFieldLabel(e.target.value)}
                        placeholder="字段标签"
                        style={{ width: 200 }}
                      />
                      <select
                        value={newFieldType}
                        onChange={v => setNewFieldType(v)}
                        options={FIELD_TYPE_OPTIONS}
                        style={{ width: 120 }}
                      />
                      <button style={{ padding: '4px 12px', fontSize: 14, background: '#1677ff', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }} onClick={addField} disabled={!newFieldLabel.trim()}>{<PlusOutlined />} 
                        添加
                      </button>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <span style={{ color: 'rgba(0,0,0,0.45)' }}>
                        已添加
                        {dynamicFields.length}
                        {' '}
                        个动态字段
                      </span>
                    </div>
                  </div></div>
                )}

                {/* 固定字段 */}
                <FormField name="title">
                  {(field: FieldInstance) => (
                    <div style={{ marginBottom: 16 }}><label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>{field.label}{field.required && <span style={{ color: 'red' }}> *</span>}</label>
                      <input
                        value={(field.value as string) ?? ''}
                        onChange={e => field.setValue(e.target.value)}
                        onBlur={() => {
                          field.blur()
                          field.validate('blur').catch(() => {})
                        }}
                        disabled={mode === 'disabled'}
                        readOnly={mode === 'readOnly'}
                        placeholder="请输入表单标题"
                      />
                    </div>
                  )}
                </FormField>

                {/* 动态字段 */}
                {dynamicFields.map(df => (
                  <FormField key={df.id} name={df.name}>
                    {(field: FieldInstance) => (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', width: '100%' }}>
                          <div style={{ flex: 1 }}>{renderDynamicField(field, df.fieldType, mode)}</div>
                          {mode === 'editable' && (
                            <button style={{ padding: '4px 8px', fontSize: 14, background: '#fff', color: '#ff4d4f', border: '1px solid #ff4d4f', borderRadius: 6, cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }} onClick={() => removeField(df.id)}>{<DeleteOutlined />}</button>
                          )}
                        </div>
                      </div>
                    )}
                  </FormField>
                ))}
              </>
            </FormProvider>
          )
        }}
      </StatusTabs>
    </div>
  )
})
