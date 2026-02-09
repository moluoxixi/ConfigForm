# @moluoxixi/plugin-devtools

ConfigForm DevTools 调试插件 — 字段树、事件时间线、值 Diff、实时编辑、一键验证。

## 架构概览

```
┌─────────────────────────────────────────────────────────────────┐
│                        使用方                                    │
│                                                                 │
│  const form = createForm({                                      │
│    plugins: [devToolsPlugin()]  ← 一行代码接入                   │
│  })                                                             │
└────────────────────┬────────────────────────────────────────────┘
                     │ install(form)
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                   devToolsPlugin（核心层）                        │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │  事件收集器   │  │  字段树构建器 │  │  调试操作              │  │
│  │              │  │              │  │                       │  │
│  │  form.on()   │  │  form 实例   │  │  highlightField()     │  │
│  │  监听 14 种  │  │  → 序列化    │  │  setFieldValue()      │  │
│  │  生命周期事件 │  │  → 树形结构   │  │  setFieldState()      │  │
│  │  → eventLog  │  │  → 纯 JSON   │  │  validateAll()        │  │
│  └──────┬───────┘  └──────┬───────┘  │  resetForm()          │  │
│         │                 │          │  submitForm()          │  │
│         ▼                 ▼          └───────────┬───────────┘  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              DevToolsPluginAPI（纯序列化接口）            │    │
│  │                                                         │    │
│  │  只读：getFieldTree / getFieldDetail / getFormOverview   │    │
│  │        getEventLog / getValueDiff / subscribe            │    │
│  │  操作：highlightField / setFieldValue / setFieldState    │    │
│  │        validateAll / resetForm / submitForm               │    │
│  └────────────────────┬────────────────────────────────────┘    │
│                       │                                         │
│  ┌────────────────────┼────────────────────────────────────┐    │
│  │  全局 Hook（为 Chrome Extension 预留）                    │    │
│  │  window.__CONFIGFORM_DEVTOOLS_HOOK__                     │    │
│  │  .forms.set(formId, api)                                 │    │
│  └────────────────────┼────────────────────────────────────┘    │
└───────────────────────┼─────────────────────────────────────────┘
                        │ API（纯 JSON 数据）
              ┌─────────┴──────────┐
              ▼                    ▼
    ┌──────────────────┐  ┌──────────────────┐
    │   浮动面板（现在） │  │ Chrome Extension │
    │                  │  │   （以后扩展）     │
    │ 直接读 API 对象   │  │ postMessage 传输  │
    │ DevToolsPanel    │  │ 同一套面板组件     │
    │ (React 组件)     │  │ 数据来源不同而已   │
    └──────────────────┘  └──────────────────┘
```

## 核心设计原理

### 1. 插件系统接入

ConfigForm 的插件系统基于**洋葱模型 Hook 管线**：

```
FormPlugin {
  name: 'devtools'
  install(form) → DevToolsPluginAPI
}
```

`install` 在表单创建时调用，接收 `form` 实例，返回 API 对象。
插件可以通过 `form.on()` 监听事件，通过 `form.getField()` 读取字段，
通过 `field.setValue()` 修改状态 — **完全的读写能力**。

### 2. 数据采集机制

```
form.on(FormLifeCycle.ON_FIELD_VALUE_CHANGE, (event) => {
  const field = event.payload    ← 事件载荷是字段实例
  addEvent('值变化', field.path, field.value)
})
```

**14 种生命周期事件**全部监听：

| 类别 | 事件 |
|------|------|
| 表单 | init / mount / unmount / valuesChange / reset |
| 提交 | submitStart / submitSuccess / submitFailed / submitEnd |
| 验证 | validateStart / validateSuccess / validateFailed |
| 字段 | fieldInit / fieldMount / fieldUnmount / fieldValueChange / fieldInputValueChange |

每个事件记录为 `EventLogEntry`：
```typescript
{ id, type, timestamp, fieldPath?, summary }
```

采用**环形缓冲**：超过 maxEventLog（默认 200）时移除最早的条目。

### 3. 字段树构建

```
form.getAllFields()     → Map<path, FieldInstance>
form.getAllVoidFields() → Map<path, VoidFieldInstance>
```

扁平 Map → 树形结构的算法：

```
1. 遍历所有字段，序列化为 FieldTreeNode（纯 JSON，无实例引用）
2. 按路径排序（确保父节点在子节点前面）
3. 对每个节点，用 getParentPath(path) 找父节点
   例如：'address.city' → 父路径 'address'
4. 如果父节点存在 → 加入 parent.children
   如果不存在   → 加入根节点列表
```

**关键设计**：序列化时用 `safeSerialize()` 处理循环引用和函数：
```typescript
JSON.stringify(value, (key, val) => {
  if (typeof val === 'function') return '(function)'
  if (val instanceof RegExp) return val.toString()
  if (val instanceof Date) return val.toISOString()
  return val
})
```

### 4. 调试操作实现

#### 字段高亮

利用 `field.domRef`（由 FormItem 在挂载时设置）：
```typescript
highlightField(path) {
  const el = form.getField(path).domRef   ← 真实 DOM 元素
  el.scrollIntoView({ behavior: 'smooth' })
  el.style.outline = '2px solid #3b82f6'  ← 蓝色轮廓
  // 300ms 后切红色 → 300ms 后切蓝色 → 300ms 后清除
  // 三次闪烁，视觉定位
}
```

#### 实时编辑

直接调用 field 模型的方法：
```typescript
setFieldValue(path, value) {
  form.getField(path).setValue(value)   ← 触发响应式更新 → UI 自动刷新
}

setFieldState(path, { visible, disabled, preview }) {
  field.display = visible ? 'visible' : 'none'
  field.disabled = disabled
  field.preview = preview
}
```

因为 field 是 MobX/Vue 响应式对象，`setValue` 后所有 `observer` 组件自动重渲染。

#### 值 Diff

```typescript
getValueDiff() {
  for (const field of form.getAllFields()) {
    diff.push({
      path,
      currentValue:  safeSerialize(field.value),
      initialValue:  safeSerialize(field.initialValue),
      changed:       JSON.stringify(current) !== JSON.stringify(initial)
    })
  }
}
```

### 5. 数据层与 UI 层分离

```
                DevToolsPluginAPI
                     │
          ┌──────────┴──────────┐
          │                     │
    纯 JSON 数据            纯 JSON 数据
          │                     │
    DevToolsPanel          Chrome Extension
    (React 组件)           (以后扩展)
    直接读 API 对象         postMessage 传输
```

**面板组件只接收序列化后的纯数据 props，不持有 form 实例引用。**

这意味着：
- 浮动面板：`api.getFieldTree()` 直接调用，拿到 JSON 数组
- Chrome Extension：页面端把相同 JSON 通过 `window.postMessage` 发出，Extension 端接收后传给同一个面板组件

**面板代码零修改，换数据来源即可。**

### 6. 全局 Hook（Extension 桥接点）

```typescript
// 插件安装时自动注册
window.__CONFIGFORM_DEVTOOLS_HOOK__ = {
  forms: Map<formId, DevToolsPluginAPI>,
  register(id, api),
  unregister(id)
}
```

Chrome Extension 的 content script 只需要：
```javascript
// 检测页面是否有 ConfigForm
if (window.__CONFIGFORM_DEVTOOLS_HOOK__) {
  const api = hook.forms.values().next().value
  // 通过 postMessage 把 api 数据发给 devtools panel
}
```

### 7. 订阅机制（面板刷新）

```typescript
// 插件内部
const listeners = new Set<() => void>()
function notify() { listeners.forEach(fn => fn()) }

// 每次 addEvent / setFieldValue / validateAll 后调用 notify()

// 面板端
useEffect(() => {
  return api.subscribe(() => setTick(n => n + 1))  // 触发 React 重渲染
}, [api])
```

面板通过 `subscribe` 注册回调，插件数据变化时通知面板刷新。
不是轮询，而是**事件驱动**的推模式。

## 面板功能清单

| Tab | 功能 | 调试能力 |
|-----|------|---------|
| 字段 | 字段树（左）+ 字段详情（右） | 搜索过滤 / 状态过滤 / 点击高亮 / 可编辑 value / 可切换 visible/disabled/preview |
| 事件 | 时间线（最新在上） | 字段路径标签 / 清空 / 成功绿色 / 失败红色 / 调试操作紫色 |
| Diff | 当前值 vs 初始值 | 修改的字段高亮 / 旧值删除线 / 新值绿色 |
| 数据 | form.values JSON | 格式化展示 / 一键复制 |
| 标题栏 | 概览信息 | 一键验证 / 一键重置 / 一键提交 |

## 使用方式

```typescript
import { devToolsPlugin, DevToolsPanel } from '@moluoxixi/plugin-devtools'

// 1. 注入插件（一行代码）
const form = createForm({
  plugins: [devToolsPlugin({ formId: 'user-form' })]
})

// 2. 渲染面板
// 方式 A：直接读 API
const api = form.getPlugin<DevToolsPluginAPI>('devtools')
<DevToolsPanel api={api} />

// 方式 B：从全局 Hook 读（推荐，支持多表单）
const hook = window.__CONFIGFORM_DEVTOOLS_HOOK__
const api = hook.forms.get('user-form')
<DevToolsPanel api={api} />
```

## 生产环境

```typescript
// 仅开发环境注入
const plugins = []
if (import.meta.env.DEV) {
  plugins.push(devToolsPlugin())
}
const form = createForm({ plugins })
```

面板组件也条件渲染：
```tsx
{import.meta.env.DEV && <DevToolsPanel api={api} />}
```

构建后零开销 — 插件代码被 tree-shaking 移除。
