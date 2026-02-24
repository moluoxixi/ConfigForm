import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  FormLayout,
  registerActions,
  registerFieldComponents,
  componentsMock,
  previewMock,
} = vi.hoisted(() => {
  const componentNames = [
    'ArrayBase',
    'ArrayField',
    'ArrayItems',
    'ArrayTable',
    'AutoComplete',
    'Cascader',
    'CheckboxGroup',
    'DatePicker',
    'DateRangePicker',
    'ExportJsonAction',
    'FormDialog',
    'FormDrawer',
    'FormItem',
    'ImportJsonAction',
    'Input',
    'InputNumber',
    'LayoutCard',
    'LayoutCollapse',
    'LayoutFormActions',
    'LayoutStepActions',
    'LayoutSteps',
    'LayoutTabs',
    'Mentions',
    'MonthPicker',
    'Password',
    'PrintAction',
    'RadioGroup',
    'RangePicker',
    'Rate',
    'Select',
    'Slider',
    'StatusTabs',
    'Switch',
    'Textarea',
    'TimePicker',
    'Transfer',
    'TreeSelect',
    'Upload',
    'WeekPicker',
    'YearPicker',
  ] as const

  const previewNames = [
    'PreviewCheckboxGroup',
    'PreviewDatePicker',
    'PreviewInput',
    'PreviewInputNumber',
    'PreviewPassword',
    'PreviewRadioGroup',
    'PreviewSelect',
    'PreviewSwitch',
    'PreviewTextarea',
  ] as const

  const componentsMock = Object.fromEntries(componentNames.map(name => [name, { name }])) as Record<string, unknown>
  const previewMock = Object.fromEntries(previewNames.map(name => [name, { name }])) as Record<string, unknown>

  return {
    FormLayout: { name: 'FormLayout' },
    registerFieldComponents: vi.fn(),
    registerActions: vi.fn(),
    componentsMock,
    previewMock,
  }
})

vi.mock('@moluoxixi/vue', () => ({
  FormLayout,
  registerFieldComponents,
  registerActions,
}))

vi.mock('../src/components', () => componentsMock)
vi.mock('../src/components/PreviewText', () => previewMock)
vi.mock('element-plus/dist/index.css', () => ({}))

import { setupElementPlus } from '../src/index.ts'

describe('ui-element-plus setup', () => {
  beforeEach(() => {
    registerFieldComponents.mockReset()
    registerActions.mockReset()
  })

  it('injects label align style once', () => {
    const appendChild = vi.fn()
    const createElement = vi.fn(() => ({ textContent: '' }))
    vi.stubGlobal('document', {
      createElement,
      head: { appendChild },
    } as any)

    setupElementPlus()
    setupElementPlus()

    expect(createElement).toHaveBeenCalledWith('style')
    expect(appendChild).toHaveBeenCalledTimes(1)
    vi.unstubAllGlobals()
  })

  it('registers field components, readPretty mapping and actions', () => {
    setupElementPlus()

    expect(registerFieldComponents).toHaveBeenCalledTimes(1)
    const [fields, decorator, layouts, readPretty] = registerFieldComponents.mock.calls[0]
    const expectedFieldKeys = [
      'Input',
      'Password',
      'Textarea',
      'InputNumber',
      'Select',
      'RadioGroup',
      'CheckboxGroup',
      'Switch',
      'DatePicker',
      'DateRangePicker',
      'Cascader',
      'TreeSelect',
      'Upload',
      'Transfer',
      'TimePicker',
      'AutoComplete',
      'Mentions',
      'Rate',
      'Slider',
      'MonthPicker',
      'WeekPicker',
      'YearPicker',
      'RangePicker',
      'ArrayItems',
      'ArrayField',
    ]
    const expectedLayoutKeys = [
      'ArrayTable',
      'FormLayout',
      'LayoutTabs',
      'LayoutCard',
      'LayoutCollapse',
      'LayoutSteps',
      'LayoutStepActions',
      'LayoutFormActions',
      'StatusTabs',
    ]
    const expectedReadPrettyKeys = [
      'Input',
      'Password',
      'Textarea',
      'InputNumber',
      'Select',
      'RadioGroup',
      'CheckboxGroup',
      'Switch',
      'DatePicker',
    ]

    expect(fields.Input).toBe(componentsMock.Input)
    expect(fields.DateRangePicker).toBe(componentsMock.DateRangePicker)
    expect(Object.keys(fields).sort()).toEqual(expectedFieldKeys.sort())
    expect(decorator).toEqual({ name: 'FormItem', component: componentsMock.FormItem })
    expect(layouts.FormLayout).toBe(FormLayout)
    expect(layouts.LayoutTabs).toBe(componentsMock.LayoutTabs)
    expect(Object.keys(layouts).sort()).toEqual(expectedLayoutKeys.sort())
    expect(readPretty.Input).toBe(previewMock.PreviewInput)
    expect(readPretty.DatePicker).toBe(previewMock.PreviewDatePicker)
    expect(Object.keys(readPretty).sort()).toEqual(expectedReadPrettyKeys.sort())

    expect(registerActions).toHaveBeenCalledWith({
      export: componentsMock.ExportJsonAction,
      import: componentsMock.ImportJsonAction,
      print: componentsMock.PrintAction,
    })
  })
})
