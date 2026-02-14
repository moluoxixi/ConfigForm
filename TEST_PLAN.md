# Playground 测试计划

## 测试矩阵

| 维度 | 值 |
|------|------|
| 场景数 | 61（3 个 UI 库共享同一份 schema） |
| 渲染 | ConfigForm + SchemaField 递归渲染（参考 Formily RecursionField） |
| 三态 | 编辑态 / 阅读态 / 禁用态（StatusTabs 切换） |
| 框架 | React 18 / Vue 3 |
| UI 库 | Ant Design（React）/ Ant Design Vue / Element Plus |

### 项目架构

> 详见 [README.md](README.md) — 包结构、分层架构、与 Formily 的差异。

#### 参考源码

> 根目录 `formily/` 是 Formily 的源码。**遇到问题时优先参考 Formily 源码**。

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
| 联动场景（5-11） | 触发联动条件 → 目标字段状态变化正确（显隐/值/属性/级联/计算/必填切换/组件切换） |
| 验证场景（12-15） | 自定义规则/异步验证/跨字段验证/分区域验证 → 错误提示内容和时机正确 |
| 复杂数据（16-20） | 嵌套对象路径正确（三级嵌套）/ 数组增删排序 / 表格行内编辑 / ObjectField 动态属性 / 提交数据结构正确 |
| 数据源（21-24） | 异步加载选项 / 依赖链重载 / 搜索 / 远程 URL 数据源 → 选项内容和加载时机正确 |
| 布局分组（25-29） | LayoutSteps/LayoutTabs/LayoutCollapse/LayoutCard 分组 → 数据保留、跨区域提交正确 |
| 动态表单（30-32） | CheckboxGroup 控制显隐 / mergeSchema 场景切换 / $ref+definitions 片段复用 → 字段集合和数据正确 |
| 自定义组件（33-40） | **真实自定义组件**特有交互：颜色选择/Canvas签名/JSON格式化/Cron解读/Markdown预览/富文本工具栏/图标搜索 |
| 进阶能力（41-51） | Schema 表达式/$ref/Effects/oneOf/Grid/自定义装饰器/大表单性能/SSR/虚拟滚动 |
| 状态管理（52-57） | 生命周期/数据转换(displayFormat+inputParse+submitTransform+submitPath)/草稿/模式切换/display三态/getGraph |
| 其他能力（58-59） | 国际化/导出 JSON+CSV → 功能完整正确 |
| 插件能力（60-65） | 撤销重做/实时diff对比/ACL权限/JSON Schema适配/数据脱敏/提交重试 → 插件 API 正确 |

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

整体节奏：**测试 → 通过/修复 → 自动下一个 → 测试 → 通过/修复 → 自动下一个 → …… 直到 60 个场景全部完成**

#### 问题处理

发现问题 → 记录到问题表 → 参考 `formily/` 源码定位根因 → 立即修复 → 刷新重验 → 通过后自动继续下一场景

---

## 场景总览

### 01-basic 基础场景（4 个）

| # | 场景 | 文件 | 覆盖能力 |
|---|------|------|----------|
| 1 | 基础表单 | BasicForm | Input/Password/Textarea/InputNumber/Select/RadioGroup/CheckboxGroup/Switch/DatePicker |
| 2 | 表单布局 | LayoutForm | labelPosition/labelWidth、4 种布局切换（schemaVariants） |
| 3 | 必填与格式验证 | BasicValidationForm | required/email/phone/URL/minLength/maxLength/pattern |
| 4 | 默认值 | DefaultValueForm | 静态默认值、动态计算联动（{{expression}}）、重置恢复 |

### 02-linkage 联动场景（7 个）

| # | 场景 | 文件 | 覆盖能力 |
|---|------|------|----------|
| 5 | 显隐联动 | VisibilityLinkageForm | 个人/企业切换、嵌套显隐、excludeWhenHidden |
| 6 | 值联动 | ValueLinkageForm | 姓名拼接、大写转换、国家→区号映射、省市区聚合 |
| 7 | 属性联动 | PropertyLinkageForm | 开关控制 disabled、类型切换 placeholder/required/componentProps |
| 8 | 级联选择 | CascadeSelectForm | 省-市-区三级联动、选择后下级清空重载 |
| 9 | 计算字段 | ComputedFieldForm | 乘法/折扣/聚合/条件计税自动计算 |
| 10 | 条件必填 | ConditionalRequiredForm | 开关→字段必填、金额阈值→审批人必填 |
| 11 | 组件切换 | ComponentSwitchForm | **NEW** reactions.fulfill.component 动态切换渲染组件（Input↔Select↔RadioGroup↔Switch↔DatePicker） |

### 03-validation 验证场景（4 个）

| # | 场景 | 文件 | 覆盖能力 |
|---|------|------|----------|
| 12 | 自定义验证 | CustomValidationForm | 车牌正则、手机号函数、密码多规则、IP 地址、warning 级别 |
| 13 | 异步验证 | AsyncValidationForm | 用户名唯一性、邮箱可用性、防抖 + AbortSignal |
| 14 | 跨字段验证 | CrossFieldValidationForm | 密码一致、比例总和 100%、超预算 |
| 15 | 分区域验证 | SectionValidationForm | **NEW** validateSection + clearSectionErrors，分步验证 |

### 04-complex-data 复杂数据（5 个）

| # | 场景 | 文件 | 覆盖能力 |
|---|------|------|----------|
| 16 | 嵌套对象 | NestedObjectForm | **REWRITE** type:'object' 真正嵌套路径（profile.name / emergency.contact.phone 三级嵌套） |
| 17 | 数组字段 | ArrayFieldForm | FormArrayField + ArrayBase 增删排序、子字段校验 |
| 18 | 可编辑表格 | EditableTableForm | ArrayTable 行内编辑、添加删除行 |
| 19 | 对象数组嵌套 | ObjectArrayNestedForm | 联系人 + 嵌套电话数组（两层 FormArrayField） |
| 20 | ObjectField 动态属性 | ObjectFieldDynamicForm | **REWRITE** addProperty/removeProperty/existProperty/getPropertyNames 实际调用 |

### 05-datasource 数据源（4 个）

| # | 场景 | 文件 | 覆盖能力 |
|---|------|------|----------|
| 21 | 异步选项 | AsyncOptionsForm | reactions.run 动态 setDataSource + field.loading |
| 22 | 依赖数据源 | DependentDataSourceForm | 品牌→型号 级联 + disabled toggle + 值清空 |
| 23 | 大数据量下拉搜索 | PaginatedSearchForm | **RENAME** Select + showSearch 50 条本地数据过滤 |
| 24 | 远程数据源 | RemoteDataSourceForm | **NEW** DataSourceConfig url/params/transform/cache |

### 06-layout 布局分组（4 个）

| # | 场景 | 文件 | 覆盖能力 |
|---|------|------|----------|
| 25 | 分步表单 | StepForm | **FIX** LayoutSteps + LayoutStepActions 真正步骤导航 |
| 26 | 标签页分组 | TabGroupForm | **FIX** LayoutTabs 标签页切换保留数据 |
| 27 | 折叠面板 | CollapseGroupForm | **FIX** LayoutCollapse 折叠展开 |
| 28 | 卡片分组 | CardGroupForm | LayoutCard 多卡片填写 + 卡片内验证 |

### 07-dynamic 动态表单（3 个）

| # | 场景 | 文件 | 覆盖能力 |
|---|------|------|----------|
| 30 | 动态增删字段 | DynamicFieldForm | **FIX** CheckboxGroup → reactions 控制字段显隐 |
| 31 | 动态 Schema 合并 | DynamicSchemaForm | **REWRITE** mergeSchema API + schemaVariants 个人/企业/学生切换 |
| 32 | Schema 片段复用 | TemplateReuseForm | **REWRITE** $ref + definitions 联系人/地址片段复用 |

### 08-components 自定义组件（4 个，playground 注册）

| # | 场景 | 文件 | 覆盖能力 |
|---|------|------|----------|
| 33 | 颜色选择器 | ColorPickerForm | registerComponent + defaultDecorator + readPrettyComponent |
| 34 | Cron 编辑器 | CronEditorForm | registerComponent + defaultDecorator（复杂组件：预设+解读） |
| 35 | 无装饰器组件 | RawComponentForm | decorator:'' 裸渲染（CodeEditor + SignaturePad 无 FormItem 包裹） |
| 36 | readPretty 映射 | ReadPrettyComponentForm | 编辑态 ColorPicker / 阅读态 PreviewColorPicker 自动切换 |

### 09-advanced 进阶能力（11 个）

| # | 场景 | 文件 | 覆盖能力 |
|---|------|------|----------|
| 41 | Schema 表达式 | SchemaExpressionForm | {{expression}} 驱动联动 — 条件显隐 + 自动计算 |
| 42 | 表达式引擎 | ExpressionEngineForm | 表达式 JSON 序列化能力 |
| 43 | Schema $ref 复用 | SchemaRefForm | $ref + definitions + 本地覆盖 |
| 44 | Effects 副作用 | EffectsForm | reactions + {{表达式}} 链式计算 |
| 45 | 自定义装饰器 | CustomDecoratorForm | **FIX** CardDecorator + InlineDecorator 已注册 |
| 46 | oneOf 条件 Schema | OneOfSchemaForm | oneOf + discriminator 分支自动切换 |
| 47 | Effects API | EffectsAPIForm | onFieldValueChange / onFormReact / onFieldMount 命令式 |
| 48 | Grid 栅格布局 | GridLayoutForm | span 属性控制字段占比，24 栅格制 |
| 49 | 大表单性能 | LargeFormPerf | 50/100/200 字段渲染性能 |
| 50 | SSR 兼容性 | SSRCompatForm | 核心库无 DOM 依赖 |
| 51 | 虚拟滚动 | VirtualScrollForm | 大数组虚拟滚动 |

### 10-state 状态管理（6 个）

| # | 场景 | 文件 | 覆盖能力 |
|---|------|------|----------|
| 52 | 生命周期 | LifecycleForm | mount/unmount + onInput vs setValue 分离 |
| 53 | 数据转换 | DataTransformForm | **REWRITE** displayFormat/inputParse/submitTransform/submitPath 完整演示 |
| 54 | 草稿保存 | FormSnapshotForm | lowerCodePlugin.draft + history 联合 |
| 55 | 表单模式切换 | PatternSwitchForm | **NEW** editable/readOnly/disabled/preview 四种模式 |
| 56 | display 三态 | DisplayTriStateForm | **NEW** visible/hidden/none 差异 |
| 57 | 表单状态快照 | FormGraphForm | **NEW** getGraph/setGraph 序列化 |

### 11-misc 其他能力（2 个）

| # | 场景 | 文件 | 覆盖能力 |
|---|------|------|----------|
| 58 | 国际化 | I18nForm | 中/英/日切换 |
| 59 | 导出 JSON/CSV | PrintExportForm | **REWRITE** effects 实时生成 JSON 和 CSV 导出预览 |

### 12-plugin 插件能力（6 个）

| # | 场景 | 文件 | 覆盖能力 |
|---|------|------|----------|
| 60 | 撤销重做 | UndoRedoForm | lowerCodePlugin.history |
| 61 | 表单比对 | FormDiffForm | **REWRITE** dirtyChecker.check() 实时 diff 日志 |
| 62 | 字段权限 | PermissionForm | lowerCodePlugin.acl 角色权限 |
| 63 | JSON Schema 适配 | JsonSchemaAdapterForm | fromJsonSchema 标准转换 |
| 64 | 数据脱敏 | MaskingPluginForm | **NEW** lowerCodePlugin.masking 六种脱敏类型 |
| 65 | 提交重试 | SubmitRetryPluginForm | **NEW** lowerCodePlugin.submitRetry 三种策略 |

---

## 场景专属测试要点

> 每个场景除了通用的 E1~E8 / R1~R5 / D1~D3 外，还需要验证以下场景特有的功能点。
> **提交、重置、校验是所有场景的必测项，以下仅列出额外要点。**

### 01-basic

| # | 场景 | 必测要点 |
|---|------|---------|
| 1 | BasicForm | 11 种字段类型逐个填写回显；Password 眼睛切换；Switch 切换；DatePicker 选日期；CheckboxGroup 多选；提交后逐字段核对 |
| 2 | LayoutForm | 切换 4 种布局变体（水平/垂直/行内/栅格），每种布局下填写提交正确 |
| 3 | BasicValidationForm | 空提交→6 个必填错误；邮箱/手机号/URL 非法→格式错误；密码不满足复杂度→正则错误；修正后错误消失 |
| 4 | DefaultValueForm | initialValues 预填正确；计算字段（totalPrice/discountRate）初始值正确；修改 quantity→totalPrice 自动更新；重置恢复所有默认值 |

### 02-linkage

| # | 场景 | 必测要点 |
|---|------|---------|
| 5 | VisibilityLinkageForm | 切换个人/企业→对应字段组显隐；开关→多字段显隐；嵌套显隐（hasAddress+hasDetailAddress 两级）；隐藏字段提交时排除（excludeWhenHidden） |
| 6 | ValueLinkageForm | 修改 firstName/lastName→fullName 自动拼接；输入 rawInput→upperCase/trimmed 自动转换；选择 country→areaCode/currency 自动映射 |
| 7 | PropertyLinkageForm | enableRemark 开关→remark disabled 切换；contactType 切换→contactValue 的 required/placeholder 动态变化；productType 切换→quantity 的 min/step 变化 |
| 8 | CascadeSelectForm | 选择省→市选项更新+值清空；选择市→区选项更新；两组独立级联互不影响 |
| 9 | ComputedFieldForm | 修改单价/数量→总价自动计算；修改折扣→折扣价自动计算；三科分数→总分/平均分自动聚合；切换计税方式→税额条件计算 |
| 10 | ConditionalRequiredForm | 开关 needInvoice→发票字段必填切换；金额超阈值→审批人必填；选"其他"请假→原因必填；多条件组合（isOverseas+travelDays>3） |
| 11 | ComponentSwitchForm | 切换输入方式→字段值组件从 Input 变为 Select 变为 RadioGroup；切换数据类型→配置值组件从 Input 变为 InputNumber/DatePicker/Switch |

### 03-validation

| # | 场景 | 必测要点 |
|---|------|---------|
| 12 | CustomValidationForm | 车牌号正则校验；手机号函数校验；密码 5 条规则（stopOnFirstFailure）；IP 地址段校验；年龄 warning 级别（不阻止提交）；切换证件类型→规则动态切换 |
| 13 | AsyncValidationForm | 输入已注册用户名（admin/test）→blur 后异步错误；输入合法名→通过；邮箱唯一性异步校验；防抖行为（快速输入不触发多次） |
| 14 | CrossFieldValidationForm | 密码≠确认密码→提交错误；结束日期<开始日期→错误；三比例总和≠100%→错误；最大年龄<最小年龄→错误；支出>预算→错误 |
| 15 | SectionValidationForm | 空提交→三个分区全部显示错误（7 个必填）；填写第一区→提交→仅第二三区有错误 |

### 04-complex-data

| # | 场景 | 必测要点 |
|---|------|---------|
| 16 | NestedObjectForm | 提交数据为嵌套结构（profile.name / address.city / emergency.contact.phone 三级）；非 void 的 object 节点 dataPath 正确 |
| 17 | ArrayFieldForm | 添加/删除/上移/下移数组项；minItems/maxItems 边界（无法删到低于 min，无法加超过 max）；数组项内子字段校验；重置恢复初始数组 |
| 18 | EditableTableForm | 表格行内编辑每个单元格；添加/删除行；必填校验在表格内生效 |
| 19 | ObjectArrayNestedForm | 外层数组（contacts）增删；内层数组（phones）增删；提交数据保持两层嵌套结构 |
| 20 | ObjectFieldDynamicForm | effects 日志展示 addProperty/removeProperty/existProperty/getPropertyNames 调用结果 |

### 05-datasource

| # | 场景 | 必测要点 |
|---|------|---------|
| 21 | AsyncOptionsForm | 选择类型→品种 Select 选项异步加载（loading 状态）；加载完成后可选择；提交值正确 |
| 22 | DependentDataSourceForm | 选择品牌→型号 Select 启用+选项加载；选择年级→班级 Select 启用+选项加载；切换父级→子级值清空+选项更新 |
| 23 | PaginatedSearchForm | showSearch 搜索过滤 50 条选项；选择后提交值正确 |
| 24 | RemoteDataSourceForm | 远程 URL 加载用户列表；选择用户→文章列表联动加载 |

### 06-layout

| # | 场景 | 必测要点 |
|---|------|---------|
| 25 | StepForm | 步骤导航正确显示；下一步/上一步切换；每步字段独立显示；跨步骤提交包含所有字段 |
| 26 | TabGroupForm | 3 个 Tab 切换正确；切换后数据保留；跨 Tab 提交包含所有字段 |
| 27 | CollapseGroupForm | 4 个折叠面板展开/折叠；折叠后数据保留；提交包含所有面板字段 |
| 28 | CardGroupForm | 3 张卡片内字段正确渲染；卡片内必填校验；跨卡片提交 |

### 07-dynamic

| # | 场景 | 必测要点 |
|---|------|---------|
| 30 | DynamicFieldForm | 勾选 CheckboxGroup 中的选项→对应字段出现；取消勾选→字段消失；提交只包含可见字段的值 |
| 31 | DynamicSchemaForm | 切换个人/企业/学生→字段集变化（身份证/公司/学校）；每个场景的必填校验独立；提交数据包含当前场景字段 |
| 32 | TemplateReuseForm | 复用的联系人/地址字段结构正确；紧急联系人区域字段完整；提交数据正确 |

### 08-components

| # | 场景 | 必测要点 |
|---|------|---------|
| 33 | ColorPickerForm | 点击预设色板→颜色值更新；HEX 输入→色块更新；提交颜色值为 HEX 字符串 |
| 34 | CronEditorForm | 输入 Cron 表达式→实时解读更新；点击预设→表达式和解读同步更新 |
| 35 | RawComponentForm | CodeEditor/SignaturePad 无 FormItem 包裹（无 label）；标题字段有 FormItem 包裹（有 label + 必填*）；对比差异明显 |
| 36 | ReadPrettyComponentForm | 编辑态→ColorPicker 完整渲染（色块+HEX+预设板）；切换阅读态→替换为 PreviewColorPicker（色块+纯文本HEX）；必填标记消失 |

### 09-advanced

| # | 场景 | 必测要点 |
|---|------|---------|
| 37 | SchemaExpressionForm | {{expression}} 驱动：订单类型→加急费用显隐+自动计算；发票联动；多条件嵌套 |
| 38 | ExpressionEngineForm | 同上，强调 JSON 可序列化 |
| 39 | SchemaRefForm | $ref 引用的地址字段正确渲染（复用两次）；本地属性覆盖 title 生效 |
| 40 | EffectsForm | 修改单价/数量→总价自动计算→实付金额链式更新 |
| 41 | CustomDecoratorForm | CardDecorator 字段有卡片背景包裹；InlineDecorator 字段左标签右内容紧凑布局；默认 FormItem 字段正常 |
| 42 | OneOfSchemaForm | 切换支付方式→对应字段组自动切换（信用卡/银行转账/支付宝）；非活跃分支字段隐藏 |
| 43 | EffectsAPIForm | effects 日志记录 onFieldMount/onFieldValueChange/onFormReact 事件 |
| 44 | GridLayoutForm | span 属性控制列宽：12+12=满行、8+16=不等分、24=满宽 |
| 45 | LargeFormPerf | 50 个字段正常渲染无卡顿 |
| 46 | SSRCompatForm | 基础字段正常渲染（无 DOM 依赖报错） |
| 47 | VirtualScrollForm | 大数组虚拟滚动配置正确 |

### 10-state

| # | 场景 | 必测要点 |
|---|------|---------|
| 48 | LifecycleForm | showOptional 开关→nickname 字段 mount/unmount 事件记录到日志；输入触发 onFieldInputChange |
| 49 | DataTransformForm | 价格字段 displayFormat（分→元显示）；inputParse（输入→存储转换）；submitTransform（标签字符串→数组）；submitPath（contactEmail→contact.email 映射） |
| 50 | FormSnapshotForm | lowerCodePlugin.draft 草稿保存/恢复 |
| 51 | PatternSwitchForm | 切换 RadioGroup→4 种模式（editable/readOnly/disabled/preview）全部字段跟随变化；alwaysEditable 字段不受影响 |
| 52 | DisplayTriStateForm | 切换 visible/hidden/none→字段显隐变化；提交数据差异（hidden 保留值，none 排除值） |
| 53 | FormGraphForm | 挂载后 graphJson 字段展示 getGraph() 序列化结果 |

### 11-misc

| # | 场景 | 必测要点 |
|---|------|---------|
| 54 | I18nForm | 标准字段+提交/重置 |
| 55 | PrintExportForm | effects 生成的 JSON 和 CSV 导出预览字段实时更新；修改字段→导出内容同步变化 |

### 12-plugin

| # | 场景 | 必测要点 |
|---|------|---------|
| 56 | UndoRedoForm | lowerCodePlugin.history 插件加载不报错 |
| 57 | FormDiffForm | 修改字段→_diffLog 实时显示 diff 结果（isDirty/字段路径/oldValue/newValue） |
| 58 | PermissionForm | 标准字段+提交/重置 |
| 59 | JsonSchemaAdapterForm | fromJsonSchema 转换后的表单正确渲染所有字段 |
| 60 | MaskingPluginForm | lowerCodePlugin.masking 插件加载不报错 |
| 61 | SubmitRetryPluginForm | lowerCodePlugin.submitRetry 插件加载不报错 |

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
| G14 | reaction engine 的 `fulfill.value` 和 `when` 回调传参不匹配 schema 签名 `(field, ctx)` | ✅ | `packages/core/src/reaction/engine.ts` 修复为 `effect.value(field, context)` 和 `rule.when(field, context)` |

### 场景级问题

| # | 场景 | 问题 | 状态 |
|---|------|------|:----:|
| S1 | CascadeSelectForm | 城市/区县/二三级分类字段缺少 component:'Select'，渲染为 Input | ✅ |
| S2 | ConditionalRequiredForm | reactions 动态设置 required 后提交不触发验证（UI *标记正常但验证跳过） | ✅ |
| S3 | ArrayFieldForm | Vue RecursionField 数组子字段缺少 resolveComponent，未映射 type→组件 | ✅ |
| S4 | ArrayFieldForm | React 端 ArrayItems 组件未在 setupAntd 注册，数组区域不渲染 | ✅ |
| S5 | ArrayFieldForm | Form.reset() 数组字段长度未恢复：FormObjectField 硬编码 initialValue:{} 污染 initialValues | ✅ |
| S6 | ConditionalRequiredForm | 提交结果区/验证失败提示在 reset 或切换为阅读/禁用后仍保留，应清理 | ✅ |
| S7 | StepForm | 提交结果表顶层字段为 `—`，实际值只在 `steps` 下（Vue AntdVue / Vue ElementPlus / React Antd） | ⏳ |
| S8 | StepForm | React 端进入场景控制台报错：Cannot update a component while rendering a different component（ReactiveField.tsx） | ⏳ |
| S9 | TabGroupForm | 部门 Select 无选项（No data / 无数据，Vue AntdVue / Vue ElementPlus / React Antd） | ⏳ |
| S10 | TabGroupForm | 提交结果表顶层字段为 `—`，实际值只在 `tabs` 下（Vue AntdVue / Vue ElementPlus / React Antd） | ⏳ |
| S11 | CollapseGroupForm | 学历 Select 无选项（No data / 无数据，Vue AntdVue / Vue ElementPlus / React Antd） | ⏳ |
| S12 | CollapseGroupForm | 提交结果表顶层字段为 `—`，实际值只在 `collapse` 下（Vue AntdVue / Vue ElementPlus / React Antd） | ⏳ |

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

> ✅ 重新验证通过：动态必填校验触发正常；reset/切换阅读或禁用后，提交结果与验证失败提示均已清理

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

### 场景 16：可编辑表格（EditableTableForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

> 新增 ArrayTable 组件，渲染为 HTML table 行内编辑，从 items.properties 自动提取列定义

### 场景 17：对象数组嵌套（ObjectArrayNestedForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

> 两层嵌套数组（contacts[].phones[]）正确渲染，提交数据结构完整保留嵌套关系

### 场景 18：异步选项加载（AsyncOptionsForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

> 类型/品种/国家 Select 正确渲染，enum 自动转 dataSource，提交数据正确

### 场景 19：依赖数据源（DependentDataSourceForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

> 品牌/型号/配置/年级/班级 5 个 Select 正确渲染，必填验证正常

### 场景 20：分页搜索数据源（PaginatedSearchForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

> 用户搜索 Select + 部门 Select 正确渲染

### 场景 21：分步表单（StepForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ❌ | ✅ | ✅ |
| Vue ElementPlus | ❌ | ✅ | ✅ |
| React Antd | ❌ | ✅ | ✅ |

> LayoutSteps 两步分组正确渲染
> 提交结果顶层字段为 `—`（值仅在 `steps` 下）

### 场景 22：标签页切换分组（TabGroupForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ❌ | ✅ | ✅ |
| Vue ElementPlus | ❌ | ✅ | ✅ |
| React Antd | ❌ | ✅ | ✅ |

> LayoutTabs 三 Tab 分组正确渲染
> 部门 Select 无数据；提交结果顶层字段为 `—`（值仅在 `tabs` 下）

### 场景 23：折叠面板分组（CollapseGroupForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ❌ | ✅ | ✅ |
| Vue ElementPlus | ❌ | ✅ | ✅ |
| React Antd | ❌ | ✅ | ✅ |

> LayoutCollapse 四面板分组正确渲染
> 学历 Select 无数据；提交结果顶层字段为 `—`（值仅在 `collapse` 下）

### 场景 24：卡片分组（CardGroupForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

> LayoutCard 三卡片分组正确渲染

### 场景 25：动态增删字段（DynamicFieldForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

**编辑态详细验证：**
- E1/E2 UI：标题/描述/StatusTabs/CheckboxGroup(姓名✓邮箱✓)+6字段+提交重置 ✅
- E3 字段填写：逐字段填写并回显正确 ✅
- E4 验证 — 空提交→"姓名不能为空" ✅；姓名1字→"至少2字"、邮箱非法→"无效邮箱"、电话非法→"无效手机号" ✅；修正后错误消失 ✅
- E6 提交：7 字段值逐一核对正确 ✅
- E7 重置：所有字段恢复空值，CheckboxGroup 恢复初始选中 ✅
- E8 控制台：无 error ✅

**阅读态：** R1~R5 全通过（纯文本"—"、必填*隐藏、无按钮、无交互）✅
**禁用态：** D1~D3 全通过（checkbox+textbox 全 disabled、无按钮）✅

### 场景 26：动态 Schema（DynamicSchemaForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

**编辑态详细验证：**
- E1/E2 UI：4 字段（姓名*、手机号*、邮箱、备注 Textarea）+ 提交/重置按钮 ✅
- E4 验证 — 空提交→"姓名不能为空""手机号不能为空" ✅；手机号"123"→"无效手机号"、邮箱"bad"→"无效邮箱" ✅；修正后错误消失 ✅
- E6 提交：11 字段值逐一核对正确 ✅
- E7 重置：所有字段恢复空值 ✅

**阅读态：** R1~R5 全通过 ✅
**禁用态：** D1~D3 全通过 ✅

### 场景 27：模板复用（TemplateReuseForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

**编辑态详细验证：**
- E1/E2 UI：7 字段（姓名*、手机号*、邮箱、省份 Select、城市、详细地址 Textarea、备注 Textarea）+ 提交/重置按钮 ✅
- E4 验证 — 空提交→"姓名不能为空""手机号不能为空" ✅；姓名1字→"至少2字"、手机号非法→"无效手机号"、邮箱非法→"无效邮箱" ✅；修正后错误消失 ✅
- E6 提交：13 字段值逐一核对正确 ✅
- E7 重置：所有字段恢复空值 ✅

**阅读态：** R1~R5 全通过 ✅
**禁用态：** D1~D3 全通过 ✅

### 场景 28：富文本编辑器（RichTextForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

**编辑态详细验证：**
- E1/E2 UI：标题*（初始"示例文章"）+ 提交/重置 ✅。content 字段 RichTextEditor 未注册不渲染（预期降级）
- E4 验证 — 清空标题→提交→"标题不能为空" ✅；修正后错误消失 ✅
- E6 提交：title + content(initialValues HTML) 逐一核对正确 ✅
- E7 重置：标题恢复"示例文章" ✅
- E8 控制台：无 error（仅 warning "未找到组件 RichTextEditor" 预期行为）✅

**阅读态：** R1~R5 全通过（纯文本"示例文章"、无*、无按钮、无交互）✅
**禁用态：** D1~D3 全通过（textbox disabled、无按钮）✅

### 场景 29：文件上传（FileUploadForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

**编辑态详细验证：**
- E1/E2 UI：标题*（Input）+ 说明（Textarea）+ 提交/重置 ✅
- E4 验证 — 空提交→"标题不能为空" ✅；填写后错误消失 ✅
- E6 提交：title + description 逐一核对正确 ✅
- E7 重置：两字段恢复空值（initialValues 为空字符串）✅
- E8 控制台：无 error ✅

**阅读态：** R1~R5 全通过（纯文本"—"、无*、无按钮、无交互）✅
**禁用态：** D1~D3 全通过（两个 textbox disabled、无按钮）✅

### 场景 30：地图选点（MapPickerForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

**编辑态详细验证：**
- E1/E2 UI：地点名称*（初始"天安门广场"）+ 经度(116.3912 InputNumber) + 纬度(39.9075 InputNumber) + 提交/重置 ✅
- E4 验证 — 清空地点名称→提交→"地点名称不能为空" ✅
- E6 提交：locationName + lng + lat 逐一核对正确 ✅
- E7 重置：恢复 initialValues（天安门广场/116.3912/39.9075）✅
- E8 控制台：无 error ✅
- **场景特有测试**：InputNumber 经纬度字段正确显示 number 类型数据 ✅

**阅读态：** R1~R5 全通过（纯文本显示值、无*、无按钮、无交互）✅
**禁用态：** D1~D3 全通过（textbox+spinbutton disabled、无按钮）✅

### 场景 31：颜色选择器（ColorPickerForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

**编辑态详细验证：**
- E1/E2 UI：主题名称*（初始"自定义主题"）+ 提交/重置。ColorPicker 组件未注册降级 ✅
- E4 验证 — 清空→"主题名称不能为空" ✅
- E6 提交：themeName + primaryColor(#1677ff) + bgColor(#ffffff) + textColor(#333333) ✅
- E7 重置：恢复"自定义主题" ✅
- **场景特有测试**：颜色 initialValues 在提交中正确保留 HEX 值 ✅

### 场景 32：代码编辑器（CodeEditorForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

> 标准字段 title* + language(Select/enum) 正确渲染。CodeEditor 降级。验证/提交/重置/三态通过。

### 场景 33：JSON 编辑器（JsonEditorForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

> 标准字段 configName* 正确渲染。JsonEditor 降级。验证/提交/重置/三态通过。

### 场景 34：手写签名（SignaturePadForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

> 标准字段 signerName* 正确渲染。SignaturePad 降级。验证/提交/重置/三态通过。

### 场景 35：穿梭框（TransferForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

> 标准字段 roleName* 正确渲染。TransferPicker 降级。验证/提交/重置/三态通过。

### 场景 36：树形选择（TreeSelectForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

> 标准字段 memberName* 正确渲染。TreeSelectPicker 降级。验证/提交/重置/三态通过。

### 场景 37：Markdown 编辑器（MarkdownEditorForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

> 标准字段 docTitle* 正确渲染。MarkdownEditor 降级。验证/提交/重置/三态通过。

### 场景 38：图标选择器（IconSelectorForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

> 标准字段 menuName* 正确渲染。IconSelector 降级。验证/提交/重置/三态通过。

### 场景 39：Cron 编辑器（CronEditorForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

> 标准字段 taskName* 正确渲染。CronEditor 降级。验证/提交/重置/三态通过。

### 场景 40：数据转换（DataTransformForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

**编辑态详细验证：**
- E1/E2 UI：价格（InputNumber 9990）+ 手机号 + 姓名 + 标签 + description 提示 + 提交/重置 ✅
- E6 提交：priceCent:9990, phoneRaw:13800138000, fullName:张三, tags:react,vue,typescript ✅
- E7 重置：恢复 initialValues ✅
- **场景特有测试**：description 提示文本（"存储单位为分""提交时可转为数组"）正确显示 ✅

### 场景 42：表单快照（FormSnapshotForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

> 标题* + 描述 + 分类 + 优先级 Select + 提交/重置。空提交→"标题不能为空" ✅。

### 场景 43：撤销重做（UndoRedoForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

> 标题* + 分类 + 金额(InputNumber) + 备注 + 提交/重置。验证/三态通过。

### 场景 44：生命周期（LifecycleForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

> 标题*（初始"生命周期测试"）+ 价格(99) + 描述 + 提交/重置。验证/三态通过。

### 场景 45：字段权限（PermissionForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

> 6 字段（姓名/邮箱/薪资25000/部门/职级/备注）+ 提交/重置。验证/三态通过。

### 场景 46：国际化（I18nForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

> 标准字段 + 提交/重置。验证/三态通过。

### 场景 47：表单比对（FormDiffForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

> 标准字段 + 提交/重置。验证/三态通过。

### 场景 48：打印导出（PrintExportForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

> 标准字段 + 提交/重置。验证/三态通过。

### 场景 49：Grid 栅格布局（GridLayoutForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

> 标准字段 + 提交/重置。验证/三态通过。

### 场景 50：Effects 链式副作用（EffectsForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

> 标准字段 + 提交/重置。验证/三态通过。

### 场景 51：大表单性能（LargeFormPerf）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

> 标准字段 + 提交/重置。验证/三态通过。

### 场景 52：自定义装饰器（CustomDecoratorForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

> 标准字段 + 提交/重置。验证/三态通过。

### 场景 11：组件切换（ComponentSwitchForm）— NEW

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

### 场景 15：分区域验证（SectionValidationForm）— NEW

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

### 场景 16：嵌套对象（NestedObjectForm）— REWRITE 需重测

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

### 场景 20：ObjectField 动态属性（ObjectFieldDynamicForm）— REWRITE 需重测

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ |
| React Antd | ✅ | ✅ | ✅ |

### 场景 24：远程数据源（RemoteDataSourceForm）— NEW

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ⏳ | ⏳ | ⏳ |
| Vue ElementPlus | ⏳ | ⏳ | ⏳ |
| React Antd | ⏳ | ⏳ | ⏳ |

### 场景 25-27：布局分组 — FIX 需重测

| 场景 | Vue AntdVue | Vue ElementPlus | React Antd |
|------|:-----------:|:-----------:|:----------:|
| 25 StepForm | ❌ | ❌ | ❌ |
| 26 TabGroupForm | ❌ | ❌ | ❌ |
| 27 CollapseGroupForm | ❌ | ❌ | ❌ |

### 场景 30：动态增删字段（DynamicFieldForm）— FIX 需重测

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ⏳ | ⏳ | ⏳ |
| Vue ElementPlus | ⏳ | ⏳ | ⏳ |
| React Antd | ⏳ | ⏳ | ⏳ |

### 场景 31：动态 Schema 合并（DynamicSchemaForm）— REWRITE 需重测

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ⏳ | ⏳ | ⏳ |
| Vue ElementPlus | ⏳ | ⏳ | ⏳ |
| React Antd | ⏳ | ⏳ | ⏳ |

### 场景 32：Schema 片段复用（TemplateReuseForm）— REWRITE 需重测

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ⏳ | ⏳ | ⏳ |
| Vue ElementPlus | ⏳ | ⏳ | ⏳ |
| React Antd | ⏳ | ⏳ | ⏳ |

### 场景 33-40：自定义组件 — REAL 组件实现 需重测

| 场景 | Vue AntdVue | Vue ElementPlus | React Antd |
|------|:-----------:|:-----------:|:----------:|
| 33 ColorPickerForm | ⏳ | ⏳ | ⏳ |
| 34 CodeEditorForm | ⏳ | ⏳ | ⏳ |
| 35 JsonEditorForm | ⏳ | ⏳ | ⏳ |
| 36 CronEditorForm | ⏳ | ⏳ | ⏳ |
| 37 SignaturePadForm | ⏳ | ⏳ | ⏳ |
| 38 MarkdownEditorForm | ⏳ | ⏳ | ⏳ |
| 39 RichTextForm | ⏳ | ⏳ | ⏳ |
| 40 IconSelectorForm | ⏳ | ⏳ | ⏳ |

> 注意：自定义组件仅在 React playground 中注册，Vue 端会降级为 Input。Vue 端仅验证降级行为正确。

### 场景 41：Schema 表达式（SchemaExpressionForm）

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ⏳ | ⏳ | ⏳ |
| Vue ElementPlus | ⏳ | ⏳ | ⏳ |
| React Antd | ⏳ | ⏳ | ⏳ |

### 场景 45：自定义装饰器（CustomDecoratorForm）— FIX 需重测

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ⏳ | ⏳ | ⏳ |
| Vue ElementPlus | ⏳ | ⏳ | ⏳ |
| React Antd | ⏳ | ⏳ | ⏳ |

> 注意：CardDecorator/InlineDecorator 仅在 React playground 注册。

### 场景 53：数据转换（DataTransformForm）— REWRITE 需重测

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ⏳ | ⏳ | ⏳ |
| Vue ElementPlus | ⏳ | ⏳ | ⏳ |
| React Antd | ⏳ | ⏳ | ⏳ |

### 场景 55-57：状态管理新增 — NEW

| 场景 | Vue AntdVue | Vue ElementPlus | React Antd |
|------|:-----------:|:-----------:|:----------:|
| 55 PatternSwitchForm | ⏳ | ⏳ | ⏳ |
| 56 DisplayTriStateForm | ⏳ | ⏳ | ⏳ |
| 57 FormGraphForm | ⏳ | ⏳ | ⏳ |

### 场景 59：导出 JSON/CSV（PrintExportForm）— REWRITE 需重测

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ⏳ | ⏳ | ⏳ |
| Vue ElementPlus | ⏳ | ⏳ | ⏳ |
| React Antd | ⏳ | ⏳ | ⏳ |

### 场景 61：表单比对（FormDiffForm）— REWRITE 需重测

| 平台 | 编辑态 | 阅读态 | 禁用态 |
|------|:------:|:------:|:------:|
| Vue AntdVue | ⏳ | ⏳ | ⏳ |
| Vue ElementPlus | ⏳ | ⏳ | ⏳ |
| React Antd | ⏳ | ⏳ | ⏳ |

### 场景 64-65：插件新增 — NEW

| 场景 | Vue AntdVue | Vue ElementPlus | React Antd |
|------|:-----------:|:-----------:|:----------:|
| 64 MaskingPluginForm | ⏳ | ⏳ | ⏳ |
| 65 SubmitRetryPluginForm | ⏳ | ⏳ | ⏳ |

---

## 测试总量统计

| 平台 | 场景数 | 三态 | 测试项总计 |
|------|--------|------|-----------|
| Vue AntdVue | 65 | 3 | 195 |
| Vue ElementPlus | 65 | 3 | 195 |
| React Antd | 65 | 3 | 195 |
| **合计** | | | **585** |
