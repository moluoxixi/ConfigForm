import type { ISchema } from '@moluoxixi/core'
import type { JsonSchemaAdapterOptions, StandardJsonSchema } from './types'
import { isArray, isObject, isString } from '@moluoxixi/core'

/* ======================== 常量 ======================== */

/** 默认 JSON Schema format → 验证器 format 映射 */
const DEFAULT_FORMAT_VALIDATOR_MAP: Record<string, string> = {
  'email': 'email',
  'idn-email': 'email',
  'uri': 'url',
  'url': 'url',
  'uri-reference': 'url',
  'ipv4': 'ipv4',
  'ipv6': 'ipv6',
  'date': 'date',
  'date-time': 'date',
  'phone': 'phone',
}

/** 默认 JSON Schema format → 组件映射 */
const DEFAULT_FORMAT_COMPONENT_MAP: Record<string, string> = {
  'date': 'DatePicker',
  'date-time': 'DatePicker',
  'email': 'Input',
  'uri': 'Input',
  'uri-reference': 'Input',
}

/** JSON Schema type → ISchema type 映射 */
const TYPE_MAP: Record<string, ISchema['type']> = {
  string: 'string',
  number: 'number',
  integer: 'number',
  boolean: 'boolean',
  object: 'object',
  array: 'array',
}

/* ======================== 工具函数 ======================== */

/**
 * 将 camelCase / snake_case / kebab-case 的 key 转为可读标签
 *
 * @example
 * ```ts
 * keyToLabel('firstName')     // 'First Name'
 * keyToLabel('user_name')     // 'User Name'
 * keyToLabel('phone-number')  // 'Phone Number'
 * ```
 */
function keyToLabel(key: string): string {
  return key
    /* camelCase → 空格分隔 */
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    /* snake_case / kebab-case → 空格分隔 */
    .replace(/[_-]/g, ' ')
    /* 首字母大写 */
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim()
}

/**
 * 获取字段标题
 */
function resolveTitle(
  key: string,
  schema: StandardJsonSchema,
  strategy: JsonSchemaAdapterOptions['titleStrategy'],
): string | undefined {
  if (strategy === 'keyToLabel') {
    return schema.title ?? keyToLabel(key)
  }
  if (typeof strategy === 'function') {
    return strategy(key, schema)
  }
  /* 默认 'schema'：仅使用 title 属性 */
  return schema.title
}

/**
 * 解析 JSON Schema 的主类型（忽略 null）
 *
 * JSON Schema 支持 `type: ['string', 'null']`，提取非 null 的主类型。
 */
function resolvePrimaryType(type: StandardJsonSchema['type']): string | undefined {
  if (isString(type)) {
    return type === 'null' ? undefined : type
  }
  if (isArray(type)) {
    const nonNull = (type as string[]).filter(t => t !== 'null')
    return nonNull[0]
  }
  return undefined
}

/**
 * 从 if 块中提取条件信息
 *
 * 支持两种常见写法：
 * - `{ properties: { field: { const: value } } }`
 * - `{ properties: { field: { enum: [...] } } }`
 *
 * @returns 提取出的 [字段名, 值/值数组] 对列表
 */
function extractIfConditions(
  ifSchema: StandardJsonSchema,
): Array<{ field: string, value: unknown, isEnum: boolean }> {
  const conditions: Array<{ field: string, value: unknown, isEnum: boolean }> = []

  if (!ifSchema.properties) return conditions

  for (const [field, propSchema] of Object.entries(ifSchema.properties)) {
    if (!isObject(propSchema)) continue

    if (propSchema.const !== undefined) {
      conditions.push({ field, value: propSchema.const, isEnum: false })
    }
    else if (isArray(propSchema.enum) && (propSchema.enum as unknown[]).length > 0) {
      conditions.push({ field, value: propSchema.enum, isEnum: true })
    }
  }

  return conditions
}

/**
 * 构建条件表达式字符串
 *
 * @param conditions - 从 if 块提取的条件列表
 * @param parentPath - 父级数据路径
 * @returns `{{...}}` 格式的表达式
 */
function buildConditionExpression(
  conditions: Array<{ field: string, value: unknown, isEnum: boolean }>,
  parentPath: string,
): string {
  const parts = conditions.map(({ field, value, isEnum }) => {
    const valuePath = parentPath ? `$values.${parentPath}.${field}` : `$values.${field}`
    if (isEnum) {
      return `${JSON.stringify(value)}.includes(${valuePath})`
    }
    return `${valuePath} === ${JSON.stringify(value)}`
  })

  return `{{${parts.join(' && ')}}}`
}

/* ======================== 核心转换 ======================== */

/**
 * 将标准 JSON Schema 的约束属性转换为 ISchema 验证规则
 */
function convertConstraintsToRules(
  schema: StandardJsonSchema,
  options: JsonSchemaAdapterOptions,
): ISchema['rules'] {
  const rules: NonNullable<ISchema['rules']> = []

  /* 字符串约束 */
  if (schema.minLength !== undefined) {
    rules.push({ minLength: schema.minLength })
  }
  if (schema.maxLength !== undefined) {
    rules.push({ maxLength: schema.maxLength })
  }
  if (schema.pattern !== undefined) {
    rules.push({ pattern: schema.pattern })
  }

  /* format → 验证规则 */
  if (schema.format) {
    const formatMap = { ...DEFAULT_FORMAT_VALIDATOR_MAP, ...options.formatValidatorMapping }
    const validatorFormat = formatMap[schema.format]
    if (validatorFormat) {
      rules.push({ format: validatorFormat })
    }
  }

  /* 数值约束 */
  if (schema.minimum !== undefined) {
    rules.push({ min: schema.minimum })
  }
  if (schema.maximum !== undefined) {
    rules.push({ max: schema.maximum })
  }
  /* Draft-07: exclusiveMinimum / exclusiveMaximum 为数值 */
  if (typeof schema.exclusiveMinimum === 'number') {
    rules.push({ exclusiveMin: schema.exclusiveMinimum })
  }
  if (typeof schema.exclusiveMaximum === 'number') {
    rules.push({ exclusiveMax: schema.exclusiveMaximum })
  }

  /* 枚举约束（仅纯值数组时添加校验规则，带 label 的 enum 在 convertNode 中处理） */
  if (schema.enum && schema.enum.every(v => isString(v) || typeof v === 'number' || typeof v === 'boolean')) {
    rules.push({ enum: schema.enum as (string | number | boolean)[] })
  }

  return rules.length > 0 ? rules : undefined
}

/**
 * 将标准 JSON Schema enum 转为 ISchema enum（带 label/value）
 */
function convertEnum(values: unknown[]): ISchema['enum'] {
  return values
    .filter(v => v !== null && v !== undefined)
    .map((v) => {
      if (isObject(v) && 'label' in v && 'value' in v) {
        return v as { label: string, value: unknown }
      }
      return { label: String(v), value: v }
    })
}

/**
 * 将 if/then/else 转换为 reactions 联动规则
 */
function convertIfThenElse(
  schema: StandardJsonSchema,
  parentPath: string,
): ISchema['reactions'] {
  if (!schema.if) return undefined

  const conditions = extractIfConditions(schema.if)
  if (conditions.length === 0) return undefined

  const whenExpr = buildConditionExpression(conditions, parentPath)
  const watchFields = conditions.map(c =>
    parentPath ? `${parentPath}.${c.field}` : c.field,
  )

  const reactions: NonNullable<ISchema['reactions']> = []

  /* then 中的 required 字段 → 条件必填 */
  if (schema.then?.required && isArray(schema.then.required)) {
    for (const fieldName of schema.then.required as string[]) {
      reactions.push({
        watch: watchFields,
        target: parentPath ? `${parentPath}.${fieldName}` : fieldName,
        when: whenExpr,
        fulfill: { state: { required: true } },
        otherwise: { state: { required: false } },
      })
    }
  }

  /* then 中的 properties → 条件显示 */
  if (schema.then?.properties) {
    for (const fieldName of Object.keys(schema.then.properties)) {
      /* 如果 then 中的 property 值为 false，表示隐藏（else 中显示） */
      const thenProp = schema.then.properties[fieldName]
      if (thenProp === false as unknown) continue

      /* 检查 else 中是否将该字段设为 false（隐藏） */
      const elseProp = schema.else?.properties?.[fieldName]
      const elseHidesField = elseProp === false as unknown

      if (elseHidesField) {
        reactions.push({
          watch: watchFields,
          target: parentPath ? `${parentPath}.${fieldName}` : fieldName,
          when: whenExpr,
          fulfill: { state: { display: 'visible' } },
          otherwise: { state: { display: 'none' } },
        })
      }
    }
  }

  /* else 中隐藏的字段（else.properties.field = false） */
  if (schema.else?.properties) {
    for (const fieldName of Object.keys(schema.else.properties)) {
      const elseProp = schema.else.properties[fieldName]
      if (elseProp === false as unknown) {
        /* 条件满足时显示，不满足时隐藏 */
        reactions.push({
          watch: watchFields,
          target: parentPath ? `${parentPath}.${fieldName}` : fieldName,
          when: whenExpr,
          fulfill: { state: { display: 'visible' } },
          otherwise: { state: { display: 'none' } },
        })
      }
    }
  }

  /* else 中的 required → 条件不满足时必填 */
  if (schema.else?.required && isArray(schema.else.required)) {
    for (const fieldName of schema.else.required as string[]) {
      /* 检查 then.required 中是否已处理（避免重复） */
      const alreadyHandled = schema.then?.required && (schema.then.required as string[]).includes(fieldName)
      if (!alreadyHandled) {
        reactions.push({
          watch: watchFields,
          target: parentPath ? `${parentPath}.${fieldName}` : fieldName,
          when: whenExpr,
          fulfill: { state: { required: false } },
          otherwise: { state: { required: true } },
        })
      }
    }
  }

  return reactions.length > 0 ? reactions : undefined
}

/**
 * 将 if/then/else 转换为 oneOf 条件分支
 */
function convertIfThenElseToOneOf(
  schema: StandardJsonSchema,
): ISchema['oneOf'] {
  if (!schema.if) return undefined

  const conditions = extractIfConditions(schema.if)
  if (conditions.length === 0) return undefined

  const branches: NonNullable<ISchema['oneOf']> = []

  /* then 分支 */
  if (schema.then?.properties) {
    const when: Record<string, unknown> = {}
    for (const { field, value } of conditions) {
      when[field] = value
    }
    branches.push({
      when,
      properties: convertProperties(schema.then.properties, '', {}) as Record<string, ISchema>,
    })
  }

  /* else 分支 */
  if (schema.else?.properties) {
    /* else 条件：取反表达式 */
    const condParts = conditions.map(({ field, value, isEnum }) => {
      if (isEnum) {
        return `!${JSON.stringify(value)}.includes($values.${field})`
      }
      return `$values.${field} !== ${JSON.stringify(value)}`
    })
    branches.push({
      when: `{{${condParts.join(' && ')}}}`,
      properties: convertProperties(schema.else.properties, '', {}) as Record<string, ISchema>,
    })
  }

  return branches.length > 0 ? branches : undefined
}

/**
 * 将 dependentRequired / dependencies 转换为 reactions
 */
function convertDependencies(
  schema: StandardJsonSchema,
  parentPath: string,
): NonNullable<ISchema['reactions']> {
  const reactions: NonNullable<ISchema['reactions']> = []

  /* dependentRequired (2020-12) */
  if (schema.dependentRequired) {
    for (const [trigger, requiredFields] of Object.entries(schema.dependentRequired)) {
      const watchPath = parentPath ? `${parentPath}.${trigger}` : trigger
      const whenExpr = `{{!!$values.${watchPath}}}`

      for (const targetField of requiredFields) {
        reactions.push({
          watch: watchPath,
          target: parentPath ? `${parentPath}.${targetField}` : targetField,
          when: whenExpr,
          fulfill: { state: { required: true } },
          otherwise: { state: { required: false } },
        })
      }
    }
  }

  /* dependencies (Draft-07) — 仅处理字符串数组形式 */
  if (schema.dependencies) {
    for (const [trigger, dep] of Object.entries(schema.dependencies)) {
      if (!isArray(dep)) continue

      const watchPath = parentPath ? `${parentPath}.${trigger}` : trigger
      const whenExpr = `{{!!$values.${watchPath}}}`

      for (const targetField of dep as string[]) {
        reactions.push({
          watch: watchPath,
          target: parentPath ? `${parentPath}.${targetField}` : targetField,
          when: whenExpr,
          fulfill: { state: { required: true } },
          otherwise: { state: { required: false } },
        })
      }
    }
  }

  /* dependentSchemas (2020-12) — 转为显隐联动 */
  if (schema.dependentSchemas) {
    for (const [trigger, depSchema] of Object.entries(schema.dependentSchemas)) {
      if (!depSchema.properties) continue

      const watchPath = parentPath ? `${parentPath}.${trigger}` : trigger
      const whenExpr = `{{!!$values.${watchPath}}}`

      for (const targetField of Object.keys(depSchema.properties)) {
        reactions.push({
          watch: watchPath,
          target: parentPath ? `${parentPath}.${targetField}` : targetField,
          when: whenExpr,
          fulfill: { state: { display: 'visible' } },
          otherwise: { state: { display: 'none' } },
        })
      }
    }
  }

  return reactions
}

/**
 * 将 allOf 中的 Schema 合并为一个
 */
function mergeAllOf(schemas: StandardJsonSchema[]): StandardJsonSchema {
  let merged: StandardJsonSchema = {}
  for (const s of schemas) {
    merged = mergeStandardSchema(merged, s)
  }
  return merged
}

/**
 * 合并两个 StandardJsonSchema（浅合并，properties 递归合并）
 */
function mergeStandardSchema(base: StandardJsonSchema, override: StandardJsonSchema): StandardJsonSchema {
  const result = { ...base }

  for (const [key, val] of Object.entries(override)) {
    if (val === undefined) continue

    if (key === 'properties' && isObject(val)) {
      const merged: Record<string, StandardJsonSchema> = { ...base.properties }
      for (const [name, propVal] of Object.entries(val as Record<string, StandardJsonSchema>)) {
        merged[name] = base.properties?.[name]
          ? mergeStandardSchema(base.properties[name], propVal)
          : propVal
      }
      result.properties = merged
      continue
    }

    if (key === 'required' && isArray(val)) {
      const baseRequired = isArray(base.required) ? base.required as string[] : []
      result.required = [...new Set([...baseRequired, ...(val as string[])])]
      continue
    }

    ;(result as Record<string, unknown>)[key] = val
  }

  return result
}

/**
 * 递归转换单个 StandardJsonSchema 属性节点为 ISchema
 */
function convertNode(
  key: string,
  schema: StandardJsonSchema,
  parentPath: string,
  options: JsonSchemaAdapterOptions,
): ISchema {
  const result: ISchema = {}

  /* ---- 类型 ---- */
  const primaryType = resolvePrimaryType(schema.type)
  if (primaryType) {
    result.type = TYPE_MAP[primaryType] ?? 'string'
  }

  /* ---- 标题 ---- */
  const title = resolveTitle(key, schema, options.titleStrategy)
  if (title) {
    result.title = title
  }

  /* ---- 描述 ---- */
  if (schema.description) {
    result.description = schema.description
    if (options.descriptionAsPlaceholder) {
      result.componentProps = { ...result.componentProps, placeholder: schema.description }
    }
  }

  /* ---- 默认值 ---- */
  if (schema.default !== undefined) {
    result.default = schema.default
  }

  /* ---- 只读 ---- */
  if (schema.readOnly) {
    result.readOnly = true
  }

  /* ---- 枚举 → dataSource ---- */
  if (schema.enum) {
    result.enum = convertEnum(schema.enum)
  }

  /* ---- format → 组件推断 ---- */
  if (schema.format) {
    const componentMap = { ...DEFAULT_FORMAT_COMPONENT_MAP, ...options.formatComponentMapping }
    const component = componentMap[schema.format]
    if (component) {
      result.component = component
    }
  }

  /* ---- 验证规则 ---- */
  const rules = convertConstraintsToRules(schema, options)
  if (rules) {
    result.rules = rules
  }

  /* ---- 对象子属性 ---- */
  if (schema.properties) {
    const dataPath = parentPath ? `${parentPath}.${key}` : key
    result.properties = convertProperties(schema.properties, dataPath, options)

    /* required: string[] → 各子字段 required: true */
    if (isArray(schema.required)) {
      for (const reqField of schema.required as string[]) {
        if (result.properties[reqField]) {
          result.properties[reqField].required = true
        }
      }
    }
  }

  /* ---- 数组项 ---- */
  if (schema.items && !isArray(schema.items)) {
    const dataPath = parentPath ? `${parentPath}.${key}` : key
    result.items = convertNode('*', schema.items, dataPath, options)
  }
  if (schema.minItems !== undefined) {
    result.minItems = schema.minItems
  }
  if (schema.maxItems !== undefined) {
    result.maxItems = schema.maxItems
  }

  /* ---- $ref 透传 ---- */
  if (schema.$ref) {
    result.$ref = schema.$ref
  }

  return result
}

/**
 * 批量转换 properties
 */
function convertProperties(
  properties: Record<string, StandardJsonSchema>,
  parentPath: string,
  options: JsonSchemaAdapterOptions,
): Record<string, ISchema> {
  const result: Record<string, ISchema> = {}

  for (const [key, propSchema] of Object.entries(properties)) {
    result[key] = convertNode(key, propSchema, parentPath, options)
  }

  return result
}

/* ======================== 公共 API ======================== */

/**
 * 将标准 JSON Schema (Draft-07/2020-12) 转换为表单 ISchema
 *
 * 纯函数，不修改原始输入。转换后的 ISchema 可直接用于 compileSchema()。
 *
 * 转换规则：
 * - `type: 'integer'` → `type: 'number'`
 * - `type: ['string', 'null']` → `type: 'string'`（忽略 null）
 * - `required: ['field1']`（object 级）→ 各字段 `required: true`
 * - `enum: [1, 2]`（纯值）→ `enum: [{ label: '1', value: 1 }, ...]`
 * - `minimum/maximum` → `rules: [{ min/max }]`
 * - `minLength/maxLength` → `rules: [{ minLength/maxLength }]`
 * - `pattern` → `rules: [{ pattern }]`
 * - `format: 'email'` → `rules: [{ format: 'email' }]` + 组件推断
 * - `if/then/else` → `reactions`（或 `oneOf`，取决于选项）
 * - `allOf` → 合并为单个 Schema
 * - `oneOf` + `const` 鉴别 → `oneOf` + `discriminator`
 * - `dependentRequired` → `reactions` 条件必填
 * - `$defs` → `definitions`
 * - `readOnly: true` → `readOnly: true`
 *
 * @param jsonSchema - 标准 JSON Schema 对象
 * @param options - 转换选项
 * @returns 表单 ISchema
 *
 * @example
 * ```ts
 * import { fromJsonSchema } from '@moluoxixi/plugin-json-schema'
 * import { compileSchema } from '@moluoxixi/core'
 *
 * const formSchema = fromJsonSchema({
 *   type: 'object',
 *   required: ['name', 'email'],
 *   properties: {
 *     name: { type: 'string', minLength: 2, maxLength: 50 },
 *     email: { type: 'string', format: 'email' },
 *     age: { type: 'integer', minimum: 0, maximum: 150 },
 *   },
 * })
 *
 * // formSchema 等价于：
 * // {
 * //   type: 'object',
 * //   properties: {
 * //     name: { type: 'string', required: true, rules: [{ minLength: 2 }, { maxLength: 50 }] },
 * //     email: { type: 'string', required: true, rules: [{ format: 'email' }] },
 * //     age: { type: 'number', rules: [{ min: 0 }, { max: 150 }] },
 * //   },
 * // }
 * ```
 */
export function fromJsonSchema(
  jsonSchema: StandardJsonSchema,
  options?: JsonSchemaAdapterOptions,
): ISchema {
  const opts: JsonSchemaAdapterOptions = {
    titleStrategy: 'schema',
    descriptionAsPlaceholder: false,
    conditionalStrategy: 'reactions',
    preserveExtensions: true,
    ...options,
  }

  /* ---- 预处理：allOf 合并 ---- */
  let effectiveSchema = jsonSchema
  if (jsonSchema.allOf && isArray(jsonSchema.allOf)) {
    const allOfMerged = mergeAllOf(jsonSchema.allOf as StandardJsonSchema[])
    effectiveSchema = mergeStandardSchema(jsonSchema, allOfMerged)
    /* 移除已处理的 allOf */
    const { allOf: _unused, ...rest } = effectiveSchema
    effectiveSchema = rest
  }

  /* ---- 根节点构建 ---- */
  const result: ISchema = {
    type: 'object',
  }

  /* 标题/描述 */
  if (effectiveSchema.title) {
    result.title = effectiveSchema.title
  }
  if (effectiveSchema.description) {
    result.description = effectiveSchema.description
  }

  /* ---- definitions / $defs ---- */
  const defs = effectiveSchema.definitions ?? effectiveSchema.$defs
  if (defs) {
    const convertedDefs: Record<string, ISchema> = {}
    for (const [defName, defSchema] of Object.entries(defs)) {
      convertedDefs[defName] = convertNode(defName, defSchema, '', opts)
    }
    result.definitions = convertedDefs
  }

  /* ---- properties ---- */
  if (effectiveSchema.properties) {
    result.properties = convertProperties(effectiveSchema.properties, '', opts)

    /* 根级 required */
    if (isArray(effectiveSchema.required)) {
      for (const reqField of effectiveSchema.required as string[]) {
        if (result.properties[reqField]) {
          result.properties[reqField].required = true
        }
      }
    }
  }

  /* ---- if/then/else → reactions 或 oneOf ---- */
  if (effectiveSchema.if) {
    if (opts.conditionalStrategy === 'oneOf') {
      const oneOfBranches = convertIfThenElseToOneOf(effectiveSchema)
      if (oneOfBranches) {
        result.oneOf = oneOfBranches
      }
    }
    else {
      const reactions = convertIfThenElse(effectiveSchema, '')
      if (reactions && reactions.length > 0) {
        result.reactions = [...(result.reactions ?? []), ...reactions]
      }
    }
  }

  /* ---- oneOf（标准） → oneOf（表单） ---- */
  if (effectiveSchema.oneOf && isArray(effectiveSchema.oneOf)) {
    const formOneOf = convertStandardOneOf(effectiveSchema.oneOf as StandardJsonSchema[], opts)
    if (formOneOf) {
      result.oneOf = [...(result.oneOf ?? []), ...formOneOf.branches]
      if (formOneOf.discriminator) {
        result.discriminator = formOneOf.discriminator
      }
    }
  }

  /* ---- anyOf → 同 oneOf 处理 ---- */
  if (effectiveSchema.anyOf && isArray(effectiveSchema.anyOf)) {
    const formOneOf = convertStandardOneOf(effectiveSchema.anyOf as StandardJsonSchema[], opts)
    if (formOneOf) {
      result.oneOf = [...(result.oneOf ?? []), ...formOneOf.branches]
      if (formOneOf.discriminator && !result.discriminator) {
        result.discriminator = formOneOf.discriminator
      }
    }
  }

  /* ---- dependencies / dependentRequired / dependentSchemas ---- */
  const depReactions = convertDependencies(effectiveSchema, '')
  if (depReactions.length > 0) {
    result.reactions = [...(result.reactions ?? []), ...depReactions]
  }

  return result
}

/**
 * 将标准 oneOf/anyOf 转换为表单 oneOf + discriminator
 *
 * 自动检测鉴别器字段：如果每个分支都有一个 properties.xxx.const，
 * 且 xxx 在所有分支中相同，则以 xxx 为鉴别器。
 */
function convertStandardOneOf(
  schemas: StandardJsonSchema[],
  options: JsonSchemaAdapterOptions,
): { branches: NonNullable<ISchema['oneOf']>, discriminator?: string } | undefined {
  if (schemas.length === 0) return undefined

  /* 尝试检测鉴别器 */
  let discriminator: string | undefined
  const constFields = schemas.map((s) => {
    if (!s.properties) return null
    for (const [key, prop] of Object.entries(s.properties)) {
      if (isObject(prop) && prop.const !== undefined) {
        return { field: key, value: prop.const }
      }
    }
    return null
  })

  /* 检查所有分支是否有同一个 const 鉴别字段 */
  const allHaveConst = constFields.every(c => c !== null)
  if (allHaveConst) {
    const fields = constFields.map(c => c!.field)
    const uniqueFields = new Set(fields)
    if (uniqueFields.size === 1) {
      discriminator = fields[0]
    }
  }

  const branches: NonNullable<ISchema['oneOf']> = schemas.map((s, index) => {
    const constInfo = constFields[index]

    /* 构建 when 条件 */
    let when: Record<string, unknown> | string
    if (discriminator && constInfo) {
      when = { [discriminator]: constInfo.value }
    }
    else {
      /* 无法推断鉴别器，使用索引标识（降级处理） */
      when = `{{$values.__oneOfIndex === ${index}}}`
    }

    /* 转换分支的 properties */
    const properties: Record<string, ISchema> = {}
    if (s.properties) {
      for (const [key, propSchema] of Object.entries(s.properties)) {
        /* 跳过鉴别器字段本身（它在主 properties 中定义） */
        if (key === discriminator) continue
        properties[key] = convertNode(key, propSchema, '', options)
      }

      /* 分支内的 required */
      if (isArray(s.required)) {
        for (const reqField of s.required as string[]) {
          if (properties[reqField]) {
            properties[reqField].required = true
          }
        }
      }
    }

    return { when, properties }
  })

  return { branches, discriminator }
}

/**
 * 将表单 ISchema 导出为标准 JSON Schema
 *
 * 反向转换，用于数据交换场景（导出给后端、生成 OpenAPI Spec 等）。
 * 仅转换标准 JSON Schema 可表达的部分，表单专有属性（reactions、component 等）会被忽略。
 *
 * @param formSchema - 表单 ISchema
 * @returns 标准 JSON Schema
 */
export function toJsonSchema(formSchema: ISchema): StandardJsonSchema {
  const result: StandardJsonSchema = {}

  /* 类型 */
  if (formSchema.type && formSchema.type !== 'void') {
    result.type = formSchema.type === 'date' ? 'string' : formSchema.type
    /* date 类型加 format */
    if (formSchema.type === 'date') {
      result.format = 'date'
    }
  }

  /* 元信息 */
  if (formSchema.title) result.title = formSchema.title
  if (formSchema.description) result.description = formSchema.description
  if (formSchema.default !== undefined) result.default = formSchema.default
  if (formSchema.readOnly) result.readOnly = true

  /* 枚举 */
  if (formSchema.enum) {
    result.enum = formSchema.enum.map(item =>
      isObject(item) && 'value' in item ? (item as { value: unknown }).value : item,
    )
  }

  /* 验证规则 → 约束 */
  if (formSchema.rules) {
    for (const rule of formSchema.rules) {
      if (rule.minLength !== undefined) result.minLength = rule.minLength
      if (rule.maxLength !== undefined) result.maxLength = rule.maxLength
      if (rule.min !== undefined) result.minimum = rule.min
      if (rule.max !== undefined) result.maximum = rule.max
      if (rule.exclusiveMin !== undefined) result.exclusiveMinimum = rule.exclusiveMin
      if (rule.exclusiveMax !== undefined) result.exclusiveMaximum = rule.exclusiveMax
      if (rule.pattern !== undefined) {
        result.pattern = rule.pattern instanceof RegExp ? rule.pattern.source : rule.pattern
      }
      if (rule.format) result.format = rule.format
    }
  }

  /* 子属性 */
  if (formSchema.properties) {
    result.properties = {}
    const requiredFields: string[] = []

    for (const [key, childSchema] of Object.entries(formSchema.properties)) {
      result.properties[key] = toJsonSchema(childSchema)
      if (childSchema.required === true) {
        requiredFields.push(key)
      }
    }

    if (requiredFields.length > 0) {
      result.required = requiredFields
    }
  }

  /* 数组项 */
  if (formSchema.items) {
    result.items = toJsonSchema(formSchema.items)
  }
  if (formSchema.minItems !== undefined) result.minItems = formSchema.minItems
  if (formSchema.maxItems !== undefined) result.maxItems = formSchema.maxItems

  /* definitions */
  if (formSchema.definitions) {
    result.definitions = {}
    for (const [key, defSchema] of Object.entries(formSchema.definitions)) {
      result.definitions[key] = toJsonSchema(defSchema)
    }
  }

  /* $ref */
  if (formSchema.$ref) result.$ref = formSchema.$ref

  return result
}
