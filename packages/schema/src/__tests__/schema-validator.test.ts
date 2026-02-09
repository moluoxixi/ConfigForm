import { describe, expect, it } from 'vitest'
import { validateSchema } from '../schema-validator'
import type { ISchema } from '../types'

describe('validateSchema', () => {
  it('有效 Schema 通过验证', () => {
    const schema: ISchema = {
      type: 'object',
      properties: {
        name: { type: 'string', title: '姓名', required: true },
        age: { type: 'number', title: '年龄' },
        active: { type: 'boolean', title: '启用' },
      },
    }
    const result = validateSchema(schema)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('无效 type 报错', () => {
    const schema: ISchema = {
      type: 'invalid' as any,
    }
    const result = validateSchema(schema)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes('无效的 type'))).toBe(true)
  })

  it('array 类型缺少 items 时警告', () => {
    const schema: ISchema = {
      type: 'array',
    }
    const result = validateSchema(schema)
    expect(result.warnings.some(w => w.message.includes('未定义 items'))).toBe(true)
  })

  it('$ref 引用不存在的定义时报错', () => {
    const schema: ISchema = {
      type: 'object',
      properties: {
        addr: { $ref: '#/definitions/address' },
      },
    }
    const result = validateSchema(schema)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes('不存在于 definitions'))).toBe(true)
  })

  it('$ref 引用存在的定义通过', () => {
    const schema: ISchema = {
      type: 'object',
      definitions: {
        address: { type: 'object', properties: { city: { type: 'string' } } },
      },
      properties: {
        addr: { $ref: '#/definitions/address' },
      },
    }
    const result = validateSchema(schema)
    /* $ref 指向的定义存在，不应报 $ref 相关错误 */
    expect(result.errors.filter(e => e.path.includes('$ref'))).toHaveLength(0)
  })

  it('minItems > maxItems 报错', () => {
    const schema: ISchema = {
      type: 'array',
      items: { type: 'string' },
      minItems: 5,
      maxItems: 2,
    }
    const result = validateSchema(schema)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes('不能大于'))).toBe(true)
  })

  it('reactions 缺少 watch 报错', () => {
    const schema: ISchema = {
      type: 'string',
      reactions: [
        { fulfill: { state: { visible: true } } } as any,
      ],
    }
    const result = validateSchema(schema)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes('watch'))).toBe(true)
  })

  it('oneOf 分支缺少 when 报错', () => {
    const schema: ISchema = {
      type: 'object',
      oneOf: [
        { properties: { a: { type: 'string' } } } as any,
      ],
    }
    const result = validateSchema(schema)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes('when 条件'))).toBe(true)
  })

  it('递归验证子节点', () => {
    const schema: ISchema = {
      type: 'object',
      properties: {
        nested: {
          type: 'object',
          properties: {
            invalid: { type: 'nope' as any },
          },
        },
      },
    }
    const result = validateSchema(schema)
    expect(result.valid).toBe(false)
    expect(result.errors[0].path).toContain('nested')
  })

  it('空 enum 警告', () => {
    const schema: ISchema = {
      type: 'string',
      enum: [],
    }
    const result = validateSchema(schema)
    expect(result.warnings.some(w => w.message.includes('enum 为空'))).toBe(true)
  })
})
