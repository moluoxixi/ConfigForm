import { h, isVNode } from 'vue'
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

describe('plugin-devtools-vue panel', () => {
  it('creates a valid Vue vnode with required api prop contract', () => {
    const api = createMockApi()
    const vnode = h(DevToolsPanel, { api })
    const panelProps = (DevToolsPanel as { props?: Record<string, { required?: boolean }> }).props

    expect(isVNode(vnode)).toBe(true)
    expect(vnode.props?.api).toBe(api)
    expect(panelProps?.api?.required).toBe(true)
  })
})
