<script setup lang="ts">
import { defineComponent, h, ref } from 'vue'
import { z } from 'zod'
import { ConfigForm, defineField } from '@config-form/core'

const formRef = ref()

// 简易 Input 组件
const SimpleInput = defineComponent({
  props: { modelValue: { type: String, default: '' }, placeholder: String },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () =>
      h('input', {
        value: props.modelValue,
        placeholder: props.placeholder,
        onInput: (e: Event) => emit('update:modelValue', (e.target as HTMLInputElement).value),
        style: { padding: '4px 8px', border: '1px solid #dcdfe6', borderRadius: '4px', fontSize: '14px' },
      })
  },
})

const fields = [
  defineField({
    field: 'keyword',
    label: '关键词',
    type: z.string().min(1, '请输入关键词'),
    component: SimpleInput,
    props: { placeholder: '搜索...' },
  }),
  defineField({
    field: 'status',
    label: '状态',
    component: SimpleInput,
    props: { placeholder: '状态筛选' },
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
      :fields="fields"
      :inline="true"
      @submit="onSubmit"
      @error="onError"
    />
    <div class="demo-actions">
      <button type="button" @click="formRef?.submit()">
        搜索
      </button>
      <button type="button" @click="formRef?.reset()">
        重置
      </button>
    </div>
  </div>
</template>

<style lang="scss">
.demo-actions {
  margin-top: 12px;

  button {
    padding: 6px 16px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    background: #409eff;
    color: white;
    cursor: pointer;
    font-size: 14px;

    &:hover {
      background: #66b1ff;
    }
  }
}
</style>
