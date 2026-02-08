/**
 * 可编辑表格（Field 版）
 *
 * 使用 FormProvider + FormArrayField + ArrayBase 实现表格行内编辑。
 * ArrayBase 子组件自动根据 form.pattern 控制操作按钮显隐。
 * 数量×单价=小计 通过 onChange 联动实现。
 */
import type { ArrayFieldInstance } from '@moluoxixi/core'
import React from 'react'
import { observer } from 'mobx-react-lite'
import { ArrayBase, FormArrayField, FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'

setupAntd()

const ROW_TEMPLATE = { productName: '', quantity: 1, unitPrice: 0, subtotal: 0 }
const MAX_ROWS = 20

export const EditableTableForm = observer((): React.ReactElement => {
  const form = useCreateForm({
    initialValues: {
      items: [
        { productName: '键盘', quantity: 2, unitPrice: 299, subtotal: 598 },
        { productName: '鼠标', quantity: 3, unitPrice: 99, subtotal: 297 },
      ],
    },
  })

  const getTotal = (): number => {
    const items = (form.getFieldValue('items') ?? []) as Array<{ subtotal?: number }>
    return items.reduce((sum, item) => sum + (item?.subtotal ?? 0), 0)
  }

  const updateSubtotal = (index: number, qty?: number, price?: number): void => {
    const basePath = `items.${index}`
    const q = qty ?? (form.getFieldValue(`${basePath}.quantity`) as number) ?? 0
    const p = price ?? (form.getFieldValue(`${basePath}.unitPrice`) as number) ?? 0
    form.setFieldValue(`${basePath}.subtotal`, Math.round(q * p * 100) / 100)
  }

  return (
    <div>
      <h2>可编辑表格（Field 版）</h2>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>
        表格行内编辑 / 行级联动 / 列统计 — FormArrayField + ArrayBase 实现
      </p>

      <StatusTabs>
        {({ mode, showResult, showErrors }) => {
          form.pattern = mode
          return (
            <FormProvider form={form}>
                <FormArrayField
                  name="items"
                  fieldProps={{ minItems: 1, maxItems: MAX_ROWS, itemTemplate: () => ({ ...ROW_TEMPLATE }) }}
                >
                  {(arrayField: ArrayFieldInstance) => {
                    const arrayValue = Array.isArray(arrayField.value) ? arrayField.value : []
                    return (
                      <ArrayBase>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ fontWeight: 600 }}>订单明细 ({arrayValue.length}/{MAX_ROWS})</span>
                            <ArrayBase.Addition title="添加行" />
                          </div>

                          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #f0f0f0' }}>
                            <thead>
                              <tr style={{ background: '#fafafa' }}>
                                <th style={{ padding: 8, width: 50 }}>#</th>
                                <th style={{ padding: 8 }}>商品名称</th>
                                <th style={{ padding: 8, width: 120 }}>数量</th>
                                <th style={{ padding: 8, width: 140 }}>单价（¥）</th>
                                <th style={{ padding: 8, width: 120, textAlign: 'right' }}>小计</th>
                                <th style={{ padding: 8, width: 80 }}>操作</th>
                              </tr>
                            </thead>
                            <tbody>
                              {arrayValue.map((_: unknown, idx: number) => (
                                <ArrayBase.Item key={idx} index={idx}>
                                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                                    <td style={{ padding: '6px 8px', textAlign: 'center', color: '#999' }}>{idx + 1}</td>
                                    <td style={{ padding: '6px 8px' }}>
                                      <FormField name={`items.${idx}.productName`} fieldProps={{ component: 'Input', componentProps: { placeholder: '商品名称', size: 'small' } }} />
                                    </td>
                                    <td style={{ padding: '6px 8px' }}>
                                      <FormField
                                        name={`items.${idx}.quantity`}
                                        fieldProps={{
                                          component: 'InputNumber',
                                          componentProps: { min: 1, size: 'small', style: { width: '100%' }, onChange: (val: number | null) => updateSubtotal(idx, val ?? 1, undefined) },
                                        }}
                                      />
                                    </td>
                                    <td style={{ padding: '6px 8px' }}>
                                      <FormField
                                        name={`items.${idx}.unitPrice`}
                                        fieldProps={{
                                          component: 'InputNumber',
                                          componentProps: { min: 0, step: 0.01, size: 'small', style: { width: '100%' }, onChange: (val: number | null) => updateSubtotal(idx, undefined, val ?? 0) },
                                        }}
                                      />
                                    </td>
                                    <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 600, color: '#52c41a' }}>
                                      ¥{((arrayValue[idx] as any)?.subtotal ?? 0).toFixed(2)}
                                    </td>
                                    <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                                        <ArrayBase.Remove title="删" />
                                      </div>
                                    </td>
                                  </tr>
                                </ArrayBase.Item>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr style={{ background: '#f6ffed', borderTop: '2px solid #52c41a' }}>
                                <td colSpan={4} style={{ padding: 8, textAlign: 'right', fontWeight: 600 }}>合计：</td>
                                <td colSpan={2} style={{ padding: 8, textAlign: 'right' }}>
                                  <strong style={{ fontSize: 16, color: '#52c41a' }}>¥{getTotal().toFixed(2)}</strong>
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </ArrayBase>
                    )
                  }}
                </FormArrayField>
                <LayoutFormActions onSubmit={showResult} onSubmitFailed={showErrors} />
            </FormProvider>
          )
        }}
      </StatusTabs>
    </div>
  )
})
