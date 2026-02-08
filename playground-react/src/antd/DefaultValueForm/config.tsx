import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/core'
import { ConfigForm } from '@moluoxixi/react'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 4：默认值
 *
 * 覆盖：
 * - 静态默认值（defaultValue 直接赋值）
 * - 动态计算默认值（通过 reactions 动态计算初始值）
 * - initialValues 外部注入
 * - 重置恢复默认值
 * - 三种模式切换
 */
import React from 'react'

setupAntd()

/** 工具：将 StatusTabs 的 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

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

/** 表单 Schema */
const schema: ISchema = {
  type: 'object',
  decoratorProps: {
    labelPosition: 'right',
    labelWidth: '140px',
  },
  properties: {
    /* ---- 静态默认值 ---- */
    country: {
      type: 'string',
      title: '国家',
      default: 'china',
      description: '静态默认值：中国',
      enum: [
        { label: '中国', value: 'china' },
        { label: '美国', value: 'usa' },
        { label: '日本', value: 'japan' },
        { label: '韩国', value: 'korea' },
      ],
    },

    status: {
      type: 'string',
      title: '状态',
      component: 'RadioGroup',
      default: 'draft',
      description: '静态默认值：草稿',
      enum: [
        { label: '草稿', value: 'draft' },
        { label: '发布', value: 'published' },
        { label: '归档', value: 'archived' },
      ],
    },

    enableNotify: {
      type: 'boolean',
      title: '开启通知',
      default: true,
      description: '静态默认值：开启',
    },

    quantity: {
      type: 'number',
      title: '默认数量',
      default: 1,
      description: '静态默认值：1',
      componentProps: { min: 1 },
    },

    /* ---- 动态计算默认值 ---- */
    unitPrice: {
      type: 'number',
      title: '单价',
      default: 99.9,
      componentProps: { min: 0, step: 0.1 },
    },

    totalPrice: {
      type: 'number',
      title: '总价（自动计算）',
      componentProps: { disabled: true },
      description: '动态默认值：数量 × 单价',
      reactions: [
        {
          watch: ['quantity', 'unitPrice'],
          fulfill: {
            run: (field, ctx) => {
              const qty = (ctx.values.quantity as number) ?? 0
              const price = (ctx.values.unitPrice as number) ?? 0
              field.setValue(Math.round(qty * price * 100) / 100)
            },
          },
        },
      ],
    },

    /* ---- 级别联动的默认值 ---- */
    level: {
      type: 'string',
      title: '会员等级',
      default: 'silver',
      enum: [
        { label: '银牌', value: 'silver' },
        { label: '金牌', value: 'gold' },
        { label: '钻石', value: 'diamond' },
      ],
    },
    discountRate: {
      type: 'number',
      title: '折扣率（%）',
      componentProps: { disabled: true },
      description: '根据会员等级动态设置默认值',
      reactions: [
        {
          watch: 'level',
          fulfill: {
            run: (field, ctx) => {
              const levelMap: Record<string, number> = {
                silver: 5,
                gold: 10,
                diamond: 20,
              }
              const level = ctx.values.level as string
              field.setValue(levelMap[level] ?? 0)
            },
          },
        },
      ],
    },
  },
}

/**
 * 默认值示例
 *
 * 静态默认值 + 动态计算默认值 + initialValues 注入 + 重置恢复。
 */
export const DefaultValueForm = observer((): React.ReactElement => {
  return (
    <div>
      <h2>默认值</h2>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>
        静态 defaultValue / 动态计算默认值 / initialValues 外部注入 / 重置恢复
      </p>

      <div style={{ padding: '8px 16px', marginBottom: 16, background: '#e6f4ff', border: '1px solid #91caff', borderRadius: 6, fontSize: 13 }}>
        外部注入初始值：订单号
        {' '}
        <code>{INITIAL_VALUES.orderNo as string}</code>
        ，
        日期
        {' '}
        <code>{INITIAL_VALUES.createDate as string}</code>
      </div>

      <StatusTabs>
        {({ mode, showResult, showErrors }) => (
          <ConfigForm
            schema={withMode(schema, mode)}
            initialValues={INITIAL_VALUES}
            onSubmit={showResult}
            onSubmitFailed={errors => showErrors(errors)}
          />
        )}
      </StatusTabs>
    </div>
  )
})
