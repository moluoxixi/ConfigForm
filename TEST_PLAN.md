# Playground 测试计划

## 测试矩阵

| 维度 | 值 |
|------|------|
| 场景数 | 56（3 个 UI 库共享同一份 schema） |
| 渲染 | ConfigForm + SchemaField 递归渲染（参考 Formily RecursionField） |
| 三态 | 编辑态 / 阅读态 / 禁用态（StatusTabs 切换） |
| 框架 | React 18 / Vue 3 |
| UI 库 | Ant Design（React）/ Ant Design Vue / Element Plus |

### 项目架构（与 Formily 的差异）

本项目（`@moluoxixi/*`）基于 Formily 思想重新设计，核心区别如下：

#### 响应式架构：适配器模式

Formily 以自研的 MobX-like 响应式为核心，Vue/React 通过桥接层接入。本项目**拆分为适配器模式**，运行时注册响应式引擎：

```
@moluoxixi/reactive           ← 抽象适配器接口 + 注册表
├── @moluoxixi/reactive-vue   ← Vue 3 原生 @vue/reactivity 适配器
└── @moluoxixi/reactive-mobx  ← MobX 适配器（React 使用）
```

- **Vue 端**：直接使用 `@vue/reactivity`（ref / reactive / computed / watch），无需 MobX 桥接，性能更优
- **React 端**：使用 MobX（与 Formily 一致）
- **切换方式**：运行时 `setReactiveAdapter(vueAdapter)` 或 `setReactiveAdapter(mobxAdapter)`

#### ConfigForm 封装（对比 Formily SchemaForm）

本项目提供 `ConfigForm` 组件，比 Formily 的 `SchemaForm` **更开箱即用**：

| 特性 | Formily SchemaForm | 本项目 ConfigForm |
|------|-------------------|-------------------|
| 表单配置来源 | Form 实例 + 外部 props | 统一从 `schema.decoratorProps` 读取 |
| 操作按钮 | 需手动配置 FormButtonGroup | 自动从 `decoratorProps.actions` 渲染提交/重置 |
| 三态切换 | 需外部管理 pattern | 支持 pattern 注入，按钮自动隐藏 |
| 布局 | 需 FormLayout 等额外组件 | 内置 `grid` / `inline` / `vertical` 布局 |
| 使用方式 | 需组合多个组件 | 单组件 `<ConfigForm :schema="..." />` |

#### 包结构

```
@moluoxixi/core          ← 表单领域模型（Form / Field / ArrayField / VoidField）
@moluoxixi/reactive      ← 响应式适配器抽象层
@moluoxixi/reactive-vue  ← Vue 响应式适配器
@moluoxixi/reactive-mobx ← MobX 响应式适配器
@moluoxixi/schema        ← Schema 编译 / 合并 / 转换（compileSchema / mergeSchema）
@moluoxixi/shared        ← 工具函数（clone / debounce / path / uid 等）
@moluoxixi/vue           ← Vue 组件（ConfigForm / SchemaField / FormField / ArrayBase 等）
@moluoxixi/react         ← React 组件（ConfigForm / SchemaField / FormField 等）
@moluoxixi/validator     ← 验证引擎（格式验证 / 自定义规则 / 异步验证）
@moluoxixi/ui-antd-vue   ← Ant Design Vue 适配（FormItem / Input / Select 等注册）
@moluoxixi/ui-element-plus ← Element Plus 适配
@moluoxixi/ui-antd       ← Ant Design (React) 适配
```

#### 关键设计差异汇总

| 维度 | Formily (`@formily/*`) | 本项目 (`@moluoxixi/*`) |
|------|----------------------|------------------------|
| 响应式核心 | 自研 MobX-like 统一实现 | 适配器模式，Vue 用原生响应式，React 用 MobX |
| 响应式切换 | 编译时决定 | 运行时 `setReactiveAdapter()` |
| 表单入口组件 | `SchemaForm` + `FormLayout` + `FormButtonGroup` | `ConfigForm` 单组件开箱即用 |
| 表单配置位置 | 分散在 Form 实例和多个组件 props | 集中在 `schema.decoratorProps` |
| 操作按钮管理 | 手动 | 自动渲染，三态自动隐藏 |
| 参考源码 | `formily/` 目录 | 遇到问题优先参考 Formily 源码实现 |

### 开发服务器

- Vue: http://localhost:3001 (playground/vue)
- React: http://localhost:3002 (playground/react)

### 目录结构

```
playground/
  shared/src/                    # 56 个场景的共享配置（SceneConfig）
    {group}/{Scene}.ts           # { title, description, schema, initialValues }
    index.ts                     # sceneRegistry 懒加载注册表
    types.ts                     # SceneConfig 类型
  vue/src/
    App.vue                      # 场景导航 + UI 库切换
    components/SceneRenderer.vue # 通用场景渲染器（UI 库无关）
    ui/                          # UI 库适配层
      index.ts                   # UIAdapter 接口 + adapters 映射
      antd-vue.ts                # { setup, StatusTabs }
      element-plus.ts            # { setup, StatusTabs }
  react/src/
    App.tsx                      # 场景导航
    components/SceneRenderer.tsx # 通用场景渲染器
```

### 架构

- **@playground/shared**：56 个场景配置，每个导出 `SceneConfig`（title / description / schema / initialValues）
- **SceneRenderer**：通用渲染组件，StatusTabs 通过 prop 注入（Vue）或直接导入（React），ConfigForm + SchemaField 递归渲染 schema
- **UI 适配层**（Vue）：`src/ui/` 目录，每个 UI 库导出 `{ setup, StatusTabs }`，App 根据选择加载
- **App**：仅负责导航、场景加载、UI 库切换，不包含表单渲染逻辑
- 三态通过 StatusTabs 切换 pattern 注入 schema

### 参考源码

> 根目录 `formily/` 是 Formily 的源码。**遇到问题时优先参考 Formily 源码**，包括但不限于：
> - 字段注册/卸载机制 → `formily/packages/core/`
> - SchemaField 递归渲染逻辑 → `formily/packages/vue/` / `formily/packages/react/`
> - UI 组件桥接方式 → `formily/packages/antd/` / `formily/packages/element/`

### 测试工具要求

测试**必须**通过 Playwright MCP 工具执行浏览器自动化操作，不允许仅靠代码阅读判断是否通过。

#### 必需的 MCP 工具

| 工具 | 用途 | 测试环节 |
|------|------|----------|
| `browser_navigate` | 导航到开发服务器页面 | 所有环节 |
| `browser_snapshot` | 获取页面可访问性快照，验证 DOM 结构 | E2/R2-R5/D2-D3 |
| `browser_take_screenshot` | 截取页面截图，保存到 `.playwright-mcp/` 目录 | E1/R1/D1 |
| `browser_click` | 点击按钮/选项/Tab 等交互元素 | E3-E7 |
| `browser_type` | 输入文本到表单字段 | E3/E4/E5 |
| `browser_console_messages` | 检查浏览器控制台日志 | E8 |

#### 截图保存规范

所有截图**必须**保存到 `.playwright-mcp/` 目录，命名规则：

```
.playwright-mcp/scene{N}-{platform}-{state}.png
```

示例：`scene13-vue-antd-edit.png` / `scene13-vue-element-read.png` / `scene13-react-antd-disabled.png`

#### MCP 不可用时的处理

> **如果 Playwright MCP 不可用，必须立即告知用户**，说明以下信息：
>
> 1. 当前环境缺少 Playwright MCP 服务，无法执行浏览器自动化测试
> 2. 需要用户安装并启用 Playwright MCP 服务
> 3. 安装方式：在 Cursor 设置中添加 Playwright MCP Server 配置
> 4. 在 MCP 可用之前，测试工作**暂停**，不进行任何"猜测性通过"标记

### 测试质量要求

> **禁止快速测试、跳过测试、简化测试。必须逐项仔细验证，尽可能覆盖所有可能的场景和边界情况。**

| 原则 | 要求 |
|------|------|
| **禁止快速通过** | 不允许仅填一个字段就提交，必须逐个字段完整填写并验证回显 |
| **禁止跳过验证** | E1~E8 / R1~R5 / D1~D3 每一项都必须实际验证，不允许"看起来差不多就过" |
| **禁止合并平台** | 3 个平台必须独立测试，不允许"A 平台通过了 B 平台应该也没问题" |
| **必须验证边界** | 空值、最大值、最小值、特殊字符、超长输入等边界情况必须覆盖 |
| **必须验证错误路径** | 不仅测试正常流程，还必须测试：非法输入→错误提示→修正→提交成功 |
| **必须验证交互顺序** | 先填A再填B vs 先填B再填A，联动/验证行为应一致 |
| **必须截图留证** | 每个平台每种状态至少一张截图，作为通过证据 |
| **必须逐字段核对提交结果** | 提交后的结果表格，每一行字段名+值都必须与输入一一核对 |

**编辑态详细测试步骤**（每个平台都必须完整执行）：

```
1. 截图 → 检查 UI 布局、样式、字段类型（E1/E2）
2. 逐个字段填写 → 每填一个字段确认值回显正确（E3）
3. 空提交 → 验证所有必填字段的错误提示内容和样式（E4）
4. 输入非法值 → 验证格式/规则错误提示（E4）
5. 修正为合法值 → 确认错误提示消失（E4）
6. 场景专属交互 → 联动/级联/计算/增删等（E5）
7. 完整填写后提交 → 逐字段核对结果表格（E6）
8. 修改部分字段 → 点击重置 → 逐字段核对恢复到 initialValues（E7）
9. 检查浏览器控制台 → 无 error 日志（E8）
```

### 测试标准

每个场景**必须**在以下 **3 个平台** 分别验证：

| # | 平台 | 框架 | 开发服务器 |
|---|------|------|-----------|
| 1 | **Vue AntdVue** | Vue 3 + Ant Design Vue | http://localhost:3001（选择 Ant Design Vue） |
| 2 | **Vue ElementPlus** | Vue 3 + Element Plus | http://localhost:3001（选择 Element Plus） |
| 3 | **React Antd** | React 18 + Ant Design | http://localhost:3002 |

每个平台**必须**验证以下 **3 种状态**（通过 StatusTabs 切换）：

| 状态 | 验证重点 |
|------|----------|
| **编辑态** | 字段填写 + 字段验证 + 字段交互 + 提交重置 + UI |
| **阅读态** | UI 验证（纯文本、无交互、无按钮、无必填标记） |
| **禁用态** | UI 验证（字段 disabled、无按钮） |

> 即每个场景 = 3 平台 × 3 状态 = **9 项测试**

#### 编辑态验证项（必须全部通过）

| # | 验证项 | 验证内容 | 适用场景 |
|---|--------|----------|----------|
| E1 | **UI 渲染** | 截取完整页面截图，确认 UI 组件库样式正确、无错位溢出 | 所有场景 |
| E2 | **组件渲染** | 标题、描述、StatusTabs、FormItem 标签冒号、必填 `*` 标记、所有字段类型正确 | 所有场景 |
| E3 | **字段填写** | 逐个填写/修改表单字段，确认输入值正确回显 | 所有场景 |
| E4 | **字段验证** | 清空必填字段 → 提交 → 验证红色错误提示出现；输入非法格式 → 验证格式错误提示 | 所有场景 |
| E5 | **字段交互** | 联动字段响应正确（显隐、值变化、属性变化）；特殊交互（增删排序、级联、计算等）按场景覆盖 | 有交互的场景 |
| E6 | **提交验证** | 填写完整字段 → 点击"提交" → 验证结果表格所有值正确 | 所有场景 |
| E7 | **重置验证** | 修改字段后点击"重置" → 验证所有字段恢复 initialValues | 所有场景 |
| E8 | **控制台检查** | 无 error 级别日志（favicon.ico 404 除外） | 所有场景 |

**场景专属编辑态验证项**（根据场景类型动态追加）：

| 场景类型 | 额外验证项 |
|----------|-----------|
| 联动场景（5-10） | 触发联动条件 → 目标字段状态变化正确（显隐/值/属性/级联/计算/必填切换） |
| 验证场景（11-13） | 自定义规则/异步验证/跨字段验证 → 错误提示内容和时机正确 |
| 复杂数据（14-17） | 嵌套对象路径正确 / 数组增删排序 / 表格行内编辑 / 提交数据结构正确 |
| 数据源（18-20） | 异步加载选项 / 依赖链重载 / 搜索分页 → 选项内容和加载时机正确 |
| 布局分组（21-24） | 步骤切换/Tab切换/折叠面板/卡片分组 → 数据保留、跨区域提交正确 |
| 动态表单（25-27） | 动态增删字段 / Schema切换 / 模板复用 → 字段集合和数据正确 |
| 复杂组件（28-39） | 组件特有交互（上传/颜色选择/签名/穿梭框/树选择等）功能正确 |
| 表单状态（40-44） | 数据转换/多表单协作/快照恢复/撤销重做/生命周期 → 状态管理正确 |
| 其他能力（45-48） | 权限控制/国际化/表单比对/打印导出 → 功能完整正确 |
| 扩展场景（49-56） | Grid栅格/Effects副作用/大表单性能/自定义装饰器/Schema表达式/oneOf/SSR/虚拟滚动 |

#### 阅读态验证项（必须全部通过）

| # | 验证项 | 验证内容 |
|---|--------|----------|
| R1 | **UI 渲染** | 截取完整页面截图，确认阅读态样式正确 |
| R2 | **纯文本显示** | 所有字段变为纯文本：有值显示值，无值显示 `—` |
| R3 | **必填标记隐藏** | 必填 `*` 标记隐藏 |
| R4 | **按钮隐藏** | 提交/重置按钮隐藏 |
| R5 | **不可交互** | 无可交互表单元素（无输入框、下拉框等） |

#### 禁用态验证项（必须全部通过）

| # | 验证项 | 验证内容 |
|---|--------|----------|
| D1 | **UI 渲染** | 截取完整页面截图，确认禁用态样式正确 |
| D2 | **禁用状态** | 所有字段保持输入框形态但灰色不可交互（`[disabled]`） |
| D3 | **按钮隐藏** | 提交/重置按钮隐藏 |

### 测试执行流程

```
对每个场景（共 56 个）按以下流程执行：

1. 阅读场景配置（playground/shared/src/{group}/{Scene}.ts）→ 了解字段/验证/交互
2. 依次测试 3 个平台：
   a. Vue AntdVue（localhost:3001，选 Ant Design Vue）
   b. Vue ElementPlus（localhost:3001，选 Element Plus）
   c. React Antd（localhost:3002）
3. 每个平台依次测试 3 种状态：
   a. 编辑态 → E1~E8 + 场景专属验证
   b. 阅读态 → R1~R5
   c. 禁用态 → D1~D3
4. 发现问题 → 记录到问题表 → 立即修复（参考 formily/ 源码）→ 刷新重验 → 通过后继续
5. 全部通过 → 更新详细测试结果表 → 自动进入下一个场景
```

#### 自动推进规则

> **场景测试通过（含修复后重验通过）后，必须自动进入下一个场景继续测试，无需等待用户指令。**

| 情况 | 处理方式 |
|------|----------|
| 3 平台 × 3 态全部通过 | 更新结果表 → **立即自动进入下一个场景** |
| 发现问题 | 记录问题 → 立即修复 → 刷新重验 → 通过后 **自动继续** |
| 修复后重验通过 | 更新结果表 → **自动进入下一个场景** |
| 遇到无法自行修复的问题 | 记录问题 → **停下来询问用户**，不跳过 |

整体节奏：**测试 → 通过/修复 → 自动下一个 → 测试 → 通过/修复 → 自动下一个 → …… 直到 56 个场景全部完成**

#### 问题处理

发现问题 → 记录到问题表 → 参考 `formily/` 源码定位根因 → 立即修复 → 刷新重验 → 通过后自动继续下一场景

---

## 场景总览

### 01-basic 基础场景

| # | 场景 | 文件夹 | 覆盖能力 |
|---|------|--------|----------|
| 1 | 基础表单 | BasicForm | Input/Password/Textarea/InputNumber/Select/RadioGroup/CheckboxGroup/Switch/DatePicker |
| 2 | 表单布局 | LayoutForm | labelPosition/labelWidth、4 种布局切换 |
| 3 | 必填与格式验证 | BasicValidationForm | required/email/phone/URL/minLength/maxLength/pattern |
| 4 | 默认值 | DefaultValueForm | 静态默认值、动态计算联动、重置恢复 |

### 02-linkage 联动场景

| # | 场景 | 文件夹 | 覆盖能力 |
|---|------|--------|----------|
| 5 | 显隐联动 | VisibilityLinkageForm | 个人/企业切换、嵌套显隐、excludeWhenHidden |
| 6 | 值联动 | ValueLinkageForm | 姓名拼接、大写转换、国家-区号映射、省市区聚合 |
| 7 | 属性联动 | PropertyLinkageForm | 开关控制 disabled、类型切换 placeholder/required/componentProps |
| 8 | 级联选择 | CascadeSelectForm | 省-市-区三级联动、选择后下级清空重载 |
| 9 | 计算字段 | ComputedFieldForm | 乘法/折扣/聚合/条件计税自动计算 |
| 10 | 条件必填 | ConditionalRequiredForm | 开关-字段必填、金额阈值-审批人必填 |

### 03-validation 验证场景

| # | 场景 | 文件夹 | 覆盖能力 |
|---|------|--------|----------|
| 11 | 自定义验证 | CustomValidationForm | 车牌正则、手机号函数、密码多规则、IP 地址、warning 级别 |
| 12 | 异步验证 | AsyncValidationForm | 用户名唯一性、邮箱可用性、防抖 + AbortSignal |
| 13 | 跨字段验证 | CrossFieldValidationForm | 密码一致、比例总和 100%、超预算 |

### 04-complex-data 复杂数据

| # | 场景 | 文件夹 | 覆盖能力 |
|---|------|--------|----------|
| 14 | 嵌套对象 | NestedObjectForm | void Card 分组、多层嵌套路径、提交扁平数据 |
| 15 | 数组字段 | ArrayFieldForm | FormArrayField + ArrayBase 增删排序、子字段校验 |
| 16 | 可编辑表格 | EditableTableForm | Table 行内编辑、计算联动、添加删除行 |
| 17 | 对象数组嵌套 | ObjectArrayNestedForm | 联系人 + 嵌套电话数组（两层 FormArrayField） |

### 05-datasource 数据源

| # | 场景 | 文件夹 | 覆盖能力 |
|---|------|--------|----------|
| 18 | 异步选项 | AsyncOptionsForm | field.loadDataSource + requestAdapter mock |
| 19 | 依赖数据源 | DependentDataSourceForm | 品牌-型号-配置三级远程链 + API 日志 |
| 20 | 分页搜索 | PaginatedSearchForm | 搜索过滤 + 分页加载 + 防抖 |

### 06-layout 布局分组

| # | 场景 | 文件夹 | 覆盖能力 |
|---|------|--------|----------|
| 21 | 分步表单 | StepForm | Steps 导航 + 步骤验证拦截 + 预览 + 提交重置 |
| 22 | 标签页分组 | TabGroupForm | Tab 切换保留数据 + 跨 Tab 提交 |
| 23 | 折叠面板 | CollapseGroupForm | 展开折叠 + 跨面板提交 |
| 24 | 卡片分组 | CardGroupForm | 多卡片填写 + 卡片内验证 + 提交重置 |

### 07-dynamic 动态表单

| # | 场景 | 文件夹 | 覆盖能力 |
|---|------|--------|----------|
| 25 | 动态增删字段 | DynamicFieldForm | FormArrayField 管理动态字段 |
| 26 | 动态 Schema | DynamicSchemaForm | 切换个人/企业/学生-字段集变化 |
| 27 | 模板复用 | TemplateReuseForm | 切换员工/客户/供应商-公共 + 扩展字段组合 |

### 08-components 复杂组件

| # | 场景 | 文件夹 | 覆盖能力 |
|---|------|--------|----------|
| 28 | 富文本编辑器 | RichTextForm | Textarea 降级、HTML 预览 |
| 29 | 文件上传 | FileUploadForm | Upload 组件集成 |
| 30 | 地图选点 | MapPickerForm | 模拟地图 + 经纬度/地址同步 |
| 31 | 颜色选择器 | ColorPickerForm | 原生 color input + HEX 输入 + 预设色板 + 主题预览 |
| 32 | 代码编辑器 | CodeEditorForm | Textarea 模拟 / 语言切换 / 代码高亮预览 |
| 33 | JSON 编辑器 | JsonEditorForm | JSON 格式化 / 压缩 / 语法检测 |
| 34 | 手写签名 | SignaturePadForm | Canvas 绘制 / 清空 / base64 数据同步 |
| 35 | 穿梭框 | TransferForm | Transfer 组件 / 搜索过滤 |
| 36 | 树形选择 | TreeSelectForm | TreeSelect 单选/多选 |
| 37 | Markdown 编辑器 | MarkdownEditorForm | 分栏编辑 + 实时预览 |
| 38 | 图标选择器 | IconSelectorForm | 搜索过滤 + 图标网格 + 点击选中 |
| 39 | Cron 编辑器 | CronEditorForm | Cron 输入 + 快捷预设 + 实时解析描述 |

### 09-state 表单状态

| # | 场景 | 文件夹 | 覆盖能力 |
|---|------|--------|----------|
| 40 | 数据转换 | DataTransformForm | format/parse/transform、原始值 vs 转换值 |
| 41 | 多表单协作 | MultiFormForm | 主表单 + 子表单 + 弹窗表单 + 联合提交 |
| 42 | 表单快照 | FormSnapshotForm | 暂存/恢复/删除草稿 |
| 43 | 撤销重做 | UndoRedoForm | Ctrl+Z 撤销 / Ctrl+Shift+Z 重做 / 历史栈 |
| 44 | 生命周期 | LifecycleForm | onValuesChange / onFieldValueChange / 自动保存 / 事件日志 |

### 10-misc 其他能力

| # | 场景 | 文件夹 | 覆盖能力 |
|---|------|--------|----------|
| 45 | 字段权限 | PermissionForm | 角色切换-字段可见性 + 读写权限 |
| 46 | 国际化 | I18nForm | 中/英/日切换-标签/placeholder/验证消息 |
| 47 | 表单比对 | FormDiffForm | 修改-变更高亮 + 原始值提示 + 变更摘要 |
| 48 | 打印导出 | PrintExportForm | 打印 + 导出 JSON + 导出 CSV |

### 11-advanced 扩展场景

| # | 场景 | 文件夹 | 覆盖能力 |
|---|------|--------|----------|
| 49 | Grid 栅格布局 | GridLayoutForm | span 属性控制字段占比，24 栅格制 |
| 50 | Effects 链式副作用 | EffectsForm | createForm({ effects }) + onFieldValueChange / onValuesChange |
| 51 | 大表单性能 | LargeFormPerf | 50/100/200 字段的渲染性能基准测试 |
| 52 | 自定义装饰器 | CustomDecoratorForm | CardDecorator + InlineDecorator 自定义 wrapper |
| 53 | Schema 表达式 | SchemaExpressionForm | 函数式 reactions 实现条件显隐 + 自动计算 |
| 54 | oneOf 联合 Schema | OneOfSchemaForm | 动态 Schema 切换模拟 oneOf 鉴别字段 |
| 55 | SSR 兼容性 | SSRCompatForm | 核心库无 DOM 依赖检查 |
| 56 | 虚拟滚动 | VirtualScrollForm | 纯 CSS 偏移虚拟滚动，支持百级数组项 |

---

## 问题跟踪

> 发现问题 → 记录 → 立即修复 → 刷新重验 → 通过后继续

### 全局问题（影响所有场景）

| # | 问题 | 状态 | 修复位置 |
|---|------|:----:|----------|
| G1 | `@moluoxixi/vue` 未导出 `ArrayItems` 等组件 | ✅ | `packages/vue/src/index.ts` |
| G2 | ConfigForm FormActionsRenderer 未传递 submit 事件 | ✅ | ConfigForm.ts / ConfigForm.tsx |
| G3 | SchemaField 对 type:array + CheckboxGroup 错误用 FormArrayField | ✅ | SchemaField.ts / SchemaField.tsx |
| G4 | Element Plus 缺少 CSS 导入，图标尺寸失控 | ✅ | `packages/ui-element-plus/src/index.ts` |
| G5 | LayoutFormActions 在 readOnly/disabled 下未隐藏按钮 | ✅ | 三个 UI 库的 LayoutFormActions |
| G6 | React ConfigForm 缺少 useEffect 同步 pattern | ✅ | `packages/react/src/components/ConfigForm.tsx` |
| G7 | antd-vue 垂直布局冒号消失（CSS 伪元素覆盖） | ✅ | FormItem.ts 手动追加冒号 |
| G8 | 阅读态/禁用态仍显示必填 `*` 标记 | ✅ | 三个 UI 库 FormItem + ReactiveField 传递 pattern |
| G9 | React ReactiveField componentProps 展开顺序覆盖 value/onChange | ✅ | ReactiveField.tsx 调整顺序 |
| G10 | React 18 StrictMode 字段注册丢失 | ✅ | FormField/FormArrayField/FormVoidField.tsx |
| G11 | 三个 UI 库 FormItem colon 属性统一 | ✅ | 三个 FormItem 添加 colon prop |
| G12 | SceneRenderer 切换场景时表单数据残留（异步加载竞态 + 缺少 key） | ✅ | Vue App.vue + React App.tsx：loadScene 先清空 sceneConfig + 添加 :key |
| G13 | reactions 动态设置 field.required 后提交不触发验证 | ✅ | `packages/core/src/models/Field.ts` validate() 前 syncRequiredRule |

### 场景级问题

| # | 场景 | 问题 | 状态 |
|---|------|------|:----:|
| S1 | CascadeSelectForm | 城市/区县/二三级分类字段缺少 component:'Select'，渲染为 Input | ✅ |
| S2 | ConditionalRequiredForm | reactions 动态设置 required 后提交不触发验证（UI *标记正常但验证跳过） | ✅ |
| S3 | ArrayFieldForm | Vue RecursionField 数组子字段缺少 resolveComponent，未映射 type→组件 | ✅ |
| S4 | ArrayFieldForm | React 端 ArrayItems 组件未在 setupAntd 注册，数组区域不渲染 | ✅ |
| S5 | ArrayFieldForm | Form.reset() 数组字段长度未恢复：FormObjectField 硬编码 initialValue:{} 污染 initialValues | ✅ |

---

## 详细测试结果

> 每个场景 3 项：编辑态 / 阅读态 / 禁用态
> 每项需在 3 个平台验证：Vue AntdVue / Vue ElementPlus / React Antd
> ✅ 通过 | ❌ 失败 | ⏳ 待测

### 场景 1：基础表单（BasicForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

### 场景 2：表单布局（LayoutForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

### 场景 3：必填与格式验证（BasicValidationForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

### 场景 4：默认值（DefaultValueForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

### 场景 5：显隐联动（VisibilityLinkageForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

### 场景 6：值联动（ValueLinkageForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

### 场景 7：属性联动（PropertyLinkageForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

### 场景 8：级联选择（CascadeSelectForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

### 场景 9：计算字段（ComputedFieldForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

### 场景 10：条件必填（ConditionalRequiredForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

> G13 已修复 — Field.validate() 前同步 required 到 rules，4 种条件必填模式全部验证通过

### 场景 11：自定义验证（CustomValidationForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

### 场景 12：异步验证（AsyncValidationForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

> 重新验证通过 — 用户名/邮箱/邀请码三项异步验证均正确触发（已注册值返回错误、合法值通过提交），防抖+AbortSignal 正常工作

### 场景 13：跨字段验证（CrossFieldValidationForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

> 5 种跨字段验证全部通过：密码不一致、结束日期早于开始日期、比例总和≠100%、最大年龄≤最小年龄、支出超预算

### 场景 14：嵌套对象（NestedObjectForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

> 5 个 LayoutCard 分组正确渲染、void 节点不参与数据路径（提交为扁平 23 字段）、主题联动 customColor 显隐正确、必填验证+重置通过

### 场景 15：数组字段（ArrayFieldForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

> 修复 S3（Vue RecursionField 子字段组件未解析）后 Vue 双平台通过
> 修复 S4（React ArrayItems 已在 setupAntd layouts 注册）+ S5（FormObjectField initialValue 污染导致重置失败）后 React 通过

### 场景 16~56：待测

> 逐个测试时展开，格式同上。

---

## 测试总量统计

| 平台 | 场景数 | 三态 | 测试项总计 |
|------|--------|------|-----------|
| Vue AntdVue | 56 | 3 | 168 |
| Vue ElementPlus | 56 | 3 | 168 |
| React Antd | 56 | 3 | 168 |
| **合计** | | | **504** |
