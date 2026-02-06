<script setup lang="ts">
/**
 * Element Plus 纯配置模式 - 全场景验证
 *
 * 覆盖场景：
 * - 内置格式（email / phone）
 * - required 必填
 * - 数值范围（min / max / exclusiveMin）
 * - 字符串长度（minLength / maxLength）
 * - 正则验证
 * - 自定义同步验证
 * - 异步验证（模拟用户名检查，含防抖）
 * - 跨字段验证（密码确认 / 日期区间）
 * - 验证时机（change / blur / submit）
 * - 警告级验证（warning 不阻塞提交）
 * - 动态验证规则（证件类型切换规则）
 * - 短路验证（stopOnFirstFailure）
 */
import { ref } from 'vue';
import { ConfigForm } from '@moluoxixi/vue';
import { setupElementPlus } from '@moluoxixi/ui-element-plus';
import type { FormSchema } from '@moluoxixi/schema';
import 'element-plus/dist/index.css';

setupElementPlus();

/** 模拟已存在用户列表 */
const EXISTING_USERS = ['admin', 'test', 'root', 'user', 'zhangsan'];

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
        { pattern: /^[a-zA-Z0-9_]+$/, message: '仅允许字母、数字和下划线' },
        {
          asyncValidator: async (value, _rule, _ctx, signal) => {
            await new Promise((resolve, reject) => {
              const timer = setTimeout(resolve, 800);
              signal.addEventListener('abort', () => {
                clearTimeout(timer);
                reject(new DOMException('Aborted', 'AbortError'));
              });
            });
            if (EXISTING_USERS.includes(String(value).toLowerCase())) {
              return `用户名 "${value}" 已被占用`;
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
    phone: {
      type: 'string',
      label: '手机号',
      component: 'Input',
      wrapper: 'FormItem',
      placeholder: '选填',
      rules: [{ format: 'phone' }],
    },

    /* ---- 数值范围 ---- */
    age: {
      type: 'number',
      label: '年龄',
      component: 'InputNumber',
      wrapper: 'FormItem',
      required: true,
      rules: [{ min: 1, max: 150, message: '年龄范围 1-150' }],
    },
    score: {
      type: 'number',
      label: '分数（0-100，不含0）',
      component: 'InputNumber',
      wrapper: 'FormItem',
      rules: [{ exclusiveMin: 0, max: 100, message: '分数范围 (0, 100]' }],
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
            const str = String(value);
            if (!/[A-Z]/.test(str) || !/[0-9]/.test(str)) {
              return '密码必须包含大写字母和数字';
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
            const pwd = context.getFieldValue('password');
            if (_value !== pwd) return '两次密码不一致';
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
            const start = context.getFieldValue('startDate') as string;
            if (start && _value && String(_value) < start) {
              return '结束日期不能早于开始日期';
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
            if (String(value).length > 10) return '昵称建议不超过 10 个字符';
          },
          level: 'warning',
        },
      ],
    },

    /* ---- 动态验证规则 ---- */
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
              const type = ctx.values.idType as string;
              if (type === 'idcard') {
                field.rules = [
                  { required: true },
                  { format: 'idcard', message: '身份证号格式不正确' },
                ];
                field.setComponentProps({ placeholder: '18 位身份证号' });
              } else {
                field.rules = [
                  { required: true },
                  { pattern: /^[A-Z0-9]{5,20}$/, message: '护照号格式不正确' },
                ];
                field.setComponentProps({ placeholder: '护照号码（大写字母和数字）' });
              }
              field.setValue('');
              field.errors = [];
            },
          },
        },
      ],
    },
  },
};

const submitResult = ref('');

function handleSubmit(values: Record<string, unknown>): void {
  submitResult.value = JSON.stringify(values, null, 2);
}

function handleSubmitFailed(errors: unknown[]): void {
  submitResult.value = '验证失败:\n' + JSON.stringify(errors, null, 2);
}
</script>

<template>
  <div>
    <h2 style="margin-bottom: 8px;">Element Plus 纯配置 - 全场景验证</h2>
    <p style="color: #909399; margin-bottom: 20px; font-size: 14px;">
      内置格式 / 数值范围 / 正则 / 异步验证（试输入 admin）/ 跨字段（密码确认、日期区间）/ 警告级 / 动态规则切换
    </p>

    <ConfigForm
      :schema="schema"
      @submit="handleSubmit"
      @submit-failed="handleSubmitFailed"
    >
      <template #default="{ form }">
        <div style="margin-top: 20px; display: flex; gap: 12px;">
          <el-button type="primary" native-type="submit">提交</el-button>
          <el-button @click="form.reset()">重置</el-button>
        </div>
      </template>
    </ConfigForm>

    <el-card v-if="submitResult" style="margin-top: 20px;" shadow="never">
      <pre style="margin: 0; white-space: pre-wrap; font-size: 13px;">{{ submitResult }}</pre>
    </el-card>
  </div>
</template>
