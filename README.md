# ConfigForm — 配置化表单引擎

基于 Formily 思想重新设计的跨框架配置化表单引擎，支持 React 18 和 Vue 3。

## 包结构

```
@moluoxixi/core             ← 表单领域模型（框架无关）
@moluoxixi/reactive-react    ← MobX 响应式适配器（React 使用）
@moluoxixi/reactive-vue     ← Vue 原生响应式适配器
@moluoxixi/react            ← React 框架层（组件 + Hooks）
@moluoxixi/vue              ← Vue 框架层（组件 + Composables）
@moluoxixi/ui-antd          ← Ant Design (React) UI 适配
@moluoxixi/ui-antd-vue      ← Ant Design Vue UI 适配
@moluoxixi/ui-element-plus  ← Element Plus UI 适配
@moluoxixi/plugin-i18n-core ← i18n 核心插件（框架无关）
@moluoxixi/plugin-i18n-react← React + i18next 适配
@moluoxixi/plugin-i18n-vue  ← Vue + vue-i18n 适配
@moluoxixi/plugin-json-schema   ← JSON Schema 适配插件
@moluoxixi/plugin-lower-code    ← 低代码增强插件
```

## 架构分层

```
┌───────────────────────────────────────────────────────┐
│  UI 层 — UI 库专属的控件、装饰器、布局与数组组件       │
│  ui-antd / ui-antd-vue / ui-element-plus              │
│                                                       │
│  控件：Input / Select / DatePicker / FormItem 等       │
│  布局：LayoutTabs / LayoutCollapse / LayoutSteps 等    │
│  数组：ArrayField / ArrayTable / ArrayCards 等          │
│        ArrayBase 子组件（Addition / Remove 等）         │
│  操作：LayoutFormActions（提交 / 重置）                 │
│                                                       │
│  布局组件调用框架层 useSchemaItems 获取面板，           │
│  用各自 UI 库的 Tabs/Collapse/Table/Button 渲染。      │
├───────────────────────────────────────────────────────┤
│  框架层 — 跨 UI 库通用的组件逻辑（不含任何 UI 渲染）   │
│  @moluoxixi/react / @moluoxixi/vue                    │
│                                                       │
│  组件：ConfigForm / SchemaField / RecursionField       │
│        ReactiveField / FormField / FormArrayField      │
│        FormObjectField / FormVoidField / FormProvider   │
│                                                       │
│  Hooks：useForm / useField / useFieldSchema            │
│         useSchemaItems / useFormValues                  │
│                                                       │
│  框架层只做 Schema 递归渲染、字段状态注入、context      │
│  传递等与 UI 库无关的通用逻辑，不渲染任何具体 UI。     │
├───────────────────────────────────────────────────────┤
│  核心层 — 框架无关的领域模型                            │
│  @moluoxixi/core                                      │
│                                                       │
│  模型：Form / Field / ArrayField / ObjectField / VoidField │
│  Schema：编译 / 合并 / $ref 解析 / 模板                 │
│  验证：同步 / 异步 / 格式 / 跨字段                     │
│  联动：ReactionEngine / 表达式引擎 / 循环检测          │
│  插件：Hook 管线（洋葱模型）/ 依赖拓扑排序             │
│  事件：完整生命周期事件系统                             │
│  数据源：远程加载 / 缓存 / 去重 / 取消                 │
├───────────────────────────────────────────────────────┤
│  响应式层 — 适配器模式                                 │
│  reactive-react（React）/ reactive-vue（Vue）           │
│                                                       │
│  Vue 直接使用 @vue/reactivity，React 使用 MobX。       │
│  运行时通过 setReactiveAdapter() 切换。                 │
└───────────────────────────────────────────────────────┘
```

### 设计动机

**UI 组件为什么放在 UI 层（参考 Formily）？**

ArrayField / ArrayTable / ArrayBase 等组件的渲染与 UI 库强耦合（表格用 `ElTable` / `antd Table`，按钮用 `ElButton` / `antd Button`），因此遵循 Formily 的做法，由各 UI 包分别使用各自 UI 库的组件实现。框架层只提供 Schema 递归渲染、字段状态注入、context 传递等与 UI 库无关的通用逻辑。

**布局组件的 Schema 感知：**

LayoutTabs / LayoutCollapse / LayoutSteps 等布局容器需要感知 Schema 结构（发现子面板、获取标题、渲染面板内容）。通过 `useFieldSchema()` + `useSchemaItems()` 在框架层实现通用的面板发现逻辑，UI 层布局组件只调用 hook 获取面板列表，用各自 UI 库的 Tabs/Collapse/Steps 渲染。参考 Formily 的 FormTab（useFieldSchema + RecursionField）架构。

## 与 Formily 的差异

| 维度 | Formily | ConfigForm |
|------|---------|------------|
| 响应式 | 自研 MobX-like 统一实现 | 适配器模式（Vue 用原生响应式，React 用 MobX） |
| 表单入口 | SchemaForm + FormLayout + FormButtonGroup | ConfigForm 单组件开箱即用 |
| 表单配置 | 分散在 Form 实例和多个组件 props | 集中在 schema.decoratorProps |
| 操作按钮 | 手动配置 | 自动渲染，三态自动隐藏 |
| 组件层级 | UI 包内实现（每个 UI 库各自用对应组件实现） | 同 Formily，UI 组件在 UI 层实现 |
| 布局 | 需 FormLayout 等组件 | 内置 grid / inline / vertical 布局 |

## 快速开始

```tsx
// React
import { setReactiveAdapter } from '@moluoxixi/core'
import { ConfigForm } from '@moluoxixi/react'
import { mobxAdapter } from '@moluoxixi/reactive-react'
import { setupAntd } from '@moluoxixi/ui-antd'

setReactiveAdapter(mobxAdapter)
setupAntd()

const schema = {
  type: 'object',
  decoratorProps: { labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
  properties: {
    name: { type: 'string', title: '姓名', required: true },
    email: { type: 'string', title: '邮箱', rules: [{ format: 'email' }] },
  },
}

<ConfigForm schema={schema} onSubmit={console.log} />
```

## i18n（插件）

`ConfigForm` 本身不内置 i18n 运行时。推荐使用适配层包（React/Vue）接入成熟 i18n 库，核心包保持轻量。

```tsx
// React + i18next
import { createReactMessageI18nRuntime } from '@moluoxixi/plugin-i18n-react'

const i18n = createReactMessageI18nRuntime({
  messages: {
    'zh-CN': { 'field.name': '姓名' },
    'en-US': { 'field.name': 'Name' },
  },
  locale: 'zh-CN',
})

const formConfig = { plugins: [i18n.plugin] }
i18n.setLocale('en-US')
```

```ts
// Vue + vue-i18n
import { createVueMessageI18nRuntime } from '@moluoxixi/plugin-i18n-vue'

const i18n = createVueMessageI18nRuntime({
  messages: {
    'zh-CN': { 'field.name': '姓名' },
    'en-US': { 'field.name': 'Name' },
  },
  locale: 'zh-CN',
})

const plugins = [i18n.plugin]
i18n.setLocale('en-US')
```

底层框架无关能力在 `@moluoxixi/plugin-i18n-core`，可直接对接你自己的 i18n 实例。

## 开发

```bash
pnpm install                    # 安装依赖
cd playground/react && pnpm dev # 启动 React playground (localhost:3002)
cd playground/vue && pnpm dev   # 启动 Vue playground (localhost:3001)
```

## TODO

- [ ] 可视化表单设计器 — 拖拽式设计器，支持非技术人员通过拖拽创建表单
- [x] DevTools 调试工具 — 浮动面板插件（`@moluoxixi/plugin-devtools`），字段树/事件时间线/值 Diff/实时编辑/一键验证

## 许可证

MIT
