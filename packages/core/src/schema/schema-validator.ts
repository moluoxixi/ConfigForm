import type { ISchema, SchemaType } from './types'

/**
 * Schema 验证错误
 */
export interface SchemaValidationError {
  /** 错误路径（Schema 内的位置，如 'properties.username.rules.0'） */
  path: string
  /** 错误消息 */
  message: string
  /** 错误级别 */
  level: 'error' | 'warning'
}

/**
 * Schema 验证结果
 */
export interface SchemaValidationResult {
  /** 是否有效（无 error 级别错误） */
  valid: boolean
  /** 错误列表 */
  errors: SchemaValidationError[]
  /** 警告列表（不影响 valid） */
  warnings: SchemaValidationError[]
}

/** 合法的 type 值 */
const VALID_TYPES: Set<SchemaType> = new Set([
  'string', 'number', 'boolean', 'date', 'array', 'object', 'void',
])

/** 合法的 pattern 值 */
const VALID_PATTERNS = new Set(['editable', 'readOnly', 'disabled', 'preview'])

/** 合法的验证触发时机 */
const VALID_TRIGGERS = new Set(['change', 'blur', 'submit'])

/**
 * 验证 ISchema 结构的正确性
 *
 * 在 Schema 编译前执行，尽早发现配置错误，避免运行时异常。
 * 检查内容：
 * - type 值合法性
 * - properties / items 结构正确性
 * - 组件配置有效性
 * - 验证规则结构
 * - 联动规则结构
 * - $ref 引用有效性
 * - oneOf 分支结构
 *
 * @param schema - 要验证的 Schema
 * @returns 验证结果
 *
 * @example
 * ```ts
 * const result = validateSchema(mySchema)
 * if (!result.valid) {
 *   console.error('Schema 配置错误:')
 *   for (const err of result.errors) {
 *     console.error(`  ${err.path}: ${err.message}`)
 *   }
 * }
 * ```
 */
export function validateSchema(schema: ISchema): SchemaValidationResult {
  const errors: SchemaValidationError[] = []
  const warnings: SchemaValidationError[] = []

  validateNode(schema, '', errors, warnings, schema.definitions)

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * 递归验证单个 Schema 节点
 */
function validateNode(
  schema: ISchema,
  path: string,
  errors: SchemaValidationError[],
  warnings: SchemaValidationError[],
  definitions?: Record<string, ISchema>,
): void {
  /* type 合法性 */
  if (schema.type !== undefined && !VALID_TYPES.has(schema.type)) {
    errors.push({
      path: joinPath(path, 'type'),
      message: `无效的 type "${schema.type}"，允许值: ${Array.from(VALID_TYPES).join(', ')}`,
      level: 'error',
    })
  }

  /* pattern 合法性 */
  if (schema.pattern !== undefined && !VALID_PATTERNS.has(schema.pattern)) {
    errors.push({
      path: joinPath(path, 'pattern'),
      message: `无效的 pattern "${schema.pattern}"，允许值: ${Array.from(VALID_PATTERNS).join(', ')}`,
      level: 'error',
    })
  }

  /* array 类型必须有 items */
  if (schema.type === 'array' && !schema.items) {
    warnings.push({
      path,
      message: 'type 为 "array" 但未定义 items，数组项将无法渲染',
      level: 'warning',
    })
  }

  /* items 只在 array 类型中有意义 */
  if (schema.items && schema.type !== 'array') {
    warnings.push({
      path: joinPath(path, 'items'),
      message: 'items 仅在 type="array" 时有效，当前 type=' + (schema.type ?? '未指定'),
      level: 'warning',
    })
  }

  /* properties 只在 object/void 类型中有意义 */
  if (schema.properties && schema.type !== undefined
    && schema.type !== 'object' && schema.type !== 'void') {
    warnings.push({
      path: joinPath(path, 'properties'),
      message: `properties 通常用于 type="object" 或 type="void"，当前 type="${schema.type}"`,
      level: 'warning',
    })
  }

  /* minItems / maxItems 只在 array 类型有意义 */
  if ((schema.minItems !== undefined || schema.maxItems !== undefined) && schema.type !== 'array') {
    warnings.push({
      path,
      message: 'minItems/maxItems 仅在 type="array" 时有效',
      level: 'warning',
    })
  }

  if (schema.minItems !== undefined && schema.maxItems !== undefined
    && schema.minItems > schema.maxItems) {
    errors.push({
      path,
      message: `minItems (${schema.minItems}) 不能大于 maxItems (${schema.maxItems})`,
      level: 'error',
    })
  }

  /* $ref 引用有效性 */
  if (schema.$ref) {
    if (!schema.$ref.startsWith('#/definitions/')) {
      errors.push({
        path: joinPath(path, '$ref'),
        message: `$ref 格式无效 "${schema.$ref}"，应为 "#/definitions/<name>"`,
        level: 'error',
      })
    }
    else {
      const refName = schema.$ref.replace('#/definitions/', '')
      if (!definitions || !(refName in definitions)) {
        errors.push({
          path: joinPath(path, '$ref'),
          message: `$ref 引用的定义 "${refName}" 不存在于 definitions 中`,
          level: 'error',
        })
      }
    }
  }

  /* enum 格式检查 */
  if (schema.enum) {
    if (!Array.isArray(schema.enum)) {
      errors.push({
        path: joinPath(path, 'enum'),
        message: 'enum 必须是数组',
        level: 'error',
      })
    }
    else if (schema.enum.length === 0) {
      warnings.push({
        path: joinPath(path, 'enum'),
        message: 'enum 为空数组，选择器将没有选项',
        level: 'warning',
      })
    }
  }

  /* rules 格式检查 */
  if (schema.rules) {
    if (!Array.isArray(schema.rules)) {
      errors.push({
        path: joinPath(path, 'rules'),
        message: 'rules 必须是数组',
        level: 'error',
      })
    }
    else {
      schema.rules.forEach((rule, index) => {
        if (typeof rule !== 'object' || rule === null) {
          errors.push({
            path: joinPath(path, `rules.${index}`),
            message: '验证规则必须是对象',
            level: 'error',
          })
        }
      })
    }
  }

  /* validateTrigger 检查 */
  if (schema.validateTrigger) {
    const triggers = Array.isArray(schema.validateTrigger)
      ? schema.validateTrigger
      : [schema.validateTrigger]
    for (const trigger of triggers) {
      if (!VALID_TRIGGERS.has(trigger)) {
        errors.push({
          path: joinPath(path, 'validateTrigger'),
          message: `无效的验证触发时机 "${trigger}"，允许值: ${Array.from(VALID_TRIGGERS).join(', ')}`,
          level: 'error',
        })
      }
    }
  }

  /* reactions 格式检查 */
  if (schema.reactions) {
    if (!Array.isArray(schema.reactions)) {
      errors.push({
        path: joinPath(path, 'reactions'),
        message: 'reactions 必须是数组',
        level: 'error',
      })
    }
    else {
      schema.reactions.forEach((reaction, index) => {
        if (!reaction.watch) {
          errors.push({
            path: joinPath(path, `reactions.${index}`),
            message: 'reaction 必须指定 watch 属性',
            level: 'error',
          })
        }
        if (!reaction.fulfill && !reaction.when) {
          warnings.push({
            path: joinPath(path, `reactions.${index}`),
            message: 'reaction 未定义 when 或 fulfill，不会产生任何效果',
            level: 'warning',
          })
        }
      })
    }
  }

  /* oneOf 格式检查 */
  if (schema.oneOf) {
    if (!Array.isArray(schema.oneOf)) {
      errors.push({
        path: joinPath(path, 'oneOf'),
        message: 'oneOf 必须是数组',
        level: 'error',
      })
    }
    else {
      schema.oneOf.forEach((branch, index) => {
        if (!branch.when) {
          errors.push({
            path: joinPath(path, `oneOf.${index}`),
            message: 'oneOf 分支必须指定 when 条件',
            level: 'error',
          })
        }
        if (!branch.properties) {
          warnings.push({
            path: joinPath(path, `oneOf.${index}`),
            message: 'oneOf 分支未定义 properties，分支无字段可渲染',
            level: 'warning',
          })
        }
      })
    }
  }

  /* span 检查 */
  if (schema.span !== undefined) {
    if (typeof schema.span !== 'number' || schema.span < 1 || schema.span > 24) {
      warnings.push({
        path: joinPath(path, 'span'),
        message: `span 建议为 1-24 之间的数值，当前值: ${schema.span}`,
        level: 'warning',
      })
    }
  }

  /* 递归验证子节点 */
  if (schema.properties) {
    for (const [childName, childSchema] of Object.entries(schema.properties)) {
      validateNode(childSchema, joinPath(path, `properties.${childName}`), errors, warnings, definitions)
    }
  }

  if (schema.items) {
    validateNode(schema.items, joinPath(path, 'items'), errors, warnings, definitions)
  }

  /* 递归验证 definitions */
  if (schema.definitions) {
    for (const [defName, defSchema] of Object.entries(schema.definitions)) {
      validateNode(defSchema, joinPath(path, `definitions.${defName}`), errors, warnings, definitions)
    }
  }
}

/** 路径拼接 */
function joinPath(parent: string, child: string): string {
  return parent ? `${parent}.${child}` : child
}
