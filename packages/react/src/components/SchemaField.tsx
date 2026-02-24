import type { CompiledField, CompileOptions, ISchema, ObjectFieldProps } from '@moluoxixi/core'
import { compileSchema, isStructuralArrayComponent, toArrayFieldProps, toFieldProps, toVoidFieldProps } from '@moluoxixi/core'
import React, { useContext, useMemo } from 'react'
import { FormContext, SchemaContext } from '../context'
import { observer } from '../reactive'
import { FormArrayField } from './FormArrayField'
import { FormField } from './FormField'
import { FormObjectField } from './FormObjectField'
import { FormVoidField } from './FormVoidField'

/**
 * Schema Field Props：类型接口定义。
 * 所属模块：`packages/react/src/components/SchemaField.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
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

  /**
   * render Node：当前功能模块的核心执行单元。
   * 所属模块：`packages/react/src/components/SchemaField.tsx`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param cf 参数 `cf`用于提供当前函数执行所需的输入信息。
   * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
   */
  function renderNode(cf: CompiledField): React.ReactElement | null {
    if (cf.isVoid)
      return renderVoidNode(cf)
    if (cf.isArray) {
      /**
       * 结构化数组组件（管理动态数组项的增删排序）使用 FormArrayField。
       * 原子组件（如 CheckboxGroup/Transfer）虽然值为数组，但作为普通字段渲染。
       */
      const comp = cf.schema.component
      const isStructuralArray = isStructuralArrayComponent(comp)
      if (!isStructuralArray) {
        return <FormField key={cf.address} name={cf.dataPath} fieldProps={toFieldProps(cf)} />
      }
      {
        /**
         * 参考 Formily + Vue 端 SchemaField：
         * 将 items schema 通过 componentProps.itemsSchema 传递给数组组件，
         * 由 ArrayField/ArrayTable 使用 RecursionField 递归渲染每个数组项。
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

  /**
   * render Void Node：当前功能模块的核心执行单元。
   * 所属模块：`packages/react/src/components/SchemaField.tsx`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param cf 参数 `cf`用于提供当前函数执行所需的输入信息。
   * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
   */
  function renderVoidNode(cf: CompiledField): React.ReactElement {
    const voidProps = toVoidFieldProps(cf)
    return (
      <SchemaContext.Provider key={cf.address} value={cf.schema}>
        <FormVoidField name={cf.address} fieldProps={voidProps}>
          {renderChildren(cf.children)}
        </FormVoidField>
      </SchemaContext.Provider>
    )
  }

  /**
   * render Object Node：当前功能模块的核心执行单元。
   * 所属模块：`packages/react/src/components/SchemaField.tsx`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param cf 参数 `cf`用于提供当前函数执行所需的输入信息。
   * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
   */
  function renderObjectNode(cf: CompiledField): React.ReactElement {
    return (
      <SchemaContext.Provider key={cf.address} value={cf.schema}>
        <FormObjectField name={cf.dataPath} fieldProps={toFieldProps(cf) as Partial<ObjectFieldProps>}>
          {renderChildren(cf.children)}
        </FormObjectField>
      </SchemaContext.Provider>
    )
  }

  /**
   * render Children：当前功能模块的核心执行单元。
   * 所属模块：`packages/react/src/components/SchemaField.tsx`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param childAddresses 参数 `childAddresses`用于提供当前函数执行所需的输入信息。
   * @returns 返回数组结果，用于后续遍历、渲染或进一步转换。
   */
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
