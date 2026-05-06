import type { RuntimeToken } from '@/types'

/**
 * Token 是插件 resolve 生命周期的分发标记。
 *
 * 配置声明时无法拿到运行时上下文（表单值、i18n 实例等），
 * 所以插件用 createRuntimeToken 创建一个"占位对象"写入配置，
 * resolveValue 遍历配置时靠 __configFormToken 查表找到对应的 resolver，
 * 把 token 连同上下文交给 resolver 处理，拿回真实值。
 *
 * 流程：插件定义 token 类型 → 用户在配置中使用 → resolveValue 识别并分发 → 插件 resolver 产出最终值
 */

/**
 * 创建运行时 token。
 *
 * type 参数是插件 resolver 的匹配 key，对应插件注册时 tokens 表的同名键。
 * payload 中的字段会原样传给 token resolver，语义由插件自行约定。
 */
export function createRuntimeToken<TValue = unknown, TType extends string = string>(
  type: TType,
): RuntimeToken<TValue, TType>
/** 创建带 payload 的运行时 token；payload 会原样传给 token resolver。 */
export function createRuntimeToken<
  TValue = unknown,
  TType extends string = string,
  TPayload extends Record<string, unknown> = Record<string, unknown>,
>(
  type: TType,
  payload: TPayload,
): RuntimeToken<TValue, TType> & TPayload
/**
 * 创建运行时 token 的实际对象结构。
 *
 * __configFormToken 始终在 payload 之后写入，确保类型 key 不被覆盖。
 */
export function createRuntimeToken<TValue = unknown, TType extends string = string>(
  type: TType,
  payload: Record<string, unknown> = {},
): RuntimeToken<TValue, TType> & Record<string, unknown> {
  return {
    ...payload,
    __configFormToken: type,
  } as RuntimeToken<TValue, TType> & Record<string, unknown>
}

/** 判断未知值是否是 runtime token；resolveValue 用此守卫识别并分发。 */
export function isRuntimeToken<TValue = unknown>(value: unknown): value is RuntimeToken<TValue> {
  return Boolean(
    value
    && typeof value === 'object'
    && typeof (value as { __configFormToken?: unknown }).__configFormToken === 'string',
  )
}
