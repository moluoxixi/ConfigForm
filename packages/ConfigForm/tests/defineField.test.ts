import { describe, expect, expectTypeOf, it } from 'vitest'
import { z } from 'zod'
import { defineField, defineFieldFor } from '../src/models/field'

describe('defineField typing', () => {
  it('infers field value from schema', () => {
    defineField({
      field: 'name',
      component: 'input',
      schema: z.string(),
      validator: (value) => {
        expectTypeOf(value).toEqualTypeOf<string>()
        const text: string = value
        // @ts-expect-error z.string() should not infer number for validator value
        const count: number = value
        expectTypeOf(text).toEqualTypeOf<string>()
        expectTypeOf(count).toEqualTypeOf<number>()
        return value.length > 0 ? undefined : '必填'
      },
      transform: (value) => {
        expectTypeOf(value).toEqualTypeOf<string>()
        const text: string = value
        // @ts-expect-error z.string() should not infer number for transform value
        const count: number = value
        expectTypeOf(text).toEqualTypeOf<string>()
        expectTypeOf(count).toEqualTypeOf<number>()
        return value.trim()
      },
    })
  })

  it('infers field value from defaultValue', () => {
    defineField({
      field: 'age',
      component: 'input',
      defaultValue: 18,
      validator: (value) => {
        expectTypeOf(value).toEqualTypeOf<number>()
        const count: number = value
        // @ts-expect-error defaultValue number should not infer string for validator value
        const text: string = value
        expectTypeOf(count).toEqualTypeOf<number>()
        expectTypeOf(text).toEqualTypeOf<string>()
        return value > 0 ? undefined : '年龄必须大于 0'
      },
    })
  })

  it('keeps field value unknown when there is no inference source', () => {
    defineField({
      field: 'remark',
      component: 'input',
      validator: (value) => {
        expectTypeOf(value).toEqualTypeOf<unknown>()
        // @ts-expect-error unknown value must be narrowed before string usage
        const text: string = value
        expectTypeOf(text).toEqualTypeOf<string>()
        return undefined
      },
    })
  })

  it('binds field value and all values for typed forms', () => {
    interface UserForm {
      age: number
      name: string
    }

    const defineUserField = defineFieldFor<UserForm>()

    defineUserField({
      field: 'age',
      component: 'input',
      defaultValue: 18,
      validator: (value, values) => {
        expectTypeOf(value).toEqualTypeOf<number>()
        expectTypeOf(values).toEqualTypeOf<UserForm>()
        return value > values.name.length ? undefined : '年龄太小'
      },
      transform: (value, values) => {
        expectTypeOf(value).toEqualTypeOf<number>()
        expectTypeOf(values).toEqualTypeOf<UserForm>()
        return value
      },
    })
  })

  it('preserves validateOn arrays that already include submit', () => {
    const field = defineField({
      field: 'name',
      component: 'input',
      validateOn: ['submit', 'blur'],
    })

    expect(field.validateOn).toEqual(['submit', 'blur'])
  })

  it('returns plain field configs and leaves runtime behavior outside the model', () => {
    const visible = (values: Record<string, unknown>) => values.role === 'admin'
    const field = defineField({
      disabled: false,
      field: 'mode',
      component: 'input',
      validateOn: ['submit', 'blur'],
      visible,
    })

    expect(field).toMatchObject({
      component: 'input',
      disabled: false,
      field: 'mode',
      validateOn: ['submit', 'blur'],
      visible,
    })
    expect('isVisible' in field).toBe(false)
    expect('isDisabled' in field).toBe(false)
    expect('applyTransform' in field).toBe(false)
  })
})
