import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'
import { ConfigForm, registerComponent } from '@moluoxixi/react'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
import { Input, Space, Tag, Typography } from 'antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 40：数据转换 — ConfigForm + Schema
 *
 * 覆盖：
 * - 自定义 TransformDisplayInput 组件注册
 * - 提交前转换（transform）
 * - 显示时格式化（format）
 * - 输入时解析（parse）
 * - 三种模式切换
 */
import React from 'react'

const { Title, Paragraph } = Typography

setupAntd()

/** 工具：将 StatusTabs 的 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

// ========== 自定义组件：数据转换展示输入 ==========

/** 数据转换展示输入 Props */
interface TransformDisplayInputProps {
  /** 字段值 */
  value?: unknown
  /** 值变更回调 */
  onChange?: (v: unknown) => void
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readOnly?: boolean
}

/**
 * 数据转换展示输入组件
 *
 * 显示输入框及原始值标签，用于演示 format/parse/transform 效果
 */
const TransformDisplayInput = observer(({ value, onChange, disabled, readOnly }: TransformDisplayInputProps): React.ReactElement => {
  return (
    <Space>
      <Input
        value={String(value ?? '')}
        onChange={e => onChange?.(e.target.value)}
        disabled={disabled}
        readOnly={readOnly}
        style={{ width: 300 }}
      />
      <Tag color="blue">
        原始值:
        {JSON.stringify(value)}
      </Tag>
    </Space>
  )
})

registerComponent('TransformDisplayInput', TransformDisplayInput, { defaultWrapper: 'FormItem' })

// ========== Schema & 初始值 ==========

/** 默认初始值 */
const INITIAL_VALUES: Record<string, unknown> = {
  priceCent: 9990,
  phoneRaw: '13800138000',
  fullName: '张三',
  tags: 'react,vue,typescript',
}

/** 表单 Schema */
const schema: ISchema = {
  type: 'object',
  decoratorProps: {
    labelPosition: 'right',
    labelWidth: '140px',
    actions: { submit: '提交', reset: '重置' },
  },
  properties: {
    /* 价格：分→元显示，输入元→分存储 */
    priceCent: {
      type: 'number',
      title: '价格（分→元）',
      required: true,
      component: 'TransformDisplayInput',
      format: (v: unknown) => v ? (Number(v) / 100).toFixed(2) : '',
      parse: (v: unknown) => Math.round(Number(v) * 100),
      transform: (v: unknown) => Number(v),
    },
    /* 手机号：显示时脱敏，输入时去除非数字 */
    phoneRaw: {
      type: 'string',
      title: '手机号（脱敏）',
      component: 'TransformDisplayInput',
      format: (v: unknown) => {
        const s = String(v ?? '')
        return s.length === 11 ? `${s.slice(0, 3)}****${s.slice(7)}` : s
      },
      parse: (v: unknown) => String(v).replace(/\D/g, ''),
    },
    fullName: {
      type: 'string',
      title: '姓名',
      required: true,
      component: 'TransformDisplayInput',
    },
    /* 标签：提交时逗号分隔字符串转数组 */
    tags: {
      type: 'string',
      title: '标签（逗号分隔）',
      description: '提交时转为数组',
      component: 'TransformDisplayInput',
      transform: (v: unknown) => String(v ?? '').split(',').map((s: string) => s.trim()).filter(Boolean),
    },
  },
}

/**
 * 数据转换表单 — ConfigForm + Schema
 *
 * 展示 format（显示格式化）/ parse（输入解析）/ transform（提交转换）
 */
export const DataTransformForm = observer((): React.ReactElement => (
  <div>
    <Title level={3}>数据转换</Title>
    <Paragraph type="secondary">format（显示格式化） / parse（输入解析） / transform（提交转换） — ConfigForm + Schema</Paragraph>
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
))
