<script setup lang="ts">
/**
 * Element Plus Field 组件模式 - 自定义组件
 *
 * 演示：使用 FormField + v-slot 自定义渲染 Element Plus 组件
 * - v-slot 获取 field 实例完全控制渲染
 * - 跨字段验证（密码确认）
 * - 自定义布局和交互
 * - 混合使用 Element Plus 组件
 */
import { ref } from 'vue';
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/vue';
import { setupElementPlus } from '@moluoxixi/ui-element-plus';
import {
  ElInput, ElButton, ElFormItem, ElCheckbox, ElAlert, ElCard,
  ElSelect, ElOption, ElRate, ElSlider,
} from 'element-plus';
import 'element-plus/dist/index.css';

setupElementPlus();

const form = useCreateForm({
  initialValues: {
    username: '',
    password: '',
    confirmPassword: '',
    role: '',
    experience: 3,
    satisfaction: 4,
    agree: false,
  },
});

/* 创建字段 */
form.createField({
  name: 'username',
  label: '用户名',
  required: true,
  rules: [
    { minLength: 3, message: '用户名至少 3 个字符' },
    { maxLength: 20, message: '用户名最多 20 个字符' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' },
  ],
});

form.createField({
  name: 'password',
  label: '密码',
  required: true,
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

/* 跨字段验证 */
form.createField({
  name: 'confirmPassword',
  label: '确认密码',
  required: true,
  rules: [
    {
      validator: (value, _rule, context) => {
        const password = context.getFieldValue('password');
        if (value !== password) return '两次密码不一致';
      },
    },
  ],
});

form.createField({
  name: 'role',
  label: '角色',
  required: true,
  dataSource: [
    { label: '前端工程师', value: 'frontend' },
    { label: '后端工程师', value: 'backend' },
    { label: '全栈工程师', value: 'fullstack' },
    { label: '设计师', value: 'designer' },
    { label: '产品经理', value: 'pm' },
  ],
});

form.createField({ name: 'experience', label: '工作年限' });
form.createField({ name: 'satisfaction', label: '满意度评分' });

form.createField({
  name: 'agree',
  label: '同意条款',
  rules: [
    {
      validator: (value) => {
        if (!value) return '请阅读并同意用户协议';
      },
    },
  ],
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
    <h2 style="margin-bottom: 8px;">Element Plus Field 组件 - 自定义组件</h2>
    <p style="color: #909399; margin-bottom: 20px; font-size: 14px;">
      v-slot 自定义渲染 / 跨字段验证（密码确认）/ 混合使用 ElRate、ElSlider 等高级组件
    </p>

    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit">
        <el-card shadow="never" style="margin-bottom: 20px;">
          <template #header><span style="font-weight: 600;">账号信息</span></template>

          <FormField name="username" v-slot="{ field }">
            <ElFormItem :label="field.label" required :error="field.errors.length > 0 ? field.errors[0].message : ''">
              <ElInput
                :model-value="(field.value as string)"
                @update:model-value="field.setValue($event)"
                @focus="field.focus()"
                @blur="field.blur(); field.validate('blur')"
                placeholder="请输入用户名"
              />
            </ElFormItem>
          </FormField>

          <FormField name="password" v-slot="{ field }">
            <ElFormItem :label="field.label" required :error="field.errors.length > 0 ? field.errors[0].message : ''">
              <ElInput
                type="password" show-password
                :model-value="(field.value as string)"
                @update:model-value="field.setValue($event)"
                @focus="field.focus()"
                @blur="field.blur(); field.validate('blur')"
                placeholder="请输入密码（含大写字母+数字）"
              />
            </ElFormItem>
          </FormField>

          <FormField name="confirmPassword" v-slot="{ field }">
            <ElFormItem :label="field.label" required :error="field.errors.length > 0 ? field.errors[0].message : ''">
              <ElInput
                type="password" show-password
                :model-value="(field.value as string)"
                @update:model-value="field.setValue($event)"
                @focus="field.focus()"
                @blur="field.blur(); field.validate('blur')"
                placeholder="请再次输入密码"
              />
            </ElFormItem>
          </FormField>
        </el-card>

        <el-card shadow="never" style="margin-bottom: 20px;">
          <template #header><span style="font-weight: 600;">个人信息</span></template>

          <FormField name="role" v-slot="{ field }">
            <ElFormItem :label="field.label" required :error="field.errors.length > 0 ? field.errors[0].message : ''">
              <ElSelect
                :model-value="(field.value as string)"
                @update:model-value="field.setValue($event)"
                placeholder="请选择角色" style="width: 100%;"
              >
                <ElOption
                  v-for="item in field.dataSource"
                  :key="String(item.value)"
                  :label="item.label"
                  :value="item.value"
                />
              </ElSelect>
            </ElFormItem>
          </FormField>

          <!-- 自定义组件：Slider -->
          <FormField name="experience" v-slot="{ field }">
            <ElFormItem :label="field.label">
              <div style="width: 100%; display: flex; align-items: center; gap: 16px;">
                <ElSlider
                  :model-value="(field.value as number)"
                  @update:model-value="field.setValue($event)"
                  :min="0" :max="30" :step="1"
                  show-stops :marks="{ 0: '0年', 5: '5年', 10: '10年', 20: '20年', 30: '30年' }"
                  style="flex: 1;"
                />
                <span style="width: 50px; text-align: center; font-weight: 600; color: #409eff;">{{ field.value }}年</span>
              </div>
            </ElFormItem>
          </FormField>

          <!-- 自定义组件：Rate -->
          <FormField name="satisfaction" v-slot="{ field }">
            <ElFormItem :label="field.label">
              <ElRate
                :model-value="(field.value as number)"
                @update:model-value="field.setValue($event)"
                show-text
                :texts="['很差', '较差', '一般', '满意', '非常满意']"
              />
            </ElFormItem>
          </FormField>
        </el-card>

        <!-- 协议确认 -->
        <FormField name="agree" v-slot="{ field }">
          <div style="margin-bottom: 20px;">
            <ElCheckbox
              :model-value="!!field.value"
              @update:model-value="field.setValue($event)"
            >
              我已阅读并同意《用户服务协议》和《隐私政策》
            </ElCheckbox>
            <div v-if="field.errors.length > 0" style="color: #f56c6c; font-size: 12px; margin-top: 4px; margin-left: 24px;">
              {{ field.errors[0].message }}
            </div>
          </div>
        </FormField>

        <ElButton type="primary" native-type="submit">注册</ElButton>
      </form>
    </FormProvider>

    <el-card v-if="submitResult" style="margin-top: 20px;" shadow="never">
      <template #header><strong>结果</strong></template>
      <pre style="margin: 0; white-space: pre-wrap; font-size: 13px;">{{ submitResult }}</pre>
    </el-card>
  </div>
</template>
