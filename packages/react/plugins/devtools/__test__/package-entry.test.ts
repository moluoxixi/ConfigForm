import { createElement, isValidElement } from 'react'
import { describe, expect, it } from 'vitest'
import { DevToolsPanel } from '../src/index.ts'

function createMockApi() {
  return {
    subscribe: () => () => {},
    getFormOverview: () => ({
      pattern: 'editable',
      fieldCount: 0,
      errorFieldCount: 0,
      values: {},
      initialValues: {},
      submitting: false,
      validating: false,
    }),
    getFieldTree: () => [],
    getEventLog: () => [],
    getFieldDetail: () => null,
    getValueDiff: () => [],
    highlightField: () => {},
    validateAll: async () => [],
    resetForm: () => {},
    submitForm: async () => ({ success: true, errors: [] }),
    clearEventLog: () => {},
    setFieldValue: () => {},
    setFieldState: () => {},
  }
}

describe('plugin-devtools-react panel', () => {
  it('creates a valid React element with api prop', () => {
    const api = createMockApi()
    const element = createElement(DevToolsPanel, { api })

    expect(isValidElement(element)).toBe(true)
    expect(element.type).toBe(DevToolsPanel)
    expect(element.props.api).toBe(api)
  })
})
