# ConfigForm 问题清单（对比 Formily 源码）

## 一、框架层包含 UI 实现（应下沉到 UI 层）

> 框架包（`packages/vue`、`packages/react`）应只提供与 UI 无关的通用逻辑（context、hooks、字段递归渲染等），
> 具体的 UI 渲染应由各 UI 包（`ui-element-plus`、`ui-antd`、`ui-antd-vue`）提供。
> **Formily 的做法**：`@formily/react` / `@formily/vue` 不含任何 UI 组件，所有 `ArrayTable`、`ArrayBase` 等全部在 `@formily/antd` / `@formily/element` 中实现，使用对应 UI 库组件。

### `packages/vue` 中的问题

- [ ] **`ArrayTable.ts`** — 直接渲染原生 `<table>` + 硬编码内联样式，应由 UI 层用 `ElTable` / `a-table` 实现
- [ ] **`ArrayItems.ts`** — 直接渲染 `<div>` 卡片布局 + 硬编码内联样式
- [ ] **`ArrayBase.ts` → `Addition`** — 直接渲染原生 `<button>` + 内联样式（颜色、边框、hover），应由 UI 层用 `ElButton` / `a-button`
- [ ] **`ArrayBase.ts` → `Remove / MoveUp / MoveDown`** — 同上，直接渲染原生 `<button>`
- [ ] **`ArrayBase.ts` → `Index`** — 直接渲染 `<span>` + 硬编码样式（影响较小）

### `packages/react` 中的问题

- [ ] **`ArrayTable.tsx`** — 直接渲染原生 `<table>` + 硬编码样式，应由 UI 层用 `antd Table`
- [ ] **`ArrayItems.tsx`** — 直接渲染 `<div>` 卡片布局 + 硬编码样式
- [ ] **`ArrayCards.tsx`** — 直接渲染 `<div>` 卡片 + 硬编码阴影/边框，应由 UI 层用 `antd Card`
- [ ] **`ArrayCollapse.tsx`** — 直接渲染折叠面板 + 硬编码三角图标，应由 UI 层用 `antd Collapse`
- [ ] **`ArrayBase.tsx` → `Addition / Remove / MoveUp / MoveDown`** — 直接渲染原生 `<button>` + 内联样式
- [ ] **`Editable.tsx`** — 直接渲染 `<div>` 编辑容器 + 硬编码 hover/border 样式
- [ ] **`EditablePopover.tsx`** — 直接渲染"简易 Popover"（`position: absolute` + `boxShadow`），应由 UI 层用 `antd Popover`
- [ ] **`DiffViewer.tsx`** — 直接渲染对比表格 + 硬编码颜色/样式

### UI 包的注册问题

- [ ] **`ui-element-plus/index.ts`** — 直接从 `@moluoxixi/vue` 导入 `ArrayTable`、`ArrayItems` 注册，应改为 UI 层自行用 Element Plus 组件实现
- [ ] **`ui-antd/index.ts`** — 直接从 `@moluoxixi/react` 导入 `ArrayCards`、`ArrayCollapse`、`ArrayItems`、`ArrayTable`、`Editable`、`EditablePopover`、`FormLayout`、`Space` 注册，应改为 UI 层自行用 antd 组件实现
- [ ] **`ui-antd-vue/index.ts`** — 直接从 `@moluoxixi/vue` 导入 `ArrayTable`、`ArrayItems` 注册，应改为 UI 层自行用 ant-design-vue 组件实现

---

## 二、框架层缺少的组件和 Hooks

> ConfigForm 的 core 已有完整 `{{expression}}` 引擎（支持 `$self/$values/$form/$record/$index/$deps`），
> 但框架层（`packages/react`、`packages/vue`）**没有暴露对应的组件和 hooks** 让用户在组件层面使用这些能力。

### 缺少的组件

- [ ] **`ExpressionScope`** — 允许在组件树中注入/扩展自定义表达式变量。core 有 `ExpressionScope` 类型定义，但无框架层组件
- [ ] **`RecordScope`** — 数组循环中注入 `$record`/`$index`/`$lookup` 到子组件。reaction engine 内部用了，但无组件暴露给用户

### 缺少的 Hooks

- [ ] **`useFormEffects`** — 在组件内部注册表单副作用（生命周期联动）
- [ ] **`useExpressionScope`** — 获取当前 Schema 表达式作用域
- [ ] **`useParentForm`** — 获取父级 Form 实例（嵌套表单场景）

### `ArrayBase` 缺少的子组件

- [ ] **`ArrayBase.Copy`** — 复制数组项按钮（Formily antd/element 都有，ConfigForm react/vue 都没有）
- [ ] **`ArrayBase.SortHandle`** — 拖拽排序手柄（React 侧已有独立 `ArraySortable` 组件，方案不同但功能类似，可评估是否需要）
- [ ] **`useRecord`** — 获取当前数组行的完整数据对象（目前只有 `useIndex`，缺少获取行数据的能力）

---

## 三、Vue 缺少 React 已有的组件（功能缺失）

> `packages/react` 已实现但 `packages/vue` 中未提供对应实现的组件。

- [ ] **`ArrayCards`** — React 有卡片式数组组件，Vue 缺少
- [ ] **`ArrayCollapse`** — React 有折叠面板式数组组件，Vue 缺少
- [ ] **`ArraySortable`** — React 有拖拽排序容器（HTML5 DnD），Vue 缺少
- [ ] **`Editable`** — React 有内联可编辑容器（点击切换编辑/阅读态），Vue 缺少
- [ ] **`EditablePopover`** — React 有 Popover 弹出编辑容器，Vue 缺少
- [ ] **`FormLayout`** — React 有布局容器（context 嵌套覆盖 labelPosition/labelWidth），Vue 缺少
- [ ] **`Space`** — React 有间距布局组件，Vue 缺少
- [ ] **`DiffViewer`** — React 有表单值对比渲染组件，Vue 缺少
- [ ] **`DevTools`** — React 有开发者工具组件，Vue 缺少

---

## 四、UI 层缺少的组件（Formily antd/element 有但 ConfigForm 全部 UI 包没有）

> 以下组件在 Formily 的 `@formily/antd` 和 `@formily/element` 中都有实现。
> 已排除 ConfigForm 已覆盖的功能（如 `LayoutFormActions` 已覆盖 `Submit`/`Reset`）。

- [ ] **`ArrayTabs`** — 标签页式数组渲染（每个数组项一个 tab）
- [ ] **`FormButtonGroup`** — 按钮组布局容器（居左/居中/居右/吸底，Formily 有 `Sticky` 子组件）
- [ ] **`FormGrid`** — 独立的栅格布局组件，可在 Schema 任意层级嵌套使用（ConfigForm 已有根级 `layout.type='grid'`，但不支持嵌套不同列数的场景）
- [ ] **`SelectTable`** — Select + Table 组合选择器（antd 特有，优先级低）

### 已确认不缺少（ConfigForm 已覆盖）

| Formily 组件 | ConfigForm 对应实现 |
|---|---|
| `Submit` / `Reset` | `LayoutFormActions`（各 UI 包已实现） ✅ |
| `FormLayout` | React 侧 `FormLayout` 组件已有 ✅（Vue 侧缺少） |
| `FormDialog` / `FormDrawer` | 非核心，按需实现 |
| `Form` 容器 | `ConfigForm` 覆盖（含 layout/actions 配置） ✅ |

---

## 五、正确的参考示例

以下是当前**已正确实现分层**的组件，可作为后续重构的参照：

| UI 包 | 组件 | 使用的 UI 库组件 |
|--------|------|------------------|
| `ui-element-plus` | `LayoutTabs` | `ElTabs`, `ElTabPane`, `ElBadge` ✅ |
| `ui-element-plus` | `LayoutCollapse` | `ElCollapse`, `ElCollapseItem` ✅ |
| `ui-element-plus` | `LayoutCard` | `ElCard` ✅ |
| `ui-element-plus` | `FormItem` | `ElFormItem` ✅ |
| `ui-antd` | `LayoutTabs` | `antd Tabs` ✅ |
| `ui-antd` | `FormItem` | `antd Form.Item` ✅ |
| `ui-antd` | `LayoutFormActions` | `antd Button` ✅ |

---

## 六、Playground 示例问题

> 全部 52 个示例逐一审查后发现的问题，分 5 类。

### 6.1 `componentProps.style` 用了字符串，应为对象

React 要求 `style` 为 `CSSProperties` 对象，UI 层组件内部也均使用对象格式（如 `style={{ width: '100%' }}`），
但以下示例传了 CSS 字符串，React 运行时会报错：

| 文件 | 行 | 当前值 |
|------|-----|--------|
| `ComponentSwitchForm.ts` | L95, L100 | `style: 'width: 100%'` |
| `PaginatedSearchForm.ts` | L50 | `style: 'width: 400px'` |
| `RemoteDataSourceForm.ts` | L41, L60 | `style: 'width: 400px'` |
| `CronEditorForm.ts` | L32 | `style: 'width: 300px'` |
| `DataTransformForm.ts` | L33, L49, L62, L71, L81 | `style: 'width: 300px'` |
| `PatternSwitchForm.ts` | L82 | `style: 'width: 200px'` |
| `FormGraphForm.ts` | L73 | `style: 'font-family: monospace; font-size: 12px'` |
| `FormDiffForm.ts` | L102 | `style: 'width: 100%'` |
| `FormDiffForm.ts` | L110 | 长串内联样式字符串 |
| `MultiFormForm.ts` | L39 | `style: 'width: 100%'` |
| `UndoRedoForm.ts` | L32 | `style: 'width: 100%'` |
| `PermissionForm.ts` | L33 | `style: 'width: 100%'` |
| `PrintExportForm.ts` | L84, L93, L101 | `style: 'width: 100%'` / monospace 样式 |
| `MaskingPluginForm.ts` | L35, L43, L50, L56, L62, L69 | `style: 'width: 300px'` |
| `SubmitRetryPluginForm.ts` | L57 | `style: 'width: 200px'` |

> ✅ 正确写法参考：`ComputedFieldForm`、`CollapseGroupForm`（`style: { width: '100%' }`）

### 6.2 `DynamicFieldForm` — `_selectedFields` 类型错误

- [ ] `_selectedFields` 设了 `type: 'string'`，但 `default: ['name', 'email']` 是数组，`CheckboxGroup` 返回值也是数组 → 应改为 `type: 'array'`

### 6.3 `TemplateReuseForm` — `definitions` 未被 `$ref` 使用

- [ ] L45-L61 定义了 `definitions.contactInfo` 和 `definitions.addressInfo`，但 L64-L93 没有用 `$ref` 引用，手动复制了一遍 → `definitions` 完全无用。应改为 `$ref: '#/definitions/contactInfo'` 引用，或删掉 `definitions`

### 6.4 `I18nForm` — 多余的 `fields` 数组

- [ ] `SceneConfig` 类型无 `fields` 属性，但 L85-L90 声明了 `fields` 数组与 `schema` 重复 → 应删除

### 6.5 `DynamicSchemaForm` / `SectionValidationForm` — 正则双重转义

- [ ] `DynamicSchemaForm` L33: `'^\\d{17}[\\dX]$'` 在 TS 字符串中二次转义后实际变成字面量 `\\d`，无法匹配数字
- [ ] `SectionValidationForm` L110: `'^\\d{6}$'` 同上
- [ ] 应确认引擎对 `pattern` 的处理方式。若 `new RegExp(pattern)` 则应写 `'^\\d{6}$'`（单次转义），若支持 `RegExp` 对象则写 `/^\d{6}$/`

---

## 七、Vue RecursionField 与 React 版本不对等

> Vue 版 `RecursionField` 渲染普通字段时缺少 React 版已传递的 5 个 props，导致 Vue 侧无法支持对应功能。

- [ ] `displayFormat` — 显示格式化（React L148, Vue 缺失）
- [ ] `inputParse` — 输入解析（React L149, Vue 缺失）
- [ ] `submitTransform` — 提交转换（React L150, Vue 缺失）
- [ ] `submitPath` — 提交路径映射（React L151, Vue 缺失）
- [ ] `excludeWhenHidden` — 隐藏时排除提交数据（React L152, Vue 缺失）

### Vue RecursionField 重复渲染逻辑

- [ ] `renderSchema()` 和 return block 中对 `object`/`array` 类型各有一套渲染逻辑，应合并去重

---

## 八、DevTools 组件职责重叠

> `packages/react/src/components/DevTools.tsx` 与 `plugin-devtools-react/src/DevToolsPanel.tsx` 功能高度重叠，但定位不同。

| 组件 | 所在包 | 大小 | 定位 |
|------|--------|------|------|
| `DevTools` | `@moluoxixi/react` | 152 行 | 简易性能面板，硬编码 UI |
| `DevToolsPanel` | `@moluoxixi/plugin-devtools-react` | 26KB | 完整调试面板，硬编码 UI |

问题：
- [ ] 两个组件都用硬编码内联样式（违反框架层无 UI 原则）
- [ ] `DevTools.tsx` 直接 import `@moluoxixi/plugin-lower-code`，但 `packages/react/package.json` 未声明该依赖（**幽灵依赖**）
- [ ] 建议：合并为一个组件，统一放在 `plugin-devtools-react`

---

## 九、依赖声明问题

### 9.1 `@moluoxixi/react` — 幽灵依赖

- [ ] `DevTools.tsx` import `@moluoxixi/plugin-lower-code` 的 `PerfMetrics`, `PerfMonitorAPI`，但 `package.json` 的 `dependencies` / `peerDependencies` 均未声明 → 在严格 pnpm 环境下会报错

### 9.2 `@moluoxixi/ui-antd` — 多余依赖

- [ ] `package.json` 声明了 `@moluoxixi/reactive-react: workspace:*`，但 UI 包不应直接依赖 reactive 适配层；所有 `observer` 调用应通过 `@moluoxixi/react` 间接获取

### 9.3 `plugin-devtools-react/vue` — 缺少框架层依赖

- [ ] `plugin-devtools-react` 未依赖 `@moluoxixi/react`，无法使用 `useForm` 等 hook
- [ ] `plugin-devtools-vue` 未依赖 `@moluoxixi/vue`，同上

---

## 十、StatusTabs 导出但未注册

> 三个 UI 包都 export 了 `StatusTabs` 组件，但 `setupAntd()` / `setupElementPlus()` / `setupAntdVue()` 均未将其注册到组件表中。

- [ ] `ui-antd/src/index.ts` — 导出 `StatusTabs` 但 `setupAntd()` 未注册
- [ ] `ui-element-plus/src/index.ts` — 导出 `StatusTabs` 但 `setupElementPlus()` 未注册
- [ ] `ui-antd-vue/src/index.ts` — 导出 `StatusTabs` 但 `setupAntdVue()` 未注册

---

## 十一、单元测试缺失

> `packages/` 下所有 13 个包中**零测试文件**（无 `.test.ts`、`.spec.ts`、`.test.tsx`、`.spec.tsx`）。

- [ ] `@moluoxixi/core` — `package.json` 有 `vitest` devDependency 和 `test` script，但无任何测试文件
- [ ] 其余 12 个包 — 连 `vitest` 依赖和 test script 都没有

---

## 十二、`element-plus` 全量 CSS 导入

> `ui-element-plus/src/index.ts` L1: `import 'element-plus/dist/index.css'` 导入了 Element Plus 的全量样式（~400KB 压缩前），应改为按组件按需导入或使用 unplugin-element-plus 自动按需。

- [ ] 改为按需导入各组件样式（如 `import 'element-plus/es/components/input/style/css'`），或使用构建插件自动按需
