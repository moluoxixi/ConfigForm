import type { ReactElement } from 'react'
import { Slider as ASlider } from 'antd'

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
 * Slider：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Slider 的单一职责，调用方可通过函数名快速理解输入输出语义。
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
