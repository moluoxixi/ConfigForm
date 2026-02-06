<script setup lang="ts">
/**
 * Element Plus 纯配置模式 - 基础表单
 *
 * 演示：通过 ConfigForm + Schema 配置驱动，使用 Element Plus 全套组件
 * - 各类型字段：Input / Password / Textarea / InputNumber / Select / RadioGroup / CheckboxGroup / Switch / DatePicker
 * - required 必填验证
 * - 格式验证（email）
 * - 字符串长度 / 数值范围
 */
import { ref } from 'vue';
import { ConfigForm } from '@moluoxixi/vue';
import { setupElementPlus } from '@moluoxixi/ui-element-plus';
import type { FormSchema } from '@moluoxixi/schema';
import 'element-plus/dist/index.css';

/* 注册 Element Plus 全套组件 */
setupElementPlus();

/** 表单 Schema 定义 */
const schema: FormSchema = {
  fields: {
    username: {
      type: 'string',
      label: '用户名',
      component: 'Input',
      wrapper: 'FormItem',
      required: true,
      placeholder: '请输入用户名',
      rules: [
        { minLength: 2, maxLength: 20, message: '用户名 2-20 个字符' },
      ],
    },
    password: {
      type: 'string',
      label: '密码',
      component: 'Password',
      wrapper: 'FormItem',
      required: true,
      rules: [{ minLength: 6, message: '密码至少 6 位' }],
    },
    email: {
      type: 'string',
      label: '邮箱',
      component: 'Input',
      wrapper: 'FormItem',
      required: true,
      placeholder: '请输入邮箱地址',
      rules: [{ format: 'email' }],
    },
    bio: {
      type: 'string',
      label: '个人简介',
      component: 'Textarea',
      wrapper: 'FormItem',
      placeholder: '简单介绍一下自己...',
      rules: [{ maxLength: 200, message: '简介不超过 200 字' }],
    },
    age: {
      type: 'number',
      label: '年龄',
      component: 'InputNumber',
      wrapper: 'FormItem',
      defaultValue: 25,
      rules: [{ min: 1, max: 150, message: '年龄范围 1-150' }],
    },
    gender: {
      type: 'string',
      label: '性别',
      component: 'RadioGroup',
      wrapper: 'FormItem',
      enum: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' },
        { label: '保密', value: 'secret' },
      ],
      defaultValue: 'male',
    },
    department: {
      type: 'string',
      label: '部门',
      component: 'Select',
      wrapper: 'FormItem',
      required: true,
      placeholder: '请选择部门',
      enum: [
        { label: '技术部', value: 'tech' },
        { label: '产品部', value: 'product' },
        { label: '设计部', value: 'design' },
        { label: '市场部', value: 'marketing' },
      ],
    },
    skills: {
      type: 'array',
      label: '技能标签',
      component: 'CheckboxGroup',
      wrapper: 'FormItem',
      enum: [
        { label: 'Vue', value: 'vue' },
        { label: 'React', value: 'react' },
        { label: 'TypeScript', value: 'ts' },
        { label: 'Node.js', value: 'node' },
      ],
      defaultValue: [],
    },
    isRemote: {
      type: 'boolean',
      label: '远程办公',
      component: 'Switch',
      wrapper: 'FormItem',
      defaultValue: false,
    },
    joinDate: {
      type: 'string',
      label: '入职日期',
      component: 'DatePicker',
      wrapper: 'FormItem',
      placeholder: '请选择日期',
    },
  },
};

const submitResult = ref<string>('');

/** 提交成功回调 */
function handleSubmit(values: Record<string, unknown>): void {
  submitResult.value = JSON.stringify(values, null, 2);
}

/** 提交失败回调 */
function handleSubmitFailed(errors: unknown[]): void {
  submitResult.value = '验证失败:\n' + JSON.stringify(errors, null, 2);
}
</script>

<template>
  <div>
    <h2 style="margin-bottom: 8px;">Element Plus 纯配置 - 基础表单</h2>
    <p style="color: #909399; margin-bottom: 20px; font-size: 14px;">
      所有字段通过 Schema 配置驱动，覆盖 Input / Password / Textarea / InputNumber / Select / RadioGroup / CheckboxGroup / Switch / DatePicker
    </p>

    <ConfigForm
      :schema="schema"
      :initial-values="{ username: '', password: '', email: '', age: 25, gender: 'male', skills: [], isRemote: false }"
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
      <template #header><strong>提交结果</strong></template>
      <pre style="margin: 0; white-space: pre-wrap; font-size: 13px;">{{ submitResult }}</pre>
    </el-card>
  </div>
</template>
