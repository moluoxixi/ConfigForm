# @moluoxixi/config-form-plugin-i18n

ConfigForm 的官方 i18n 插件包。核心包只提供 runtime token 协议，本包提供 `i18n()` token 工厂并负责把 token 解析为具体文案。

```ts
import { createFormRuntime } from '@moluoxixi/config-form'
import { createI18nPlugin, i18n } from '@moluoxixi/config-form-plugin-i18n'

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
