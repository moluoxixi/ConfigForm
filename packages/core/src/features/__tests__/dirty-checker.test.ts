import { describe, expect, it } from 'vitest'
import { checkDirty, deepEqual, getDiffView, isFieldDirty } from '../dirty-checker'

describe('deepEqual', () => {
  it('基本类型相等', () => {
    expect(deepEqual(1, 1)).toBe(true)
    expect(deepEqual('a', 'a')).toBe(true)
    expect(deepEqual(true, true)).toBe(true)
    expect(deepEqual(null, null)).toBe(true)
    expect(deepEqual(undefined, undefined)).toBe(true)
  })

  it('基本类型不等', () => {
    expect(deepEqual(1, 2)).toBe(false)
    expect(deepEqual('a', 'b')).toBe(false)
    expect(deepEqual(true, false)).toBe(false)
    expect(deepEqual(null, undefined)).toBe(false)
    expect(deepEqual(0, '')).toBe(false)
  })

  it('对象深度比较', () => {
    expect(deepEqual({ a: 1 }, { a: 1 })).toBe(true)
    expect(deepEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } })).toBe(true)
    expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false)
    expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false)
  })

  it('数组深度比较', () => {
    expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true)
    expect(deepEqual([1, [2, 3]], [1, [2, 3]])).toBe(true)
    expect(deepEqual([1, 2], [1, 3])).toBe(false)
    expect(deepEqual([1], [1, 2])).toBe(false)
  })

  it('Date 比较', () => {
    const d1 = new Date('2024-01-01')
    const d2 = new Date('2024-01-01')
    const d3 = new Date('2024-01-02')
    expect(deepEqual(d1, d2)).toBe(true)
    expect(deepEqual(d1, d3)).toBe(false)
  })

  it('RegExp 比较', () => {
    expect(deepEqual(/abc/g, /abc/g)).toBe(true)
    expect(deepEqual(/abc/g, /abc/i)).toBe(false)
  })
})

describe('checkDirty', () => {
  function createMockForm(initial: Record<string, unknown>, current: Record<string, unknown>) {
    return {
      values: current,
      initialValues: initial,
      getAllFields: () => new Map(Object.keys(current).map(k => [k, { path: k }])),
    }
  }

  it('无变化时 isDirty 为 false', () => {
    const form = createMockForm({ name: '张三' }, { name: '张三' })
    const result = checkDirty(form as any)
    expect(result.isDirty).toBe(false)
    expect(result.dirtyCount).toBe(0)
  })

  it('有变化时返回 diff', () => {
    const form = createMockForm(
      { name: '张三', age: 20 },
      { name: '李四', age: 20 },
    )
    const result = checkDirty(form as any)
    expect(result.isDirty).toBe(true)
    expect(result.dirtyCount).toBe(1)
    expect(result.diffs[0].path).toBe('name')
    expect(result.diffs[0].initialValue).toBe('张三')
    expect(result.diffs[0].currentValue).toBe('李四')
    expect(result.diffs[0].type).toBe('changed')
  })

  it('新增属性标记为 added', () => {
    const form = createMockForm(
      { name: '张三' },
      { name: '张三', email: 'test@test.com' },
    )
    const result = checkDirty(form as any)
    expect(result.isDirty).toBe(true)
    expect(result.diffs.find(d => d.path === 'email')?.type).toBe('added')
  })

  it('删除属性标记为 removed', () => {
    const form = createMockForm(
      { name: '张三', email: 'test@test.com' },
      { name: '张三' },
    )
    const result = checkDirty(form as any)
    expect(result.isDirty).toBe(true)
    expect(result.diffs.find(d => d.path === 'email')?.type).toBe('removed')
  })

  it('嵌套对象变化', () => {
    const form = createMockForm(
      { address: { city: '北京', district: '朝阳' } },
      { address: { city: '上海', district: '朝阳' } },
    )
    const result = checkDirty(form as any)
    expect(result.isDirty).toBe(true)
    expect(result.dirtyPaths.has('address.city')).toBe(true)
    expect(result.dirtyPaths.has('address.district')).toBe(false)
  })
})

describe('isFieldDirty', () => {
  function createMockForm(initial: Record<string, unknown>, current: Record<string, unknown>) {
    return { values: current, initialValues: initial }
  }

  it('值未变返回 false', () => {
    const form = createMockForm({ name: '张三' }, { name: '张三' })
    expect(isFieldDirty(form as any, 'name')).toBe(false)
  })

  it('值已变返回 true', () => {
    const form = createMockForm({ name: '张三' }, { name: '李四' })
    expect(isFieldDirty(form as any, 'name')).toBe(true)
  })
})

describe('getDiffView', () => {
  it('返回字段对比视图', () => {
    const form = createMockForm(
      { name: '张三', age: 20 },
      { name: '李四', age: 20 },
    )
    const view = getDiffView(form as any, ['name', 'age'])
    expect(view.name.dirty).toBe(true)
    expect(view.age.dirty).toBe(false)
    expect(view.name.initial).toBe('张三')
    expect(view.name.current).toBe('李四')
  })

  function createMockForm(initial: Record<string, unknown>, current: Record<string, unknown>) {
    return {
      values: current,
      initialValues: initial,
      getAllFields: () => new Map(Object.keys(current).map(k => [k, { path: k }])),
    }
  }
})
