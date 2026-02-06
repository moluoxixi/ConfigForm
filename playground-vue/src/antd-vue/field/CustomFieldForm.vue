<template>
  <div>
    <h2 style="margin-bottom: 8px;">
      Ant Design Vue Field 组件 - 自定义渲染
    </h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 20px; font-size: 14px;">
      v-slot 自定义渲染（a-input / a-input-password）/ 跨字段验证（密码确认）
    </p>

    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit">
        <ACard style="margin-bottom: 20px;">
          <template #title>
            账号信息
          </template>

          <FormField v-slot="{ field }" name="username">
            <AFormItem :label="field.label" required :validate-status="field.errors.length > 0 ? 'error' : ''" :help="field.errors[0]?.message">
              <AInput :value="(field.value as string)" placeholder="请输入用户名" @update:value="field.setValue($event)" @focus="field.focus()" @blur="field.blur(); field.validate('blur')" />
            </AFormItem>
          </FormField>

          <FormField v-slot="{ field }" name="password">
            <AFormItem :label="field.label" required :validate-status="field.errors.length > 0 ? 'error' : ''" :help="field.errors[0]?.message">
              <AInputPassword :value="(field.value as string)" placeholder="请输入密码（含大写字母+数字）" @update:value="field.setValue($event)" @focus="field.focus()" @blur="field.blur(); field.validate('blur')" />
            </AFormItem>
          </FormField>

          <FormField v-slot="{ field }" name="confirmPassword">
            <AFormItem :label="field.label" required :validate-status="field.errors.length > 0 ? 'error' : ''" :help="field.errors[0]?.message">
              <AInputPassword :value="(field.value as string)" placeholder="请再次输入密码" @update:value="field.setValue($event)" @focus="field.focus()" @blur="field.blur(); field.validate('blur')" />
            </AFormItem>
          </FormField>
        </ACard>

        <ACard style="margin-bottom: 20px;">
          <template #title>
            个人信息
          </template>

          <FormField v-slot="{ field }" name="role">
            <AFormItem :label="field.label" required :validate-status="field.errors.length > 0 ? 'error' : ''" :help="field.errors[0]?.message">
              <ASelect
                :value="(field.value as string) || undefined" placeholder="请选择角色" style="width: 100%;" :options="field.dataSource.map((item) => ({ label: item.label, value: item.value }))"
                @update:value="field.setValue($event)"
              />
            </AFormItem>
          </FormField>

          <FormField v-slot="{ field }" name="bio">
            <AFormItem :label="field.label">
              <ATextarea :value="(field.value as string)" :rows="3" placeholder="简单介绍一下自己..." @update:value="field.setValue($event)" />
            </AFormItem>
          </FormField>
        </ACard>

        <!-- 协议确认 -->
        <FormField v-slot="{ field }" name="agree">
          <div style="margin-bottom: 20px;">
            <ACheckbox :checked="!!field.value" @update:checked="field.setValue($event)">
              我已阅读并同意《用户服务协议》和《隐私政策》
            </ACheckbox>
            <div v-if="field.errors.length > 0" style="color: #ff4d4f; font-size: 12px; margin-top: 4px; margin-left: 24px;">
              {{ field.errors[0].message }}
            </div>
          </div>
        </FormField>

        <AButton type="primary" html-type="submit">
          注册
        </AButton>
      </form>
    </FormProvider>

    <ACard v-if="submitResult" style="margin-top: 20px;">
      <template #title>
        <strong>结果</strong>
      </template>
      <pre style="margin: 0; white-space: pre-wrap; font-size: 13px;">{{ submitResult }}</pre>
    </ACard>
  </div>
</template>

<script setup lang="ts">
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { Button as AButton, Card as ACard, Checkbox as ACheckbox, FormItem as AFormItem, Input as AInput, InputPassword as AInputPassword, Select as ASelect, Textarea as ATextarea } from 'ant-design-vue'
/**
 * Ant Design Vue Field 组件模式 - 自定义渲染
 *
 * 演示：使用 FormField + v-slot 自定义渲染 Ant Design Vue 组件
 * - v-slot 获取 field 实例完全控制渲染（a-input / a-input-password）
 * - 跨字段验证（密码确认）
 * - 自定义布局和交互
 */
import { ref } from 'vue'

setupAntdVue()

const form = useCreateForm({
  initialValues: { username: '', password: '', confirmPassword: '', role: '', bio: '', agree: false },
})

/* 创建字段 */
form.createField({
  name: 'username',
  label: '用户名',
  required: true,
  rules: [
    { minLength: 3, message: '用户名至少 3 个字符' },
    { maxLength: 20, message: '用户名最多 20 个字符' },
    { pattern: /^\w+$/, message: '用户名只能包含字母、数字和下划线' },
  ],
})

form.createField({
  name: 'password',
  label: '密码',
  required: true,
  rules: [
    { minLength: 6, message: '密码至少 6 位' },
    {
      validator: (value) => {
        const str = String(value)
        if (!/[A-Z]/.test(str))
          return '密码须包含至少一个大写字母'
        if (!/\d/.test(str))
          return '密码须包含至少一个数字'
      },
    },
  ],
})

/* 跨字段验证 - 密码确认 */
form.createField({
  name: 'confirmPassword',
  label: '确认密码',
  required: true,
  rules: [{
    validator: (value, _rule, context) => {
      const password = context.getFieldValue('password')
      if (value !== password)
        return '两次密码不一致'
    },
  }],
})

form.createField({
  name: 'role',
  label: '角色',
  required: true,
  dataSource: [
    { label: '前端工程师', value: 'frontend' },
    { label: '后端工程师', value: 'backend' },
    { label: '全栈工程师', value: 'fullstack' },
    { label: '设计师', value: 'designer' },
  ],
})

form.createField({ name: 'bio', label: '个人简介' })
form.createField({
  name: 'agree',
  label: '同意条款',
  rules: [{ validator: (value) => {
    if (!value)
      return '请阅读并同意用户协议'
  } }],
})

const submitResult = ref('')

async function handleSubmit(): Promise<void> {
  const result = await form.submit()
  if (result.errors.length > 0) {
    submitResult.value = `验证失败:\n${result.errors.map(e => `  ${e.path}: ${e.message}`).join('\n')}`
  }
  else {
    submitResult.value = JSON.stringify(result.values, null, 2)
  }
}
</script>
