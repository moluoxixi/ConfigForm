import type { CompiledField, CompileOptions, ISchema } from '@moluoxixi/schema'
import { compileSchema, toArrayFieldProps, toFieldProps, toVoidFieldProps } from '@moluoxixi/schema'
import { observer } from 'mobx-react-lite'
import React, { useContext, useMemo } from 'react'
import { FormContext } from '../context'
import { FormArrayField } from './FormArrayField'
import { FormField } from './FormField'
import { FormObjectField } from './FormObjectField'
import { FormVoidField } from './FormVoidField'

export interface SchemaFieldProps {
  schema: ISchema
  compileOptions?: CompileOptions
}

/**
 * Schema 驱动的递归渲染器（React 版）
 *
 * 每种 type 对应一个 Field 组件，通过 ReactiveField 桥接渲染。
 */
export const SchemaField = observer<SchemaFieldProps>(({ schema, compileOptions }) => {
  const form = useContext(FormContext)
  if (!form)
    throw new Error('[ConfigForm] <SchemaField> 必须在 <FormProvider> 内部使用')

  const compiled = useMemo(() => compileSchema(schema, compileOptions), [schema, compileOptions])

  function renderNode(cf: CompiledField): React.ReactElement | null {
    if (cf.isVoid)
      return renderVoidNode(cf)
    if (cf.isArray) {
      /**
       * 结构化数组组件（管理动态数组项的增删排序）使用 FormArrayField。
       * 原子组件（如 CheckboxGroup/Transfer）虽然值为数组，但作为普通字段渲染。
       */
      const comp = cf.schema.component
      const isStructuralArray = !comp || comp === 'ArrayItems' || comp === 'ArrayTable'
      if (!isStructuralArray) {
        return <FormField key={cf.address} name={cf.dataPath} fieldProps={toFieldProps(cf)} />
      }
      {
        /**
         * 参考 Formily + Vue 端 SchemaField：
         * 将 items schema 通过 componentProps.itemsSchema 传递给数组组件，
         * 由 ArrayItems/ArrayTable 使用 RecursionField 递归渲染每个数组项。
         */
        const arrayProps = toArrayFieldProps(cf)
        arrayProps.componentProps = {
          ...arrayProps.componentProps,
          itemsSchema: cf.schema.items,
        }
        return <FormArrayField key={cf.address} name={cf.dataPath} fieldProps={arrayProps} />
      }
    }
    if (cf.schema.type === 'object' && cf.children.length > 0) {
      return renderObjectNode(cf)
    }
    return <FormField key={cf.address} name={cf.dataPath} fieldProps={toFieldProps(cf)} />
  }

  function renderVoidNode(cf: CompiledField): React.ReactElement {
    const voidProps = toVoidFieldProps(cf)
    return (
      <FormVoidField key={cf.address} name={cf.address} fieldProps={voidProps}>
        {renderChildren(cf.children)}
      </FormVoidField>
    )
  }

  function renderObjectNode(cf: CompiledField): React.ReactElement {
    return (
      <FormObjectField key={cf.address} name={cf.dataPath} fieldProps={toFieldProps(cf)}>
        {renderChildren(cf.children)}
      </FormObjectField>
    )
  }

  function renderChildren(childAddresses: string[]): React.ReactElement[] {
    const allFields = compiled.fields
    const result: React.ReactElement[] = []
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

  const rootChildren: React.ReactElement[] = []
  for (const addr of compiled.fieldOrder) {
    if (!addr.includes('.')) {
      const cf = compiled.fields.get(addr)
      if (cf) {
        const node = renderNode(cf)
        if (node)
          rootChildren.push(node)
      }
    }
  }

  return <>{rootChildren}</>
})
