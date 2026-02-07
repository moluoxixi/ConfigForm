/**
 * 场景 4：默认值 (Field 版)
 *
 * 覆盖：
 * - 静态默认值（defaultValue 直接赋值）
 * - 动态计算默认值（通过 reactions 动态计算初始值）
 * - initialValues 外部注入
 * - 重置恢复默认值
 * - 三种模式切换
 *
 * FormField + fieldProps 实现
 */
import React from 'react'
import { observer } from 'mobx-react-lite'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'
import { Alert, Typography } from 'antd'

const { Title, Paragraph, Text } = Typography

setupAntd()

/** 生成今天的日期字符串 */
function getToday(): string {
  return new Date().toISOString().slice(0, 10)
}

/** 生成默认订单编号 */
function generateOrderNo(): string {
  const now = new Date()
  const pad = (n: number): string => String(n).padStart(2, '0')
  return `ORD-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
}

/** 外部注入的初始值（模拟从接口获取） */
const INITIAL_VALUES: Record<string, unknown> = {
  orderNo: generateOrderNo(),
  createDate: getToday(),
  country: 'china',
  status: 'draft',
  enableNotify: true,
  quantity: 1,
  unitPrice: 99.9,
  totalPrice: 99.9,
  level: 'silver',
  discountRate: 5,
}

/**
 * 默认值示例（Field 版）
 *
 * 静态默认值 + 动态计算默认值 + initialValues 注入 + 重置恢复。
 */
export const DefaultValueForm = observer((): React.ReactElement => {
  const form = useCreateForm({
    initialValues: { ...INITIAL_VALUES },
  })

  return (
    <div>
      <Title level={3}>默认值 (Field 版)</Title>
      <Paragraph type="secondary">
        静态 defaultValue / 动态计算默认值 / initialValues 外部注入 / 重置恢复 —— FormField + fieldProps 实现
      </Paragraph>

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message={(
          <span>
            外部注入初始值：订单号
            {' '}
            <Text code>{INITIAL_VALUES.orderNo as string}</Text>
            ，日期
            {' '}
            <Text code>{INITIAL_VALUES.createDate as string}</Text>
          </span>
        )}
      />

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
                {/* 静态默认值 */}
                <FormField name="country" fieldProps={{
                  label: '国家',
                  component: 'Select',
                  description: '静态默认值：中国',
                  dataSource: [
                    { label: '中国', value: 'china' },
                    { label: '美国', value: 'usa' },
                    { label: '日本', value: 'japan' },
                    { label: '韩国', value: 'korea' },
                  ],
                }}
                />
                <FormField name="status" fieldProps={{
                  label: '状态',
                  component: 'RadioGroup',
                  description: '静态默认值：草稿',
                  dataSource: [
                    { label: '草稿', value: 'draft' },
                    { label: '发布', value: 'published' },
                    { label: '归档', value: 'archived' },
                  ],
                }}
                />
                <FormField name="enableNotify" fieldProps={{ label: '开启通知', component: 'Switch', description: '静态默认值：开启' }} />
                <FormField name="quantity" fieldProps={{ label: '默认数量', component: 'InputNumber', componentProps: { min: 1 }, description: '静态默认值：1' }} />

                {/* 动态计算默认值 */}
                <FormField name="unitPrice" fieldProps={{ label: '单价', component: 'InputNumber', componentProps: { min: 0, step: 0.1 } }} />
                <FormField name="totalPrice" fieldProps={{
                  label: '总价（自动计算）',
                  component: 'InputNumber',
                  componentProps: { disabled: true },
                  description: '动态默认值：数量 × 单价',
                  reactions: [{
                    watch: ['quantity', 'unitPrice'],
                    fulfill: {
                      run: (field, ctx) => {
                        const qty = (ctx.values.quantity as number) ?? 0
                        const price = (ctx.values.unitPrice as number) ?? 0
                        field.setValue(Math.round(qty * price * 100) / 100)
                      },
                    },
                  }],
                }}
                />

                {/* 级别联动的默认值 */}
                <FormField name="level" fieldProps={{
                  label: '会员等级',
                  component: 'Select',
                  dataSource: [
                    { label: '银牌', value: 'silver' },
                    { label: '金牌', value: 'gold' },
                    { label: '钻石', value: 'diamond' },
                  ],
                }}
                />
                <FormField name="discountRate" fieldProps={{
                  label: '折扣率（%）',
                  component: 'InputNumber',
                  componentProps: { disabled: true },
                  description: '根据会员等级动态设置默认值',
                  reactions: [{
                    watch: 'level',
                    fulfill: {
                      run: (field, ctx) => {
                        const levelMap: Record<string, number> = { silver: 5, gold: 10, diamond: 20 }
                        const level = ctx.values.level as string
                        field.setValue(levelMap[level] ?? 0)
                      },
                    },
                  }],
                }}
                />
                {mode === 'editable' && <LayoutFormActions onReset={() => form.reset()} />}
              </form>
            </FormProvider>
          )
        }}
      </StatusTabs>
    </div>
  )
})
