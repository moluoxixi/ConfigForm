<script setup lang="ts">
import { ref } from 'vue'
import { z } from 'zod'
import { ConfigForm, defineField } from '@moluoxixi/config-form'

import { Input, Select, Textarea } from 'ant-design-vue'

const formRef = ref()

const fields = [
  defineField({
    field: 'username',
    label: '用户名',
    // 默认只在 submit 时校验，可以手动配置触发时机
    validateOn: ['blur', 'change'],
    type: z.string()
      .min(2, '用户名至少 2 个字符')
      .max(20, '用户名最多 20 个字符')
      .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'),
    span: 12,
    component: Input,
    props: { placeholder: '请输入用户名', allowClear: true },
  }),
  defineField({
    field: 'email',
    label: '邮箱',
    // 配置为失焦时校验
    validateOn: 'blur',
    type: z.string().email('请输入有效的邮箱地址'),
    span: 12,
    component: Input,
    props: { placeholder: '请输入邮箱', allowClear: true },
  }),
  defineField({
    field: 'role',
    label: '角色',
    type: z.string({ required_error: '请选择角色' }).min(1, '请选择角色'),
    span: 12,
    component: Select,
    props: {
      placeholder: '请选择角色',
      allowClear: true,
      options: [
        { label: '管理员', value: 'admin' },
        { label: '用户', value: 'user' },
        { label: '访客', value: 'guest' },
      ],
    },
  }),
  defineField({
    field: 'bio',
    label: '简介',
    type: z.string().max(200, '简介最多 200 个字符').optional(),
    span: 24,
    component: Textarea,
    props: { placeholder: '请输入简介', rows: 3, allowClear: true },
  }),
]

function onSubmit(values: Record<string, any>) {
  alert(`提交成功！\n${JSON.stringify(values, null, 2)}`)
}

function onError(errors: Record<string, string[]>) {
  console.error('校验失败：', errors)
}
</script>

<template>
  <div>
    <ConfigForm
      ref="formRef"
      namespace="moluoxixi"
      :fields="fields"
      label-width="80px"
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

<style lang="scss">
.demo-actions {
  margin-top: 16px;
  display: flex;
  gap: 8px;
}
</style>
