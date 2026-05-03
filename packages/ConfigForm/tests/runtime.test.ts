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
  it('resolves components, runtime tokens, expressions, and plugins', () => {
    const runtime = createFormRuntime({
      components: {
        RuntimeInput,
      },
      plugins: [
        {
          name: 'test-messages',
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
          name: 'normal-props',
          transformField: field => ({
            ...field,
            props: {
              ...field.props,
              order: [...((field.props?.order as string[] | undefined) ?? []), 'normal'],
            },
          }),
        },
        {
          name: 'pre-props',
          transformField: {
            order: 'pre',
            handler: field => ({
              ...field,
              props: {
                ...field.props,
                order: [...((field.props?.order as string[] | undefined) ?? []), 'pre'],
              },
            }),
          },
        },
        {
          name: 'post-props',
          transformField: {
            order: 'post',
            handler: field => ({
              ...field,
              props: {
                ...field.props,
                order: [...((field.props?.order as string[] | undefined) ?? []), 'post'],
              },
            }),
          },
        },
        {
          name: 'normal-props-2',
          transformField: field => ({
            ...field,
            props: {
              ...field.props,
              order: [...((field.props?.order as string[] | undefined) ?? []), 'normal-2'],
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
      order: ['pre', 'normal', 'normal-2', 'post'],
      placeholder: 'Name placeholder',
    })
    expect(resolved.slots?.default).toBe('Default slot')
    expect(runtime.resolveVisible(field, ctx)).toBe(true)
    expect(runtime.resolveDisabled(field, ctx)).toBe(false)
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

  it('enforces duplicate plugin and component conflicts in strict mode', () => {
    expect(() => createFormRuntime({
      plugins: [{ name: 'dup' }, { name: 'dup' }],
    })).toThrow(/Duplicate plugin/)

    expect(() => createFormRuntime({
      components: { RuntimeInput },
      plugins: [{ components: { RuntimeInput: AlternateInput }, name: 'ui' }],
    })).toThrow(/Component key conflict/)

    expect(() => createFormRuntime({
      plugins: [
        { name: 'token-a', tokens: { sample: () => 'a' } },
        { name: 'token-b', tokens: { sample: () => 'b' } },
      ],
    })).toThrow(/Token resolver conflict/)
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

  it('resolves slot field configs, vnodes, and conditions without plugin hooks', () => {
    const runtime = createFormRuntime()
    const field = defineField({
      component: 'input',
      disabled: true,
      field: 'field',
      props: { flag: expr({ path: 'values.flag' }) },
      slots: { default: 'base' },
      visible: false,
    })
    const ctx = runtime.createContext({ errors: {}, values: { flag: 'from-values' } })
    const resolved = runtime.resolveField(field, ctx)
    const vnode = h('span', 'kept')

    expect(resolved.props?.flag).toBe('from-values')
    expect(resolved.slots?.default).toBe('base')
    expect(runtime.resolveSlot(defineField({ component: 'input', field: 'slotField' }), ctx)).toMatchObject({
      component: 'input',
      field: 'slotField',
      valueProp: 'modelValue',
    })
    expect(runtime.resolveSlot(vnode, ctx)).toBe(vnode)
    expect(runtime.resolveVisible(field, ctx)).toBe(false)
    expect(runtime.resolveDisabled(field, ctx)).toBe(true)
  })

  it('exposes the current slot name through runtime context while resolving slots', () => {
    const seenSlotNames: Array<string | undefined> = []
    const slotNameToken = createRuntimeToken<string | undefined, 'slotName'>('slotName')
    const runtime = createFormRuntime({
      plugins: [
        {
          name: 'slot-context',
          tokens: {
            slotName: (_token, context) => {
              seenSlotNames.push(context.slotName)
              return context.slotName
            },
          },
        },
      ],
    })
    const field = defineField({
      component: 'section',
      field: 'group',
      slots: {
        default: slotNameToken,
        suffix: slotNameToken,
      },
    })

    const resolved = runtime.resolveField(field, runtime.createContext({ errors: {}, values: {} }))

    expect(seenSlotNames).toEqual(['default', 'suffix'])
    expect(resolved.slots?.default).toBe('default')
    expect(resolved.slots?.suffix).toBe('suffix')
  })

  it('keeps runtime context limited to form and slot data', () => {
    const runtime = createFormRuntime()
    const context = runtime.createContext({
      errors: {},
      slotScope: { label: '作用域' },
      values: {},
    })

    expect(context).not.toHaveProperty('locale')
    expect(context).not.toHaveProperty('meta')
    expect(context).not.toHaveProperty('plugins')
    expect(context.slotScope).toEqual({ label: '作用域' })
    expect(runtime.resolveValue(expr({ path: 'slotScope.label' }), context)).toBe('作用域')
  })

  it('does not re-run field transforms for already resolved slot nodes', () => {
    const resolvedFields: string[] = []
    const runtime = createFormRuntime({
      plugins: [
        {
          name: 'count-resolve-field',
          transformField: (field) => {
            resolvedFields.push(field.field)
            return field
          },
        },
      ],
    })
    const field = defineField({
      component: 'section',
      field: 'host',
      slots: {
        default: defineField({
          component: 'input',
          field: 'child',
        }),
      },
    })
    const ctx = runtime.createContext({ errors: {}, values: {} })

    const resolved = runtime.resolveField(field, ctx)

    expect(resolvedFields).toEqual(['host', 'child'])

    resolvedFields.length = 0
    expect(runtime.resolveField(resolved, ctx)).toBe(resolved)
    expect(resolvedFields).toEqual([])

    resolvedFields.length = 0
    expect(runtime.resolveSlot(resolved.slots?.default, ctx)).toBe(resolved.slots?.default)
    expect(resolvedFields).toEqual([])
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
    expect(runtime.resolveSlot(defineField({ component: 'RuntimeInput' }), ctx)).toMatchObject({
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

  it('runs field transforms without exposing form values or errors', () => {
    const seenKeys: string[][] = []
    const runtime = createFormRuntime({
      plugins: [
        {
          name: 'static-transform',
          transformField: (field, context) => {
            seenKeys.push(Object.keys(context).sort())
            return {
              ...field,
              props: {
                ...field.props,
                transformed: true,
              },
            }
          },
        },
      ],
    })

    const resolved = runtime.resolveField(
      defineField({ component: 'input', field: 'name' }),
      runtime.createContext({ errors: { name: ['error'] }, values: { name: 'Ada' } }),
    )

    expect(resolved.props.transformed).toBe(true)
    expect(seenKeys).toEqual([['field']])
  })

  it('rejects legacy field plugins config instead of silently ignoring it', () => {
    const runtime = createFormRuntime()

    expect(() => runtime.resolveField({
      component: 'input',
      field: 'name',
      plugins: {
        i18n: {
          label: 'field.name',
        },
      },
    } as never, runtime.createContext())).toThrow(/field\.plugins is no longer supported/)
  })
})
