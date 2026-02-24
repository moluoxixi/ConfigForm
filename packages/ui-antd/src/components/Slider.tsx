import type { ReactElement } from 'react'
import { Slider as ASlider } from 'antd'

/**
 * Cf Slider Props：类型接口定义。
 * 所属模块：`packages/ui-antd/src/components/Slider.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface CfSliderProps {
  value?: number | [number, number]
  onChange?: (value: number | [number, number]) => void
  disabled?: boolean
  preview?: boolean
  min?: number
  max?: number
  step?: number
  range?: boolean
}

/**
 * Slider：当前功能模块的核心执行单元。
 * 所属模块：`packages/ui-antd/src/components/Slider.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 原始解构参数（{ value, onChange, disabled, preview, min = 0, max = 100, step = 1, range = false }）用于提供待处理的值并参与结果计算。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function Slider({ value, onChange, disabled, preview, min = 0, max = 100, step = 1, range = false }: CfSliderProps): ReactElement {
  if (range) {
    return (
      <ASlider
        value={Array.isArray(value) ? value : undefined}
        onChange={(nextValue: number | number[]) => {
          if (Array.isArray(nextValue)) {
            onChange?.([nextValue[0] ?? 0, nextValue[1] ?? 0])
          }
        }}
        disabled={disabled || preview}
        min={min}
        max={max}
        step={step}
        range
      />
    )
  }

  return (
    <ASlider
      value={typeof value === 'number' ? value : undefined}
      onChange={(nextValue: number | number[]) => {
        if (typeof nextValue === 'number') {
          onChange?.(nextValue)
        }
      }}
      disabled={disabled || preview}
      min={min}
      max={max}
      step={step}
    />
  )
}
