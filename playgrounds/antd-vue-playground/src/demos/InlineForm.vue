<script setup lang="ts">
import { ref } from 'vue'
import { z } from 'zod'
import { ConfigForm, defineField } from '@moluoxixi/config-form'

import { Input, Select } from 'ant-design-vue'

const formRef = ref()

const fields = [
  defineField({
    field: 'keyword',
    label: '关键词',
    schema: z.string().min(1, '请输入关键词'),
    component: Input,
    props: { placeholder: '搜索...', allowClear: true },
  }),
  defineField({
    field: 'status',
    label: '状态',
    component: Select,
    props: {
      placeholder: '状态筛选',
      allowClear: true,
      options: [
        { label: '启用', value: 'active' },
        { label: '禁用', value: 'inactive' },
      ],
    },
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
      <a-button type="primary" @click="formRef?.submit()">
        搜索
      </a-button>
      <a-button @click="formRef?.reset()">
        重置
      </a-button>
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
