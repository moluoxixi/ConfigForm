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
