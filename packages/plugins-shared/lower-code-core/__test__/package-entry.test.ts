import { describe, expect, it } from 'vitest'
import {
  containerTarget,
  defaultNodeFromMaterial,
  defaultNodes,
  insertNodeByTarget,
  keyToTarget,
  MATERIALS,
  moveNodeByIdToTarget,
  nodesToSchema,
  rootTarget,
  schemaToNodes,
  sectionTarget,
  targetToKey,
} from '../src/index.ts'

describe('plugin-lower-code-core designer', () => {
  it('creates default node tree', () => {
    const nodes = defaultNodes()

    expect(nodes.length).toBeGreaterThan(0)
  })

  it('creates select node with enum options', () => {
    const selectMaterial = MATERIALS.find(item => item.id === 'select')
    expect(selectMaterial).toBeDefined()

    const node = defaultNodeFromMaterial(selectMaterial, [])

    expect(node.kind).toBe('field')
    if (node.kind === 'field') {
      expect(node.enumOptions.length).toBeGreaterThan(0)
    }
  })

  it('serializes and parses drop target keys', () => {
    const target = sectionTarget('section-1')
    const key = targetToKey(target)

    expect(keyToTarget(key)).toEqual(target)
  })

  it('converts schema and designer nodes bidirectionally', () => {
    const schemaNodes = schemaToNodes({
      type: 'object',
      properties: {
        status: {
          type: 'string',
          title: 'Status',
          component: 'Select',
          required: true,
          enum: [{ label: 'Enabled', value: 'enabled' }],
        },
        age: {
          type: 'number',
          title: 'Age',
          component: 'InputNumber',
        },
      },
    })
    const schema = nodesToSchema(schemaNodes)

    expect(schema.properties?.status?.required).toBe(true)
    expect(schema.properties?.status?.component).toBe('Select')
    expect(schema.properties?.status?.enum).toEqual([{ label: 'Enabled', value: 'enabled' }])
    expect(schema.properties?.age?.type).toBe('number')
  })

  it('inserts and moves nodes by valid drop targets', () => {
    const tabsMaterial = MATERIALS.find(item => item.id === 'layout-tabs')
    const inputMaterial = MATERIALS.find(item => item.id === 'input')
    expect(tabsMaterial).toBeDefined()
    expect(inputMaterial).toBeDefined()

    const tabs = defaultNodeFromMaterial(tabsMaterial!, [])
    const input = defaultNodeFromMaterial(inputMaterial!, [])
    expect(tabs.kind).toBe('container')
    if (tabs.kind !== 'container') {
      return
    }

    const source = [tabs]
    const invalidInsert = insertNodeByTarget(source, containerTarget(tabs.id), 0, input)
    expect(invalidInsert).toBe(source)

    const firstSectionId = tabs.sections[0].id
    const inserted = insertNodeByTarget(source, sectionTarget(firstSectionId), 0, input)
    expect(inserted).not.toBe(source)
    expect(inserted[0].kind).toBe('container')
    if (inserted[0].kind === 'container') {
      expect(inserted[0].sections[0].children.length).toBe(1)
      expect(inserted[0].sections[0].children[0].kind).toBe('field')
    }

    const defaults = defaultNodes()
    const moved = moveNodeByIdToTarget(defaults, defaults[0].id, rootTarget(), defaults.length)
    expect(moved.map(item => item.id)).toEqual([defaults[1].id, defaults[0].id])
  })
})
