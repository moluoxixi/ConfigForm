# ConfigForm Devtools Design

## 背景

ConfigForm 已经具备 `defineField` 字段工厂、运行时扩展、递归 slot 字段渲染和 playground 示例。本设计新增一个开发态源码导航与性能监控套件，用于定位 `defineField` 源码、还原 `FormField` 递归拓扑、采集单个字段实例的 patch 耗时，并通过全局悬浮 UI 进行交互。

本能力必须只存在于开发环境。生产构建不能引入调试 UI、IDE 跳转接口、DOM 高亮逻辑或调试元数据注入逻辑。

## 目标

- 在构建阶段识别 `defineField` / `defineFieldFor<T>()({...})` 调用，并为对象字面量配置注入源码位置。
- 在运行时还原顶层字段和递归 slot 字段形成的逻辑树。
- 采集每个真实 `FormField` 实例的 patch duration，并实时同步给全局调试 UI。
- 在 `document.body` 挂载可拖拽、可吸边隐藏的悬浮入口。
- 展示字段树、字段 key、label、实时 patch 耗时。
- 鼠标悬浮树节点时高亮页面中的真实字段实例。
- 点击源码按钮时通过 Vite dev server 唤起 IDE 并定位到字段定义行。

## 非目标

- 不实现生产环境分析器。
- 不替代 Vue Devtools 的完整 profiler。
- 不为非 `defineField` 创建的任意对象推断源码位置。
- 不解析运行时动态生成字段的源位置；动态字段可以进入拓扑树，但没有源码跳转按钮。
- 不把调试 UI、Vite 插件或 open-in-editor server middleware 放进核心包运行时依赖。

## 推荐方案

采用独立包 `@moluoxixi/config-form-devtools` 加核心包最小 dev hook。

核心包负责：

- 扩展字段类型，允许开发态源码元数据。
- 在 `FormField` 生命周期内暴露实例注册、注销、DOM 引用、父子关系和 patch 耗时。
- 在 `ConfigForm` 根节点提供当前调试上下文。

Devtools 包负责：

- Vite AST 注入。
- 全局 store。
- 悬浮 UI。
- DOM 高亮。
- IDE 跳转 middleware。

这样可以让 `@moluoxixi/config-form` 保持组件库职责，避免生产包绑定调试面板和 dev server 行为。

## 包结构

新增包：

```txt
packages/ConfigFormDevtools/
  package.json
  index.ts
  vite.ts
  src/
    types.ts
    vite/
      defineFieldSourcePlugin.ts
      openInEditorMiddleware.ts
    runtime/
      bridge.ts
      devtoolsStore.ts
      installDevtools.ts
    overlay/
      DevtoolsBubble.vue
      DevtoolsPanel.vue
      FieldTree.vue
      highlight.ts
      styles.scss
```

核心包新增或修改：

```txt
packages/ConfigForm/src/types/index.ts
packages/ConfigForm/src/runtime/types.ts
packages/ConfigForm/src/components/FormField/src/index.vue
packages/ConfigForm/src/index.vue
packages/ConfigForm/index.ts
```

## 公共数据契约

核心包新增字段源码元数据类型：

```ts
export interface FieldSourceMeta {
  id: string
  file: string
  line: number
  column: number
}

export interface FieldConfig {
  __source?: FieldSourceMeta
}
```

`ResolvedField` 必须保留 `__source`。如果字段没有源码信息，运行时不得制造默认值。

核心包新增开发态桥接接口：

```ts
export interface FormFieldDevtoolsNode {
  id: string
  parentId?: string
  formId: string
  field: string
  label?: string
  embedded: boolean
  slotName?: string
  source?: FieldSourceMeta
}

export interface FormFieldPatchMetric {
  id: string
  duration: number
  timestamp: number
}

export interface FormDevtoolsBridge {
  registerField: (node: FormFieldDevtoolsNode, element: HTMLElement | null) => void
  updateField: (node: FormFieldDevtoolsNode, element: HTMLElement | null) => void
  recordPatch: (metric: FormFieldPatchMetric) => void
  unregisterField: (id: string) => void
}
```

桥接对象通过 Vue provide/inject 或 runtime devtools option 传入。核心包只依赖类型和空值判断，不静态 import devtools 包。

## 构建期源码注入

Devtools Vite 插件只在开发模式启用：

```ts
import { configFormDevtools } from '@moluoxixi/config-form-devtools/vite'

export default defineConfig({
  plugins: [
    Vue(),
    configFormDevtools(),
  ],
})
```

插件处理 `.ts`、`.tsx`、`.js`、`.jsx`、`.vue` 文件。Vue SFC 只转换 `<script>` 和 `<script setup>`。

识别规则：

- 只转换绑定到 ConfigForm 的 `defineField` 和 `defineFieldFor`。
- 只处理第一个参数为对象字面量的调用。
- 支持 `defineField({...})`。
- 支持 `const f = defineFieldFor<T>(); f({...})`。
- 支持 `defineFieldFor<T>()({...})`。
- 如果对象已存在 `__source`，插件必须抛错，不允许覆盖。
- 不能解析的位置必须抛错，不允许注入空对象或跳过成功。

注入形态：

```ts
defineField({
  field: 'username',
  component: ElInput,
  __source: {
    id: 'sha1(file:line:column)',
    file: 'D:/project-new/ConfigForm/playgrounds/element-plus-playground/src/demos/GridForm.vue',
    line: 55,
    column: 3,
  },
})
```

`id` 用规范化绝对路径、行号、列号生成。路径分隔符统一为 `/`，便于浏览器端展示和跨平台比较。

## 为什么不只改 defineField

`defineField` 是运行时函数，只能拿到配置对象，无法可靠知道源码文件、行号和列号。通过 `Error().stack` 反推会受到 SFC 转换、source map、浏览器栈格式、HMR 和 bundle 位置影响，失败时容易产生不准确但继续运行的隐性降级。

源码位置属于编译期事实，应在 AST 阶段注入。`defineField` 只负责承载字段定义契约并保留注入后的 metadata。

拓扑、DOM 高亮和 patch duration 也不能放在 `defineField` 内，因为它不代表真实组件实例。一个配置可能不渲染、被复用、多次 mount，或者由 slot 函数动态返回。真实父子关系、DOM 元素和更新耗时只能在 `FormField` 生命周期内采集。

## 运行时拓扑采集

`ConfigForm` 创建 `formId`，并 provide 给内部 `FormField`。

每个 `FormField`：

- 注入父节点 id。
- 生成本实例 `nodeId`。
- 注册自身字段、label、embedded 状态、slotName、source。
- 将自身 `nodeId` provide 给递归 slot 子字段。
- 在 unmount 时注销自身。

递归 slot 子字段需要在 `normalizeSlotValue()` 产出节点时携带当前 slot 名称。这样面板可以显示类似：

```txt
gender
  default
    gender-male
    gender-female
    gender-other
```

如果一个 slot 返回普通文本或 VNode，不注册为字段节点。

## Patch Duration 采集

在 `FormField` 中使用 Vue 生命周期近似采样：

- `onBeforeUpdate()` 记录 `performance.now()`。
- `onUpdated()` 计算 duration 并调用 `recordPatch()`。
- 首次 mount 可记录 mount duration，但 UI 默认展示 patch duration。

Devtools store 维护：

```ts
interface FieldPerformanceStats {
  lastPatchMs?: number
  maxPatchMs?: number
  avgPatchMs?: number
  samples: number
}
```

批量同步策略：

- `recordPatch()` 只写入内存队列。
- 使用 `requestAnimationFrame` 合并 UI 更新。
- 面板最多保留最近 N 次样本，避免长时间开发导致内存增长。

UI 文案使用 `Patch ms`，不声称等同 Vue Devtools profiler。

## 全局悬浮 UI

Devtools 包在浏览器开发态安装时挂载：

```ts
installConfigFormDevtools()
```

安装逻辑：

- 检查 `document` 是否存在。
- 创建唯一容器 `#cf-devtools-root`。
- 挂载 Vue overlay 应用。
- 重复安装时抛错或返回已有实例，不能创建多个根节点。

交互：

- 右下角悬浮气泡。
- 气泡可拖拽。
- 拖拽到左右边缘时吸边，空闲状态半隐藏。
- 点击气泡展开面板。
- 面板展示所有 form root，可切换当前表单。
- 树节点显示 `field`、`label`、`Patch ms`。
- 慢节点分级：`>16ms` warning，`>50ms` danger。
- 搜索框可按 field / label / file 过滤。

样式前缀统一为 `cf-devtools-*`，避免污染业务组件。

## DOM 高亮

`registerField()` 保存 `HTMLElement` 引用。树节点 hover 时：

- 读取元素 `getBoundingClientRect()`。
- 在 body 上绘制 fixed overlay。
- overlay 使用 `pointer-events: none`。
- 页面滚动、resize 时重新计算。
- 元素不存在或已卸载时移除高亮并在 store 中清理节点。

隐藏或未渲染字段不显示高亮按钮。动态消失的节点必须注销，不能保留过期 DOM。

## IDE 跳转

Vite 插件注册 dev server middleware：

```txt
POST /__config-form-devtools/open
```

请求：

```json
{
  "file": "D:/project-new/ConfigForm/playgrounds/element-plus-playground/src/demos/GridForm.vue",
  "line": 55,
  "column": 3
}
```

规则：

- 只允许打开 Vite root 或 configured allow list 内的文件。
- 文件不存在返回 404。
- 参数非法返回 400。
- IDE 启动失败返回 500。
- 前端面板展示失败原因。

默认优先使用 Vite dev server 的 open-in-editor 能力；如果不可用，按配置执行：

```ts
configFormDevtools({
  editor: 'code'
})
```

支持 `code`、`cursor`、`webstorm` 和自定义命令。

## 生产隔离

必须同时满足：

- Vite 插件默认只在 `serve` / development 启用。
- 核心包中 dev hook 调用必须包裹在 `if (import.meta.env.DEV)`。
- 核心包不得静态 import `@moluoxixi/config-form-devtools`。
- 生产构建产物不应包含 `cf-devtools`、`/__config-form-devtools/open`、`openInEditor`、调试 overlay 组件。
- 字段对象里的 `__source` 只由开发态插件注入，生产构建不注入。

如生产构建检查发现调试标识残留，视为构建失败。

## 错误处理

遵循项目全局规则：不得用错误回退机制掩盖真实失败。

- AST 解析失败：抛出带文件路径和插件名的错误。
- 无法确定源码位置：抛出错误。
- 用户手写 `__source`：抛出错误。
- middleware 打开失败：返回明确 HTTP 错误，前端显示错误。
- store 注册同 id 但字段不一致：抛出错误或记录冲突后阻塞当前更新，不能静默覆盖。
- DOM 引用失效：注销节点或显示 detached 状态，不能继续高亮过期元素。

允许捕获错误的场景仅限于补充上下文、资源清理或转换为等价失败语义。

## 测试计划

核心包测试：

- `defineField` 保留 `__source`。
- runtime resolve 后保留 `__source`。
- `FormField` mount 时注册节点。
- `FormField` update 后记录 patch duration。
- `FormField` unmount 后注销节点。
- slot 递归字段注册 parentId 和 slotName。
- 无 bridge 时开发态不崩溃，生产态不触发调试逻辑。

Devtools 包测试：

- Vite 插件注入 `defineField({...})`。
- Vite 插件注入 `defineFieldFor<T>()({...})`。
- Vue SFC `<script setup>` 注入位置正确。
- 已有 `__source` 时抛错。
- 生产模式不注入。
- open middleware 参数校验、越界路径、文件不存在、成功打开路径。
- store 能构建树、更新性能统计、清理节点。
- overlay 树节点 hover 调用高亮。

集成验证：

- 在 Element Plus playground 启用 devtools。
- 在 Ant Design Vue playground 启用 devtools。
- 点击树节点源码按钮能打开对应 `GridForm.vue` 行。
- hover 树节点能高亮真实表单字段。
- 修改字段触发 patch 耗时刷新。

质量检查命令：

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:coverage
pnpm build
```

如果某类检查脚本或工具缺失，最终交付必须明确报告缺失项，不能声称通过。

## 实施顺序

1. 核心类型和 dev bridge：先定义协议，不接 UI。
2. `FormField` 生命周期采集：完成注册、注销、patch duration、slot parentId。
3. Devtools store：实现树构建和性能聚合。
4. Vite 注入插件：完成源码 metadata 注入和单元测试。
5. Overlay UI：完成气泡、面板、树、高亮。
6. IDE 跳转 middleware：完成 open endpoint。
7. Playground 接入：两个 playground 都启用 devtools。
8. 生产隔离检查：确认构建产物无调试残留。

## 验收标准

- 开发态可以看到全局悬浮气泡。
- 面板可以展示顶层字段和递归 slot 字段的层级关系。
- 每个节点显示 key / label / patch duration。
- hover 节点能高亮真实 `FormField` 实例。
- 有源码信息的节点可以一键打开 IDE 到 `defineField` 定义位置。
- 动态 slot 字段能进入拓扑树；没有源码信息时明确禁用跳转。
- 生产构建没有 devtools UI、middleware 和源码注入残留。
- 所有项目既有质量检查命令执行并报告结果。
