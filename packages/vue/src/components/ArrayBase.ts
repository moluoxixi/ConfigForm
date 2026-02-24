import type { ArrayFieldInstance } from '@moluoxixi/core'
import type { InjectionKey, PropType, Ref } from 'vue'
import { defineComponent, h, inject, provide, ref, toRefs } from 'vue'
import { useField } from '../composables'

/**
 * IArrayBaseContext??????
 * ???`packages/vue/src/components/ArrayBase.ts:6`?
 * ??????????????????????????????
 */
export interface IArrayBaseContext {
  field: Ref<ArrayFieldInstance>
}

/**
 * IArrayBaseItemContext??????
 * ???`packages/vue/src/components/ArrayBase.ts:10`?
 * ??????????????????????????????
 */
export interface IArrayBaseItemContext {
  index: Ref<number>
}

const ArrayBaseSymbol: InjectionKey<IArrayBaseContext> = Symbol('ArrayBaseContext')
const ArrayBaseItemSymbol: InjectionKey<IArrayBaseItemContext> = Symbol('ArrayBaseItemContext')

/**
 * use Array：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 use Array 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function useArray(): IArrayBaseContext | null {
  return inject(ArrayBaseSymbol, null)
}

/**
 * use Index：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 use Index 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function useIndex(defaultIndex?: number): Ref<number> {
  const ctx = inject(ArrayBaseItemSymbol, null)
  return ctx?.index ?? ref(defaultIndex ?? 0)
}

const ArrayBaseInner = defineComponent({
  name: 'ArrayBase',
  /**
   * setup：执行当前位置的功能逻辑。
   * 定位：`packages/vue/src/components/ArrayBase.ts:42`。
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
   * @param _ 参数 _ 为当前功能所需的输入信息。
   * @returns 返回当前分支执行后的处理结果。
   */
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
  /**
   * setup：执行当前位置的功能逻辑。
   * 定位：`packages/vue/src/components/ArrayBase.ts:64`。
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
   * @param props 参数 props 为当前功能所需的输入信息。
   * @returns 返回当前分支执行后的处理结果。
   */
  setup(props, { slots }) {
    const { index } = toRefs(props)
    provide(ArrayBaseItemSymbol, { index })
    return () => slots.default?.()
  },
})

const ArrayBaseIndex = defineComponent({
  name: 'ArrayBaseIndex',
  /**
   * setup：执行当前位置的功能逻辑。
   * 定位：`packages/vue/src/components/ArrayBase.ts:73`。
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
   * @returns 返回当前分支执行后的处理结果。
   */
  setup() {
    const index = useIndex()
    return () => h('span', {
      style: { color: '#999', minWidth: '30px', flexShrink: 0 },
    }, `#${index.value + 1}`)
  },
})

/**
 * use Editable：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 use Editable 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function useEditable(): { isEditable: () => boolean, getField: () => ArrayFieldInstance | null } {
  const ctx = useArray()

  return {
    /**
     * isEditable：执行当前位置的功能逻辑。
     * 定位：`packages/vue/src/components/ArrayBase.ts:92`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    isEditable: () => {
      if (!ctx)
        return false
      return ctx.field.value.editable
    },
    /**
     * getField：执行当前位置的功能逻辑。
     * 定位：`packages/vue/src/components/ArrayBase.ts:97`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    getField: () => ctx?.field.value ?? null,
  }
}

const ArrayBaseAddition = defineComponent({
  name: 'ArrayBaseAddition',
  props: {
    title: { type: String, default: '+ 添加条目' },
    method: { type: String as PropType<'push' | 'unshift'>, default: 'push' },
  },
  /**
   * setup：执行当前位置的功能逻辑。
   * 定位：`packages/vue/src/components/ArrayBase.ts:107`。
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
   * @param props 参数 props 为当前功能所需的输入信息。
   * @returns 返回当前分支执行后的处理结果。
   */
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
        /**
         * onMouseenter：执行当前位置的功能逻辑。
         * 定位：`packages/vue/src/components/ArrayBase.ts:132`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @param e 参数 e 为事件对象，用于提供交互上下文。
         */
        onMouseenter: (e: MouseEvent) => {
          if (field.canAdd) {
            (e.currentTarget as HTMLElement).style.background = '#e6f4ff'
          }
        },
        /**
         * onMouseleave：执行当前位置的功能逻辑。
         * 定位：`packages/vue/src/components/ArrayBase.ts:137`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @param e 参数 e 为事件对象，用于提供交互上下文。
         */
        onMouseleave: (e: MouseEvent) => {
          (e.currentTarget as HTMLElement).style.background = field.canAdd ? '#fff' : '#f5f5f5'
        },
        /**
         * onClick：执行当前位置的功能逻辑。
         * 定位：`packages/vue/src/components/ArrayBase.ts:140`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         */
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
  /**
   * setup：执行当前位置的功能逻辑。
   * 定位：`packages/vue/src/components/ArrayBase.ts:158`。
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
   * @param props 参数 props 为当前功能所需的输入信息。
   * @returns 返回当前分支执行后的处理结果。
   */
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
        /**
         * onClick：执行当前位置的功能逻辑。
         * 定位：`packages/vue/src/components/ArrayBase.ts:173`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @param e 参数 e 为事件对象，用于提供交互上下文。
         */
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
  /**
   * setup：执行当前位置的功能逻辑。
   * 定位：`packages/vue/src/components/ArrayBase.ts:187`。
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
   * @param props 参数 props 为当前功能所需的输入信息。
   * @returns 返回当前分支执行后的处理结果。
   */
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
        /**
         * onClick：执行当前位置的功能逻辑。
         * 定位：`packages/vue/src/components/ArrayBase.ts:203`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @param e 参数 e 为事件对象，用于提供交互上下文。
         */
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
  /**
   * setup：执行当前位置的功能逻辑。
   * 定位：`packages/vue/src/components/ArrayBase.ts:217`。
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
   * @param props 参数 props 为当前功能所需的输入信息。
   * @returns 返回当前分支执行后的处理结果。
   */
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
        /**
         * onClick：执行当前位置的功能逻辑。
         * 定位：`packages/vue/src/components/ArrayBase.ts:234`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @param e 参数 e 为事件对象，用于提供交互上下文。
         */
        onClick: (e: MouseEvent) => {
          e.stopPropagation()
          field.moveDown(index.value)
        },
      }, props.title)
    }
  },
})

/**
 * op Btn Style：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 op Btn Style 的单一职责，调用方可通过函数名快速理解输入输出语义。
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
 * ComposedArrayBase????????
 * ???`packages/vue/src/components/ArrayBase.ts:373`?
 * ??????????????????????????????
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

export const ArrayBase = ArrayBaseInner as ComposedArrayBase
;(ArrayBase as ComposedArrayBase).Item = ArrayBaseItem
;(ArrayBase as ComposedArrayBase).Index = ArrayBaseIndex
;(ArrayBase as ComposedArrayBase).Addition = ArrayBaseAddition
;(ArrayBase as ComposedArrayBase).Remove = ArrayBaseRemove
;(ArrayBase as ComposedArrayBase).MoveUp = ArrayBaseMoveUp
;(ArrayBase as ComposedArrayBase).MoveDown = ArrayBaseMoveDown
;(ArrayBase as ComposedArrayBase).useArray = useArray
;(ArrayBase as ComposedArrayBase).useIndex = useIndex
