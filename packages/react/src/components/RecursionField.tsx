import type { ISchema } from '@moluoxixi/schema'
import { DEFAULT_COMPONENT_MAPPING, resolveComponent } from '@moluoxixi/schema'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { FormArrayField } from './FormArrayField'
import { FormField } from './FormField'
import { FormObjectField } from './FormObjectField'

export interface RecursionFieldProps {
  /** 要渲染的 schema 节点 */
  schema: ISchema
  /** 字段名或索引 */
  name?: string | number
  /** 基础数据路径（拼接 name 后作为字段的完整路径） */
  basePath?: string
  /** 仅渲染 properties，不创建当前节点的字段 */
  onlyRenderProperties?: boolean
}

/**
 * RecursionField — 递归 Schema 渲染器（React 版，参考 Vue 端 RecursionField）
 *
 * 根据 schema 定义递归渲染字段组件。
 * 主要用于 ArrayItems 内部渲染每个数组项的子字段。
 *
 * 与 SchemaField 的区别：
 * - SchemaField 是顶层渲染器，编译整个 schema 树
 * - RecursionField 是局部渲染器，渲染指定 schema 节点及其子节点
 *
 * @example
 * ```tsx
 * <RecursionField schema={itemsSchema} name={index} basePath="contacts" />
 * ```
 */
export const RecursionField = observer<RecursionFieldProps>(
  ({ schema, name, basePath = '', onlyRenderProperties = false }) => {
    if (!schema) return null

    /** 拼接完整数据路径 */
    function fullPath(suffix?: string): string {
      const parts: string[] = []
      if (basePath) parts.push(basePath)
      if (name !== undefined) parts.push(String(name))
      if (suffix) parts.push(suffix)
      return parts.join('.')
    }

    /** 渲染 properties 子节点 */
    function renderProperties(propSchema: ISchema, parentPath: string): React.ReactElement[] {
      if (!propSchema.properties) return []

      const entries = Object.entries(propSchema.properties)
      entries.sort(([, a], [, b]) => (a.order ?? 0) - (b.order ?? 0))

      return entries.map(([key, childSchema]) => renderSchema(key, childSchema, parentPath))
    }

    /** 渲染单个 schema 节点 */
    function renderSchema(fieldName: string, fieldSchema: ISchema, parentPath: string): React.ReactElement {
      const dataPath = fieldSchema.type === 'void'
        ? parentPath
        : (parentPath ? `${parentPath}.${fieldName}` : fieldName)

      /* 数组字段 */
      if (fieldSchema.type === 'array') {
        return (
          <FormArrayField
            key={dataPath}
            name={dataPath}
            fieldProps={{
              label: fieldSchema.title,
              minItems: fieldSchema.minItems,
              maxItems: fieldSchema.maxItems,
              itemTemplate: fieldSchema.itemTemplate,
              component: fieldSchema.component || 'ArrayItems',
              componentProps: {
                ...fieldSchema.componentProps,
                itemsSchema: fieldSchema.items,
              },
            }}
          />
        )
      }

      /* 对象字段（有 properties） */
      if (fieldSchema.type === 'object' && fieldSchema.properties) {
        return (
          <FormObjectField
            key={dataPath}
            name={dataPath}
            fieldProps={{
              label: fieldSchema.title,
              component: fieldSchema.component,
              componentProps: fieldSchema.componentProps,
            }}
          >
            {renderProperties(fieldSchema, dataPath)}
          </FormObjectField>
        )
      }

      /* 普通数据字段 — 通过 resolveComponent 解析组件名（与 compileSchema 逻辑一致） */
      const resolvedComp = resolveComponent(fieldSchema, DEFAULT_COMPONENT_MAPPING)

      return (
        <FormField
          key={dataPath}
          name={dataPath}
          fieldProps={{
            label: fieldSchema.title,
            description: fieldSchema.description,
            required: fieldSchema.required === true,
            component: resolvedComp,
            componentProps: fieldSchema.componentProps,
            rules: fieldSchema.rules,
            disabled: fieldSchema.disabled,
            readOnly: fieldSchema.readOnly,
            pattern: fieldSchema.pattern,
            dataSource: fieldSchema.dataSource,
          }}
        />
      )
    }

    /* 仅渲染 properties（用于 object/void 节点的子内容） */
    if (onlyRenderProperties) {
      const path = fullPath()
      return <>{renderProperties(schema, path)}</>
    }

    /* 无 name：直接渲染 properties */
    if (name === undefined) {
      return <>{renderProperties(schema, basePath)}</>
    }

    /* 完整渲染 */
    const path = fullPath()

    /* 对象类型 */
    if (schema.type === 'object') {
      if (schema.properties) {
        return (
          <FormObjectField
            key={path}
            name={path}
            fieldProps={{
              label: schema.title,
              component: schema.component,
              componentProps: schema.componentProps,
            }}
          >
            {renderProperties(schema, path)}
          </FormObjectField>
        )
      }
      /* 无 properties 的对象：按普通字段渲染 */
      return <FormField key={path} name={path} fieldProps={{ label: schema.title }} />
    }

    /* 数组类型 */
    if (schema.type === 'array') {
      return (
        <FormArrayField
          key={path}
          name={path}
          fieldProps={{
            label: schema.title,
            minItems: schema.minItems,
            maxItems: schema.maxItems,
            itemTemplate: schema.itemTemplate,
            component: schema.component || 'ArrayItems',
            componentProps: {
              ...schema.componentProps,
              itemsSchema: schema.items,
            },
          }}
        />
      )
    }

    /* 普通字段 */
    return renderSchema(String(name), schema, basePath)
  },
)
