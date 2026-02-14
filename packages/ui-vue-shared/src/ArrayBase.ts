import type { ArrayFieldInstance } from '@moluoxixi/core'
import type { InjectionKey, PropType, Ref } from 'vue'
import { useField } from '@moluoxixi/vue'
import { defineComponent, h, inject, provide, ref, toRefs } from 'vue'

export interface IArrayBaseContext {
  field: Ref<ArrayFieldInstance>
}

export interface IArrayBaseItemContext {
  index: Ref<number>
}

const ArrayBaseSymbol: InjectionKey<IArrayBaseContext> = Symbol('ArrayBaseContext')
const ArrayBaseItemSymbol: InjectionKey<IArrayBaseItemContext> = Symbol('ArrayBaseItemContext')

export function useArray(): IArrayBaseContext | null {
  return inject(ArrayBaseSymbol, null)
}

export function useIndex(defaultIndex?: number): Ref<number> {
  const ctx = inject(ArrayBaseItemSymbol, null)
  return ctx?.index ?? ref(defaultIndex ?? 0)
}

const ArrayBaseInner = defineComponent({
  name: 'ArrayBase',
  setup(_, { slots }) {
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

const ArrayBaseIndex = defineComponent({
  name: 'ArrayBaseIndex',
  setup() {
    const index = useIndex()
    return () => h('span', {
      style: { color: '#999', minWidth: '30px', flexShrink: 0 },
    }, `#${index.value + 1}`)
  },
})

function useEditable(): { isEditable: () => boolean, getField: () => ArrayFieldInstance | null } {
  const ctx = useArray()

  return {
    isEditable: () => {
      if (!ctx)
        return false
      return ctx.field.value.editable
    },
    getField: () => ctx?.field.value ?? null,
  }
}

const ArrayBaseAddition = defineComponent({
  name: 'ArrayBaseAddition',
  props: {
    title: { type: String, default: '+ 添加条目' },
    method: { type: String as PropType<'push' | 'unshift'>, default: 'push' },
  },
  setup(props) {
    const { isEditable, getField } = useEditable()

    return () => {
      if (!isEditable())
        return null
      const field = getField()
      if (!field)
        return null

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

const ArrayBaseRemove = defineComponent({
  name: 'ArrayBaseRemove',
  props: {
    title: { type: String, default: '删除' },
  },
  setup(props) {
    const { isEditable, getField } = useEditable()
    const index = useIndex()

    return () => {
      if (!isEditable())
        return null
      const field = getField()
      if (!field)
        return null

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

const ArrayBaseMoveUp = defineComponent({
  name: 'ArrayBaseMoveUp',
  props: {
    title: { type: String, default: '↑' },
  },
  setup(props) {
    const { isEditable, getField } = useEditable()
    const index = useIndex()

    return () => {
      if (!isEditable())
        return null
      const field = getField()
      if (!field)
        return null
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

const ArrayBaseMoveDown = defineComponent({
  name: 'ArrayBaseMoveDown',
  props: {
    title: { type: String, default: '↓' },
  },
  setup(props) {
    const { isEditable, getField } = useEditable()
    const index = useIndex()

    return () => {
      if (!isEditable())
        return null
      const field = getField()
      if (!field)
        return null
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
