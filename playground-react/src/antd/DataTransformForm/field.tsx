/**
 * 场景 40：数据转换
 *
 * 覆盖：
 * - 提交前转换（transform）
 * - 显示时格式化（format）
 * - 输入时解析（parse）
 * - submitPath 路径映射
 * - 三种模式切换
 *
 * 自定义 TransformDisplayInput 组件注册后，在 fieldProps 中通过 component: 'TransformDisplayInput' 引用。
 * format / parse / transform 配置通过 fieldProps 传入字段。
 */
import React from 'react'
import { observer } from 'mobx-react-lite'
import { FormField, FormProvider, registerComponent, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'

setupAntd()

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
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input
        value={String(value ?? '')}
        onChange={e => onChange?.(e.target.value)}
        disabled={disabled}
        readOnly={readOnly}
        style={{ width: 300, padding: '4px 11px', borderRadius: 6, border: '1px solid #d9d9d9', outline: 'none' }}
      />
      <span style={{ display: 'inline-block', padding: '0 7px', fontSize: 12, lineHeight: '20px', background: '#e6f4ff', color: '#1677ff', border: '1px solid #91caff', borderRadius: 4 }}>
        原始值:
        {JSON.stringify(value)}
      </span>
    </div>
  )
})

registerComponent('TransformDisplayInput', TransformDisplayInput, { defaultWrapper: 'FormItem' })

// ========== 表单组件 ==========

/**
 * 数据转换表单
 *
 * 展示 format（显示格式化）/ parse（输入解析）/ transform（提交转换）
 */
export const DataTransformForm = observer((): React.ReactElement => {
  const form = useCreateForm({
    initialValues: {
      priceCent: 9990,
      phoneRaw: '13800138000',
      fullName: '张三',
      tags: 'react,vue,typescript',
    },
  })

  return (
    <div>
      <h3>数据转换</h3>
      <p style={{ color: '#666' }}>format（显示格式化） / parse（输入解析） / transform（提交转换）</p>
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
                <FormField
                  name="priceCent"
                  fieldProps={{
                    label: '价格（分→元）',
                    required: true,
                    component: 'TransformDisplayInput',
                    format: (v: unknown) => v ? (Number(v) / 100).toFixed(2) : '',
                    parse: (v: unknown) => Math.round(Number(v) * 100),
                    transform: (v: unknown) => Number(v),
                  }}
                />
                <FormField
                  name="phoneRaw"
                  fieldProps={{
                    label: '手机号（脱敏）',
                    component: 'TransformDisplayInput',
                    format: (v: unknown) => {
                      const s = String(v ?? '')
                      return s.length === 11 ? `${s.slice(0, 3)}****${s.slice(7)}` : s
                    },
                    parse: (v: unknown) => String(v).replace(/\D/g, ''),
                  }}
                />
                <FormField
                  name="fullName"
                  fieldProps={{
                    label: '姓名',
                    required: true,
                    component: 'TransformDisplayInput',
                  }}
                />
                <FormField
                  name="tags"
                  fieldProps={{
                    label: '标签（逗号分隔）',
                    description: '提交时转为数组',
                    component: 'TransformDisplayInput',
                    transform: (v: unknown) => String(v ?? '').split(',').map((s: string) => s.trim()).filter(Boolean),
                  }}
                />
                {<LayoutFormActions onReset={() => form.reset()} />}
              </form>
            </FormProvider>
          )
        }}
      </StatusTabs>
    </div>
  )
})
