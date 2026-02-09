import type { ISchema } from '@moluoxixi/core'
import { DEFAULT_COMPONENT_MAPPING, resolveComponent } from '@moluoxixi/core'
import { observer } from '@moluoxixi/reactive-react'
import React from 'react'
import { SchemaContext } from '../context'
import { FormArrayField } from './FormArrayField'
import { FormField } from './FormField'
import { FormObjectField } from './FormObjectField'
import { FormVoidField } from './FormVoidField'

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
 * RecursionField — 递归 Schema 渲染器（React 版）
 *
 * 参考 Formily RecursionField，根据 schema 定义递归渲染字段组件。
 *
 * 用途：
 * 1. ArrayItems 内部渲染每个数组项的子字段
 * 2. 布局组件（LayoutTabs/LayoutCollapse/LayoutSteps）渲染各面板内容
 *
 * 支持所有类型：string / number / boolean / date / array / object / void
 */
export const RecursionField = observer<RecursionFieldProps>(
  ({ schema, name, basePath = '', onlyRenderProperties = false }) => {
    if (!schema) return null

    /** 拼接完整路径 */
    function fullPath(suffix?: string): string {
      const parts: string[] = []
      if (basePath) parts.push(basePath)
      if (name !== undefined) parts.push(String(name))
      if (suffix) parts.push(suffix)
      return parts.join('.')
    }

    /** 渲染 properties 子节点 */
    function renderProperties(propSchema: ISchema, parentPath: string, parentAddress?: string): React.ReactElement[] {
      if (!propSchema.properties) return []

      const entries = Object.entries(propSchema.properties)
      entries.sort(([, a], [, b]) => (a.order ?? 0) - (b.order ?? 0))

      return entries.map(([key, childSchema]) => renderSchema(key, childSchema, parentPath, parentAddress))
    }

    /** 渲染单个 schema 节点 */
    function renderSchema(fieldName: string, fieldSchema: ISchema, parentPath: string, parentAddress?: string): React.ReactElement {
      const isVoid = fieldSchema.type === 'void'

      /**
       * void 节点不参与数据路径但参与地址路径。
       * - dataPath：跳过 void（用于 form.values 读写）
       * - address：包含 void（用于字段注册和组件查找）
       */
      const dataPath = isVoid
        ? parentPath
        : (parentPath ? `${parentPath}.${fieldName}` : fieldName)
      const address = parentAddress
        ? `${parentAddress}.${fieldName}`
        : (basePath ? `${basePath}.${fieldName}` : fieldName)

      /* void 字段 — 通过 FormVoidField 渲染，注入 SchemaContext */
      if (isVoid) {
        return (
          <SchemaContext.Provider key={address} value={fieldSchema}>
            <FormVoidField
              name={address}
              fieldProps={{
                label: fieldSchema.title,
                component: fieldSchema.component,
                componentProps: fieldSchema.componentProps,
                visible: fieldSchema.visible,
                disabled: fieldSchema.disabled,
                preview: fieldSchema.preview,
                pattern: fieldSchema.pattern,
                reactions: fieldSchema.reactions,
              }}
            >
              {renderProperties(fieldSchema, dataPath, address)}
            </FormVoidField>
          </SchemaContext.Provider>
        )
      }

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
          <SchemaContext.Provider key={dataPath} value={fieldSchema}>
            <FormObjectField
              name={dataPath}
              fieldProps={{
                label: fieldSchema.title,
                component: fieldSchema.component,
                componentProps: fieldSchema.componentProps,
              }}
            >
              {renderProperties(fieldSchema, dataPath, dataPath)}
            </FormObjectField>
          </SchemaContext.Provider>
        )
      }

      /* 普通数据字段 */
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
            preview: fieldSchema.preview,
            pattern: fieldSchema.pattern,
            dataSource: fieldSchema.dataSource,
            displayFormat: fieldSchema.displayFormat as ((value: unknown) => unknown) | undefined,
            inputParse: fieldSchema.inputParse as ((value: unknown) => unknown) | undefined,
            submitTransform: fieldSchema.submitTransform as ((value: unknown) => unknown) | undefined,
            submitPath: fieldSchema.submitPath,
            excludeWhenHidden: fieldSchema.excludeWhenHidden,
          }}
        />
      )
    }

    /* 仅渲染 properties（用于布局组件渲染各面板内容） */
    if (onlyRenderProperties) {
      const path = fullPath()
      return <>{renderProperties(schema, path, path)}</>
    }

    /* 无 name：直接渲染 properties */
    if (name === undefined) {
      return <>{renderProperties(schema, basePath, basePath)}</>
    }

    /* 完整渲染（有 name） */
    return renderSchema(String(name), schema, basePath, basePath)
  },
)
