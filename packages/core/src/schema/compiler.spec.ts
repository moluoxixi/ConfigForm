import { describe, expect, it } from 'vitest'
import {
  BUILTIN_DECORATORS,
  BUILTIN_FIELD_COMPONENTS,
  BUILTIN_STRUCTURAL_ARRAY_COMPONENTS,
  compileSchema,
  DEFAULT_COMPONENT_MAPPING,
  isStructuralArrayComponent,
} from './index'

describe('schema compiler protocol', () => {
  it('uses neutral array default component and exposes built-in protocol constants', () => {
    expect(DEFAULT_COMPONENT_MAPPING.array).toBe('ArrayField')
    expect(BUILTIN_FIELD_COMPONENTS).toContain('Input')
    expect(BUILTIN_STRUCTURAL_ARRAY_COMPONENTS).toContain('ArrayField')
    expect(BUILTIN_DECORATORS).toContain('FormItem')
  })

  it('distinguishes structural and non-structural array components', () => {
    expect(isStructuralArrayComponent('ArrayField')).toBe(true)
    expect(isStructuralArrayComponent('ArrayTable')).toBe(true)
    expect(isStructuralArrayComponent('CheckboxGroup')).toBe(false)
    expect(isStructuralArrayComponent(undefined)).toBe(true)
  })

  it('applies compile-time component mapping overrides at runtime', () => {
    const compiled = compileSchema(
      {
        type: 'object',
        properties: {
          title: { type: 'string' },
          list: { type: 'array', items: { type: 'string' } },
        },
      },
      {
        componentMapping: {
          string: 'Select',
        },
      },
    )

    const title = compiled.fields.get('title')
    const list = compiled.fields.get('list')

    expect(title?.resolvedComponent).toBe('Select')
    expect(list?.resolvedComponent).toBe('ArrayField')
  })
})
