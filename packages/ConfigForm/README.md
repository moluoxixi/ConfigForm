# @moluoxixi/config-form

一个轻量的 Vue 3 配置化表单组件库，使用 Zod 和字段级配置完成渲染、校验、显隐、禁用和提交转换。

## 特性

- 配置驱动：通过 `fields` 数组声明表单字段。
- UI 框架无关：支持 Vue 组件、函数式组件、原生标签和 runtime 组件注册。
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

interface LoginForm {
  username: string
  password: string
  confirm: string
}

const formRef = ref()
const model = ref<LoginForm>({ username: 'Ada', password: '', confirm: '' })

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

function onSubmit(values: LoginForm) {
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
| `fields` | `FieldConfig[]` | - | 字段配置数组；`defineField` 返回的就是纯配置 |
| `labelWidth` | `string \| number` | - | 标签宽度，number 自动转 px |
| `modelValue` | `Record<string, unknown>` | - | 表单值，支持 `v-model`；传泛型后为对应表单类型 |
| `runtime` | `FormRuntime \| FormRuntimeOptions` | - | DIY 运行时，用于组件注册、runtime token、表达式、插件扩展和调试 |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `submit` | `Record<string, unknown>` | 校验通过后提交的字段值；传泛型后为对应表单类型 |
| `error` | `FormErrors` | 校验失败时的错误信息 |
| `update:modelValue` | `Record<string, unknown>` | 内部值变化时触发；传泛型后为对应表单类型 |

## Expose

| Method | Returns | Description |
|--------|---------|-------------|
| `submit()` | `Promise<boolean>` | 校验通过后触发 `submit` |
| `validate()` | `Promise<boolean>` | 校验整个表单 |
| `validateField(field, trigger?)` | `Promise<boolean>` | 校验指定字段 |
| `reset()` | `void` | 重置为字段默认值并清空错误 |
| `setValue(field, value)` | `void` | 设置单个字段值 |
| `setValues(values, replace?)` | `void` | 批量设置字段值 |
| `getValue(field)` | `unknown` | 获取单个字段值；传泛型后可按字段 key 推导 |
| `getValues()` | `Record<string, unknown>` | 获取浅拷贝快照；传泛型后为对应表单类型 |
| `clearValidate(field?)` | `void` | 清除指定字段错误；不传则清除全部 |

## Field 配置

`defineField` 会优先从 `schema` 和 `defaultValue` 推导当前字段值类型；没有可推导来源时，字段值默认为 `unknown`。它只返回纯 `FieldConfig`，所有默认值、显隐、禁用、组件注册和 token 解析都由 runtime 管线处理。字段配置彼此独立，`validator` 的第二个参数是当前表单 values 快照，可用于必要的跨字段校验。

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `field` | `string` | - | 字段名，作为 values 的 key |
| `label` | `RuntimeText` | - | 字段标签；支持字符串或 runtime token |
| `schema` | `ZodTypeAny` | - | 字段 Zod 校验 |
| `validator` | `(value, values) => string \| string[] \| void \| Promise` | - | 自定义校验，可访问全量 values |
| `span` | `number` | `24` | 非 inline 模式下的 24 栅格跨度 |
| `component` | `Component \| Function \| string` | - | 实际渲染组件 |
| `props` | `Record<string, unknown>` | - | 传给组件的 props |
| `defaultValue` | `unknown` | `undefined` | 默认值；会参与 `defineField` 字段值推导 |
| `valueProp` | `string` | `'modelValue'` | 注入组件的值 prop |
| `trigger` | `string` | `'update:modelValue'` | 接收组件值变化的事件名 |
| `blurTrigger` | `string` | `'blur'` | blur 校验事件名 |
| `validateOn` | `'submit' \| 'blur' \| 'change' \| array` | `'submit'` | 校验触发时机，始终包含 submit |
| `visible` | `boolean \| ExpressionToken<boolean> \| (values) => boolean` | - | 动态显隐 |
| `disabled` | `boolean \| ExpressionToken<boolean> \| (values) => boolean` | - | 动态禁用 |
| `transform` | `(value, values) => unknown` | - | submit 前转换值 |
| `submitWhenHidden` | `boolean` | `false` | 隐藏字段是否仍提交 |
| `submitWhenDisabled` | `boolean` | `false` | 禁用字段是否仍提交 |
| `slots` | `Record<string, SlotContent>` | - | 传给组件的插槽；支持文本、渲染函数、`defineField` 递归字段或配置数组 |

`defineField` 返回的 slot 会继续交给 `FormField` 递归渲染，适合配置 Radio / Checkbox 这类子组件，并让子组件配置获得 props 和字段值推导：

```ts
defineField({
  field: 'gender',
  label: '性别',
  component: RadioGroup,
  slots: {
    default: [
      defineField({ field: 'gender-male', component: Radio, props: { value: 'male' }, slots: { default: '男' } }),
      defineField({ field: 'gender-female', component: Radio, props: { value: 'female' }, slots: { default: '女' } }),
    ],
  },
})
```

## DIY Runtime

`runtime` 是表单的开放扩展边界。字段始终是纯配置，runtime 在渲染、校验和提交前规范化字段，并解析组件、表达式、插槽和插件扩展。国际化等官方插件以独立包接入，例如 `@moluoxixi/config-form-plugin-i18n`。

```vue
<script setup lang="ts">
import { ConfigForm, createFormRuntime, defineField, expr } from '@moluoxixi/config-form'
import { createI18nPlugin, i18n } from '@moluoxixi/config-form-plugin-i18n'
import MyInput from './MyInput.vue'

const runtime = createFormRuntime({
  components: {
    MyInput,
  },
  extensions: [
    createI18nPlugin({
      locale: 'zh-CN',
      messages: {
        'zh-CN': {
          'field.username': '用户名{required}',
        },
      },
    }),
    {
      name: 'audit',
      priority: 10,
      resolveField: field => ({
        ...field,
        props: {
          ...field.props,
          'data-field': field.field,
        },
      }),
    },
  ],
  debug: {
    emit: event => console.debug('[ConfigForm]', event),
  },
})

const fields = [
  defineField({
    field: 'username',
    label: i18n('field.username', '用户名', { required: ' *' }),
    component: 'MyInput',
    visible: expr({ left: { path: 'values.role' }, op: 'neq', right: 'guest' }, true),
  }),
]
</script>

<template>
  <ConfigForm :fields="fields" :runtime="runtime" />
</template>
```

Token：

- `expr(expression, fallback?)`：核心内置表达式 token，用于 `visible`、`disabled`、`props` 等位置的安全表达式解析，不执行字符串代码；非法表达式配置会直接抛错。
- `i18n(key, defaultMessage?, params?)`：由 `@moluoxixi/config-form-plugin-i18n` 提供，用于 `label`、`props`、`slots` 等位置的文案 token。

扩展点：

- `components`：注册字符串组件 key，字段中可直接写 `component: 'MyInput'`；大写 key 未注册会抛错，原生标签如 `'input'` 可直接使用。
- `extensions`：按 `priority` 从小到大执行，可实现 `tokens`、`prepareField`、`resolveValue`、`resolveField`、`resolveSlot`、`resolveVisible`、`resolveDisabled` 和 `onDebugEvent`。
- 官方插件包：例如 `@moluoxixi/config-form-plugin-i18n`，支持 `locale`、`messages`、`translate`、`missing`，并支持字符串模板 `{name}` 插值；没有命中当前语言文案或默认文案时会抛错，`missing` 仅用于通知/诊断。
- `conflictStrategy`：组件名或插件名冲突时可选 `'error'`、`'warn'`、`'last-write-wins'`，默认 `'error'`；需要宽松覆盖时必须显式声明。
- `expression.evaluate`：接入自定义表达式引擎；返回 `undefined` 时回退到内置表达式解析。

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
