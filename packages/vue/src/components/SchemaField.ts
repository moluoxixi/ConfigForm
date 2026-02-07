import type { CompiledField, CompileOptions, ISchema } from '@moluoxixi/schema'
import type { PropType, VNode } from 'vue'
import { compileSchema, toArrayFieldProps, toFieldProps, toVoidFieldProps } from '@moluoxixi/schema'
import { computed, defineComponent, h, inject } from 'vue'
import { FormSymbol } from '../context'
import { FormArrayField } from './FormArrayField'
import { FormField } from './FormField'
import { FormObjectField } from './FormObjectField'
import { FormVoidField } from './FormVoidField'

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
  setup(props) {
    const form = inject(FormSymbol)
    if (!form) {
      throw new Error('[ConfigForm] <SchemaField> 必须在 <FormProvider> 内部使用')
    }

    const compiled = computed(() => compileSchema(props.schema, props.compileOptions))

    /** 渲染一个编译后的节点 */
    function renderNode(cf: CompiledField): VNode | null {
      if (cf.isVoid) {
        return renderVoidNode(cf)
      }
      if (cf.isArray) {
        return h(FormArrayField, {
          key: cf.address,
          name: cf.dataPath,
          fieldProps: toArrayFieldProps(cf),
        })
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

    /** void 节点 → FormVoidField + 递归 children */
    function renderVoidNode(cf: CompiledField): VNode {
      const voidProps = toVoidFieldProps(cf)
      return h(FormVoidField, {
        key: cf.address,
        name: cf.address,
        fieldProps: voidProps,
      }, {
        default: () => renderChildren(cf.children),
      })
    }

    /** object 节点 → FormObjectField + 递归 children */
    function renderObjectNode(cf: CompiledField): VNode {
      return h(FormObjectField, {
        key: cf.address,
        name: cf.dataPath,
        fieldProps: toFieldProps(cf),
      }, {
        default: () => renderChildren(cf.children),
      })
    }

    /** 递归渲染子节点 */
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
