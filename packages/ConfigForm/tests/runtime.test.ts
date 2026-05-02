import type { RuntimeToken } from '../src/types'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, markRaw } from 'vue'
import { defineField } from '../src/models/field'
import { createFormRuntime, createRuntimeToken, expr } from '../src/runtime'

interface MessageToken extends RuntimeToken<string, 'message'> {
  key: string
  fallback?: string
  params?: Record<string, unknown>
}

function message(key: string, fallback?: string, params?: Record<string, unknown>): MessageToken {
  return createRuntimeToken<string, 'message', Omit<MessageToken, '__configFormToken'>>('message', { fallback, key, params })
}

const RuntimeInput = markRaw(defineComponent({
  name: 'RuntimeInput',
  setup(_props, { attrs }) {
    return () => h('input', attrs)
  },
}))

const AlternateInput = markRaw(defineComponent({
  name: 'AlternateInput',
  setup(_props, { attrs }) {
    return () => h('textarea', attrs)
  },
}))

describe('form runtime', () => {
  it('resolves components, runtime tokens, expressions, extensions, and debug events', () => {
    const events: Array<{ type: string, field?: string, extension?: string }> = []
    const runtime = createFormRuntime({
      components: {
        RuntimeInput,
      },
      debug: {
        emit: event => events.push(event),
      },
      extensions: [
        {
          name: 'test-messages',
          priority: -100,
          tokens: {
            message: (token, context, path, helpers) => {
              const { fallback, key, params: rawParams } = token as MessageToken
              const params = rawParams
                ? helpers.resolveValue(rawParams, context, `${path}.params`) as Record<string, unknown>
                : undefined
              if (key === 'fields.name')
                return `用户名-${String(params?.name)}`
              return fallback ?? key
            },
          },
        },
        {
          name: 'late-props',
          priority: 20,
          resolveField: field => ({
            ...field,
            props: {
              ...field.props,
              order: [...((field.props?.order as string[] | undefined) ?? []), 'late'],
            },
          }),
        },
        {
          name: 'early-props',
          priority: 10,
          resolveField: field => ({
            ...field,
            props: {
              ...field.props,
              order: [...((field.props?.order as string[] | undefined) ?? []), 'early'],
            },
          }),
        },
      ],
    })

    const field = defineField({
      field: 'name',
      label: message('fields.name', 'Name', { name: 'Ada' }),
      component: 'RuntimeInput',
      props: {
        disabled: expr({ left: { path: 'values.role' }, op: 'eq', right: 'guest' }, false),
        placeholder: message('fields.name.placeholder', 'Name placeholder'),
      },
      visible: expr({ left: { path: 'values.role' }, op: 'eq', right: 'admin' }, false),
      slots: {
        default: message('slots.name', 'Default slot'),
      },
    })

    const ctx = runtime.createContext({ errors: {}, values: { role: 'admin' } })
    const resolved = runtime.resolveField(field, ctx)

    expect(resolved.component).toBe(RuntimeInput)
    expect(resolved.label).toBe('用户名-Ada')
    expect(resolved.props).toMatchObject({
      disabled: false,
      order: ['early', 'late'],
      placeholder: 'Name placeholder',
    })
    expect(resolved.slots?.default).toBe('Default slot')
    expect(runtime.resolveVisible(field, ctx)).toBe(true)
    expect(runtime.resolveDisabled(field, ctx)).toBe(false)
    expect(events.map(event => event.type)).toEqual(
      expect.arrayContaining(['field:resolved', 'extension:resolved', 'condition:resolved']),
    )
  })

  it('uses custom expression evaluators without eval-style assumptions', () => {
    const runtime = createFormRuntime({
      expression: {
        evaluate: (input, ctx) => input === 'canEdit' ? ctx.values.canEdit === true : undefined,
      },
    })

    const ctx = runtime.createContext({ errors: {}, values: { canEdit: true } })

    expect(runtime.resolveValue(expr('canEdit', false), ctx)).toBe(true)
  })

  it('throws when runtime tokens are used without a resolver', () => {
    const runtime = createFormRuntime()
    const field = defineField({
      component: 'input',
      field: 'name',
      label: message('field.name', 'Name'),
    })

    expect(() => runtime.resolveField(field, runtime.createContext({ errors: {}, values: {} })))
      .toThrow(/No token resolver registered/)
  })

  it('enforces duplicate extension and component conflicts in strict mode', () => {
    expect(() => createFormRuntime({
      extensions: [{ name: 'dup' }, { name: 'dup' }],
    })).toThrow(/Duplicate extension/)

    expect(() => createFormRuntime({
      components: { RuntimeInput },
      extensions: [{ components: { RuntimeInput: AlternateInput }, name: 'ui' }],
    })).toThrow(/Component key conflict/)

    expect(() => createFormRuntime({
      extensions: [
        { name: 'token-a', tokens: { sample: () => 'a' } },
        { name: 'token-b', tokens: { sample: () => 'b' } },
      ],
    })).toThrow(/Token resolver conflict/)
  })

  it('can opt into last-write-wins conflicts explicitly', () => {
    const warnings: string[] = []
    const runtime = createFormRuntime({
      components: { RuntimeInput },
      conflictStrategy: 'last-write-wins',
      extensions: [
        { components: { RuntimeInput: AlternateInput }, name: 'ui', tokens: { sample: () => 'first' } },
        { name: 'ui', tokens: { sample: () => 'second' } },
      ],
      onConflict: warning => warnings.push(warning.message),
    })

    const field = defineField({ component: 'RuntimeInput', field: 'name' })
    const resolved = runtime.resolveField(field, runtime.createContext({ errors: {}, values: {} }))

    expect(resolved.component).toBe(AlternateInput)
    expect(runtime.resolveValue(createRuntimeToken<string, 'sample'>('sample'), runtime.createContext())).toBe('second')
    expect(warnings).toEqual([])
  })

  it('throws when uppercase component keys cannot be resolved', () => {
    const runtime = createFormRuntime()
    const field = defineField({ component: 'MissingInput', field: 'name' })

    expect(() => runtime.resolveField(field, runtime.createContext({ errors: {}, values: {} })))
      .toThrow(/Unknown component key: MissingInput/)
  })

  it('evaluates built-in expressions and path fallbacks without unsafe eval', () => {
    const runtime = createFormRuntime()
    const ctx = runtime.createContext({
      errors: {},
      values: {
        count: 3,
        name: 'Ada Lovelace',
        tags: ['admin', 'editor'],
      },
    })

    expect(runtime.resolveValue(expr({ path: 'values.count' }), ctx)).toBe(3)
    expect(runtime.resolveValue(expr({ path: 'count' }), ctx)).toBe(3)
    expect(runtime.resolveValue(expr({ path: 'missing', fallback: 'fallback' }), ctx)).toBe('fallback')
    expect(runtime.resolveValue(expr({ path: '' }), ctx)).toEqual(ctx.values)
    expect(runtime.resolveValue(expr({ path: 'values.count.deep', fallback: 'bad path' }), ctx)).toBe('bad path')
    expect(runtime.resolveValue(expr({ left: { path: 'count' }, op: 'neq', right: 4 }), ctx)).toBe(true)
    expect(runtime.resolveValue(expr({ left: { path: 'count' }, op: 'gt', right: 2 }), ctx)).toBe(true)
    expect(runtime.resolveValue(expr({ left: { path: 'count' }, op: 'gte', right: 3 }), ctx)).toBe(true)
    expect(runtime.resolveValue(expr({ left: { path: 'count' }, op: 'lt', right: 4 }), ctx)).toBe(true)
    expect(runtime.resolveValue(expr({ left: { path: 'count' }, op: 'lte', right: 3 }), ctx)).toBe(true)
    expect(runtime.resolveValue(expr({ items: [true, { left: { path: 'count' }, op: 'eq', right: 3 }], op: 'and' }), ctx)).toBe(true)
    expect(runtime.resolveValue(expr({ items: [false, { left: { path: 'count' }, op: 'eq', right: 3 }], op: 'or' }), ctx)).toBe(true)
    expect(runtime.resolveValue(expr({ op: 'not', value: false }), ctx)).toBe(true)
    expect(runtime.resolveValue(expr({ op: 'includes', source: { path: 'tags' }, value: 'admin' }), ctx)).toBe(true)
    expect(runtime.resolveValue(expr({ op: 'includes', source: { path: 'name' }, value: 'Love' }), ctx)).toBe(true)
    expect(runtime.resolveValue(expr({ op: 'includes', source: 3, value: '3' }), ctx)).toBe(false)
    expect(() => runtime.resolveValue(expr({} as never, 'unsupported'), ctx))
      .toThrow(/Unsupported expression/)
  })

  it('lets value, slot, and condition extensions compose in priority order', () => {
    const debugEvents: string[] = []
    const runtime = createFormRuntime({
      debug: {
        emit: event => debugEvents.push(event.type),
      },
      extensions: [
        {
          name: 'conditions',
          resolveDisabled: (_field, _ctx, next) => !next(),
          resolveVisible: (_field, _ctx, next) => !next(),
        },
        {
          name: 'value-and-slot',
          resolveSlot: slot => slot === 'base' ? 'slot-from-extension' : undefined,
          resolveValue: (value, _ctx, path) => path === 'field.props.flag' && value === 'raw'
            ? 'from-extension'
            : undefined,
        },
      ],
    })
    const field = defineField({
      component: 'input',
      disabled: false,
      field: 'field',
      props: { flag: 'raw' },
      slots: { default: 'base' },
      visible: true,
    })
    const ctx = runtime.createContext({ errors: {}, values: {} })
    const resolved = runtime.resolveField(field, ctx)
    const vnode = h('span', 'kept')

    expect(resolved.props?.flag).toBe('from-extension')
    expect(resolved.slots?.default).toBe('slot-from-extension')
    expect(runtime.resolveSlot({ component: 'input', field: 'slotField' }, ctx)).toMatchObject({
      component: 'input',
      field: 'slotField',
      valueProp: 'modelValue',
    })
    expect(runtime.resolveSlot(vnode, ctx)).toBe(vnode)
    expect(runtime.resolveVisible(field, ctx)).toBe(false)
    expect(runtime.resolveDisabled(field, ctx)).toBe(true)
    expect(debugEvents).toContain('extension:resolved')
  })

  it('resolves component container nodes without manufacturing field bindings', () => {
    const runtime = createFormRuntime({
      components: {
        RuntimeInput,
      },
    })
    const ctx = runtime.createContext({ errors: {}, values: {} })

    const resolved = runtime.resolveNode({
      component: 'RuntimeInput',
      props: {
        placeholder: 'Container placeholder',
      },
      slots: {
        default: [
          defineField({
            component: 'input',
            field: 'inside',
          }),
        ],
      },
    }, ctx)

    expect(resolved).toMatchObject({
      component: RuntimeInput,
      props: {
        placeholder: 'Container placeholder',
      },
    })
    expect('field' in resolved).toBe(false)
    expect(runtime.resolveSlot({ component: 'RuntimeInput' }, ctx)).toMatchObject({
      component: RuntimeInput,
      props: {},
    })
  })

  it('throws when field-only options are used on component containers', () => {
    const runtime = createFormRuntime()
    const ctx = runtime.createContext({ errors: {}, values: {} })

    expect(() => runtime.resolveNode({
      component: 'section',
      label: '错误的容器 label',
    } as never, ctx)).toThrow(/Component node without field cannot use field-only option "label"/)
  })
})
