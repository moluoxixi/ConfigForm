# @moluoxixi/config-form-plugin-i18n

ConfigForm 的官方 i18n 插件包。核心包只提供 runtime 协议和 `i18n()` token，本包负责把 token 解析为具体文案。

```ts
import { createFormRuntime, i18n } from '@moluoxixi/config-form'
import { createI18nPlugin } from '@moluoxixi/config-form-plugin-i18n'

const runtime = createFormRuntime({
  extensions: [
    createI18nPlugin({
      locale: 'zh-CN',
      fallbackLocale: 'en-US',
      messages: {
        'en-US': { 'field.name': 'Name' },
        'zh-CN': { 'field.name': '姓名' },
      },
    }),
  ],
})

const label = i18n('field.name', 'Name')
```
