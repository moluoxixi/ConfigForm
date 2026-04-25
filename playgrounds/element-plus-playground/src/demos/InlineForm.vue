<script setup lang="ts">
import { ref } from 'vue'
import { z } from 'zod'
import { ConfigForm, defineField } from '@config-form/core'

const formRef = ref()

const fields = [
  defineField({
    field: 'keyword',
    label: '关键词',
    type: z.string().min(1, '请输入关键词'),
    component: 'ElInput',
    props: { placeholder: '搜索...', clearable: true },
  }),
  defineField({
    field: 'status',
    label: '状态',
    component: 'ElSelect',
    props: { placeholder: '状态筛选', clearable: true },
  }),
]

function onSubmit(values: Record<string, any>) {
  alert(`搜索提交！\n${JSON.stringify(values, null, 2)}`)
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
      :inline="true"
      @submit="onSubmit"
      @error="onError"
    />
    <div class="demo-actions">
      <el-button type="primary" @click="formRef?.submit()">
        搜索
      </el-button>
      <el-button @click="formRef?.reset()">
        重置
      </el-button>
    </div>
  </div>
</template>

<style lang="scss">
.demo-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}
</style>
