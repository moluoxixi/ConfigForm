import { beforeEach, describe, expect, it, vi } from 'vitest'

import { setupAntdVue } from '../src/index.ts'

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

describe('ui-antd-vue setup', () => {
  beforeEach(() => {
    registerFieldComponents.mockReset()
    registerActions.mockReset()
  })

  it('registers field components, readPretty mapping and actions', () => {
    setupAntdVue()

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
      'Cascader',
      'TimePicker',
      'Transfer',
      'TreeSelect',
      'Upload',
      'ArrayItems',
      'ArrayField',
      'AutoComplete',
      'Mentions',
      'Rate',
      'Slider',
      'MonthPicker',
      'WeekPicker',
      'YearPicker',
      'RangePicker',
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
    expect(fields.TreeSelect).toBe(componentsMock.TreeSelect)
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
