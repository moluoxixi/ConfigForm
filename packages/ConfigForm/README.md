# @moluoxixi/config-form

一个轻量的 Vue 3 配置化表单组件库，使用 Zod 和字段级配置完成渲染、校验、显隐、禁用和提交转换。

## 特性

- 配置驱动：通过 `fields` 数组声明表单字段。
- UI 框架无关：支持 Vue 组件、函数式组件和全局组件名。
- Zod + 自定义校验：字段支持 `schema`，也支持读取全量 values 的 `validator`。
- 双向绑定：支持 `modelValue` / `v-model` 初始化和外部更新。
- 灵活布局：内置 24 栅格和 inline 模式，并包含基础移动端适配。
- 可发布样式：SCSS 使用命名空间变量，便于在业务侧覆盖。

## 安装

```bash
pnpm add @moluoxixi/config-form zod
```

## 快速开始

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { z } from 'zod'
import { ConfigForm, defineField } from '@moluoxixi/config-form'
import MyInput from './MyInput.vue'

const formRef = ref()
const model = ref({ username: 'Ada' })

const fields = [
  defineField({
    field: 'username',
    label: '用户名',
    schema: z.string().min(2, '至少 2 个字符'),
    span: 12,
    component: MyInput,
    props: { placeholder: '请输入' },
    validateOn: ['blur', 'change'],
  }),
  defineField({
    field: 'password',
    label: '密码',
    schema: z.string().min(6, '至少 6 个字符'),
    span: 12,
    component: MyInput,
    props: { type: 'password' },
  }),
  defineField({
    field: 'confirm',
    label: '确认密码',
    component: MyInput,
    span: 12,
    validator: (value, values) =>
      value === values.password ? undefined : '两次密码不一致',
  }),
]

function onSubmit(values: Record<string, any>) {
  console.log('提交', values)
}
</script>

<template>
  <ConfigForm
    ref="formRef"
    v-model="model"
    :fields="fields"
    label-width="80px"
    @submit="onSubmit"
  />
</template>
```

## ConfigForm Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `namespace` | `string` | `'cf'` | 运行时 CSS 类名前缀 |
| `inline` | `boolean` | `false` | 行内布局模式 |
| `fields` | `FieldDef[]` | - | 字段配置数组 |
| `labelWidth` | `string \| number` | - | 标签宽度，number 自动转 px |
| `modelValue` | `Record<string, any>` | - | 表单值，支持 `v-model` |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `submit` | `Record<string, any>` | 校验通过后提交的字段值 |
| `error` | `FormErrors` | 校验失败时的错误信息 |
| `update:modelValue` | `Record<string, any>` | 内部值变化时触发 |

## Expose

| Method | Returns | Description |
|--------|---------|-------------|
| `submit()` | `Promise<boolean>` | 校验通过后触发 `submit` |
| `validate()` | `Promise<boolean>` | 校验整个表单 |
| `validateField(field, trigger?)` | `Promise<boolean>` | 校验指定字段 |
| `reset()` | `void` | 重置为字段默认值并清空错误 |
| `setValue(field, value)` | `void` | 设置单个字段值 |
| `setValues(values, replace?)` | `void` | 批量设置字段值 |
| `getValue(field)` | `any` | 获取单个字段值 |
| `getValues()` | `Record<string, any>` | 获取浅拷贝快照 |
| `clearValidate(field?)` | `void` | 清除指定字段错误；不传则清除全部 |

## Field 配置

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `field` | `string` | - | 字段名，作为 values 的 key |
| `label` | `string` | - | 字段标签 |
| `schema` | `ZodTypeAny` | - | 字段 Zod 校验 |
| `validator` | `(value, values) => string \| string[] \| void \| Promise` | - | 自定义校验，可访问全量 values |
| `span` | `number` | `24` | 非 inline 模式下的 24 栅格跨度 |
| `component` | `Component \| Function \| string` | - | 实际渲染组件 |
| `props` | `Record<string, any>` | - | 传给组件的 props |
| `defaultValue` | `any` | `undefined` | 默认值 |
| `valueProp` | `string` | `'modelValue'` | 注入组件的值 prop |
| `trigger` | `string` | `'update:modelValue'` | 接收组件值变化的事件名 |
| `blurTrigger` | `string` | `'blur'` | blur 校验事件名 |
| `validateOn` | `'submit' \| 'blur' \| 'change' \| array` | `'submit'` | 校验触发时机，始终包含 submit |
| `visible` | `(values) => boolean` | - | 动态显隐 |
| `disabled` | `(values) => boolean` | - | 动态禁用 |
| `transform` | `(value, values) => any` | - | submit 前转换值 |
| `submitWhenHidden` | `boolean` | `false` | 隐藏字段是否仍提交 |
| `submitWhenDisabled` | `boolean` | `false` | 禁用字段是否仍提交 |
| `slots` | `Record<string, SlotRenderFn>` | - | 传给组件的插槽渲染函数 |

## 样式

默认命名空间是 `cf`。如果只使用默认样式：

```ts
import '@moluoxixi/config-form/styles'
```

自定义命名空间时，运行时 prop 和 SCSS 变量需要保持一致：

```scss
@use '@moluoxixi/config-form/styles' with (
  $namespace: 'my-form'
);
```

```vue
<ConfigForm namespace="my-form" />
```

## License

MIT
