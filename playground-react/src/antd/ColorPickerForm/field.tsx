/**
 * 场景 31：颜色选择器
 *
 * 覆盖：
 * - 原生 color input + 预设色板
 * - HEX 输入
 * - 颜色预览
 * - 三种模式切换
 *
 * 自定义 ColorPicker 组件注册后，在 fieldProps 中通过 component: 'ColorPicker' 引用。
 */
import React from 'react'
import { observer } from 'mobx-react-lite'
import { FormField, FormProvider, registerComponent, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'
import { Input, Space, Typography } from 'antd'

const { Title, Paragraph, Text } = Typography

setupAntd()

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

  /* 只读或禁用：仅展示色块和值 */
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

// ========== 表单组件 ==========

/**
 * 颜色选择器表单
 *
 * 展示颜色选择、预设色板、主题预览、三种模式切换
 */
export const ColorPickerForm = observer((): React.ReactElement => {
  const form = useCreateForm({
    initialValues: { themeName: '自定义主题', primaryColor: '#1677ff', bgColor: '#ffffff', textColor: '#333333' },
  })

  return (
    <div>
      <Title level={3}>颜色选择器</Title>
      <Paragraph type="secondary">原生 color input + 预设色板 / HEX 输入 / 三种模式</Paragraph>
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
                <FormField name="themeName" fieldProps={{ label: '主题名称', required: true, component: 'Input' }} />
                <FormField name="primaryColor" fieldProps={{ label: '主色调', required: true, component: 'ColorPicker' }} />
                <FormField name="bgColor" fieldProps={{ label: '背景色', component: 'ColorPicker' }} />
                <FormField name="textColor" fieldProps={{ label: '文字颜色', component: 'ColorPicker' }} />

                {/* 主题预览 */}
                <div style={{
                  padding: 16,
                  borderRadius: 8,
                  marginBottom: 16,
                  border: '1px solid #eee',
                  background: (form.getFieldValue('bgColor') as string) || '#fff',
                  color: (form.getFieldValue('textColor') as string) || '#333',
                }}
                >
                  <h4 style={{ color: (form.getFieldValue('primaryColor') as string) || '#1677ff' }}>主题预览</h4>
                  <p>
                    这是文字颜色预览，背景色为
                    {(form.getFieldValue('bgColor') as string) || '#ffffff'}
                    。
                  </p>
                  <button
                    type="button"
                    style={{ background: (form.getFieldValue('primaryColor') as string) || '#1677ff', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: 4 }}
                  >
                    主色调按钮
                  </button>
                </div>
                {mode === 'editable' && <LayoutFormActions onReset={() => form.reset()} />}
              </form>
            </FormProvider>
          )
        }}
      </StatusTabs>
    </div>
  )
})
