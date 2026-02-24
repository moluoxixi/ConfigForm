import type { ValidationRule } from '@moluoxixi/core'
import type { SceneConfig } from '../types'

/**
 * 场景：异步验证
 *
 * 覆盖：用户名唯一性 / 邮箱可用性 / 邀请码 / 防抖 + AbortSignal
 */

/** 已注册用户名列表 */
const REGISTERED = ['admin', 'test', 'root', 'user']

/** 已注册邮箱列表 */
const REGISTERED_EMAILS = ['admin@test.com', 'test@test.com']

/** 有效邀请码列表 */
const VALID_CODES = ['INVITE2024', 'VIP888', 'NEWUSER']

/**
 * 可取消的延迟函数
 * @param ms 参数 `ms`用于提供当前函数执行所需的输入信息。
 * @param signal 参数 `signal`用于提供当前函数执行所需的输入信息。
 * @returns 返回 Promise 异步结果，调用方应通过 await 或 then 获取最终数据。
 */
function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new Error('取消'))
    })
  })
}

/** 用户名验证规则：长度 + 异步唯一性检查 */
const usernameRules: ValidationRule[] = [
  { minLength: 3, maxLength: 20, message: '3-20 字符' },
  {
    /**
     * asyncValidator：执行当前功能逻辑。
     *
     * @param v 参数 v 的输入说明。
     * @param _r 参数 _r 的输入说明。
     * @param _c 参数 _c 的输入说明。
     * @param signal 参数 signal 的输入说明。
     *
     * @returns 返回当前功能的处理结果。
     */

    asyncValidator: async (v: unknown, _r: unknown, _c: unknown, signal: AbortSignal): Promise<string | undefined> => {
      await delay(800, signal)
      if (REGISTERED.includes(String(v).toLowerCase()))
        return `"${v}" 已被注册`
      return undefined
    },
    trigger: 'blur',
    debounce: 300,
  },
]

/** 邮箱验证规则：格式 + 异步可用性检查 */
const emailRules: ValidationRule[] = [
  { format: 'email', message: '无效邮箱' },
  {
    /**
     * asyncValidator：执行当前功能逻辑。
     *
     * @param v 参数 v 的输入说明。
     * @param _r 参数 _r 的输入说明。
     * @param _c 参数 _c 的输入说明。
     * @param signal 参数 signal 的输入说明。
     *
     * @returns 返回当前功能的处理结果。
     */

    asyncValidator: async (v: unknown, _r: unknown, _c: unknown, signal: AbortSignal): Promise<string | undefined> => {
      if (!v)
        return undefined
      await delay(800, signal)
      if (REGISTERED_EMAILS.includes(String(v).toLowerCase()))
        return '邮箱已注册'
      return undefined
    },
    trigger: 'blur',
    debounce: 500,
  },
]

/** 邀请码验证规则：长度 + 异步有效性检查 */
const inviteCodeRules: ValidationRule[] = [
  { minLength: 3, message: '至少 3 字符' },
  {
    /**
     * asyncValidator：执行当前功能逻辑。
     *
     * @param v 参数 v 的输入说明。
     * @param _r 参数 _r 的输入说明。
     * @param _c 参数 _c 的输入说明。
     * @param signal 参数 signal 的输入说明。
     *
     * @returns 返回当前功能的处理结果。
     */

    asyncValidator: async (v: unknown, _r: unknown, _c: unknown, signal: AbortSignal): Promise<string | undefined> => {
      if (!v)
        return undefined
      await delay(1000, signal)
      if (!VALID_CODES.includes(String(v).toUpperCase()))
        return '邀请码无效'
      return undefined
    },
    trigger: 'blur',
    debounce: 300,
  },
]

/**
 * config：定义该模块复用的常量配置。
 * 所属模块：`playground/shared/src/03-validation/AsyncValidationForm.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const config: SceneConfig = {
  title: '异步验证',
  description: '用户名唯一性 / 邮箱可用性 / 邀请码 / 防抖 + AbortSignal',

  initialValues: { username: '', email: '', inviteCode: '', nickname: '' },

  schema: {
    type: 'object',
    decoratorProps: { actions: { submit: '提交', reset: '重置' }, labelPosition: 'right', labelWidth: '140px' },
    properties: {
      username: { type: 'string', title: '用户名', required: true, componentProps: { placeholder: '试试 admin / test' }, rules: usernameRules },
      email: { type: 'string', title: '邮箱', required: true, componentProps: { placeholder: '试试 admin@test.com' }, rules: emailRules },
      inviteCode: { type: 'string', title: '邀请码', required: true, componentProps: { placeholder: 'INVITE2024 / VIP888' }, rules: inviteCodeRules },
      nickname: { type: 'string', title: '昵称', componentProps: { placeholder: '无需异步验证' }, rules: [{ maxLength: 20, message: '不超过 20 字' }] },
    },
  },
}

export default config
