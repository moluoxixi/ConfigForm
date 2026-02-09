import { Slider as ASlider } from 'antd'
import type { ReactElement } from 'react'

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
  return (
    <ASlider
      value={value}
      onChange={onChange}
      disabled={disabled || preview}
      min={min}
      max={max}
      step={step}
      range={range}
    />
  )
}
