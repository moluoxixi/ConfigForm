<script setup lang="ts">
import { ref } from 'vue'
import { z } from 'zod'
import { ConfigForm, Field, toFields } from '@moluoxixi/config-form'

import { Input, Select, Switch, Textarea, InputPassword } from 'ant-design-vue'

// ── 装饰器定义表单模型 ──────────────────────────────────────────
class RegistrationForm {
  @Field({
    label: '账号类型',
    component: Select,
    defaultValue: 'user',
    props: {
      placeholder: '请选择账号类型',
      options: [
        { label: '管理员', value: 'admin' },
        { label: '普通用户', value: 'user' },
        { label: '访客', value: 'anonymous' },
      ],
    },
  })
  accountType = 'user'

  @Field({
    label: '用户名',
    component: Input,
    type: z.string().min(2, '用户名至少2个字符').max(20, '用户名最多20个字符'),
    span: 12,
    validateOn: 'blur',
    visible: (vals) => vals.accountType !== 'anonymous',
    transform: (val: string) => val.trim(),
    props: { placeholder: '请输入用户名', allowClear: true },
  })
  username = ''

  @Field({
    label: '邮箱',
    component: Input,
    type: z.string().email('请输入有效邮箱'),
    span: 12,
    validateOn: ['blur', 'change'],
    visible: (vals) => vals.accountType !== 'anonymous',
    props: { placeholder: '请输入邮箱', allowClear: true },
  })
  email = ''

  @Field({
    label: '管理员密钥',
    component: InputPassword,
    type: z.string().min(8, '密钥至少8位'),
    validateOn: 'blur',
    visible: (vals) => vals.accountType === 'admin',
    props: { placeholder: '仅管理员账号需填写', allowClear: true },
  })
  adminKey = ''

  @Field({
    label: '是否禁用演示',
    component: Switch,
    defaultValue: false,
    valueProp: 'checked', // Ant Design 的 Switch 绑定值属性名为 checked
    trigger: 'change',    // 触发事件名为 change
  })
  disableDemo = false

  @Field({
    label: '备注',
    component: Textarea,
    span: 24,
    disabled: (vals) => vals.disableDemo === true,
    props: { placeholder: '禁用演示后此字段不可编辑，提交时也不含此字段', rows: 3 },
  })
  remark = ''
}

// 直接将 Class 传给 ConfigForm
const formRef = ref()

function onSubmit(values: Record<string, any>) {
  alert(`提交成功（装饰器模式）！\n${JSON.stringify(values, null, 2)}`)
}

function onError(errors: Record<string, string[]>) {
  console.error('校验失败：', errors)
}
</script>

<template>
  <div>
    <p class="demo-tip">
      ✅ 账号类型切换 → 字段动态显示/隐藏（visible）<br>
      ✅ 开启"禁用演示" → 备注字段禁用且提交时排除（disabled，结合最新 valueProp: 'checked' 映射）<br>
      ✅ 用户名/邮箱失焦时实时校验（validateOn: blur）<br>
      ✅ 用户名提交前自动 trim（transform）
    </p>

    <ConfigForm
      ref="formRef"
      namespace="moluoxixi"
      :fields="RegistrationForm"
      label-width="100px"
      @submit="onSubmit"
      @error="onError"
    />

    <div class="demo-actions">
      <a-button type="primary" @click="formRef?.submit()">
        提交
      </a-button>
      <a-button @click="formRef?.validate()">
        校验
      </a-button>
      <a-button @click="formRef?.reset()">
        重置
      </a-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.demo-tip {
  font-size: 12px;
  color: #666;
  background: #f5f7fa;
  padding: 10px 14px;
  border-radius: 6px;
  margin-bottom: 16px;
  line-height: 2;
}
.demo-actions {
  margin-top: 16px;
  display: flex;
  gap: 8px;
}
</style>
