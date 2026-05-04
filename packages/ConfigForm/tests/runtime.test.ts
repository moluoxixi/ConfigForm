import type { FormRuntimeResolveSnap } from '../src/runtime'
import type { RuntimeToken } from '../src/types'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, markRaw } from 'vue'
import { defineField } from '../src/models/field'
import { createFormRuntime, createRuntimeToken } from '../src/runtime'

interface MessageToken extends RuntimeToken<string, 'message'> {
  key: string
  fallback?: string
  params?: Record<string, unknown>
}

/**
 * 创建 runtime message token。
 *
 * 参数允许嵌套 token，用于验证 resolver helpers.resolveValue 的递归解析边界。
 */
function message(key: string, fallback?: string, params?: Record<string, unknown>): MessageToken {
  return createRuntimeToken<string, 'message', Omit<MessageToken, '__configFormToken'>>('message', { fallback, key, params })
}

type PathTokenPayload<TValue = unknown> = Record<string, unknown> & {
  path: string
  fallback?: TValue
}

interface PathToken<TValue = unknown> extends RuntimeToken<TValue, 'path'>, PathTokenPayload<TValue> {}

/**
 * 创建按 resolveSnap 路径取值的测试 token。
 *
 * fallback 只在路径结果为 undefined 时生效，用于区分空值和缺失值。
 */
function pathValue<TValue = unknown>(path: string, fallback?: TValue): PathToken<TValue> {
  const payload: PathTokenPayload<TValue> = { path }
  if (fallback !== undefined)
    payload.fallback = fallback
  return createRuntimeToken<TValue, 'path', PathTokenPayload<TValue>>('path', payload)
}

interface RoleIsToken extends RuntimeToken<boolean, 'roleIs'> {
  role: string
}

/** 创建 role 条件 token，用于验证 visible/disabled 可接收 runtime token。 */
function roleIs(role: string): RoleIsToken {
  return createRuntimeToken<boolean, 'roleIs', { role: string }>('roleIs', { role })
}

/**
 * 从普通对象中按点路径读取测试值。
 *
 * 读取过程中遇到空值或非对象会返回 undefined，不抛出路径错误。
 */
function getByPath(source: unknown, path: string): unknown {
  if (!path)
    return source

  return path.split('.').reduce<unknown>((current, segment) => {
    if (current == null)
      return undefined
    if (typeof current !== 'object')
      return undefined
    return (current as Record<string, unknown>)[segment]
  }, source)
}

/**
 * 从 resolveSnap 或 values 中读取测试路径。
 *
 * 以 errors/field/slotName/slotScope/values 开头时从 resolveSnap 根读取，否则默认从 values 读取。
 */
function resolveSnapPath(path: string, resolveSnap: FormRuntimeResolveSnap): unknown {
  const roots: Record<string, unknown> = {
    errors: resolveSnap.errors,
    field: resolveSnap.field,
    slotName: resolveSnap.slotName,
    slotScope: resolveSnap.slotScope,
    values: resolveSnap.values,
  }
  const firstSegment = path.split('.')[0]
  const source = firstSegment && Object.hasOwn(roots, firstSegment)
    ? roots
    : resolveSnap.values
  return getByPath(source, path)
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
  it('resolves components, runtime tokens, token conditions, and plugins', () => {
    const runtime = createFormRuntime({
      components: {
        RuntimeInput,
      },
      plugins: [
        {
          name: 'test-paths',
          tokens: {
            path: (token, resolveSnap) => {
              const pathToken = token as PathToken
              const value = resolveSnapPath(pathToken.path, resolveSnap)
              return value === undefined ? pathToken.fallback : value
            },
            roleIs: (token, resolveSnap) => resolveSnap.values.role === (token as RoleIsToken).role,
          },
        },
        {
          name: 'test-messages',
          tokens: {
            message: (token, resolveSnap, path, helpers) => {
              const { fallback, key, params: rawParams } = token as MessageToken
              const params = rawParams
                ? helpers.resolveValue(rawParams, resolveSnap, `${path}.params`) as Record<string, unknown>
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
        disabled: roleIs('guest'),
        placeholder: message('fields.name.placeholder', 'Name placeholder'),
      },
      visible: roleIs('admin'),
      slots: {
        default: message('slots.name', 'Default slot'),
      },
    })

    const resolveSnap = runtime.createResolveSnap({ errors: {}, values: { role: 'admin' } })
    const resolved = runtime.resolveField(field, resolveSnap)

    expect(resolved.component).toBe(RuntimeInput)
    expect(resolved.label).toBe('用户名-Ada')
    expect(resolved.props).toMatchObject({
      disabled: false,
      order: ['pre', 'normal', 'normal-2', 'post'],
      placeholder: 'Name placeholder',
    })
    expect(resolved.slots?.default).toBe('Default slot')
    expect(runtime.resolveVisible(field, resolveSnap)).toBe(true)
    expect(runtime.resolveDisabled(field, resolveSnap)).toBe(false)
  })

  it('throws when runtime tokens are used without a resolver', () => {
    const runtime = createFormRuntime()
    const field = defineField({
      component: 'input',
      field: 'name',
      label: message('field.name', 'Name'),
    })

    expect(() => runtime.resolveField(field, runtime.createResolveSnap({ errors: {}, values: {} })))
      .toThrow(/No token resolver registered/)
  })

  it('rejects runtime token payloads that try to overwrite reserved metadata', () => {
    expect(() => createRuntimeToken('message', {
      __configFormToken: 'other',
    } as never)).toThrow(/reserved runtime token key: __configFormToken/)

    expect(() => createRuntimeToken('message', {
      __configFormValue: 'phantom',
    } as never)).toThrow(/reserved runtime token key: __configFormValue/)
  })

  it('rejects fields that use the same event for value and blur triggers', () => {
    const runtime = createFormRuntime()
    const field = defineField({
      blurTrigger: 'commit',
      component: 'input',
      field: 'status',
      trigger: 'commit',
    })

    expect(() => runtime.resolveField(field, runtime.createResolveSnap({ errors: {}, values: {} })))
      .toThrow(/cannot use the same event for trigger and blurTrigger/)
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

    expect(() => runtime.resolveField(field, runtime.createResolveSnap({ errors: {}, values: {} })))
      .toThrow(/Unknown component key: MissingInput/)
  })

  it('resolves slot field configs, vnodes, and conditions without plugin hooks', () => {
    const runtime = createFormRuntime({
      plugins: [
        {
          name: 'test-paths',
          tokens: {
            path: (token, resolveSnap) => {
              const pathToken = token as PathToken
              const value = resolveSnapPath(pathToken.path, resolveSnap)
              return value === undefined ? pathToken.fallback : value
            },
          },
        },
      ],
    })
    const field = defineField({
      component: 'input',
      disabled: true,
      field: 'field',
      props: { flag: pathValue('values.flag') },
      slots: { default: 'base' },
      visible: false,
    })
    const resolveSnap = runtime.createResolveSnap({ errors: {}, values: { flag: 'from-values' } })
    const resolved = runtime.resolveField(field, resolveSnap)
    const vnode = h('span', 'kept')

    expect(resolved.props?.flag).toBe('from-values')
    expect(resolved.slots?.default).toBe('base')
    expect(runtime.resolveSlot(defineField({ component: 'input', field: 'slotField' }), resolveSnap)).toMatchObject({
      component: 'input',
      field: 'slotField',
      valueProp: 'modelValue',
    })
    expect(runtime.resolveSlot(vnode, resolveSnap)).toBe(vnode)
    expect(runtime.resolveVisible(field, resolveSnap)).toBe(false)
    expect(runtime.resolveDisabled(field, resolveSnap)).toBe(true)
  })

  it('exposes the current slot name through resolve snap while resolving slots', () => {
    const seenSlotNames: Array<string | undefined> = []
    const slotNameToken = createRuntimeToken<string | undefined, 'slotName'>('slotName')
    const runtime = createFormRuntime({
      plugins: [
        {
          name: 'slot-snap',
          tokens: {
            slotName: (_token, resolveSnap) => {
              seenSlotNames.push(resolveSnap.slotName)
              return resolveSnap.slotName
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

    const resolved = runtime.resolveField(field, runtime.createResolveSnap({ errors: {}, values: {} }))

    expect(seenSlotNames).toEqual(['default', 'suffix'])
    expect(resolved.slots?.default).toBe('default')
    expect(resolved.slots?.suffix).toBe('suffix')
  })

  it('keeps resolve snap limited to form and slot data', () => {
    const slotScopeLabel = createRuntimeToken<string | undefined, 'slotScopeLabel'>('slotScopeLabel')
    const runtime = createFormRuntime({
      plugins: [
        {
          name: 'slot-scope-label',
          tokens: {
            slotScopeLabel: (_token, resolveSnap) => resolveSnap.slotScope?.label,
          },
        },
      ],
    })
    const resolveSnap = runtime.createResolveSnap({
      errors: {},
      slotScope: { label: '作用域' },
      values: {},
    })

    expect(resolveSnap).not.toHaveProperty('locale')
    expect(resolveSnap).not.toHaveProperty('meta')
    expect(resolveSnap).not.toHaveProperty('plugins')
    expect(resolveSnap.slotScope).toEqual({ label: '作用域' })
    expect(runtime.resolveValue(slotScopeLabel, resolveSnap)).toBe('作用域')
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
    const resolveSnap = runtime.createResolveSnap({ errors: {}, values: {} })

    const resolved = runtime.resolveField(field, resolveSnap)

    expect(resolvedFields).toEqual(['host', 'child'])

    resolvedFields.length = 0
    expect(runtime.resolveField(resolved, resolveSnap)).toBe(resolved)
    expect(resolvedFields).toEqual([])

    resolvedFields.length = 0
    expect(runtime.resolveSlot(resolved.slots?.default, resolveSnap)).toBe(resolved.slots?.default)
    expect(resolvedFields).toEqual([])
  })

  it('resolves component container nodes without manufacturing field bindings', () => {
    const runtime = createFormRuntime({
      components: {
        RuntimeInput,
      },
    })
    const resolveSnap = runtime.createResolveSnap({ errors: {}, values: {} })

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
    }, resolveSnap)

    expect(resolved).toMatchObject({
      component: RuntimeInput,
      props: {
        placeholder: 'Container placeholder',
      },
    })
    expect('field' in resolved).toBe(false)
    expect(runtime.resolveSlot(defineField({ component: 'RuntimeInput' }), resolveSnap)).toMatchObject({
      component: RuntimeInput,
      props: {},
    })
  })

  it('throws when field-only options are used on component containers', () => {
    const runtime = createFormRuntime()
    const resolveSnap = runtime.createResolveSnap({ errors: {}, values: {} })

    expect(() => runtime.resolveNode({
      component: 'section',
      label: '错误的容器 label',
    } as never, resolveSnap)).toThrow(/Component node without field cannot use field-only option "label"/)
  })

  it('runs field transforms without exposing form values or errors', () => {
    const seenArgCounts: number[] = []
    const runtime = createFormRuntime({
      plugins: [
        {
          name: 'static-transform',
          transformField: (...args) => {
            seenArgCounts.push(args.length)
            const [field] = args
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
      runtime.createResolveSnap({ errors: { name: ['error'] }, values: { name: 'Ada' } }),
    )

    expect(resolved.props.transformed).toBe(true)
    expect(seenArgCounts).toEqual([1])
  })

  it('does not keep legacy field plugins as a runtime compatibility branch', () => {
    const runtime = createFormRuntime()

    expect(() => runtime.resolveField({
      component: 'input',
      field: 'name',
      plugins: {
        i18n: {
          label: 'field.name',
        },
      },
    } as never, runtime.createResolveSnap())).not.toThrow()
  })
})
