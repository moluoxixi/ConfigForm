# ConfigForm

基于 Vue 3 + Zod 的轻量配置化表单组件。

## 快速开始

```vue
<script setup lang="ts">
import { z } from 'zod'
import { ConfigForm, defineField } from '@config-form/core'
import MyInput from './MyInput.vue'

const fields = [
  defineField({
    field: 'username',
    label: '用户名',
    type: z.string().min(2, '至少 2 个字符'),
    span: 12,
    component: MyInput,
    props: { placeholder: '请输入' },
  }),
]

function onSubmit(values: Record<string, any>) {
  console.log('提交', values)
}

function onError(errors: Record<string, string[]>) {
  console.error('校验失败', errors)
}
</script>

<template>
  <ConfigForm
    :fields="fields"
    label-width="80px"
    @submit="onSubmit"
    @error="onError"
  />
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `namespace` | `string` | `'cf'` | 命名空间前缀，影响 CSS 类名 |
| `inline` | `boolean` | `false` | 行内布局模式 |
| `fields` | `FieldDef[]` | — | 字段配置数组（必填） |
| `labelWidth` | `string \| number` | — | 标签统一宽度 |
| `initialValues` | `Record<string, any>` | — | 初始值 |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `submit` | `Record<string, any>` | 校验通过后提交 |
| `error` | `FormErrors` | 校验失败 |

## Expose

| Method | Returns | Description |
|--------|---------|-------------|
| `submit()` | `Promise<boolean>` | 先校验再提交 |
| `validate()` | `Promise<boolean>` | 仅校验 |
| `reset()` | `void` | 重置 |

## Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `field-error` | `{ error, field }` | 自定义错误展示 |
