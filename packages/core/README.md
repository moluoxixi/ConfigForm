# @config-form/core

一个极其轻量的 Vue 3 配置化表单组件库，使用 Zod 校验。

## 特性

- **配置驱动**：通过 `fields` 数组声明式定义表单字段
- **Zod 校验**：基于 Zod schema 的类型安全校验
- **布局灵活**：支持 Grid（24栅格）和 Inline 两种布局模式
- **组件无关**：支持任意 Vue 组件、函数式组件、全局注册组件
- **SCSS 命名空间**：`cf-` 前缀 BEM 命名，无 scoped，便于样式覆盖
- **TypeScript**：完整的类型推导，`defineField` 辅助函数自动推导组件 props 类型
- **轻量**：零 UI 框架依赖，仅 peerDependencies: vue + zod

## 安装

```bash
pnpm add @config-form/core zod
```

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
  defineField({
    field: 'email',
    label: '邮箱',
    type: z.string().email('请输入有效邮箱'),
    span: 12,
    component: MyInput,
    props: { placeholder: '请输入邮箱' },
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

## API

### ConfigForm Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fields` | `FieldDef[]` | — | 字段配置数组（必填） |
| `inline` | `boolean` | `false` | 行内布局模式 |
| `labelWidth` | `string \| number` | — | 标签宽度，number 自动加 px |
| `initialValues` | `Record<string, any>` | — | 初始值 |

### ConfigForm Events

| Event | Payload | Description |
|-------|---------|-------------|
| `submit` | `Record<string, any>` | 校验通过后提交，返回表单值 |
| `error` | `FormErrors` | 校验失败，返回错误信息 |

### ConfigForm Expose

| Method | Returns | Description |
|--------|---------|-------------|
| `submit()` | `Promise<boolean>` | 先校验再提交，通过 emit submit，失败 emit error |
| `validate()` | `Promise<boolean>` | 仅校验，失败 emit error |
| `reset()` | `void` | 重置表单值和错误信息 |

### FieldDef

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `field` | `string` | — | 字段标识（必填，作为值的 key） |
| `label` | `string` | — | 字段标签 |
| `type` | `ZodTypeAny` | — | Zod schema，不传则不校验 |
| `span` | `number` | `24` | 栅格占位，仅非 inline 模式 |
| `component` | `Component \| FunctionalFieldComponent \| string` | — | 渲染组件（必填） |
| `props` | `Record<string, any>` | — | 传递给 component 的 props |

### component 三种形态

1. **Vue 组件对象**：直接传入组件定义
2. **函数式组件 / JSX**：签名为 `(props: { modelValue, ... }, context: SetupContext) => VNode`
3. **字符串**：全局注册的组件名称

### defineField

类型辅助函数，自动推导 `component` 对应的 `props` 类型：

```ts
defineField({
  field: 'name',
  component: MyInput,
  props: { placeholder: '输入' },  // 自动推导 MyInput 的 props
})
```

## SCSS 命名空间

所有类名使用 `cf-` 前缀的 BEM 命名：

| 类名 | 说明 |
|------|------|
| `.cf-form` | 表单容器 |
| `.cf-form--inline` | 行内布局 |
| `.cf-field` | 字段容器 |
| `.cf-field--inline` | 行内字段 |
| `.cf-field__label` | 字段标签 |
| `.cf-field__control` | 控件区域 |
| `.cf-field__error` | 错误信息 |

### 自定义命名空间

覆盖 SCSS 变量：

```scss
// 在你的全局样式中
$namespace: 'my';

@import '@config-form/core/styles/variables';
```

## License

MIT
