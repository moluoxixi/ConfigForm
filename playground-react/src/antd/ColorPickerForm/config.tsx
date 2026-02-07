import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'
import { ConfigForm, registerComponent } from '@moluoxixi/react'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
import { Input, Space, Typography } from 'antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 31：颜色选择器 — ConfigForm + Schema
 *
 * 覆盖：
 * - 自定义 ColorPicker 组件注册
 * - 原生 color input + 预设色板
 * - HEX 输入
 * - 三种模式切换
 */
import React from 'react'

const { Title, Paragraph, Text } = Typography

setupAntd()

/** 工具：将 StatusTabs 的 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

/** 预设颜色 */
const PRESET_COLORS = ['#1677ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2', '#eb2f96', '#000000']

// ========== 辅助组件 ==========

/** 颜色预览块 */
function ColorSwatch({ color, size = 24 }: { color: string; size?: number }): React.ReactElement {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: color || '#fff',
        border: '1px solid #d9d9d9',
        borderRadius: 4,
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
    />
  )
}

// ========== 自定义组件：颜色选择器 ==========

/** 颜色选择器 Props */
interface ColorPickerProps {
  /** 当前颜色值（HEX） */
  value?: string
  /** 值变更回调 */
  onChange?: (v: string) => void
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readOnly?: boolean
}

/**
 * 颜色选择器组件
 *
 * - 编辑态：color input + HEX 输入 + 预设色板
 * - 只读/禁用态：色块 + HEX 文本
 */
const ColorPicker = observer(({ value, onChange, disabled, readOnly }: ColorPickerProps): React.ReactElement => {
  const color = value ?? '#1677ff'

  if (readOnly || disabled) {
    return (
      <Space>
        <ColorSwatch color={color} size={32} />
        <Text code>{color}</Text>
      </Space>
    )
  }

  return (
    <div>
      <Space style={{ marginBottom: 8 }}>
        <input
          type="color"
          value={color}
          onChange={e => onChange?.(e.target.value)}
          style={{ width: 48, height: 48, border: 'none', cursor: 'pointer', padding: 0 }}
        />
        <Input
          value={color}
          onChange={e => onChange?.(e.target.value)}
          style={{ width: 120 }}
          placeholder="#000000"
        />
        <ColorSwatch color={color} size={32} />
      </Space>
      <div style={{ display: 'flex', gap: 4 }}>
        {PRESET_COLORS.map(c => (
          <div
            key={c}
            onClick={() => onChange?.(c)}
            style={{
              width: 24,
              height: 24,
              background: c,
              borderRadius: 4,
              cursor: 'pointer',
              border: color === c ? '2px solid #333' : '1px solid #d9d9d9',
            }}
          />
        ))}
      </div>
    </div>
  )
})

registerComponent('ColorPicker', ColorPicker, { defaultWrapper: 'FormItem' })

// ========== Schema & 初始值 ==========

/** 默认初始值 */
const INITIAL_VALUES: Record<string, unknown> = {
  themeName: '自定义主题',
  primaryColor: '#1677ff',
  bgColor: '#ffffff',
  textColor: '#333333',
}

/** 表单 Schema */
const schema: ISchema = {
  type: 'object',
  decoratorProps: {
    labelPosition: 'right',
    labelWidth: '120px',
    actions: { submit: '提交', reset: '重置' },
  },
  properties: {
    themeName: {
      type: 'string',
      title: '主题名称',
      required: true,
      component: 'Input',
    },
    primaryColor: {
      type: 'string',
      title: '主色调',
      required: true,
      component: 'ColorPicker',
    },
    bgColor: {
      type: 'string',
      title: '背景色',
      component: 'ColorPicker',
    },
    textColor: {
      type: 'string',
      title: '文字颜色',
      component: 'ColorPicker',
    },
  },
}

/**
 * 颜色选择器表单 — ConfigForm + Schema
 *
 * 展示颜色选择、预设色板、三种模式切换
 */
export const ColorPickerForm = observer((): React.ReactElement => (
  <div>
    <Title level={3}>颜色选择器</Title>
    <Paragraph type="secondary">原生 color input + 预设色板 / HEX 输入 / 三种模式 — ConfigForm + Schema</Paragraph>
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
