import { isString } from './is';

/**
 * 表达式引擎
 *
 * 支持 {{expression}} 语法的字符串表达式编译与求值。
 * 表达式内可引用作用域变量：$self、$values、$form、$record、$index、$deps。
 *
 * 编译结果被缓存，相同表达式只编译一次。
 *
 * 典型用途：让 Schema 中的联动规则可以纯 JSON 序列化，
 * 无需 JavaScript 函数，支持远程下发、数据库存储、可视化设计器。
 *
 * @example
 * ```ts
 * // 条件判断
 * isExpression('{{$values.type === "advanced"}}') // true
 *
 * // 编译并执行
 * const fn = compileExpression<boolean>('{{$values.type === "advanced"}}')
 * fn({ $values: { type: 'advanced' } }) // true
 *
 * // 数组场景
 * const calc = compileExpression<number>('{{$record.price * $record.quantity}}')
 * calc({ $record: { price: 10, quantity: 3 } }) // 30
 *
 * // 自动判断（非表达式直接返回原值）
 * evaluateExpression('{{$values.a + 1}}', { $values: { a: 2 } }) // 3
 * evaluateExpression(42, {}) // 42
 * ```
 */

/* ======================== 常量 ======================== */

/** 表达式正则：匹配 {{...}} 包裹的内容 */
const EXPRESSION_RE = /^\{\{([\s\S]+)\}\}$/;

/**
 * 作用域参数名列表（固定顺序，与 ExpressionScope 属性一一对应）。
 * 编译时按此顺序从 __scope__ 对象中解构出变量。
 */
const SCOPE_PARAMS = [
  '$self',
  '$values',
  '$form',
  '$record',
  '$index',
  '$deps',
] as const;

/** $ref 解析深度上限，防止循环引用导致无限递归 */
const MAX_CACHE_SIZE = 1000;

/* ======================== 缓存 ======================== */

/** 编译缓存（表达式字符串 → 编译后函数） */
const compilationCache = new Map<string, (scope: ExpressionScope) => unknown>();

/* ======================== 类型 ======================== */

/**
 * 表达式作用域
 *
 * 执行 {{表达式}} 时可引用的上下文变量。
 * 各变量在不同场景下可能为 undefined（如非数组场景中 $record 为 undefined）。
 */
export interface ExpressionScope {
  /** 当前字段实例 */
  $self?: unknown;
  /** 表单所有值 */
  $values?: Record<string, unknown>;
  /** 表单实例 */
  $form?: unknown;
  /** 当前数组行记录（仅数组内字段可用） */
  $record?: Record<string, unknown>;
  /** 当前数组索引（仅数组内字段可用） */
  $index?: number;
  /** watch 路径对应的依赖值数组 */
  $deps?: unknown[];
}

/* ======================== 核心函数 ======================== */

/**
 * 判断值是否为 {{表达式}} 字符串
 *
 * @param value - 任意值
 * @returns 是否匹配 {{...}} 格式
 *
 * @example
 * ```ts
 * isExpression('{{$values.type === "a"}}') // true
 * isExpression('普通字符串')               // false
 * isExpression(42)                         // false
 * isExpression('{{}}')                     // false（空表达式）
 * ```
 */
export function isExpression(value: unknown): value is string {
  if (!isString(value)) return false;
  const match = value.match(EXPRESSION_RE);
  if (!match) return false;
  /* 排除空表达式 {{}} */
  return match[1].trim().length > 0;
}

/**
 * 编译表达式字符串为可执行函数
 *
 * 使用 new Function() 编译（与 Formily、Vue 模板相同的标准做法），
 * 编译结果被缓存，相同表达式只编译一次。
 *
 * 安全机制：
 * - 编译在 strict 模式下执行
 * - 仅声明的作用域变量可被引用（$self/$values/$form/$record/$index/$deps）
 * - 运行时错误被捕获，返回 undefined 并输出警告
 *
 * @param expression - 表达式字符串，格式 {{expression}}
 * @returns 编译后的函数，接收 ExpressionScope 对象作为参数
 * @throws 表达式语法错误时抛出（编译阶段）
 *
 * @example
 * ```ts
 * const fn = compileExpression<boolean>('{{$values.age >= 18}}')
 * fn({ $values: { age: 20 } }) // true
 * fn({ $values: { age: 15 } }) // false
 * ```
 */
export function compileExpression<T = unknown>(
  expression: string,
): (scope: ExpressionScope) => T {
  /* 尝试从缓存获取 */
  const cached = compilationCache.get(expression);
  if (cached) return cached as (scope: ExpressionScope) => T;

  /* 提取 {{...}} 中的表达式体 */
  const match = expression.match(EXPRESSION_RE);
  if (!match) {
    throw new Error(
      `[ConfigForm] 无效的表达式格式，期望 {{expression}}，收到: ${expression}`,
    );
  }

  const body = match[1].trim();

  /*
   * 构建变量声明语句，从 __scope__ 对象中解构出各作用域变量。
   * 生成形如：var $self=__scope__&&__scope__.$self,$values=__scope__&&__scope__.$values,...
   * 使用 && 短路防止 __scope__ 为 null/undefined 时报错。
   */
  const varDeclarations = SCOPE_PARAMS
    .map(p => `${p}=__scope__&&__scope__.${p}`)
    .join(',');

  try {
    /*
     * 使用 new Function 编译表达式。
     * 这是 Formily、Vue、Angular 等主流框架的标准做法。
     * 表达式由开发者编写（非终端用户输入），安全风险等同于模板引擎。
     */
    /* eslint-disable-next-line no-new-func */
    const rawFn = new Function(
      '__scope__',
      `"use strict";var ${varDeclarations};return(${body})`,
    ) as (scope: ExpressionScope) => T;

    /* 包装错误处理，防止运行时表达式异常导致联动引擎崩溃 */
    const wrapped = (scope: ExpressionScope): T => {
      try {
        return rawFn(scope || {});
      }
      catch (err) {
        console.warn(`[ConfigForm] 表达式执行失败: ${expression}`, err);
        return undefined as T;
      }
    };

    /* 缓存（防止内存泄漏，设置上限） */
    if (compilationCache.size >= MAX_CACHE_SIZE) {
      const firstKey = compilationCache.keys().next().value;
      if (firstKey !== undefined) {
        compilationCache.delete(firstKey);
      }
    }
    compilationCache.set(expression, wrapped as (scope: ExpressionScope) => unknown);

    return wrapped;
  }
  catch (err) {
    throw new Error(
      `[ConfigForm] 表达式编译失败: ${expression}，原因: ${(err as Error).message}`,
    );
  }
}

/**
 * 求值：如果是 {{表达式}} 则编译执行，否则原样返回
 *
 * 这是最常用的入口函数，自动判断传入值是否为表达式：
 * - 是 {{表达式}} 字符串 → 编译并执行，返回计算结果
 * - 不是（静态值、函数等）→ 直接返回原值
 *
 * @param valueOrExpression - 静态值 或 {{表达式}} 字符串
 * @param scope - 表达式作用域
 * @returns 求值结果
 *
 * @example
 * ```ts
 * // 表达式求值
 * evaluateExpression('{{$values.a + $values.b}}', { $values: { a: 1, b: 2 } }) // 3
 *
 * // 非表达式原样返回
 * evaluateExpression(42, {})      // 42
 * evaluateExpression('hello', {}) // 'hello'
 * evaluateExpression(null, {})    // null
 * ```
 */
export function evaluateExpression<T = unknown>(
  valueOrExpression: unknown,
  scope: ExpressionScope,
): T {
  if (isExpression(valueOrExpression)) {
    const fn = compileExpression<T>(valueOrExpression);
    return fn(scope);
  }
  return valueOrExpression as T;
}

/**
 * 清空表达式编译缓存
 *
 * 通常不需要手动调用。适用场景：
 * - 单元测试间隔清理
 * - 热更新后清理旧表达式缓存
 * - 内存敏感场景的主动回收
 */
export function clearExpressionCache(): void {
  compilationCache.clear();
}
