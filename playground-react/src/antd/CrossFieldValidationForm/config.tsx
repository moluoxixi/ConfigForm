import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'
import { ConfigForm } from '@moluoxixi/react'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
import { Typography } from 'antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 13：跨字段验证
 *
 * 覆盖：
 * - 密码一致性验证（password === confirmPassword）
 * - 日期范围验证（endDate >= startDate）
 * - 数值总和限制（分配比例之和 = 100%）
 * - 数值区间不重叠验证
 * - 三种模式切换
 */
import React from 'react'

const { Title, Paragraph } = Typography

setupAntd()

/** 工具：将 StatusTabs 的 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

/** 默认初始值 */
const INITIAL_VALUES: Record<string, unknown> = {
  password: '',
  confirmPassword: '',
  startDate: '',
  endDate: '',
  ratioA: 40,
  ratioB: 30,
  ratioC: 30,
  minAge: 18,
  maxAge: 60,
  budget: 10000,
  expense: 0,
}

/** 表单 Schema */
const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '150px' },
  properties: {
    /* ---- 场景 A：密码一致性 ---- */
    password: {
      type: 'string',
      title: '密码',
      required: true,
      component: 'Password',
      placeholder: '请输入密码',
      rules: [{ minLength: 8, message: '密码至少 8 个字符' }],
    },
    confirmPassword: {
      type: 'string',
      title: '确认密码',
      required: true,
      component: 'Password',
      placeholder: '请再次输入密码',
      rules: [
        {
          validator: (value, _rule, context) => {
            const pwd = context.getFieldValue('password')
            if (value && pwd && value !== pwd) {
              return '两次输入的密码不一致'
            }
            return undefined
          },
          trigger: 'blur',
        },
      ],
    },

    /* ---- 场景 B：日期范围 ---- */
    startDate: {
      type: 'string',
      title: '开始日期',
      required: true,
    },
    endDate: {
      type: 'string',
      title: '结束日期',
      required: true,
      rules: [
        {
          validator: (value, _rule, context) => {
            const start = context.getFieldValue('startDate') as string
            if (start && value && String(value) < start) {
              return '结束日期不能早于开始日期'
            }
            return undefined
          },
          trigger: 'blur',
        },
        {
          level: 'warning',
          validator: (value, _rule, context) => {
            const start = context.getFieldValue('startDate') as string
            if (start && value) {
              const diffMs = new Date(String(value)).getTime() - new Date(start).getTime()
              const diffDays = diffMs / (1000 * 60 * 60 * 24)
              if (diffDays > 365)
                return '日期跨度超过一年，请确认'
            }
            return undefined
          },
        },
      ],
    },

    /* ---- 场景 C：比例总和 = 100% ---- */
    ratioA: {
      type: 'number',
      title: '项目 A 比例（%）',
      required: true,
      default: 40,
      componentProps: { min: 0, max: 100, style: { width: '100%' } },
      description: 'A + B + C 必须等于 100',
    },
    ratioB: {
      type: 'number',
      title: '项目 B 比例（%）',
      required: true,
      default: 30,
      componentProps: { min: 0, max: 100, style: { width: '100%' } },
    },
    ratioC: {
      type: 'number',
      title: '项目 C 比例（%）',
      required: true,
      default: 30,
      componentProps: { min: 0, max: 100, style: { width: '100%' } },
      rules: [
        {
          validator: (_value, _rule, context) => {
            const a = (context.getFieldValue('ratioA') as number) ?? 0
            const b = (context.getFieldValue('ratioB') as number) ?? 0
            const c = (context.getFieldValue('ratioC') as number) ?? 0
            const total = a + b + c
            if (total !== 100) {
              return `三项比例之和必须等于 100%，当前为 ${total}%`
            }
            return undefined
          },
          trigger: 'blur',
        },
      ],
    },

    /* ---- 场景 D：数值区间不重叠 ---- */
    minAge: {
      type: 'number',
      title: '最小年龄',
      required: true,
      default: 18,
      componentProps: { min: 0, max: 150, style: { width: '100%' } },
    },
    maxAge: {
      type: 'number',
      title: '最大年龄',
      required: true,
      default: 60,
      componentProps: { min: 0, max: 150, style: { width: '100%' } },
      rules: [
        {
          validator: (value, _rule, context) => {
            const minVal = context.getFieldValue('minAge') as number
            if (minVal !== undefined && value !== undefined && Number(value) <= minVal) {
              return '最大年龄必须大于最小年龄'
            }
            return undefined
          },
          trigger: 'blur',
        },
      ],
    },

    /* ---- 场景 E：总金额不超过预算 ---- */
    budget: {
      type: 'number',
      title: '预算上限',
      required: true,
      default: 10000,
      componentProps: { min: 0, style: { width: '100%' } },
    },
    expense: {
      type: 'number',
      title: '实际支出',
      required: true,
      default: 0,
      componentProps: { min: 0, style: { width: '100%' } },
      rules: [
        {
          validator: (value, _rule, context) => {
            const budgetVal = context.getFieldValue('budget') as number
            if (budgetVal !== undefined && Number(value) > budgetVal) {
              return `实际支出（${value}）不能超过预算上限（${budgetVal}）`
            }
            return undefined
          },
          trigger: 'blur',
        },
        {
          level: 'warning',
          validator: (value, _rule, context) => {
            const budgetVal = (context.getFieldValue('budget') as number) ?? 0
            if (budgetVal > 0 && Number(value) > budgetVal * 0.8) {
              return '支出已超过预算的 80%，请注意控制'
            }
            return undefined
          },
        },
      ],
    },
  },
}

/**
 * 跨字段验证示例
 */
export const CrossFieldValidationForm = observer((): React.ReactElement => {
  return (
    <div>
      <Title level={3}>跨字段验证</Title>
      <Paragraph type="secondary">
        密码一致性 / 日期范围 / 比例总和 = 100% / 数值区间不重叠 / 预算限制
      </Paragraph>
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
