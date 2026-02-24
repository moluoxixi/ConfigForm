import { describe, expect, it } from 'vitest'
import { fromJsonSchema, toJsonSchema } from '../src/index.ts'

describe('plugin-json-schema adapter', () => {
  it('converts required and format constraints', () => {
    const converted = fromJsonSchema({
      type: 'object',
      required: ['email'],
      properties: {
        email: { type: 'string', format: 'email' },
      },
    })

    expect(converted.properties?.email?.required).toBe(true)
    expect(converted.properties?.email?.rules).toEqual(
      expect.arrayContaining([expect.objectContaining({ format: 'email' })]),
    )
  })

  it('converts conditional schema into reactions', () => {
    const converted = fromJsonSchema({
      type: 'object',
      properties: {
        role: { type: 'string', enum: ['company', 'personal'] },
        companyName: { type: 'string' },
      },
      if: {
        properties: {
          role: { const: 'company' },
        },
      },
      then: {
        required: ['companyName'],
      },
    })

    expect(converted.reactions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          target: 'companyName',
          fulfill: { state: { required: true } },
          otherwise: { state: { required: false } },
        }),
      ]),
    )
  })

  it('converts standard oneOf to form oneOf with discriminator', () => {
    const converted = fromJsonSchema({
      type: 'object',
      oneOf: [
        {
          type: 'object',
          properties: {
            kind: { const: 'a' },
            alpha: { type: 'string' },
          },
          required: ['alpha'],
        },
        {
          type: 'object',
          properties: {
            kind: { const: 'b' },
            beta: { type: 'number' },
          },
        },
      ],
    })

    expect(converted.discriminator).toBe('kind')
    expect(converted.oneOf?.[0].when).toEqual({ kind: 'a' })
    expect(converted.oneOf?.[0].properties?.alpha.required).toBe(true)
    expect(converted.oneOf?.[1].when).toEqual({ kind: 'b' })
  })

  it('converts schema back to json schema', () => {
    const back = toJsonSchema({
      type: 'object',
      properties: {
        age: {
          type: 'number',
          title: 'Age',
          required: true,
        },
      },
    })

    expect(back.type).toBe('object')
    expect(back.properties?.age?.type).toBe('number')
    expect(back.required).toEqual(['age'])
  })
})
