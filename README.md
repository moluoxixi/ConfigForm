# ConfigForm — 配置化表单引擎

基于 Formily 思想重新设计的跨框架配置化表单引擎，支持 React 18 和 Vue 3。

## 包结构

```
@moluoxixi/core             ← 表单领域模型（框架无关）
@moluoxixi/reactive-mobx    ← MobX 响应式适配器（React 使用）
@moluoxixi/reactive-vue     ← Vue 原生响应式适配器
@moluoxixi/react            ← React 框架层（组件 + Hooks）
@moluoxixi/vue              ← Vue 框架层（组件 + Composables）
@moluoxixi/ui-antd          ← Ant Design (React) UI 适配
@moluoxixi/ui-antd-vue      ← Ant Design Vue UI 适配
@moluoxixi/ui-element-plus  ← Element Plus UI 适配
@moluoxixi/plugin-json-schema   ← JSON Schema 适配插件
@moluoxixi/plugin-lower-code    ← 低代码增强插件
```

## 架构分层

```
┌───────────────────────────────────────────────────────┐
│  UI 层 — 仅注册 UI 库特定的表单控件和装饰器            │
│  ui-antd / ui-antd-vue / ui-element-plus              │
│                                                       │
│  注册：Input / Select / DatePicker / FormItem 等       │
│  布局：LayoutTabs / LayoutCollapse / LayoutSteps 等    │
│  （布局组件调用框架层 useSchemaItems 获取面板，        │
│    只负责用各自 UI 库的 Tabs/Collapse/Steps 渲染）     │
├───────────────────────────────────────────────────────┤
│  框架层 — 跨 UI 库通用的组件逻辑                       │
│  @moluoxixi/react / @moluoxixi/vue                    │
│                                                       │
│  组件：ConfigForm / SchemaField / RecursionField       │
│        ReactiveField / FormField / FormArrayField      │
│        FormObjectField / FormVoidField / FormProvider   │
│        ArrayBase / ArrayItems / ArrayTable              │
│                                                       │
│  Hooks：useForm / useField / useFieldSchema            │
│         useSchemaItems / useFormValues                  │
│                                                       │
│  这些组件自带基础 UI（inline styles），                │
│  无需 UI 库即可工作。UI 库可注册覆盖。                 │
├───────────────────────────────────────────────────────┤
│  核心层 — 框架无关的领域模型                            │
│  @moluoxixi/core                                      │
│                                                       │
│  模型：Form / Field / ArrayField / ObjectField / VoidField │
│  Schema：编译 / 合并 / $ref 解析 / 模板 / i18n          │
│  验证：同步 / 异步 / 格式 / 跨字段 / 国际化消息        │
│  联动：ReactionEngine / 表达式引擎 / 循环检测          │
│  插件：Hook 管线（洋葱模型）/ 依赖拓扑排序             │
│  事件：完整生命周期事件系统                             │
│  数据源：远程加载 / 缓存 / 去重 / 取消                 │
├───────────────────────────────────────────────────────┤
│  响应式层 — 适配器模式                                 │
│  reactive-mobx（React）/ reactive-vue（Vue）           │
│                                                       │
│  Vue 直接使用 @vue/reactivity，React 使用 MobX。       │
│  运行时通过 setReactiveAdapter() 切换。                 │
└───────────────────────────────────────────────────────┘
```

### 设计动机

**为什么在框架层放组件？**

Formily 将 ArrayBase/ArrayItems 等放在 UI 包（@formily/antd），每个 UI 包重复实现。本项目认为这些组件的核心逻辑（Schema 递归渲染、数组增删排序、字段状态注入）与 UI 库无关，因此提升到框架层实现一次，自带 inline styles 作为默认 UI。UI 包只注册特定控件（Input/Select/FormItem）。

**布局组件的 Schema 感知：**

LayoutTabs / LayoutCollapse / LayoutSteps 等布局容器需要感知 Schema 结构（发现子面板、获取标题、渲染面板内容）。通过 `useFieldSchema()` + `useSchemaItems()` 在框架层实现通用的面板发现逻辑，UI 层布局组件只调用 hook 获取面板列表，用各自 UI 库的 Tabs/Collapse/Steps 渲染。参考 Formily 的 FormTab（useFieldSchema + RecursionField）架构。

## 与 Formily 的差异

| 维度 | Formily | ConfigForm |
|------|---------|------------|
| 响应式 | 自研 MobX-like 统一实现 | 适配器模式（Vue 用原生响应式，React 用 MobX） |
| 表单入口 | SchemaForm + FormLayout + FormButtonGroup | ConfigForm 单组件开箱即用 |
| 表单配置 | 分散在 Form 实例和多个组件 props | 集中在 schema.decoratorProps |
| 操作按钮 | 手动配置 | 自动渲染，三态自动隐藏 |
| 组件层级 | UI 包内实现（每个 UI 库重复） | 框架层实现一次，UI 层注册覆盖 |
| 布局 | 需 FormLayout 等组件 | 内置 grid / inline / vertical 布局 |

## 快速开始

```tsx
// React
import { ConfigForm } from '@moluoxixi/react'
import { setupAntd } from '@moluoxixi/ui-antd'

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

## 开发

```bash
pnpm install                    # 安装依赖
cd playground/react && pnpm dev # 启动 React playground (localhost:3002)
cd playground/vue && pnpm dev   # 启动 Vue playground (localhost:3001)
```

## 许可证

MIT
