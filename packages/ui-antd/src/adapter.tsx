import type { DataSourceItem } from '@moluoxixi/shared'
import type { ValidationFeedback } from '@moluoxixi/validator'
import {
  Checkbox as ACheckbox,
  DatePicker as ADatePicker,
  Form as AForm,
  Input as AInput,
  InputNumber as AInputNumber,
  Radio as ARadio,
  Select as ASelect,
  Switch as ASwitch,
} from 'antd'
import React from 'react'

/* ========== 输入适配 ========== */

export interface CfInputProps {
  value?: string
  onChange?: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
}

export function Input({ value, onChange, onFocus, onBlur, placeholder, disabled, readOnly }: CfInputProps): React.ReactElement {
  return (
    <AInput
      value={value}
      onChange={e => onChange?.(e.target.value)}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
    />
  )
}

export function Password({ value, onChange, onFocus, onBlur, placeholder, disabled, readOnly }: CfInputProps): React.ReactElement {
  return (
    <AInput.Password
      value={value}
      onChange={e => onChange?.(e.target.value)}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
    />
  )
}

export interface CfTextareaProps extends CfInputProps {
  rows?: number
}

export function Textarea({ value, onChange, onFocus, onBlur, placeholder, disabled, readOnly, rows = 3 }: CfTextareaProps): React.ReactElement {
  return (
    <AInput.TextArea
      value={value}
      onChange={e => onChange?.(e.target.value)}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      rows={rows}
    />
  )
}

export interface CfInputNumberProps {
  value?: number
  onChange?: (value: number) => void
  onFocus?: () => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  min?: number
  max?: number
  step?: number
}

export function InputNumber({ value, onChange, onFocus, onBlur, placeholder, disabled, readOnly, min, max, step = 1 }: CfInputNumberProps): React.ReactElement {
  return (
    <AInputNumber
      value={value}
      onChange={v => onChange?.(v as number)}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled || readOnly}
      min={min}
      max={max}
      step={step}
      style={{ width: '100%' }}
    />
  )
}

/* ========== 选择适配 ========== */

export interface CfSelectProps {
  value?: unknown
  onChange?: (value: unknown) => void
  onFocus?: () => void
  onBlur?: () => void
  dataSource?: DataSourceItem[]
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  loading?: boolean
  mode?: 'multiple' | 'tags'
}

export function Select({ value, onChange, onFocus, onBlur, dataSource = [], placeholder, disabled, readOnly, loading, mode }: CfSelectProps): React.ReactElement {
  return (
    <ASelect
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled || readOnly}
      loading={loading}
      mode={mode}
      style={{ width: '100%' }}
      options={dataSource.map(item => ({
        label: item.label,
        value: item.value,
        disabled: item.disabled,
      }))}
    />
  )
}

export interface CfRadioGroupProps {
  value?: unknown
  onChange?: (value: unknown) => void
  dataSource?: DataSourceItem[]
  disabled?: boolean
  readOnly?: boolean
}

export function RadioGroup({ value, onChange, dataSource = [], disabled, readOnly }: CfRadioGroupProps): React.ReactElement {
  return (
    <ARadio.Group
      value={value}
      onChange={e => onChange?.(e.target.value)}
      disabled={disabled || readOnly}
      options={dataSource.map(item => ({ label: item.label, value: item.value }))}
    />
  )
}

export interface CfCheckboxGroupProps {
  value?: unknown[]
  onChange?: (value: unknown[]) => void
  dataSource?: DataSourceItem[]
  disabled?: boolean
  readOnly?: boolean
}

export function CheckboxGroup({ value, onChange, dataSource = [], disabled, readOnly }: CfCheckboxGroupProps): React.ReactElement {
  return (
    <ACheckbox.Group
      value={value}
      onChange={v => onChange?.(v)}
      disabled={disabled || readOnly}
      options={dataSource.map(item => ({ label: item.label, value: item.value as string }))}
    />
  )
}

/* ========== 开关 ========== */

export interface CfSwitchProps {
  value?: boolean
  onChange?: (value: boolean) => void
  disabled?: boolean
  readOnly?: boolean
}

export function Switch({ value, onChange, disabled, readOnly }: CfSwitchProps): React.ReactElement {
  return <ASwitch checked={value} onChange={onChange} disabled={disabled || readOnly} />
}

/* ========== 日期 ========== */

export interface CfDatePickerProps {
  value?: string
  onChange?: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
}

export function DatePicker({ value, onChange, placeholder, disabled, readOnly }: CfDatePickerProps): React.ReactElement {
  return (
    <ADatePicker
      value={value || undefined}
      onChange={(_date, dateString) => onChange?.(dateString as string)}
      placeholder={placeholder}
      disabled={disabled || readOnly}
      style={{ width: '100%' }}
    />
  )
}

/* ========== FormItem 装饰器 ========== */

export interface CfFormItemProps {
  label?: string
  required?: boolean
  errors?: ValidationFeedback[]
  warnings?: ValidationFeedback[]
  description?: string
  children: React.ReactNode
}

export function FormItem({ label, required, errors = [], warnings = [], description, children }: CfFormItemProps): React.ReactElement {
  const validateStatus = errors.length > 0
    ? 'error' as const
    : warnings.length > 0
      ? 'warning' as const
      : undefined

  const helpMsg = errors.length > 0
    ? errors[0].message
    : warnings.length > 0
      ? warnings[0].message
      : description

  return (
    <AForm.Item
      label={label}
      required={required}
      validateStatus={validateStatus}
      help={helpMsg}
    >
      {children}
    </AForm.Item>
  )
}
