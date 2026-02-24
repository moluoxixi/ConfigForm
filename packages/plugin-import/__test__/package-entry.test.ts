import { describe, expect, it, vi } from 'vitest'
import { ensurePlainObject, importPlugin, parseJSON } from '../src/index.ts'

describe('plugin-import', () => {
  it('parses json into plain object only', () => {
    expect(parseJSON('{"name":"Alice","age":"18"}', (key, value) => {
      if (key === 'age') {
        return Number(value)
      }
      return value
    })).toEqual({ name: 'Alice', age: 18 })
    expect(() => ensurePlainObject([])).toThrow('plain object')
  })

  it('applies import data by strategy and filtering options', () => {
    const form: any = {
      setValues: vi.fn(),
    }

    const installed = importPlugin({
      excludePrefixes: ['$'],
    }).install(form)

    const parsed = installed.api.parseImportJSON('{"name":"Bob","$meta":1}', {
      strategy: 'replace',
    })
    const result = installed.api.importJSON(parsed.data, {
      strategy: 'replace',
    })

    expect(parsed.data).toEqual({ name: 'Bob' })
    expect(parsed.skippedKeys).toEqual(['$meta'])
    expect(parsed.strategy).toBe('replace')
    expect(parsed.excludePrefixes).toEqual(['$'])
    expect(result.data).toEqual({ name: 'Bob' })
    expect(form.setValues).toHaveBeenCalledWith({ name: 'Bob' }, 'replace')
  })

  it('supports allowing internal fields and cleans mounted api on dispose', () => {
    const form: any = {
      setValues: vi.fn(),
    }

    const installed = importPlugin().install(form)
    const result = installed.api.applyImport({ name: 'Bob', _internal: 1 }, {
      allowInternal: true,
      strategy: 'shallow',
    })

    expect(result.data).toEqual({ name: 'Bob', _internal: 1 })
    expect(result.skippedKeys).toEqual([])
    expect(form.setValues).toHaveBeenCalledWith({ name: 'Bob', _internal: 1 }, 'shallow')

    expect(typeof form.parseImportJSON).toBe('function')
    installed.dispose?.()
    expect(form.parseImportJSON).toBeUndefined()
  })
})
