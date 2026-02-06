import type { CompiledField, CompileOptions, FormSchema } from '@moluoxixi/schema'
import { compileSchema, toArrayFieldProps, toFieldProps } from '@moluoxixi/schema'
import { observer } from 'mobx-react-lite'
import React, { useContext, useMemo } from 'react'
import { FormContext } from '../context'
import { FormArrayField } from './FormArrayField'
import { FormField } from './FormField'

export interface SchemaFieldProps {
  /** 表单 Schema */
  schema: FormSchema
  /** 编译选项 */
  compileOptions?: CompileOptions
}

/**
 * Schema 驱动的字段渲染器
 *
 * 根据 FormSchema 自动创建字段并渲染对应组件。
 */
export const SchemaField = observer<SchemaFieldProps>(({ schema, compileOptions }) => {
  const form = useContext(FormContext)
  if (!form) {
    throw new Error('[ConfigForm] <SchemaField> 必须在 <FormProvider> 内部使用')
  }

  const compiled = useMemo(() => compileSchema(schema, compileOptions), [schema, compileOptions])

  /* 仅渲染顶层字段（嵌套由各组件递归处理） */
  const topLevelFields = Array.from(compiled.fields.entries()).filter(
    ([path]) => !path.includes('.'),
  )

  return (
    <>
      {topLevelFields.map(([path, compiledField]) => (
        <SchemaFieldItem key={path} path={path} compiledField={compiledField} />
      ))}
    </>
  )
})

/** 单个 Schema 字段渲染 */
const SchemaFieldItem = observer<{ path: string, compiledField: CompiledField }>(
  ({ path, compiledField }) => {
    if (compiledField.isVoid) {
      /* 虚拟字段：仅渲染容器 */
      return null
    }

    if (compiledField.isArray) {
      const props = toArrayFieldProps(compiledField)
      return (
        <FormArrayField name={path} fieldProps={props}>
          {field => (
            <div data-field-array={path}>
              {(field.value as unknown[])?.map((_, index) => (
                <div key={index} data-array-item={index}>
                  {/* 数组项由具体组件处理 */}
                </div>
              ))}
            </div>
          )}
        </FormArrayField>
      )
    }

    const props = toFieldProps(compiledField)
    return <FormField name={path} fieldProps={props} />
  },
)
