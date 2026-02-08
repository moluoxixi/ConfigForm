/**
 * 场景 12：异步验证 (Field 版)
 *
 * 覆盖：
 * - 用户名唯一性校验（异步 + 防抖 + AbortSignal 取消）
 * - 邮箱可用性校验（异步远程规则）
 * - 邀请码校验（异步 + loading 状态）
 * - 三种模式切换
 *
 * FormField + fieldProps 实现
 */
import React from 'react'
import { observer } from 'mobx-react-lite'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'

setupAntd()

/** 模拟已注册用户名 */
const REGISTERED_USERNAMES = ['admin', 'test', 'root', 'user', 'demo', 'zhangsan']

/** 模拟已注册邮箱 */
const REGISTERED_EMAILS = ['admin@test.com', 'test@test.com', 'user@example.com']

/** 合法邀请码 */
const VALID_INVITE_CODES = ['INVITE2024', 'VIP888', 'NEWUSER']

/** 模拟异步延迟 */
const ASYNC_DELAY = 800

/**
 * 模拟异步请求（带取消支持）
 *
 * @param ms - 延迟毫秒
 * @param signal - AbortSignal
 */
function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new Error('已取消'))
    })
  })
}

/** 默认初始值 */
const INITIAL_VALUES: Record<string, unknown> = {
  username: '',
  email: '',
  inviteCode: '',
  phone: '',
  nickname: '',
}

/**
 * 异步验证示例（Field 版）
 */
export const AsyncValidationForm = observer((): React.ReactElement => {
  const form = useCreateForm({
    initialValues: { ...INITIAL_VALUES },
  })

  return (
    <div>
      <h2>异步验证 (Field 版)</h2>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>
        用户名唯一性 / 邮箱可用性 / 邀请码有效性 / 防抖 + AbortSignal 取消 —— FormField + fieldProps 实现
      </p>

      <div style={{ padding: '8px 16px', marginBottom: 16, background: '#e6f4ff', border: '1px solid #91caff', borderRadius: 6, fontSize: 13 }}>
        测试数据：已注册用户名 <code>admin / test / root</code>，已注册邮箱 <code>admin@test.com</code>，有效邀请码 <code>INVITE2024 / VIP888</code>
      </div>

      <StatusTabs>
        {({ mode, showResult, showErrors }) => {
          form.pattern = mode
          return (
            <FormProvider form={form}>
              <form onSubmit={async (e: React.FormEvent) => {
                e.preventDefault()
                const res = await form.submit()
                if (res.errors.length > 0) showErrors(res.errors)
                else showResult(res.values)
              }} noValidate>
                {/* 用户名唯一性校验 */}
                <FormField name="username" fieldProps={{
                  label: '用户名',
                  required: true,
                  component: 'Input',
                  componentProps: { placeholder: '试试输入 admin / test / root' },
                  description: '失焦后异步检查用户名是否已注册',
                  rules: [
                    { minLength: 3, maxLength: 20, message: '用户名 3-20 个字符' },
                    { pattern: /^\w+$/, message: '只能包含字母、数字和下划线' },
                    {
                      asyncValidator: async (value, _rule, _context, signal) => {
                        await delay(ASYNC_DELAY, signal)
                        if (REGISTERED_USERNAMES.includes(String(value).toLowerCase())) {
                          return `用户名 "${value}" 已被注册`
                        }
                        return undefined
                      },
                      trigger: 'blur',
                      debounce: 300,
                      message: '正在检查用户名可用性...',
                    },
                  ],
                }}
                />

                {/* 邮箱可用性校验 */}
                <FormField name="email" fieldProps={{
                  label: '邮箱',
                  required: true,
                  component: 'Input',
                  componentProps: { placeholder: '试试输入 admin@test.com' },
                  description: '异步检查邮箱是否已注册',
                  rules: [
                    { format: 'email', message: '请输入有效邮箱' },
                    {
                      asyncValidator: async (value, _rule, _context, signal) => {
                        if (!value) return undefined
                        await delay(ASYNC_DELAY, signal)
                        if (REGISTERED_EMAILS.includes(String(value).toLowerCase())) {
                          return '该邮箱已被注册，请使用其他邮箱'
                        }
                        return undefined
                      },
                      trigger: 'blur',
                      debounce: 500,
                      message: '正在检查邮箱可用性...',
                    },
                  ],
                }}
                />

                {/* 邀请码校验 */}
                <FormField name="inviteCode" fieldProps={{
                  label: '邀请码',
                  required: true,
                  component: 'Input',
                  componentProps: { placeholder: '试试输入 INVITE2024 / VIP888' },
                  description: '异步验证邀请码有效性',
                  rules: [
                    { minLength: 3, message: '邀请码至少 3 个字符' },
                    {
                      asyncValidator: async (value, _rule, _context, signal) => {
                        if (!value) return undefined
                        await delay(ASYNC_DELAY + 200, signal)
                        if (!VALID_INVITE_CODES.includes(String(value).toUpperCase())) {
                          return '邀请码无效或已过期'
                        }
                        return undefined
                      },
                      trigger: 'blur',
                      debounce: 300,
                      message: '正在验证邀请码...',
                    },
                  ],
                }}
                />

                {/* 手机号异步验证 */}
                <FormField name="phone" fieldProps={{
                  label: '手机号',
                  component: 'Input',
                  componentProps: { placeholder: '先同步校验格式，再异步校验可用性' },
                  rules: [
                    { format: 'phone', message: '请输入有效手机号' },
                    {
                      asyncValidator: async (value, _rule, _context, signal) => {
                        if (!value) return undefined
                        await delay(ASYNC_DELAY, signal)
                        if (String(value).startsWith('170')) {
                          return '该手机号已被绑定到其他账户'
                        }
                        return undefined
                      },
                      trigger: 'blur',
                      debounce: 300,
                    },
                    {
                      level: 'warning',
                      validator: (value) => {
                        if (value && String(value).startsWith('170')) {
                          return '170 号段可能存在接收验证码延迟的情况'
                        }
                        return undefined
                      },
                    },
                  ],
                }}
                />

                {/* 普通字段 */}
                <FormField name="nickname" fieldProps={{
                  label: '昵称',
                  component: 'Input',
                  componentProps: { placeholder: '不需要异步验证' },
                  rules: [{ maxLength: 20, message: '昵称不超过 20 字' }],
                }}
                />
                {<LayoutFormActions onReset={() => form.reset()} />}
              </form>
            </FormProvider>
          )
        }}
      </StatusTabs>
    </div>
  )
})
