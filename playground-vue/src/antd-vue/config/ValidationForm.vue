<template>
  <div>
    <h2 style="margin-bottom: 8px;">
      Ant Design Vue 纯配置 - 全场景验证
    </h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 20px; font-size: 14px;">
      异步验证（试输入 admin）/ 正则 / 跨字段（密码确认、日期区间）/ 警告级 / 动态规则切换
    </p>

    <ConfigForm :schema="schema" @submit="handleSubmit" @submit-failed="handleSubmitFailed">
      <template #default="{ form }">
        <div style="margin-top: 20px; display: flex; gap: 12px;">
          <AButton type="primary" html-type="submit">
            提交
          </AButton>
          <AButton @click="form.reset()">
            重置
          </AButton>
        </div>
      </template>
    </ConfigForm>

    <ACard v-if="submitResult" style="margin-top: 20px;">
      <pre style="margin: 0; white-space: pre-wrap; font-size: 13px;">{{ submitResult }}</pre>
    </ACard>
  </div>
</template>

<script setup lang="ts">
import type { FormSchema } from '@moluoxixi/schema'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { ConfigForm } from '@moluoxixi/vue'
import { Button as AButton, Card as ACard } from 'ant-design-vue'
/**
 * Ant Design Vue 纯配置模式 - 全场景验证
 *
 * 覆盖场景：
 * - 异步用户名检查（含防抖 + AbortSignal）
 * - 正则验证
 * - 跨字段验证（密码确认 / 日期区间）
 * - 警告级验证（不阻塞提交）
 * - 动态验证规则（证件类型切换）
 * - 短路验证（stopOnFirstFailure）
 */
import { ref } from 'vue'

setupAntdVue()

/** 模拟已存在用户列表 */
const EXISTING_USERS = ['admin', 'test', 'root', 'user', 'zhangsan']

const schema: FormSchema = {
  fields: {
    /* ---- 异步验证 + 短路 ---- */
    username: {
      type: 'string',
      label: '用户名',
      component: 'Input',
      wrapper: 'FormItem',
      required: true,
      placeholder: '试输入 admin / test / root',
      rules: [
        { minLength: 3, maxLength: 20, message: '用户名 3-20 个字符', stopOnFirstFailure: true },
        { pattern: /^\w+$/, message: '仅允许字母、数字和下划线' },
        {
          asyncValidator: async (value, _rule, _ctx, signal) => {
            await new Promise((resolve, reject) => {
              const timer = setTimeout(resolve, 800)
              signal.addEventListener('abort', () => {
                clearTimeout(timer)
                reject(new DOMException('Aborted', 'AbortError'))
              })
            })
            if (EXISTING_USERS.includes(String(value).toLowerCase())) {
              return `用户名 "${value}" 已被占用`
            }
          },
          debounce: 500,
        },
      ],
    },

    /* ---- 内置格式 ---- */
    email: {
      type: 'string',
      label: '邮箱',
      component: 'Input',
      wrapper: 'FormItem',
      required: true,
      placeholder: '请输入邮箱',
      rules: [{ format: 'email' }],
    },

    /* ---- 正则验证 ---- */
    zipCode: {
      type: 'string',
      label: '邮编',
      component: 'Input',
      wrapper: 'FormItem',
      placeholder: '6 位数字',
      rules: [{ pattern: /^\d{6}$/, message: '邮编为 6 位数字' }],
    },

    /* ---- 跨字段验证 - 密码确认 ---- */
    password: {
      type: 'string',
      label: '密码',
      component: 'Password',
      wrapper: 'FormItem',
      required: true,
      rules: [
        { minLength: 6, message: '密码至少 6 位' },
        {
          validator: (value) => {
            const str = String(value)
            if (!/[A-Z]/.test(str) || !/\d/.test(str)) {
              return '密码必须包含大写字母和数字'
            }
          },
        },
      ],
    },
    confirmPassword: {
      type: 'string',
      label: '确认密码',
      component: 'Password',
      wrapper: 'FormItem',
      required: true,
      rules: [
        {
          validator: (_value, _rule, context) => {
            const pwd = context.getFieldValue('password')
            if (_value !== pwd)
              return '两次密码不一致'
          },
          trigger: 'blur',
        },
      ],
    },

    /* ---- 跨字段验证 - 日期区间 ---- */
    startDate: {
      type: 'string',
      label: '开始日期',
      component: 'DatePicker',
      wrapper: 'FormItem',
      placeholder: '请选择开始日期',
    },
    endDate: {
      type: 'string',
      label: '结束日期',
      component: 'DatePicker',
      wrapper: 'FormItem',
      placeholder: '请选择结束日期',
      rules: [
        {
          validator: (_value, _rule, context) => {
            const start = context.getFieldValue('startDate') as string
            if (start && _value && String(_value) < start) {
              return '结束日期不能早于开始日期'
            }
          },
        },
      ],
    },

    /* ---- 警告级验证 ---- */
    nickname: {
      type: 'string',
      label: '昵称',
      component: 'Input',
      wrapper: 'FormItem',
      description: '警告不阻塞提交',
      placeholder: '请输入昵称',
      rules: [
        {
          validator: (value) => {
            if (String(value).length > 10)
              return '昵称建议不超过 10 个字符'
          },
          level: 'warning',
        },
      ],
    },

    /* ---- 动态验证规则（证件类型） ---- */
    idType: {
      type: 'string',
      label: '证件类型',
      component: 'Select',
      wrapper: 'FormItem',
      enum: [
        { label: '身份证', value: 'idcard' },
        { label: '护照', value: 'passport' },
      ],
      defaultValue: 'idcard',
    },
    idNumber: {
      type: 'string',
      label: '证件号码',
      component: 'Input',
      wrapper: 'FormItem',
      required: true,
      reactions: [
        {
          watch: 'idType',
          fulfill: {
            run: (field, ctx) => {
              const type = ctx.values.idType as string
              if (type === 'idcard') {
                field.rules = [
                  { required: true },
                  { format: 'idcard', message: '身份证号格式不正确' },
                ]
                field.setComponentProps({ placeholder: '18 位身份证号' })
              }
              else {
                field.rules = [
                  { required: true },
                  { pattern: /^[A-Z0-9]{5,20}$/, message: '护照号格式不正确' },
                ]
                field.setComponentProps({ placeholder: '护照号码（大写字母和数字）' })
              }
              field.setValue('')
              field.errors = []
            },
          },
        },
      ],
    },
  },
}

const submitResult = ref('')

function handleSubmit(values: Record<string, unknown>): void {
  submitResult.value = JSON.stringify(values, null, 2)
}

function handleSubmitFailed(errors: unknown[]): void {
  submitResult.value = `验证失败:\n${JSON.stringify(errors, null, 2)}`
}
</script>
