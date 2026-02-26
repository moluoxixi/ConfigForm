import type { ArrayFieldInstance } from '@moluoxixi/core'
import type { InjectionKey, PropType, Ref } from 'vue'
import { useField } from '@moluoxixi/vue'
import { defineComponent, h, inject, provide, ref, toRefs } from 'vue'

/**
 * 数组上下文结构。
 * 保存当前 ArrayField 实例，供增删改排序组件复用。
 */
export interface IArrayBaseContext {
  field: Ref<ArrayFieldInstance>
}

/**
 * 数组项上下文结构。
 * 保存当前数组项索引，供 MoveUp/MoveDown/Remove 读取。
 */
export interface IArrayBaseItemContext {
  index: Ref<number>
}

/**
 * 数组上下文注入键。
 */
const ArrayBaseSymbol: InjectionKey<IArrayBaseContext> = Symbol('ArrayBaseContext')

/**
 * 数组项上下文注入键。
 */
const ArrayBaseItemSymbol: InjectionKey<IArrayBaseItemContext> = Symbol('ArrayBaseItemContext')

/**
 * 读取数组上下文。
 * @returns 返回当前数组上下文；未注入时返回 `null`。
 */
export function useArray(): IArrayBaseContext | null {
  return inject(ArrayBaseSymbol, null)
}

/**
 * 读取当前数组项索引。
 * @param defaultIndex 未注入数组项上下文时返回的兜底索引。
 * @returns 返回当前数组项索引引用。
 */
export function useIndex(defaultIndex?: number): Ref<number> {
  const ctx = inject(ArrayBaseItemSymbol, null)
  return ctx?.index ?? ref(defaultIndex ?? 0)
}

/**
 * ArrayBase 根容器。
 * 负责把当前数组字段实例注入上下文，供子组件共享访问。
 */
const ArrayBaseInner = defineComponent({
  name: 'ArrayBase',
  /**
   * 注入数组字段上下文。
   *
   * @param _ 保留参数，当前组件不消费 props。
   * @param context setup 上下文，用于读取默认插槽。
   * @returns 返回默认插槽渲染函数。
   */
  setup(_, context) {
    const { slots } = context
    let field: ArrayFieldInstance

    try {
      field = useField() as unknown as ArrayFieldInstance
    }
    catch {
      return () => slots.default?.()
    }

    provide(ArrayBaseSymbol, {
      field: ref(field) as Ref<ArrayFieldInstance>,
    })

    return () => slots.default?.()
  },
})

/**
 * ArrayBase.Item。
 * 注入当前项索引，供项内操作组件复用。
 */
const ArrayBaseItem = defineComponent({
  name: 'ArrayBaseItem',
  props: {
    index: { type: Number, required: true },
  },
  /**
   * 注入数组项索引上下文。
   *
   * @param props 组件属性，包含当前项索引。
   * @param context setup 上下文，用于读取默认插槽。
   * @returns 返回默认插槽渲染函数。
   */
  setup(props, context) {
    const { slots } = context
    const { index } = toRefs(props)
    provide(ArrayBaseItemSymbol, { index })
    return () => slots.default?.()
  },
})

/**
 * ArrayBase.Index。
 * 展示当前项序号（从 1 开始）。
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

/**
 * 统一计算数组字段编辑态。
 * @returns 返回编辑态判断函数和字段获取函数。
 */
function useEditable(): { isEditable: () => boolean, getField: () => ArrayFieldInstance | null } {
  const ctx = useArray()

  return {
    /** 判断当前数组是否允许编辑。 */
    isEditable: () => !!ctx?.field.value.editable,
    /** 获取数组字段实例。 */
    getField: () => ctx?.field.value ?? null,
  }
}

/**
 * ArrayBase.Addition。
 * 提供数组追加能力。
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
      if (!isEditable()) {
        return null
      }
      const field = getField()
      if (!field) {
        return null
      }

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
        onMouseenter: (event: MouseEvent) => {
          if (field.canAdd) {
            (event.currentTarget as HTMLElement).style.background = '#e6f4ff'
          }
        },
        onMouseleave: (event: MouseEvent) => {
          (event.currentTarget as HTMLElement).style.background = field.canAdd ? '#fff' : '#f5f5f5'
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
 * ArrayBase.Remove。
 * 删除当前索引对应的数组项。
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
      if (!isEditable()) {
        return null
      }
      const field = getField()
      if (!field) {
        return null
      }

      return h('button', {
        type: 'button',
        disabled: !field.canRemove,
        style: opBtnStyle(!field.canRemove, '#f56c6c'),
        onClick: (event: MouseEvent) => {
          event.stopPropagation()
          field.remove(index.value)
        },
      }, props.title)
    }
  },
})

/**
 * ArrayBase.MoveUp。
 * 把当前项向上移动一个位置。
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
      if (!isEditable()) {
        return null
      }
      const field = getField()
      if (!field) {
        return null
      }
      const disabled = index.value === 0

      return h('button', {
        type: 'button',
        disabled,
        style: opBtnStyle(disabled),
        onClick: (event: MouseEvent) => {
          event.stopPropagation()
          field.moveUp(index.value)
        },
      }, props.title)
    }
  },
})

/**
 * ArrayBase.MoveDown。
 * 把当前项向下移动一个位置。
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
      if (!isEditable()) {
        return null
      }
      const field = getField()
      if (!field) {
        return null
      }
      const values = Array.isArray(field.value) ? field.value : []
      const disabled = index.value >= values.length - 1

      return h('button', {
        type: 'button',
        disabled,
        style: opBtnStyle(disabled),
        onClick: (event: MouseEvent) => {
          event.stopPropagation()
          field.moveDown(index.value)
        },
      }, props.title)
    }
  },
})

/**
 * 生成数组操作按钮样式。
 * @param disabled 按钮是否禁用。
 * @param activeColor 按钮可用态主色。
 * @returns 返回按钮样式对象。
 */
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

/**
 * 组合导出类型，支持 `ArrayBase.Item` 等静态成员访问。
 */
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

/**
 * 组合导出对象。
 */
export const ArrayBase = ArrayBaseInner as ComposedArrayBase
;(ArrayBase as ComposedArrayBase).Item = ArrayBaseItem
;(ArrayBase as ComposedArrayBase).Index = ArrayBaseIndex
;(ArrayBase as ComposedArrayBase).Addition = ArrayBaseAddition
;(ArrayBase as ComposedArrayBase).Remove = ArrayBaseRemove
;(ArrayBase as ComposedArrayBase).MoveUp = ArrayBaseMoveUp
;(ArrayBase as ComposedArrayBase).MoveDown = ArrayBaseMoveDown
;(ArrayBase as ComposedArrayBase).useArray = useArray
;(ArrayBase as ComposedArrayBase).useIndex = useIndex
