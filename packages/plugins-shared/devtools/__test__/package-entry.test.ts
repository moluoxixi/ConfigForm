import { FormLifeCycle } from '@moluoxixi/core'
import { describe, expect, it, vi } from 'vitest'
import {
  buildDevToolsFieldEventSummary,
  DEVTOOLS_ACTION_EVENT_LABELS,
  DEVTOOLS_FIELD_EVENT_DEFINITIONS,
  devToolsPlugin,
} from '../src/index.ts'

describe('plugin-devtools-core events', () => {
  it('builds field value change summary', () => {
    const summary = buildDevToolsFieldEventSummary(FormLifeCycle.ON_FIELD_VALUE_CHANGE, {
      path: 'user.name',
      value: 'Alice',
    })

    expect(summary).toContain('user.name')
    expect(summary).toContain('Alice')
  })

  it('contains built-in action labels', () => {
    expect(DEVTOOLS_ACTION_EVENT_LABELS['devtools:validate']).toBeTypeOf('string')
    expect(DEVTOOLS_ACTION_EVENT_LABELS['devtools:validate'].length).toBeGreaterThan(0)
    expect(DEVTOOLS_FIELD_EVENT_DEFINITIONS.length).toBeGreaterThan(0)
  })
})

function createMockForm() {
  const field: any = {
    path: 'user.name',
    name: 'name',
    label: 'Name',
    component: 'Input',
    decorator: 'FormItem',
    pattern: 'editable',
    selfPattern: 'editable',
    visible: true,
    disabled: false,
    preview: false,
    required: true,
    mounted: true,
    value: 'Alice',
    initialValue: 'Alice',
    errors: [],
    warnings: [],
    dataSource: [{ label: 'A', value: 'a' }],
    dataSourceLoading: false,
    componentProps: { placeholder: 'name' },
    decoratorProps: { colon: false },
    setValue(next: unknown) {
      field.value = next
    },
  }

  const listeners = new Map<string, Set<(event: any) => void>>()
  const on = (event: string, handler: (event: any) => void) => {
    if (!listeners.has(event)) {
      listeners.set(event, new Set())
    }
    listeners.get(event)!.add(handler)
    return () => {
      listeners.get(event)?.delete(handler)
    }
  }

  const form: any = {
    pattern: 'editable',
    values: { user: { name: 'Alice' } },
    initialValues: { user: { name: 'Alice' } },
    submitting: false,
    validating: false,
    on,
    onValuesChange: on.bind(null, FormLifeCycle.ON_FORM_VALUES_CHANGE),
    getAllFields: () => new Map([[field.path, field]]),
    getAllVoidFields: () => new Map(),
    getField: (path: string) => (path === field.path ? field : undefined),
    getArrayField: () => undefined,
    getObjectField: () => undefined,
    validate: async () => ({ errors: [{ path: field.path, message: 'required' }] }),
    reset: () => {},
    submit: async () => ({ errors: [] }),
  }

  const emit = (event: string, payload: unknown) => {
    const handlers = listeners.get(event)
    if (!handlers) {
      return
    }
    const formEvent = { type: event, payload }
    for (const handler of handlers) {
      handler(formEvent)
    }
  }

  return { form, field, emit }
}

describe('plugin-devtools-core plugin', () => {
  it('captures lifecycle events with max log size', () => {
    const { form, field, emit } = createMockForm()
    const { api } = devToolsPlugin({
      formId: 'test-form',
      globalHook: false,
      maxEventLog: 2,
    }).install(form)

    emit(FormLifeCycle.ON_FORM_MOUNT, form)
    emit(FormLifeCycle.ON_FIELD_VALUE_CHANGE, field)

    const log = api.getEventLog()
    expect(log).toHaveLength(2)
    expect(log[0].type).toBe(FormLifeCycle.ON_FORM_MOUNT)
    expect(log[1].type).toBe(FormLifeCycle.ON_FIELD_VALUE_CHANGE)
  })

  it('supports inspect and debug actions on field state', async () => {
    const { form, field } = createMockForm()
    const { api } = devToolsPlugin({
      formId: 'test-form',
      globalHook: false,
    }).install(form)

    const listener = vi.fn()
    const unsubscribe = api.subscribe(listener)

    const overview = api.getFormOverview()
    expect(overview.fieldCount).toBe(1)
    expect(overview.pattern).toBe('editable')

    api.setFieldValue('user.name', 'Bob')
    expect(field.value).toBe('Bob')

    api.setFieldState('user.name', {
      visible: false,
      disabled: true,
      preview: true,
      pattern: 'readPretty',
    })

    expect(field.display).toBe('none')
    expect(field.disabled).toBe(true)
    expect(field.preview).toBe(true)
    expect(field.selfPattern).toBe('readPretty')

    const diff = api.getValueDiff()
    expect(diff.find(item => item.path === 'user.name')?.changed).toBe(true)

    const errors = await api.validateAll()
    expect(errors).toEqual([{ path: 'user.name', message: 'required' }])

    const submit = await api.submitForm()
    expect(submit).toEqual({ success: true, errors: [] })

    api.highlightField('missing.path')
    expect(api.getEventLog().some(item => item.type === 'devtools:locate-miss')).toBe(true)

    expect(listener).toHaveBeenCalled()
    unsubscribe()
    api.clearEventLog()
    expect(api.getEventLog()).toEqual([])
  })
})
