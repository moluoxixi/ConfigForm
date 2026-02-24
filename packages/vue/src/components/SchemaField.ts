import type { CompiledField, CompileOptions, ISchema, ObjectFieldProps } from '@moluoxixi/core'
import type { PropType, VNode } from 'vue'
import { compileSchema, isStructuralArrayComponent, toArrayFieldProps, toFieldProps, toVoidFieldProps } from '@moluoxixi/core'
import { computed, defineComponent, h, inject, provide } from 'vue'
import { FormSymbol, SchemaSymbol } from '../context'
import { FormArrayField } from './FormArrayField'
import { FormField } from './FormField'
import { FormObjectField } from './FormObjectField'
import { FormVoidField } from './FormVoidField'

/** 辅助组件：在运行时注入 SchemaSymbol（Vue 的 provide 必须在 setup 中调用） */
const SchemaProvider = defineComponent({
  name: 'SchemaProvider',
  props: {
    schema: { type: Object as PropType<ISchema>, required: true },
  },
  /**
   * setup：当前功能模块的核心执行单元。
   * 所属模块：`packages/vue/src/components/SchemaField.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param props 参数 `props`用于提供当前函数执行所需的输入信息。
   * @param param2 原始解构参数（{ slots }）用于提供当前函数执行所需的输入信息。
   * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
   */
  setup(props, { slots }) {
    provide(SchemaSymbol, props.schema)
    return () => slots.default?.()
  },
})

/**
 * Schema 驱动的递归渲染器（参考 Formily RecursionField）
 *
 * 根据编译后的 schema 树递归渲染，每种 type 对应一个 Field 组件：
 * - void   → FormVoidField（创建 VoidField 实例，渲染布局容器）
 * - string/number/boolean/date → FormField（创建 Field 实例）
 * - array  → FormArrayField（创建 ArrayField 实例）
 * - object → FormObjectField（创建 Field 实例，递归子节点）
 *
 * 所有 Field 组件通过 ReactiveField 桥接渲染 decorator(component(children))。
 */
export const SchemaField = defineComponent({
  name: 'SchemaField',
  props: {
    schema: {
      type: Object as PropType<ISchema>,
      required: true,
    },
    compileOptions: {
      type: Object as PropType<CompileOptions>,
      default: undefined,
    },
  },
  /**
   * setup：当前功能模块的核心执行单元。
   * 所属模块：`packages/vue/src/components/SchemaField.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param props 参数 `props`用于提供当前函数执行所需的输入信息。
   * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
   */
  setup(props) {
    const form = inject(FormSymbol)
    if (!form) {
      throw new Error('[ConfigForm] <SchemaField> 必须在 <FormProvider> 内部使用')
    }

    const compiled = computed(() => compileSchema(props.schema, props.compileOptions))

    /**
     * 渲染一个编译后的节点
     * @param cf 参数 `cf`用于提供当前函数执行所需的输入信息。
     * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
     */
    function renderNode(cf: CompiledField): VNode | null {
      if (cf.isVoid) {
        return renderVoidNode(cf)
      }
      if (cf.isArray) {
        /**
         * 结构化数组组件（管理动态数组项的增删排序）使用 FormArrayField。
         * 原子组件（如 CheckboxGroup/Transfer）虽然值为数组，但作为普通字段渲染。
         */
        const comp = cf.schema.component
        const isStructuralArray = isStructuralArrayComponent(comp)
        if (!isStructuralArray) {
          return h(FormField, {
            key: cf.address,
            name: cf.dataPath,
            fieldProps: toFieldProps(cf),
          })
        }
        return renderArrayNode(cf)
      }
      if (cf.schema.type === 'object' && cf.children.length > 0) {
        return renderObjectNode(cf)
      }
      /* 普通数据字段 */
      return h(FormField, {
        key: cf.address,
        name: cf.dataPath,
        fieldProps: toFieldProps(cf),
      })
    }

    /**
     * array 节点 → FormArrayField
     *
     * 参考 Formily：将 items schema 通过 componentProps.itemsSchema 传递给
     * ArrayField 组件，由 ArrayField 使用 RecursionField 递归渲染每个数组项。
     * @param cf 参数 `cf`用于提供当前函数执行所需的输入信息。
     * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
     */
    function renderArrayNode(cf: CompiledField): VNode {
      const arrayProps = toArrayFieldProps(cf)

      /* 将 items schema 注入 componentProps，供 ArrayField 使用 */
      arrayProps.componentProps = {
        ...arrayProps.componentProps,
        itemsSchema: cf.schema.items,
      }

      return h(FormArrayField, {
        key: cf.address,
        name: cf.dataPath,
        fieldProps: arrayProps,
      })
    }

    /**
     * void 节点 → FormVoidField + 递归 children
     *
     * 注入 SchemaSymbol，让布局组件能通过 useFieldSchema() 获取 Schema。
     * 注意：Vue 的 provide 只能在 setup 中调用，
     * 这里通过包裹一个 SchemaProvider 组件来实现运行时注入。
     * @param cf 参数 `cf`用于提供当前函数执行所需的输入信息。
     * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
     */
    function renderVoidNode(cf: CompiledField): VNode {
      const voidProps = toVoidFieldProps(cf)
      return h(SchemaProvider, {
        key: cf.address,
        schema: cf.schema,
      }, {
        /**
         * default：执行当前功能逻辑。
         *
         * @returns 返回当前功能的处理结果。
         */

        default: () => h(FormVoidField, {
          name: cf.address,
          fieldProps: voidProps,
        }, {
          /**
           * default：执行当前功能逻辑。
           *
           * @returns 返回当前功能的处理结果。
           */

          default: () => renderChildren(cf.children),
        }),
      })
    }

    /**
     * object 节点 → FormObjectField + 递归 children
     * @param cf 参数 `cf`用于提供当前函数执行所需的输入信息。
     * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
     */
    function renderObjectNode(cf: CompiledField): VNode {
      return h(SchemaProvider, {
        key: cf.address,
        schema: cf.schema,
      }, {
        /**
         * default：执行当前功能逻辑。
         *
         * @returns 返回当前功能的处理结果。
         */

        default: () => h(FormObjectField, {
          name: cf.dataPath,
          fieldProps: toFieldProps(cf) as Partial<ObjectFieldProps>,
        }, {
          /**
           * default：执行当前功能逻辑。
           *
           * @returns 返回当前功能的处理结果。
           */

          default: () => renderChildren(cf.children),
        }),
      })
    }

    /**
     * 递归渲染子节点
     * @param childAddresses 参数 `childAddresses`用于提供当前函数执行所需的输入信息。
     * @returns 返回数组结果，用于后续遍历、渲染或进一步转换。
     */
    function renderChildren(childAddresses: string[]): VNode[] {
      const allFields = compiled.value.fields
      const result: VNode[] = []
      for (const addr of childAddresses) {
        const cf = allFields.get(addr)
        if (cf) {
          const node = renderNode(cf)
          if (node)
            result.push(node)
        }
      }
      return result
    }

    return () => {
      const rootChildren: VNode[] = []
      const allFields = compiled.value.fields

      for (const addr of compiled.value.fieldOrder) {
        if (!addr.includes('.')) {
          const cf = allFields.get(addr)
          if (cf) {
            const node = renderNode(cf)
            if (node)
              rootChildren.push(node)
          }
        }
      }

      return rootChildren
    }
  },
})
