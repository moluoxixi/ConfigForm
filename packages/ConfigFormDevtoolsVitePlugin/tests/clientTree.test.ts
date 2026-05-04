// @vitest-environment happy-dom
import type { DevtoolsStore, StoredNode } from '../src/client/types'
import { describe, expect, it } from 'vitest'
import { comparePickNodes, resolvePickedNode } from '../src/client/tree'

function createNode(overrides: Partial<StoredNode> & Pick<StoredNode, 'id'>): StoredNode {
  const { id, ...rest } = overrides

  return {
    element: null,
    field: id,
    formId: 'form-1',
    id,
    kind: 'field',
    order: 1,
    registrationOrder: 1,
    renderSamples: 0,
    syncSamples: 0,
    ...rest,
  }
}

function createStore(nodes: StoredNode[]): DevtoolsStore {
  return {
    nodes: new Map(nodes.map(node => [node.id, node])),
    recordRender: () => {},
    recordSync: () => {},
    registerField: () => {},
    unregisterField: () => {},
    updateField: () => {},
  }
}

function setRect(element: HTMLElement, width: number, height: number) {
  element.getBoundingClientRect = () => ({
    bottom: height,
    height,
    left: 0,
    right: width,
    top: 0,
    width,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  })
}

describe('client tree helpers', () => {
  it('orders picked nodes by visible area, tree depth, and declaration order', () => {
    const smallElement = document.createElement('div')
    const largeElement = document.createElement('div')
    setRect(smallElement, 20, 20)
    setRect(largeElement, 100, 100)
    document.body.append(smallElement, largeElement)

    const smallNode = createNode({ element: smallElement, id: 'small', order: 2 })
    const largeNode = createNode({ element: largeElement, id: 'large', order: 1 })
    const parentNode = createNode({ id: 'parent', order: 1 })
    const childNode = createNode({ id: 'child', order: 2, parentId: 'parent' })
    const laterNode = createNode({ id: 'later', order: 3 })
    const earlierNode = createNode({ id: 'earlier', order: 1 })
    const store = createStore([smallNode, largeNode, parentNode, childNode, laterNode, earlierNode])

    expect(comparePickNodes(store, smallNode, largeNode)).toBeLessThan(0)
    expect(comparePickNodes(store, parentNode, childNode)).toBeGreaterThan(0)
    expect(comparePickNodes(store, laterNode, earlierNode)).toBeGreaterThan(0)
  })

  it('resolves the enabled node that contains the picked target', () => {
    const element = document.createElement('div')
    const target = document.createElement('button')
    setRect(element, 80, 40)
    element.append(target)
    document.body.append(element)

    const node = createNode({ element, id: 'field-name' })
    expect(resolvePickedNode(createStore([node]), target)).toBe(node)
  })
})
