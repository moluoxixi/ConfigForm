import type { ISchema } from '@moluoxixi/core'
import { DEFAULT_COMPONENT_MAPPING, resolveComponent } from '@moluoxixi/core'
import type { PropType, VNode } from 'vue'
import { defineComponent, h, provide } from 'vue'
import { SchemaSymbol } from '../context'
import { FormField } from './FormField'
import { FormArrayField } from './FormArrayField'
import { FormObjectField } from './FormObjectField'
import { FormVoidField } from './FormVoidField'

/**
 * RecursionField — 递归 Schema 渲染器（参考 Formily RecursionField）
 *
 * 根据 schema 定义递归渲染字段组件。
 * 主要用于 ArrayItems 内部渲染每个数组项的子字段。
 *
 * 与 SchemaField 的区别：
 * - SchemaField 是顶层渲染器，编译整个 schema 树
 * - RecursionField 是局部渲染器，渲染指定 schema 节点及其子节点
 *
 * @example
 * ```vue
 * <!-- 渲染数组项（索引为 name） -->
 * <RecursionField :schema="itemsSchema" :name="index" :base-path="'contacts'" />
 * ```
 */
export const RecursionField = defineComponent({
  name: 'RecursionField',
  props: {
    /** 要渲染的 schema 节点 */
    schema: {
      type: Object as PropType<ISchema>,
      required: true,
    },
    /** 字段名或索引 */
    name: {
      type: [String, Number] as PropType<string | number>,
      default: undefined,
    },
    /** 基础数据路径（拼接 name 后作为字段的完整路径） */
    basePath: {
      type: String,
      default: '',
    },
    /** 仅渲染 properties，不创建当前节点的字段 */
    onlyRenderProperties: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    /** 拼接完整数据路径 */
    function fullPath(suffix?: string): string {
      const parts: string[] = []
      if (props.basePath) parts.push(props.basePath)
      if (props.name !== undefined) parts.push(String(props.name))
      if (suffix) parts.push(suffix)
      return parts.join('.')
    }

    /** 渲染 properties 子节点 */
    function renderProperties(schema: ISchema, parentPath: string): VNode[] {
      if (!schema.properties) return []

      const entries = Object.entries(schema.properties)
      entries.sort(([, a], [, b]) => (a.order ?? 0) - (b.order ?? 0))

      return entries.map(([key, childSchema]) => renderSchema(key, childSchema, parentPath))
    }

    /** 渲染单个 schema 节点 */
    /** SchemaProvider 辅助组件 */
    const SchemaProviderLocal = defineComponent({
      name: 'SchemaProviderLocal',
      props: { schema: { type: Object as PropType<ISchema>, required: true } },
      setup(localProps, { slots }) {
        provide(SchemaSymbol, localProps.schema)
        return () => slots.default?.()
      },
    })

    function renderSchema(name: string, schema: ISchema, parentPath: string): VNode {
      const dataPath = schema.type === 'void' ? parentPath : (parentPath ? `${parentPath}.${name}` : name)
      const address = parentPath ? `${parentPath}.${name}` : name

      /* void 字段 — 通过 FormVoidField 渲染，注入 SchemaSymbol */
      if (schema.type === 'void') {
        return h(SchemaProviderLocal, { key: address, schema }, {
          default: () => h(FormVoidField, {
            name: address,
            fieldProps: {
              label: schema.title,
              component: schema.component,
              componentProps: schema.componentProps,
              visible: schema.visible,
              disabled: schema.disabled,
              readOnly: schema.readOnly,
              pattern: schema.pattern,
              reactions: schema.reactions,
            },
          }, {
            default: () => renderProperties(schema, dataPath),
          }),
        })
      }

      /* 数组字段 */
      if (schema.type === 'array') {
        return h(FormArrayField, {
          key: dataPath,
          name: dataPath,
          fieldProps: {
            label: schema.title,
            minItems: schema.minItems,
            maxItems: schema.maxItems,
            itemTemplate: schema.itemTemplate,
            component: schema.component || 'ArrayItems',
            componentProps: {
              ...schema.componentProps,
              itemsSchema: schema.items,
            },
          },
        })
      }

      /* 对象字段（有 properties） */
      if (schema.type === 'object' && schema.properties) {
        return h(FormObjectField, {
          key: dataPath,
          name: dataPath,
          fieldProps: {
            label: schema.title,
            component: schema.component,
            componentProps: schema.componentProps,
          },
        }, {
          default: () => renderProperties(schema, dataPath),
        })
      }

      /* 普通数据字段 — 通过 resolveComponent 解析组件名（与 compileSchema 逻辑一致） */
      const resolvedComp = resolveComponent(schema, DEFAULT_COMPONENT_MAPPING)

      return h(FormField, {
        key: dataPath,
        name: dataPath,
        fieldProps: {
          label: schema.title,
          description: schema.description,
          required: schema.required === true,
          component: resolvedComp,
          componentProps: schema.componentProps,
          rules: schema.rules,
          disabled: schema.disabled,
          readOnly: schema.readOnly,
          pattern: schema.pattern,
          dataSource: schema.dataSource,
        },
      })
    }

    return () => {
      const schema = props.schema
      if (!schema) return null

      /* 仅渲染 properties（用于 object/void 节点的子内容） */
      if (props.onlyRenderProperties) {
        const path = fullPath()
        return renderProperties(schema, path) as unknown as VNode
      }

      /* 无 name：直接渲染 properties */
      if (props.name === undefined) {
        return renderProperties(schema, props.basePath) as unknown as VNode
      }

      /* 完整渲染 */
      const path = fullPath()

      /* 对象类型 */
      if (schema.type === 'object') {
        if (schema.properties) {
          return h(FormObjectField, {
            key: path,
            name: path,
            fieldProps: {
              label: schema.title,
              component: schema.component,
              componentProps: schema.componentProps,
            },
          }, {
            default: () => renderProperties(schema, path),
          })
        }
        /* 无 properties 的对象：按普通字段渲染 */
        return h(FormField, { key: path, name: path, fieldProps: { label: schema.title } })
      }

      /* 数组类型 */
      if (schema.type === 'array') {
        return h(FormArrayField, {
          key: path,
          name: path,
          fieldProps: {
            label: schema.title,
            minItems: schema.minItems,
            maxItems: schema.maxItems,
            itemTemplate: schema.itemTemplate,
            component: schema.component || 'ArrayItems',
            componentProps: {
              ...schema.componentProps,
              itemsSchema: schema.items,
            },
          },
        })
      }

      /* 普通字段 */
      return renderSchema(String(props.name), schema, props.basePath)
    }
  },
})
