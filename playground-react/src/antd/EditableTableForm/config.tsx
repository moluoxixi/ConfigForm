import type { ArrayFieldInstance, FieldInstance } from '@moluoxixi/core'
import type { FieldPattern } from '@moluoxixi/core'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { FormArrayField, FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 16：可编辑表格
 *
 * 覆盖：
 * - 表格行内编辑
 * - 行级联动（数量 × 单价 = 小计）
 * - 列统计（合计行）
 * - 增删行
 * - 三种模式切换
 */
import React from 'react'

setupAntd()

/** 行模板 */
const ROW_TEMPLATE = { productName: '', quantity: 1, unitPrice: 0, subtotal: 0 }

/** 最大行数 */
const MAX_ROWS = 20

/**
 * 可编辑表格行
 */
const EditableRow = observer(({
  index,
  arrayField,
  form,
  pattern,
}: {
  index: number
  arrayField: ArrayFieldInstance
  form: ReturnType<typeof useCreateForm>
  pattern: FieldPattern
}): React.ReactElement => {
  const basePath = `items.${index}`
  const isEditable = pattern === 'editable'

  /** 更新小计 */
  const updateSubtotal = (qty?: number, price?: number): void => {
    const q = qty ?? (form.getFieldValue(`${basePath}.quantity`) as number) ?? 0
    const p = price ?? (form.getFieldValue(`${basePath}.unitPrice`) as number) ?? 0
    form.setFieldValue(`${basePath}.subtotal`, Math.round(q * p * 100) / 100)
  }

  return (
    <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
      <td style={{ padding: '6px 8px', textAlign: 'center' }}>
        <span style={{ color: 'rgba(0,0,0,0.45)' }}>{index + 1}</span>
      </td>
      <td style={{ padding: '6px 8px' }}>
        <FormField name={`${basePath}.productName`}>
          {(field: FieldInstance) => (
            <input
              value={(field.value as string) ?? ''}
              onChange={e => field.setValue(e.target.value)}
              placeholder="商品名称"
              size="small"
              disabled={pattern === 'disabled'}
              readOnly={pattern === 'readOnly'}
            />
          )}
        </FormField>
      </td>
      <td style={{ padding: '6px 8px' }}>
        <FormField name={`${basePath}.quantity`}>
          {(field: FieldInstance) => (
            <input type="number"
              value={(field.value as number) ?? 1}
              min={1}
              size="small"
              style={{ width: '100%' }}
              disabled={pattern === 'disabled'}
              readOnly={pattern === 'readOnly'}
              onChange={(val) => {
                field.setValue(val ?? 1)
                updateSubtotal(val ?? 1, undefined)
              }}
            />
          )}
        </FormField>
      </td>
      <td style={{ padding: '6px 8px' }}>
        <FormField name={`${basePath}.unitPrice`}>
          {(field: FieldInstance) => (
            <input type="number"
              value={(field.value as number) ?? 0}
              min={0}
              step={0.01}
              size="small"
              style={{ width: '100%' }}
              disabled={pattern === 'disabled'}
              readOnly={pattern === 'readOnly'}
              onChange={(val) => {
                field.setValue(val ?? 0)
                updateSubtotal(undefined, val ?? 0)
              }}
            />
          )}
        </FormField>
      </td>
      <td style={{ padding: '6px 8px', textAlign: 'right' }}>
        <FormField name={`${basePath}.subtotal`}>
          {(field: FieldInstance) => (
            <strong style={{ color: '#52c41a' }}>
              ¥
              {((field.value as number) ?? 0).toFixed(2)}
            </strong>
          )}
        </FormField>
      </td>
      {isEditable && (
        <td style={{ padding: '6px 8px', textAlign: 'center' }}>
          <button style={{ padding: '0 8px', height: 24, fontSize: 12, background: '#fff', color: '#ff4d4f', border: '1px solid #ff4d4f', borderRadius: 4, cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }} disabled={!arrayField.canRemove} onClick={() => arrayField.remove(index)}>{<DeleteOutlined />}</button>
        </td>
      )}
    </tr>
  )
})

/**
 * 可编辑表格示例
 */
export const EditableTableForm = observer((): React.ReactElement => {
  const form = useCreateForm({
    initialValues: {
      items: [
        { productName: '键盘', quantity: 2, unitPrice: 299, subtotal: 598 },
        { productName: '鼠标', quantity: 3, unitPrice: 99, subtotal: 297 },
      ],
    },
  })

  /** 计算总金额 */
  const getTotal = (): number => {
    const items = (form.getFieldValue('items') ?? []) as Array<{ subtotal?: number }>
    return items.reduce((sum, item) => sum + (item?.subtotal ?? 0), 0)
  }

  return (
    <div>
      <h2>可编辑表格</h2>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>
        表格行内编辑 / 行级联动（数量×单价=小计） / 列统计（合计行）
      </p>

      <StatusTabs>
        {({ mode }) => {
          form.pattern = mode
          return (
            <FormProvider form={form}>
              <FormArrayField
                name="items"
                fieldProps={{ minItems: 1, maxItems: MAX_ROWS, itemTemplate: () => ({ ...ROW_TEMPLATE }) }}
              >
                {(arrayField: ArrayFieldInstance) => (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <strong>订单明细</strong>
                        <span style={{ display: 'inline-block', padding: '0 7px', fontSize: 12, background: '#f0f0f0', border: '1px solid #d9d9d9', borderRadius: 4 }}>
                          {((arrayField.value as unknown[]) ?? []).length}
                          /
                          {MAX_ROWS}
                        </span>
                      </div>
                      {mode === 'editable' && (
                        <button style={{ padding: '0 8px', height: 24, fontSize: 12, background: '#1677ff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }} disabled={!arrayField.canAdd} onClick={() => arrayField.push({ ...ROW_TEMPLATE })}><PlusOutlined />
                          添加行
                        </button>
                      )}
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #f0f0f0' }}>
                      <thead>
                        <tr style={{ background: '#fafafa' }}>
                          <th style={{ padding: '8px', width: 50 }}>#</th>
                          <th style={{ padding: '8px' }}>商品名称</th>
                          <th style={{ padding: '8px', width: 120 }}>数量</th>
                          <th style={{ padding: '8px', width: 140 }}>单价（¥）</th>
                          <th style={{ padding: '8px', width: 120, textAlign: 'right' }}>小计</th>
                          {mode === 'editable' && <th style={{ padding: '8px', width: 60 }}>操作</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {((arrayField.value as unknown[]) ?? []).map((_: unknown, idx: number) => (
                          <EditableRow key={idx} index={idx} arrayField={arrayField} form={form} pattern={mode} />
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ background: '#f6ffed', borderTop: '2px solid #52c41a' }}>
                          <td colSpan={mode === 'editable' ? 4 : 4} style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>合计：</td>
                          <td style={{ padding: '8px', textAlign: 'right' }} colSpan={mode === 'editable' ? 2 : 1}>
                            <strong style={{ fontSize: 16, color: '#52c41a' }}>
                              ¥
                              {getTotal().toFixed(2)}
                            </strong>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </FormArrayField>
            </FormProvider>
          )
        }}
      </StatusTabs>
    </div>
  )
})
