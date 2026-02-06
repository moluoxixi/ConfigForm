<script setup lang="ts">
/**
 * Ant Design Vue Field 组件模式 - 自定义渲染
 *
 * 演示：使用 FormField + v-slot 自定义渲染 Ant Design Vue 组件
 * - v-slot 获取 field 实例完全控制渲染（a-input / a-input-password）
 * - 跨字段验证（密码确认）
 * - 自定义布局和交互
 */
import { ref } from 'vue';
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/vue';
import { setupAntdVue } from '@moluoxixi/ui-antd-vue';

setupAntdVue();

const form = useCreateForm({
  initialValues: { username: '', password: '', confirmPassword: '', role: '', bio: '', agree: false },
});

/* 创建字段 */
form.createField({
  name: 'username', label: '用户名', required: true,
  rules: [
    { minLength: 3, message: '用户名至少 3 个字符' },
    { maxLength: 20, message: '用户名最多 20 个字符' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' },
  ],
});

form.createField({
  name: 'password', label: '密码', required: true,
  rules: [
    { minLength: 6, message: '密码至少 6 位' },
    {
      validator: (value) => {
        const str = String(value);
        if (!/[A-Z]/.test(str)) return '密码须包含至少一个大写字母';
        if (!/[0-9]/.test(str)) return '密码须包含至少一个数字';
      },
    },
  ],
});

/* 跨字段验证 - 密码确认 */
form.createField({
  name: 'confirmPassword', label: '确认密码', required: true,
  rules: [{
    validator: (value, _rule, context) => {
      const password = context.getFieldValue('password');
      if (value !== password) return '两次密码不一致';
    },
  }],
});

form.createField({
  name: 'role', label: '角色', required: true,
  dataSource: [
    { label: '前端工程师', value: 'frontend' },
    { label: '后端工程师', value: 'backend' },
    { label: '全栈工程师', value: 'fullstack' },
    { label: '设计师', value: 'designer' },
  ],
});

form.createField({ name: 'bio', label: '个人简介' });
form.createField({
  name: 'agree', label: '同意条款',
  rules: [{ validator: (value) => { if (!value) return '请阅读并同意用户协议'; } }],
});

const submitResult = ref('');

async function handleSubmit(): Promise<void> {
  const result = await form.submit();
  if (result.errors.length > 0) {
    submitResult.value = '验证失败:\n' + result.errors.map((e) => `  ${e.path}: ${e.message}`).join('\n');
  } else {
    submitResult.value = JSON.stringify(result.values, null, 2);
  }
}
</script>

<template>
  <div>
    <h2 style="margin-bottom: 8px;">Ant Design Vue Field 组件 - 自定义渲染</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 20px; font-size: 14px;">
      v-slot 自定义渲染（a-input / a-input-password）/ 跨字段验证（密码确认）
    </p>

    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit">
        <a-card style="margin-bottom: 20px;">
          <template #title>账号信息</template>

          <FormField name="username" v-slot="{ field }">
            <a-form-item :label="field.label" required :validate-status="field.errors.length > 0 ? 'error' : ''" :help="field.errors[0]?.message">
              <a-input :value="(field.value as string)" @update:value="field.setValue($event)" @focus="field.focus()" @blur="field.blur(); field.validate('blur')" placeholder="请输入用户名" />
            </a-form-item>
          </FormField>

          <FormField name="password" v-slot="{ field }">
            <a-form-item :label="field.label" required :validate-status="field.errors.length > 0 ? 'error' : ''" :help="field.errors[0]?.message">
              <a-input-password :value="(field.value as string)" @update:value="field.setValue($event)" @focus="field.focus()" @blur="field.blur(); field.validate('blur')" placeholder="请输入密码（含大写字母+数字）" />
            </a-form-item>
          </FormField>

          <FormField name="confirmPassword" v-slot="{ field }">
            <a-form-item :label="field.label" required :validate-status="field.errors.length > 0 ? 'error' : ''" :help="field.errors[0]?.message">
              <a-input-password :value="(field.value as string)" @update:value="field.setValue($event)" @focus="field.focus()" @blur="field.blur(); field.validate('blur')" placeholder="请再次输入密码" />
            </a-form-item>
          </FormField>
        </a-card>

        <a-card style="margin-bottom: 20px;">
          <template #title>个人信息</template>

          <FormField name="role" v-slot="{ field }">
            <a-form-item :label="field.label" required :validate-status="field.errors.length > 0 ? 'error' : ''" :help="field.errors[0]?.message">
              <a-select :value="(field.value as string) || undefined" @update:value="field.setValue($event)" placeholder="请选择角色" style="width: 100%;"
                :options="field.dataSource.map((item) => ({ label: item.label, value: item.value }))" />
            </a-form-item>
          </FormField>

          <FormField name="bio" v-slot="{ field }">
            <a-form-item :label="field.label">
              <a-textarea :value="(field.value as string)" @update:value="field.setValue($event)" :rows="3" placeholder="简单介绍一下自己..." />
            </a-form-item>
          </FormField>
        </a-card>

        <!-- 协议确认 -->
        <FormField name="agree" v-slot="{ field }">
          <div style="margin-bottom: 20px;">
            <a-checkbox :checked="!!field.value" @update:checked="field.setValue($event)">
              我已阅读并同意《用户服务协议》和《隐私政策》
            </a-checkbox>
            <div v-if="field.errors.length > 0" style="color: #ff4d4f; font-size: 12px; margin-top: 4px; margin-left: 24px;">
              {{ field.errors[0].message }}
            </div>
          </div>
        </FormField>

        <a-button type="primary" html-type="submit">注册</a-button>
      </form>
    </FormProvider>

    <a-card v-if="submitResult" style="margin-top: 20px;">
      <template #title><strong>结果</strong></template>
      <pre style="margin: 0; white-space: pre-wrap; font-size: 13px;">{{ submitResult }}</pre>
    </a-card>
  </div>
</template>
