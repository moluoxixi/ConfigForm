<script setup lang="ts">
import { defineComponent, h, ref } from 'vue'
import { z } from 'zod'
import { ConfigForm, defineField } from '@config-form/core'

const formRef = ref()

// 简易 Input 组件（演示用）
const SimpleInput = defineComponent({
  props: { modelValue: { type: String, default: '' }, placeholder: String },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () =>
      h('input', {
        value: props.modelValue,
        placeholder: props.placeholder,
        onInput: (e: Event) => emit('update:modelValue', (e.target as HTMLInputElement).value),
        style: { width: '100%', padding: '6px 8px', border: '1px solid #dcdfe6', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' },
      })
  },
})

// 简易 Select 组件（演示用）
const SimpleSelect = defineComponent({
  props: { modelValue: { type: String, default: '' }, options: Array as () => { label: string, value: string }[] },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () =>
      h('select', {
        value: props.modelValue,
        onChange: (e: Event) => emit('update:modelValue', (e.target as HTMLSelectElement).value),
        style: { width: '100%', padding: '6px 8px', border: '1px solid #dcdfe6', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' },
      }, props.options?.map(opt => h('option', { value: opt.value }, opt.label)))
  },
})

const fields = [
  defineField({
    field: 'username',
    label: '用户名',
    type: z.string().min(2, '用户名至少 2 个字符').max(20, '用户名最多 20 个字符'),
    span: 12,
    component: SimpleInput,
    props: { placeholder: '请输入用户名' },
  }),
  defineField({
    field: 'email',
    label: '邮箱',
    type: z.string().email('请输入有效的邮箱地址'),
    span: 12,
    component: SimpleInput,
    props: { placeholder: '请输入邮箱' },
  }),
  defineField({
    field: 'role',
    label: '角色',
    span: 12,
    component: SimpleSelect,
    props: {
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
    component: SimpleInput,
    props: { placeholder: '请输入简介' },
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
      :fields="fields"
      label-width="80px"
      @submit="onSubmit"
      @error="onError"
    />
    <div class="demo-actions">
      <button type="button" @click="formRef?.submit()">
        提交
      </button>
      <button type="button" @click="formRef?.validate()">
        校验
      </button>
      <button type="button" @click="formRef?.reset()">
        重置
      </button>
    </div>
  </div>
</template>

<style lang="scss">
.demo-actions {
  margin-top: 16px;
  display: flex;
  gap: 8px;

  button {
    padding: 8px 16px;
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
