import type { ArrayFieldInstance } from '@moluoxixi/core'
import type { InjectionKey, PropType, Ref } from 'vue'
import { defineComponent, h, inject, provide, ref, toRefs } from 'vue'
import { FieldSymbol } from '../context'

/* ======================== 类型定义 ======================== */

export interface IArrayBaseContext {
  field: Ref<ArrayFieldInstance>
}

export interface IArrayBaseItemContext {
  index: Ref<number>
}

/* ======================== 注入 Key ======================== */

const ArrayBaseSymbol: InjectionKey<IArrayBaseContext> = Symbol('ArrayBaseContext')
const ArrayBaseItemSymbol: InjectionKey<IArrayBaseItemContext> = Symbol('ArrayBaseItemContext')

/* ======================== Hooks ======================== */

/**
 * 获取 ArrayBase 上下文（数组字段实例）
 *
 * 参考 Formily ArrayBase.useArray
 */
export function useArray(): IArrayBaseContext | null {
  return inject(ArrayBaseSymbol, null)
}

/**
 * 获取当前数组项索引
 *
 * 参考 Formily ArrayBase.useIndex
 */
export function useIndex(defaultIndex?: number): Ref<number> {
  const ctx = inject(ArrayBaseItemSymbol, null)
  return ctx?.index ?? ref(defaultIndex ?? 0)
}

/* ======================== 组件 ======================== */

/**
 * ArrayBase — 数组基础容器（参考 Formily ArrayBase）
 *
 * 为子组件提供 ArrayField 上下文注入，使 Addition/Remove/MoveUp/MoveDown
 * 等声明式子组件能够访问数组字段实例并执行操作。
 *
 * 设计原则：
 * - 不直接用 `<button>` — 操作全部通过子组件声明
 * - 子组件根据 field.pattern 自动显隐 — 非 editable 模式下操作按钮不渲染
 * - 通过 inject/provide 传递上下文 — 无需 props 穿透
 */
const ArrayBaseInner = defineComponent({
  name: 'ArrayBase',
  props: {
    disabled: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    const fieldRef = inject(FieldSymbol, null) as ArrayFieldInstance | null

    if (!fieldRef) {
      console.warn('[ArrayBase] 未找到 ArrayField 上下文，请确保在 FormArrayField 内部使用')
      return () => slots.default?.()
    }

    provide(ArrayBaseSymbol, {
      field: ref(fieldRef) as Ref<ArrayFieldInstance>,
    })

    return () => slots.default?.()
  },
})

/**
 * ArrayBase.Item — 数组项容器（参考 Formily ArrayBase.Item）
 *
 * 为子组件（Remove / MoveUp / MoveDown / Index）提供当前项的索引。
 */
const ArrayBaseItem = defineComponent({
  name: 'ArrayBaseItem',
  props: {
    index: { type: Number, required: true },
  },
  setup(props, { slots }) {
    const { index } = toRefs(props)
    provide(ArrayBaseItemSymbol, { index })
    return () => slots.default?.()
  },
})

/**
 * ArrayBase.Index — 显示当前项序号
 */
const ArrayBaseIndex = defineComponent({
  name: 'ArrayBaseIndex',
  setup() {
    const index = useIndex()
    return () => h('span', {
      style: { color: '#999', minWidth: '30px', flexShrink: 0 },
    }, `#${index.value + 1}`)
  },
})

/* ---- 工具：判断当前是否可编辑 ---- */

function useEditable(): { isEditable: () => boolean, getField: () => ArrayFieldInstance | null } {
  const ctx = useArray()

  return {
    isEditable: () => {
      if (!ctx) return false
      const field = ctx.field.value
      return field.editable
    },
    getField: () => ctx?.field.value ?? null,
  }
}

/**
 * ArrayBase.Addition — 添加按钮（参考 Formily ArrayBase.Addition）
 *
 * 根据 field.pattern 自动显隐：非 editable 模式不渲染。
 */
const ArrayBaseAddition = defineComponent({
  name: 'ArrayBaseAddition',
  props: {
    title: { type: String, default: '+ 添加条目' },
    method: { type: String as PropType<'push' | 'unshift'>, default: 'push' },
  },
  setup(props) {
    const { isEditable, getField } = useEditable()

    return () => {
      if (!isEditable()) return null
      const field = getField()
      if (!field) return null

      return h('button', {
        type: 'button',
        disabled: !field.canAdd,
        style: {
          width: '100%',
          padding: '8px 0',
          background: field.canAdd ? '#fff' : '#f5f5f5',
          color: field.canAdd ? '#1677ff' : '#999',
          border: `1px dashed ${field.canAdd ? '#1677ff' : '#d9d9d9'}`,
          borderRadius: '4px',
          cursor: field.canAdd ? 'pointer' : 'not-allowed',
          fontSize: '14px',
          lineHeight: '22px',
          transition: 'all 0.2s',
        },
        onMouseenter: (e: MouseEvent) => {
          if (field.canAdd) {
            (e.currentTarget as HTMLElement).style.background = '#e6f4ff'
          }
        },
        onMouseleave: (e: MouseEvent) => {
          (e.currentTarget as HTMLElement).style.background = field.canAdd ? '#fff' : '#f5f5f5'
        },
        onClick: () => {
          if (props.method === 'unshift') {
            field.insert(0)
          }
          else {
            field.push()
          }
        },
      }, props.title)
    }
  },
})

/**
 * ArrayBase.Remove — 删除按钮（参考 Formily ArrayBase.Remove）
 */
const ArrayBaseRemove = defineComponent({
  name: 'ArrayBaseRemove',
  props: {
    title: { type: String, default: '删除' },
  },
  setup(props) {
    const { isEditable, getField } = useEditable()
    const index = useIndex()

    return () => {
      if (!isEditable()) return null
      const field = getField()
      if (!field) return null

      return h('button', {
        type: 'button',
        disabled: !field.canRemove,
        style: opBtnStyle(!field.canRemove, '#f56c6c'),
        onClick: (e: MouseEvent) => {
          e.stopPropagation()
          field.remove(index.value)
        },
      }, props.title)
    }
  },
})

/**
 * ArrayBase.MoveUp — 上移按钮（参考 Formily ArrayBase.MoveUp）
 */
const ArrayBaseMoveUp = defineComponent({
  name: 'ArrayBaseMoveUp',
  props: {
    title: { type: String, default: '↑' },
  },
  setup(props) {
    const { isEditable, getField } = useEditable()
    const index = useIndex()

    return () => {
      if (!isEditable()) return null
      const field = getField()
      if (!field) return null
      const disabled = index.value === 0

      return h('button', {
        type: 'button',
        disabled,
        style: opBtnStyle(disabled),
        onClick: (e: MouseEvent) => {
          e.stopPropagation()
          field.moveUp(index.value)
        },
      }, props.title)
    }
  },
})

/**
 * ArrayBase.MoveDown — 下移按钮（参考 Formily ArrayBase.MoveDown）
 */
const ArrayBaseMoveDown = defineComponent({
  name: 'ArrayBaseMoveDown',
  props: {
    title: { type: String, default: '↓' },
  },
  setup(props) {
    const { isEditable, getField } = useEditable()
    const index = useIndex()

    return () => {
      if (!isEditable()) return null
      const field = getField()
      if (!field) return null
      const arr = Array.isArray(field.value) ? field.value : []
      const disabled = index.value >= arr.length - 1

      return h('button', {
        type: 'button',
        disabled,
        style: opBtnStyle(disabled),
        onClick: (e: MouseEvent) => {
          e.stopPropagation()
          field.moveDown(index.value)
        },
      }, props.title)
    }
  },
})

/* ======================== 样式工具 ======================== */

function opBtnStyle(disabled: boolean, activeColor = '#606266'): Record<string, string> {
  return {
    padding: '4px 8px',
    background: disabled ? '#f5f5f5' : '#fff',
    color: disabled ? '#ccc' : activeColor,
    border: `1px solid ${disabled ? '#dcdfe6' : activeColor === '#606266' ? '#dcdfe6' : activeColor}`,
    borderRadius: '4px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '12px',
    lineHeight: '1',
  }
}

/* ======================== 组合导出（参考 Formily composeExport） ======================== */

type ComposedArrayBase = typeof ArrayBaseInner & {
  Item: typeof ArrayBaseItem
  Index: typeof ArrayBaseIndex
  Addition: typeof ArrayBaseAddition
  Remove: typeof ArrayBaseRemove
  MoveUp: typeof ArrayBaseMoveUp
  MoveDown: typeof ArrayBaseMoveDown
  useArray: typeof useArray
  useIndex: typeof useIndex
}

export const ArrayBase = ArrayBaseInner as ComposedArrayBase
;(ArrayBase as ComposedArrayBase).Item = ArrayBaseItem
;(ArrayBase as ComposedArrayBase).Index = ArrayBaseIndex
;(ArrayBase as ComposedArrayBase).Addition = ArrayBaseAddition
;(ArrayBase as ComposedArrayBase).Remove = ArrayBaseRemove
;(ArrayBase as ComposedArrayBase).MoveUp = ArrayBaseMoveUp
;(ArrayBase as ComposedArrayBase).MoveDown = ArrayBaseMoveDown
;(ArrayBase as ComposedArrayBase).useArray = useArray
;(ArrayBase as ComposedArrayBase).useIndex = useIndex
