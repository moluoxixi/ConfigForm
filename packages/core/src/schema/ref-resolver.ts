import type { ISchema } from './types';
import { isObject } from '../shared';
import { mergeSchema } from './merge';

/**
 * $ref 解析深度上限。
 * 防止循环引用（如 A → B → A）导致无限递归。
 */
const MAX_REF_DEPTH = 10;

/**
 * $ref 路径格式正则。
 *
 * 支持 JSON Pointer 格式：`#/definitions/<name>`
 * name 支持字母、数字、下划线、连字符、点号。
 */
const REF_PATH_RE = /^#\/definitions\/([a-zA-Z0-9_\-.]+)$/;

/**
 * 解析单个 $ref 引用
 *
 * 将 `{ $ref: '#/definitions/xxx', ...localProps }` 解析为完整 Schema：
 * 1. 从 definitions 中查找被引用的 Schema
 * 2. 以被引用 Schema 为基础，用本地属性覆盖
 *
 * @param schema - 包含 $ref 的 Schema 节点
 * @param definitions - 可用的 definitions 定义
 * @returns 解析后的 Schema（不含 $ref）
 */
function resolveRef(
  schema: ISchema,
  definitions: Record<string, ISchema>,
): ISchema {
  if (!schema.$ref) return schema;

  const match = schema.$ref.match(REF_PATH_RE);
  if (!match) {
    console.warn(
      `[ConfigForm] 无法解析 $ref: "${schema.$ref}"，`
      + `期望格式 #/definitions/<name>`,
    );
    return schema;
  }

  const defName = match[1];
  const definition = definitions[defName];
  if (!definition) {
    console.warn(`[ConfigForm] $ref 未找到定义: "${defName}"`);
    return schema;
  }

  /*
   * 合并策略：definition 为基础，本地属性（排除 $ref）为覆盖。
   * 例如 { $ref: '#/definitions/address', title: '家庭地址' }
   * → mergeSchema(definitions.address, { title: '家庭地址' })
   */
  const { $ref: _, definitions: __, ...localProps } = schema;
  return mergeSchema(definition, localProps);
}

/**
 * 递归解析 Schema 树中所有 $ref 引用
 *
 * 遍历整个 Schema 树（包括 properties、items），将所有 $ref 替换为实际定义。
 * definitions 从根 Schema 继承，子节点也可以声明自己的 definitions。
 *
 * 安全机制：
 * - 深度超过 MAX_REF_DEPTH（10）时停止解析，防止循环引用
 * - $ref 指向不存在的定义时输出警告并保留原节点
 *
 * @param schema - 待解析的 Schema
 * @param definitions - 可用的 definitions（默认从 schema.definitions 读取）
 * @param depth - 当前递归深度（内部使用）
 * @returns 解析后的 Schema（所有 $ref 已替换）
 *
 * @example
 * ```ts
 * const schema: ISchema = {
 *   type: 'object',
 *   definitions: {
 *     address: {
 *       type: 'object',
 *       properties: {
 *         city: { type: 'string', title: '城市' },
 *       },
 *     },
 *   },
 *   properties: {
 *     home: { $ref: '#/definitions/address', title: '家庭地址' },
 *     work: { $ref: '#/definitions/address', title: '工作地址' },
 *   },
 * }
 *
 * const resolved = resolveSchemaRefs(schema)
 * // resolved.properties.home = { type: 'object', title: '家庭地址', properties: { city: ... } }
 * // resolved.properties.work = { type: 'object', title: '工作地址', properties: { city: ... } }
 * ```
 */
export function resolveSchemaRefs(
  schema: ISchema,
  definitions?: Record<string, ISchema>,
  depth: number = 0,
): ISchema {
  /* 深度保护 */
  if (depth > MAX_REF_DEPTH) {
    console.warn(
      `[ConfigForm] $ref 解析深度超过 ${MAX_REF_DEPTH} 层，可能存在循环引用，停止解析`,
    );
    return schema;
  }

  /* 合并 definitions 来源：当前节点的 definitions 优先于继承的 */
  const defs: Record<string, ISchema> = {
    ...definitions,
    ...schema.definitions,
  };

  /* 如果当前节点没有 definitions 且没有继承的 definitions，无需处理 $ref */
  const hasDefs = Object.keys(defs).length > 0;

  /* 解析当前节点的 $ref */
  let resolved = schema;
  if (schema.$ref && hasDefs) {
    resolved = resolveRef(schema, defs);
    /* 被引用的 Schema 可能也包含 $ref，递归解析 */
    if (resolved.$ref) {
      resolved = resolveSchemaRefs(resolved, defs, depth + 1);
    }
  }

  /* 没有 definitions，子节点也无需解析 */
  if (!hasDefs) return resolved;

  /* 递归解析 properties 中的 $ref */
  if (resolved.properties) {
    let hasChanges = false;
    const resolvedProps: Record<string, ISchema> = {};

    for (const [key, child] of Object.entries(resolved.properties)) {
      const resolvedChild = resolveSchemaRefs(child, defs, depth + 1);
      if (resolvedChild !== child) hasChanges = true;
      resolvedProps[key] = resolvedChild;
    }

    /* 只在有变化时创建新对象，减少不必要的对象分配 */
    if (hasChanges) {
      resolved = { ...resolved, properties: resolvedProps };
    }
  }

  /* 递归解析 items 中的 $ref */
  if (resolved.items && isObject(resolved.items)) {
    const resolvedItems = resolveSchemaRefs(resolved.items, defs, depth + 1);
    if (resolvedItems !== resolved.items) {
      resolved = { ...resolved, items: resolvedItems };
    }
  }

  /* 递归解析 definitions 自身内部的交叉引用 */
  if (resolved.definitions) {
    let defHasChanges = false;
    const resolvedDefs: Record<string, ISchema> = {};

    for (const [key, def] of Object.entries(resolved.definitions)) {
      const resolvedDef = resolveSchemaRefs(def, defs, depth + 1);
      if (resolvedDef !== def) defHasChanges = true;
      resolvedDefs[key] = resolvedDef;
    }

    if (defHasChanges) {
      resolved = { ...resolved, definitions: resolvedDefs };
    }
  }

  return resolved;
}
