# @moluoxixi/config-form-plugin-i18n

ConfigForm 的官方 i18n 插件包。核心包只提供 runtime token 协议和插件生命周期，本包通过 `i18n()` token 把字段 label、props、slots 和嵌套 props 文案解析为当前语言文案。

插件不会捕获 `locale`、`translate`、消息函数或 `missing` 里的异常，未解析到当前语言文案且没有 `defaultMessage` 时会直接抛错。`missing` 仅用于通知/诊断，返回值不会替代缺失文案。

```ts
import type { FormRuntimeOptions } from '@moluoxixi/config-form'
import { defineField } from '@moluoxixi/config-form'
import { createI18nPlugin, i18n } from '@moluoxixi/config-form-plugin-i18n'

const runtimeOptions = {
  plugins: [
    createI18nPlugin({
      locale: 'zh-CN',
      messages: {
        'en-US': { 'field.name': 'Name' },
        'zh-CN': {
          'field.name': '姓名',
          'field.name.placeholder': '请输入姓名',
        },
      },
    }),
  ],
} satisfies FormRuntimeOptions

const field = defineField({
  field: 'name',
  component: 'input',
  label: i18n('field.name', { defaultMessage: 'Name' }),
  props: {
    placeholder: i18n('field.name.placeholder', { defaultMessage: 'Enter name' }),
  },
})
```

`i18n(key, options?)` 可用于 `label`、`props`、`slots`、选项数组等 runtime 会解析的位置：

```ts
i18n('field.username.label', {
  defaultMessage: '用户名',
  params: { min: 2, max: 20 },
})
```
