我自己的提问：
我发现问题很多集中在vue/react实现不统一，我是否可以把事件，props，逻辑抽离到core里的components中以便统一呢？还有field能否采用继承的方式，避免这种缺失问题

# ConfigForm 问题清单（对比 Formily 源码重新评估）

> 每条 issue 均标注了对应的 **Formily 源码依据**（`formily_next` 分支），确保评估准确。
> 优先级：🔴 高（功能缺陷） · 🟡 中（结构/规范问题） · 🟢 低（优化建议）

---

## 一、🔴 Vue `ReactiveField` `componentProps` 展开顺序错误

> **Formily 做法**（React `ReactiveField.tsx`）：
> ```js
> { disabled, readOnly, ...toJS(field.componentProps), value, onChange, onFocus, onBlur }
> ```
> `componentProps` 在 `value`/`onChange` **之前**展开，确保框架控制的绑定不被用户 props 覆盖。
>
> **Formily Vue `ReactiveField.ts`**：
> ```js
> attrs: { disabled, readOnly, ...originData, value: field.value }
> ```
> 同样 `componentProps` 在 `value` **之前**。

**ConfigForm 问题**：

| 版本 | 文件 | 行号 | 顺序 | 是否正确 |
|------|------|------|------|---------|
| React | `ReactiveField.tsx` | L166-178 | `...componentProps` → `value` → `onChange` | ✅ 正确 |
| Vue | `ReactiveField.ts` | L138-147 | `modelValue` → `onUpdate:modelValue` → `...componentProps` | ❌ **反了** |

- [ ] Vue `ReactiveField.ts` L138-147: 将 `...dataField.componentProps` 移到 `modelValue`/`onUpdate:modelValue` **之前**

---

## 二、🔴 `FormVoidField` / `FormObjectField` / `FormArrayField` 缺少生命周期调用

> **Formily 做法**：所有字段组件都通过 `useAttach()` 调用 `onMount()` / `onUnmount()`。
> 
> React `useAttach.ts`：
> ```ts
> export const useAttach = <T extends IRecycleTarget>(target: T): T => {
>   unstable_useCompatEffect(() => {
>     target.onMount()
>     return () => target.onUnmount()
>   }, [target])
>   return target
> }
> ```
> 
> React 的 `Field.tsx` 直接调用 `field.onMount()` / `field.onUnmount()`；
> `VoidField` / `ObjectField` / `ArrayField` 通过 `useAttach()` 间接调用——**全部都有生命周期**。

**ConfigForm 问题**：

| 组件 | React mount | React unmount | Vue mount | Vue unmount |
|------|------------|--------------|----------|------------|
| `FormField` | ✅ | ✅ | ✅ | ✅ |
| `FormVoidField` | ❌ | ❌ | ❌ | ❌ |
| `FormObjectField` | ❌ | ❌ | ❌ | ❌ |
| `FormArrayField` | ❌ | ❌ | ❌ | ❌ |

- [ ] React `FormVoidField.tsx` — 添加 `useEffect(() => { field.mount(); return () => field.unmount() }, [field])`
- [ ] React `FormObjectField.tsx` — 同上
- [ ] React `FormArrayField.tsx` — 同上
- [ ] Vue `FormVoidField.ts` — 添加 `onMounted(() => field.mount())`、`onBeforeUnmount(() => field.unmount())`
- [ ] Vue `FormObjectField.ts` — 同上
- [ ] Vue `FormArrayField.ts` — 同上

---

## 三、🔴 `FormObjectField` 调用 `createField` 而非 `createObjectField`

> **Formily 做法**（React `ObjectField.tsx`）：
> ```ts
> const field = useAttach(form.createObjectField({ basePath: parent?.address, ...props }))
> ```
> Formily 明确使用 `form.createObjectField()`，创建 `ObjectFieldInstance`。

**ConfigForm 问题**：

- [ ] React `FormObjectField.tsx` L37: `form.createField(...)` → 应改为 `form.createObjectField(...)`
- [ ] Vue `FormObjectField.ts` L52: `form.createField(...)` → 应改为 `form.createObjectField(...)`
- [ ] ConfigForm core 已有 `form.createObjectField()` 方法（`Form.ts` L209），但框架层未调用

---

## 四、🔴 React `FormField` 与 `ReactiveField` 渲染逻辑重复

> **Formily 做法**：React `Field.tsx` 只做字段创建 + 生命周期，渲染完全委托 `ReactiveField`：
> ```tsx
> <FieldContext.Provider value={field}>
>   <ReactiveField field={field}>{props.children}</ReactiveField>
> </FieldContext.Provider>
> ```
> Vue 侧同理，所有 `VoidField` / `ObjectField` / `ArrayField` 都只透传到 `ReactiveField`。

**ConfigForm 问题**：

- [ ] React `FormField.tsx`（173 行）内部自行实现了完整的 component/decorator 渲染逻辑（L99-171），包括 readPretty、disabled、decorator 包装
- [ ] 同时 React `ReactiveField.tsx`（239 行）也实现了一套完整的渲染逻辑
- [ ] 两套逻辑存在细节差异（`FormField` 不传 ARIA 属性、不包 `FieldErrorBoundary`）
- [ ] Vue 侧已正确委托：`FormField` → `ReactiveField`

---

## 五、🟡 Vue `RecursionField` 与 React 版本不对等

### 5.1 Vue 缺少 5 个字段属性

React 版 `RecursionField.tsx` L152-156 传递了：

- [ ] `displayFormat` — 显示格式化
- [ ] `inputParse` — 输入解析
- [ ] `submitTransform` — 提交转换
- [ ] `submitPath` — 提交路径映射
- [ ] `excludeWhenHidden` — 隐藏时排除提交数据

Vue 版 `RecursionField.ts` 的 `renderSchema()` 未传递以上 5 个属性。

### 5.2 Vue `RecursionField` 重复渲染逻辑

- [ ] `renderSchema()`（L82-160）和 return block（L162-220）中对 `object`/`array` 类型各有一套渲染逻辑，应合并去重

---

## 六、🟡 框架层包含 UI 实现（应下沉到 UI 层）

> **Formily 做法**：`@formily/react` / `@formily/vue` 不含任何 UI 组件。所有 `ArrayTable`、`ArrayBase`、`ArrayCards` 等全部在 `@formily/antd` / `@formily/element` 中实现。

### `packages/vue` 中的问题

- [ ] `ArrayTable.ts` — 直接渲染原生 `<table>` + 硬编码内联样式
- [ ] `ArrayItems.ts` — 直接渲染 `<div>` 卡片布局 + 硬编码内联样式
- [ ] `ArrayBase.ts` → `Addition / Remove / MoveUp / MoveDown` — 直接渲染原生 `<button>` + 内联样式
- [ ] `FormArrayField.ts` L125-204：`renderDefaultArrayItems` 80 行硬编码默认 UI

### `packages/react` 中的问题

- [ ] `ArrayTable.tsx` — 直接渲染原生 `<table>` + 硬编码样式
- [ ] `ArrayItems.tsx` — 直接渲染 `<div>` 卡片布局 + 硬编码样式
- [ ] `ArrayCards.tsx` — 直接渲染 `<div>` 卡片 + 硬编码阴影
- [ ] `ArrayCollapse.tsx` — 直接渲染折叠面板 + 硬编码三角图标
- [ ] `ArrayBase.tsx` → `Addition / Remove / MoveUp / MoveDown` — 原生 `<button>` + 内联样式
- [ ] `Editable.tsx` / `EditablePopover.tsx` — 硬编码 hover/border/Popover 样式
- [ ] `DiffViewer.tsx` — 硬编码对比表格
- [ ] `DevTools.tsx` — 硬编码性能面板 + 幽灵依赖 `@moluoxixi/plugin-lower-code`

### UI 包直接从框架包导入的问题

- [ ] `ui-antd/index.ts` — 从 `@moluoxixi/react` 导入 `ArrayCards` 等注册，应 UI 层重新实现
- [ ] `ui-element-plus/index.ts` — 从 `@moluoxixi/vue` 导入 `ArrayTable`/`ArrayItems` 注册
- [ ] `ui-antd-vue/index.ts` — 同上

---

## 七、🟡 Vue `ReactiveField` 缺少 ARIA 无障碍属性

> React `ReactiveField.tsx` L157-161 传递了 `aria-label`、`aria-describedby`、`aria-labelledby`、`aria-invalid`、`aria-required`。

- [ ] Vue `ReactiveField.ts` 完全缺失 ARIA 属性传递

---

## 八、🟡 `ConfigForm` Props React / Vue 不对称

| Prop | React | Vue | 说明 |
|------|-------|-----|------|
| `schema` 类型 | `FormSchema<Values>` | `ISchema` | 类型不一致 |
| `effects` | ❌ | ✅ | React 无法通过 prop 传递 effects |
| `plugins` | ❌ | ✅ | React 无法通过 prop 传递插件 |
| `pattern` | ✅（顶层 prop） | ❌ | |
| `className`/`style` | ✅ | ❌ | |

> 注：`onSubmit` vs `emit('submit')` 属于 React/Vue 惯用差异，不算问题。

- [ ] React `ConfigForm` 应补充 `effects` / `plugins` props
- [ ] 统一 `schema` 类型

---

## 九、🟡 8 个 React 独有组件 Vue 无对应实现

| React 组件 | 功能 | Vue 有否 |
|-----------|------|---------|
| `ArrayCards.tsx` | 卡片式数组 | ❌ |
| `ArrayCollapse.tsx` | 折叠式数组 | ❌ |
| `ArraySortable.tsx` | 拖拽排序 | ❌ |
| `DevTools.tsx` | 性能监控面板 | ❌ |
| `DiffViewer.tsx` | 值差异对比 | ❌ |
| `Editable.tsx` | 行内编辑 | ❌ |
| `FormLayout.tsx` | 布局上下文 | ❌ |
| `Space.tsx` | 间距容器 | ❌ |

- [ ] `FormLayout` 和 `Space` 为基础布局组件，Vue 侧应优先补齐

---

## 十、🟡 依赖声明问题

### 10.1 幽灵依赖

- [ ] `packages/react` — `DevTools.tsx` import `@moluoxixi/plugin-lower-code`，`package.json` 未声明

### 10.2 多余依赖

- [ ] `ui-antd` — `package.json` 声明 `@moluoxixi/reactive-react`，UI 包应通过 `@moluoxixi/react` 间接使用

### 10.3 缺少依赖

- [ ] `plugin-devtools-react` 未依赖 `@moluoxixi/react`，无法使用 `useForm`
- [ ] `plugin-devtools-vue` 未依赖 `@moluoxixi/vue`

---

## 十一、🟡 DevTools 组件职责重叠

| 组件 | 所在包 | 大小 | 问题 |
|------|--------|------|------|
| `DevTools` | `@moluoxixi/react` | 152 行 | 框架包含 UI |
| `DevToolsPanel` | `plugin-devtools-react` | 26KB | 独立插件 |

- [ ] 应合并到 `plugin-devtools-react`，移除 `packages/react` 中的版本

---

## 十二、🟡 框架层缺少的组件和 Hooks

### 缺少的组件

- [ ] `ExpressionScope` — 在组件树中注入自定义表达式变量
- [ ] `RecordScope` — 数组循环注入 `$record`/`$index`

### 缺少的 Hooks

- [ ] `useFormEffects` — 在组件内注册表单副作用
- [ ] `useExpressionScope` — 获取当前 Schema 表达式作用域
- [ ] `useParentForm` — 获取父级 Form 实例

### `ArrayBase` 缺少的子组件

- [ ] `ArrayBase.Copy` — 复制数组项（Formily antd/element 都有）
- [ ] `useRecord` — 获取当前数组行数据（目前只有 `useIndex`）

---

## 十三、🟡 StatusTabs 导出但未注册

- [ ] `ui-antd/setupAntd()` 未注册 `StatusTabs`
- [ ] `ui-element-plus/setupElementPlus()` 未注册
- [ ] `ui-antd-vue/setupAntdVue()` 未注册

---

## 十四、🟡 全局注册表无法清理/隔离

- [ ] 无 `clear()`/`reset()` 方法，影响测试隔离
- [ ] 多个 ConfigForm 实例共享全局状态
- [ ] Vue 有 `createComponentScope`，React 无对应实现

---

## 十五、🟡 单元测试缺失

- [ ] `packages/` 下 13 个包零测试文件
- [ ] `@moluoxixi/core` 有 `vitest` devDep 和 test script，但无测试文件

---

## 十六、🟡 UI 层缺少的组件（Formily 有）

- [ ] `ArrayTabs` — 标签页式数组渲染
- [ ] `FormButtonGroup` — 按钮组布局（含 Sticky）
- [ ] `FormGrid` — 独立栅格（ConfigForm 只有根级 grid）

---

## 十七、🟢 `element-plus` 全量 CSS 导入

- [ ] `ui-element-plus/src/index.ts` L1: `import 'element-plus/dist/index.css'`（~400KB），应按需导入

---

## 十八、🟢 Playground 示例问题

### 18.1 `componentProps.style` 用了字符串

> React 要求 `style` 为对象。涉及文件：`ComponentSwitchForm`、`PaginatedSearchForm`、`RemoteDataSourceForm`、`CronEditorForm`、`DataTransformForm`、`PatternSwitchForm`、`FormGraphForm`、`FormDiffForm`、`MultiFormForm`、`UndoRedoForm`、`PermissionForm`、`PrintExportForm`、`MaskingPluginForm`、`SubmitRetryPluginForm`。

### 18.2 `DynamicFieldForm` — `_selectedFields` 类型错误

- [ ] `type: 'string'` 但 `default: ['name', 'email']` 是数组，应为 `type: 'array'`

### 18.3 `TemplateReuseForm` — `definitions` 未被 `$ref` 使用

- [ ] 定义了 `definitions` 但未用 `$ref` 引用

### 18.4 `I18nForm` — 多余的 `fields` 数组

- [ ] `SceneConfig` 类型无 `fields` 属性

### 18.5 正则双重转义

- [ ] `DynamicSchemaForm` L33、`SectionValidationForm` L110 中 `'^\\d{6}$'` 双重转义

---

## 十九、🟢 Vue 框架层组件使用 CSS 字符串

> Vue `h()` 支持字符串 style，不会报错，但对象格式有更好的类型安全。

- [ ] `ReactiveField.ts` L86, L175: 错误提示 style 为字符串
- [ ] `ConfigForm.ts` L214-224: `fieldContainerStyle` 为字符串拼接
- [ ] `FormArrayField.ts` L137-145: `renderDefaultArrayItems` 中混合格式
