/**
 * 场景 16：可编辑表格 (Field 版)
 *
 * 覆盖：
 * - 表格行内编辑
 * - 行级联动（数量 × 单价 = 小计）
 * - 列统计（合计行）
 * - 增删行
 * - 三种模式切换
 *
 * FormField + fieldProps 实现（简单字段用 fieldProps，表格行用 FormArrayField）
 */
import type { ArrayFieldInstance } from '@moluoxixi/core'
import React from 'react'
import { observer } from 'mobx-react-lite'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { FormArrayField, FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'
import { Button, Space, Tag, Typography } from 'antd'

const { Title, Paragraph, Text } = Typography

setupAntd()

/** 行模板 */
const ROW_TEMPLATE = { productName: '', quantity: 1, unitPrice: 0, subtotal: 0 }

/** 最大行数 */
const MAX_ROWS = 20

/**
 * 可编辑表格示例（Field 版）
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

  /** 更新小计 */
  const updateSubtotal = (index: number, qty?: number, price?: number): void => {
    const basePath = `items.${index}`
    const q = qty ?? (form.getFieldValue(`${basePath}.quantity`) as number) ?? 0
    const p = price ?? (form.getFieldValue(`${basePath}.unitPrice`) as number) ?? 0
    form.setFieldValue(`${basePath}.subtotal`, Math.round(q * p * 100) / 100)
  }

  return (
    <div>
      <Title level={3}>可编辑表格 (Field 版)</Title>
      <Paragraph type="secondary">
        表格行内编辑 / 行级联动（数量×单价=小计） / 列统计（合计行） —— FormField + fieldProps 实现
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
                <FormArrayField
                  name="items"
                  fieldProps={{ minItems: 1, maxItems: MAX_ROWS, itemTemplate: () => ({ ...ROW_TEMPLATE }) }}
                >
                  {(arrayField: ArrayFieldInstance) => (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Space>
                          <Text strong>订单明细</Text>
                          <Tag>
                            {((arrayField.value as unknown[]) ?? []).length}
                            /
                            {MAX_ROWS}
                          </Tag>
                        </Space>
                        {mode === 'editable' && (
                          <Button type="primary" icon={<PlusOutlined />} size="small" disabled={!arrayField.canAdd} onClick={() => arrayField.push({ ...ROW_TEMPLATE })}>
                            添加行
                          </Button>
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
                          {((arrayField.value as unknown[]) ?? []).map((_: unknown, idx: number) => {
                            const basePath = `items.${idx}`
                            return (
                              <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                                  <Text type="secondary">{idx + 1}</Text>
                                </td>
                                <td style={{ padding: '6px 8px' }}>
                                  <FormField name={`${basePath}.productName`} fieldProps={{ component: 'Input', componentProps: { placeholder: '商品名称', size: 'small' } }} />
                                </td>
                                <td style={{ padding: '6px 8px' }}>
                                  <FormField
                                    name={`${basePath}.quantity`}
                                    fieldProps={{
                                      component: 'InputNumber',
                                      componentProps: {
                                        min: 1,
                                        size: 'small',
                                        style: { width: '100%' },
                                        onChange: (val: number | null) => updateSubtotal(idx, val ?? 1, undefined),
                                      },
                                    }}
                                  />
                                </td>
                                <td style={{ padding: '6px 8px' }}>
                                  <FormField
                                    name={`${basePath}.unitPrice`}
                                    fieldProps={{
                                      component: 'InputNumber',
                                      componentProps: {
                                        min: 0,
                                        step: 0.01,
                                        size: 'small',
                                        style: { width: '100%' },
                                        onChange: (val: number | null) => updateSubtotal(idx, undefined, val ?? 0),
                                      },
                                    }}
                                  />
                                </td>
                                <td style={{ padding: '6px 8px', textAlign: 'right' }}>
                                  <FormField name={`${basePath}.subtotal`}>
                                    {(field: any) => (
                                      <Text strong type="success">
                                        ¥
                                        {((field.value as number) ?? 0).toFixed(2)}
                                      </Text>
                                    )}
                                  </FormField>
                                </td>
                                {mode === 'editable' && (
                                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                                    <Button size="small" danger icon={<DeleteOutlined />} disabled={!arrayField.canRemove} onClick={() => arrayField.remove(idx)} />
                                  </td>
                                )}
                              </tr>
                            )
                          })}
                        </tbody>
                        <tfoot>
                          <tr style={{ background: '#f6ffed', borderTop: '2px solid #52c41a' }}>
                            <td colSpan={mode === 'editable' ? 4 : 4} style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>合计：</td>
                            <td style={{ padding: '8px', textAlign: 'right' }} colSpan={mode === 'editable' ? 2 : 1}>
                              <Text strong style={{ fontSize: 16, color: '#52c41a' }}>
                                ¥
                                {getTotal().toFixed(2)}
                              </Text>
                            </td>
                          </tr>
                        </tfoot>
                      </table>
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
