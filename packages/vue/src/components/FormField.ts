import type { FieldInstance, FieldProps } from '@moluoxixi/core'
import type { Component, PropType } from 'vue'
import { defineComponent, h, inject, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue'
import { FieldSymbol, FormSymbol } from '../context'
import { getDefaultWrapper } from '../registry'
import { ReactiveField } from './ReactiveField'

/**
 * 表单字段组件
 *
 * 自动从 Form 中获取/创建 Field，通过 ReactiveField 桥接渲染。
 * 当 name prop 变化时（如数组项重排序），自动销毁旧字段并创建新字段。
 *
 * 支持两种渲染模式：
 * 1. 自定义插槽：`v-slot="{ field, isReadOnly, isDisabled }"`
 * 2. 自动渲染：根据 field.component + field.wrapper 从 registry 查找组件
 */
export const FormField = defineComponent({
  name: 'FormField',
  props: {
    name: {
      type: String,
      required: true,
    },
    fieldProps: {
      type: Object as PropType<Partial<FieldProps>>,
      default: undefined,
    },
    component: {
      type: [String, Object, Function] as PropType<string | Component>,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    const form = inject(FormSymbol)

    if (!form) {
      throw new Error('[ConfigForm] <FormField> 必须在 <FormProvider> 内部使用')
    }

    /** 获取或创建字段实例 */
    function resolveField(name: string): { field: FieldInstance, created: boolean } {
      const existing = form!.getField(name)
      if (existing) {
        return { field: existing, created: false }
      }
      const mergedProps: Record<string, unknown> = { ...props.fieldProps, name }
      if (!mergedProps.pattern && form!.pattern !== 'editable') {
        mergedProps.pattern = form!.pattern
      }
      /* 未显式指定 wrapper 时，使用组件注册的默认 wrapper */
      if (!mergedProps.wrapper && typeof mergedProps.component === 'string') {
        const defaultWrapper = getDefaultWrapper(mergedProps.component)
        if (defaultWrapper) {
          mergedProps.wrapper = defaultWrapper
        }
      }
      return { field: form!.createField(mergedProps as any), created: true }
    }

    const { field: initialField, created: initialCreated } = resolveField(props.name)
    const fieldRef = ref<FieldInstance>(initialField)
    let createdByThis = initialCreated
    let currentName = props.name

    provide(FieldSymbol, fieldRef.value)

    /**
     * 当 name 变更时，销毁旧字段并创建新字段。
     *
     * 注意：不在 watch 内调用 provide()。Vue 3 的 inject 是一次性读取，
     * 已执行过 inject(FieldSymbol) 的子组件不会感知到后续 provide 的新值。
     * 子组件 ReactiveField 通过 props.field 接收字段引用（响应式更新），
     * 不依赖 inject。
     *
     * 对于 SchemaField 驱动的场景，每个 FormField 都有 key（cf.address），
     * name 变化时 Vue 会销毁并重建组件，setup 重新执行，provide 重新注册。
     */
    watch(() => props.name, (newName, oldName) => {
      if (newName === oldName)
        return

      /* 清理旧字段 */
      if (createdByThis) {
        form!.removeField(currentName)
      }

      /* 创建新字段 */
      const { field, created } = resolveField(newName)
      fieldRef.value = field
      createdByThis = created
      currentName = newName
    })

    onMounted(() => {
      fieldRef.value.mount()
    })

    onBeforeUnmount(() => {
      fieldRef.value.unmount()
      if (createdByThis) {
        form!.removeField(currentName)
      }
    })

    return () => {
      /* 通过 ReactiveField 统一渲染 */
      return h(ReactiveField, {
        field: fieldRef.value as any,
        isVoid: false,
      }, slots)
    }
  },
})
