import { describe, expect, it, vi } from 'vitest'
import { FormHistory } from '../history'

/**
 * 创建一个简化的 mock Form 实例
 *
 * 仅实现 FormHistory 需要的 getGraph / setGraph 接口。
 */
function createMockForm(initialValues: Record<string, unknown> = {}) {
  let values = { ...initialValues }
  let graphVersion = 0

  return {
    values,
    initialValues: { ...initialValues },
    getGraph() {
      graphVersion++
      return {
        values: { ...values },
        initialValues: { ...initialValues },
        fields: {},
        timestamp: Date.now(),
      }
    },
    setGraph(graph: { values: Record<string, unknown>, initialValues: Record<string, unknown> }) {
      values = { ...graph.values }
    },
    setFieldValue(path: string, value: unknown) {
      values[path] = value
    },
  }
}

describe('FormHistory', () => {
  it('初始化后 undoStack 包含一条初始记录', () => {
    const form = createMockForm({ name: '' })
    const history = new FormHistory(form as any)

    expect(history.canUndo).toBe(false)
    expect(history.canRedo).toBe(false)
    expect(history.undoCount).toBe(0)
    expect(history.records.length).toBe(1)
    expect(history.records[0].type).toBe('init')

    history.dispose()
  })

  it('save 后可以 undo', () => {
    const form = createMockForm({ name: '' })
    const history = new FormHistory(form as any)

    form.setFieldValue('name', '张三')
    history.save('input', '修改姓名')

    expect(history.canUndo).toBe(true)
    expect(history.undoCount).toBe(1)

    history.undo()
    expect(history.canUndo).toBe(false)
    expect(history.canRedo).toBe(true)

    history.dispose()
  })

  it('undo 后可以 redo', () => {
    const form = createMockForm({ name: '' })
    const history = new FormHistory(form as any)

    form.setFieldValue('name', '张三')
    history.save('input')

    history.undo()
    expect(history.canRedo).toBe(true)

    history.redo()
    expect(history.canRedo).toBe(false)
    expect(history.canUndo).toBe(true)

    history.dispose()
  })

  it('新操作清空 redo 栈', () => {
    const form = createMockForm({ name: '' })
    const history = new FormHistory(form as any)

    form.setFieldValue('name', '张三')
    history.save('input')

    form.setFieldValue('name', '李四')
    history.save('input')

    history.undo()
    expect(history.canRedo).toBe(true)

    /* 新操作，redo 栈应被清空 */
    form.setFieldValue('name', '王五')
    history.save('input')

    expect(history.canRedo).toBe(false)
    expect(history.undoCount).toBe(2)

    history.dispose()
  })

  it('batch 合并多步为一次快照', () => {
    const form = createMockForm({ firstName: '', lastName: '' })
    const history = new FormHistory(form as any)

    history.batch(() => {
      form.setFieldValue('firstName', 'John')
      form.setFieldValue('lastName', 'Doe')
    }, '设置完整姓名')

    expect(history.undoCount).toBe(1)
    expect(history.records[history.records.length - 1].description).toBe('设置完整姓名')

    history.dispose()
  })

  it('超过 maxLength 时淘汰最早记录', () => {
    const form = createMockForm({ count: 0 })
    const history = new FormHistory(form as any, { maxLength: 5 })

    /* 初始 1 条 + 保存 6 条 = 7 条，应淘汰到 5 条 */
    for (let i = 1; i <= 6; i++) {
      form.setFieldValue('count', i)
      history.save('input')
    }

    expect(history.records.length).toBe(5)

    history.dispose()
  })

  it('goto 跳转到指定位置', () => {
    const form = createMockForm({ step: 0 })
    const history = new FormHistory(form as any)

    for (let i = 1; i <= 3; i++) {
      form.setFieldValue('step', i)
      history.save('input')
    }

    /* 跳转到第一条记录（初始状态） */
    history.goto(0)
    expect(history.canRedo).toBe(true)
    expect(history.canUndo).toBe(false)

    history.dispose()
  })

  it('clear 保留当前状态', () => {
    const form = createMockForm({ name: '' })
    const history = new FormHistory(form as any)

    form.setFieldValue('name', '张三')
    history.save('input')

    form.setFieldValue('name', '李四')
    history.save('input')

    history.clear()
    expect(history.records.length).toBe(1)
    expect(history.canUndo).toBe(false)
    expect(history.canRedo).toBe(false)

    history.dispose()
  })

  it('onChange 回调在操作后触发', () => {
    const form = createMockForm({ name: '' })
    const history = new FormHistory(form as any)
    const onChange = vi.fn()
    history.onChange(onChange)

    form.setFieldValue('name', '张三')
    history.save('input')
    expect(onChange).toHaveBeenCalledTimes(1)

    history.undo()
    expect(onChange).toHaveBeenCalledTimes(2)

    history.redo()
    expect(onChange).toHaveBeenCalledTimes(3)

    history.dispose()
  })

  it('filter 为 false 时跳过保存', () => {
    const form = createMockForm({ name: '' })
    const history = new FormHistory(form as any, {
      filter: () => false,
    })

    form.setFieldValue('name', '张三')
    const saved = history.save('input')

    expect(saved).toBe(false)
    expect(history.undoCount).toBe(0)

    history.dispose()
  })
})
