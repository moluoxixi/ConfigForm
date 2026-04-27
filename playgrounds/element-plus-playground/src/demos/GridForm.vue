<script setup lang="ts">
import { ref } from 'vue'
import { z } from 'zod'
import { ConfigForm, defineField } from '@moluoxixi/config-form'
import { ElInput, ElSelect } from 'element-plus'

const formRef = ref()

const fields = [
  defineField({
    field: 'username',
    label: '用户名',
    type: z.string().min(2, '用户名至少 2 个字符').max(20, '用户名最多 20 个字符'),
    span: 12,
    component: ElInput,
    props: { placeholder: '请输入用户名' },
  }),
  defineField({
    field: 'email',
    label: '邮箱',
    type: z.string().email('请输入有效的邮箱地址'),
    span: 12,
    component: ElInput,
    props: { placeholder: '请输入邮箱' },
  }),
  defineField({
    field: 'role',
    label: '角色',
    span: 12,
    component: ElSelect,
    props: {
      placeholder: '请选择角色',
    },
  }),
  defineField({
    field: 'bio',
    label: '简介',
    type: z.string().max(200, '简介最多 200 个字符').optional(),
    span: 24,
    component: ElInput,
    props: { type: 'textarea', placeholder: '请输入简介', rows: 3 },
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
      <el-button type="primary" @click="formRef?.submit()">
        提交
      </el-button>
      <el-button @click="formRef?.validate()">
        校验
      </el-button>
      <el-button @click="formRef?.reset()">
        重置
      </el-button>
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
