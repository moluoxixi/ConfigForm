# Playground 测试计划

## 测试矩阵

| 维度 | 值 |
|------|------|
| 场景数 | 56（3 个 UI 库完全一致） |
| 模式 | Config（ConfigForm + ISchema）/ Field（FormProvider + FormField） |
| 三态 | 编辑态 / 阅读态 / 禁用态 |
| 框架 | React 18 / Vue 3 |
| UI 库 | Ant Design（React）/ Ant Design Vue / Element Plus |

### 开发服务器

- Vue: http://localhost:3001 (playground-vue)
- React: http://localhost:3002 (playground-react)

### 目录结构

示例按场景分组，两层目录结构：

```
{ui-lib}/
  01-basic/BasicForm/{config,field}.vue
  02-linkage/VisibilityLinkageForm/{config,field}.vue
  ...
  11-advanced/VirtualScrollForm/{config,field}.vue
```

App 使用 `import.meta.glob` 自动扫描，新增示例只需创建文件夹。

### 文件完成度

| 平台 | Config | Field | 合计 |
|------|--------|-------|------|
| React Antd | 56/56 | 56/56 | 112 |
| Vue AntdVue | 56/56 | 56/56 | 112 |
| Vue ElementPlus | 56/56 | 56/56 | 112 |

### 实现规范

| 文件类型 | 组件 | 规则 |
|----------|------|------|
| config | StatusTabs + ConfigForm | 纯 ISchema 声明（`type: 'object', properties: {}`），withMode 注入模式，`decoratorProps.actions` 配置提交/重置 |
| field | StatusTabs + FormProvider + FormField | 所有表单输入用 FormField + component，布局用 FormVoidField + LayoutCard/LayoutTabs 等，数组用 FormArrayField + ArrayBase，提交/重置用 LayoutFormActions（自动调用 form.submit()） |

**field 文件禁止**：
- `<form>` 标签（LayoutFormActions 自动处理提交）
- `<button>`/`<input>`/`<select>`/`<textarea>` 原生标签
- 直接 import UI 库组件（antd/element-plus/ant-design-vue）
- 手动 `mode === 'editable'`/`readOnly`/`disabled` 判断
- 手动 handleSubmit 函数

### 测试标准

每个场景需测试 **Config** 和 **Field** 两种模式，每种模式测试 **编辑态 / 阅读态 / 禁用态** 三态，共 6 项。

#### 编辑态验证项（6项）

1. **UI 截图检查**：截取完整页面，逐像素确认 UI 组件库样式（输入框边框、按钮颜色、图标尺寸、布局对齐）正确
2. **组件渲染检查**：标题、描述、StatusTabs、FormItem 标签、必填 `*` 标记、所有字段类型正确
3. **交互+提交**：逐一填写所有字段 → 点击"提交" → 验证结果表格/JSON 所有值正确
4. **重置验证**：点击"重置" → 验证所有字段恢复初始值（包含默认值字段）
5. **校验验证**：清空必填字段 → 提交 → 验证每个必填字段显示红色错误提示 + 底部汇总
6. **控制台检查**：无 error 级别日志

#### 阅读态验证项（4项）

1. **UI 截图检查**：截取完整页面，确认无残留输入框/选择器
2. 所有字段变为纯文本：有值显示值，无值显示"—"
3. 提交/重置按钮完全隐藏
4. accessibility 快照中不应有 textbox/combobox/checkbox/radio 等可交互元素

#### 禁用态验证项（4项）

1. **UI 截图检查**：截取完整页面，确认字段显示为灰色输入框
2. 所有字段保持输入框形态但灰色不可交互（快照含 `[disabled]`）
3. 提交/重置按钮完全隐藏
4. 尝试点击 Switch/输入框 → 确认 Playwright 报 disabled 超时

#### 问题处理

发现问题 → 截图记录 → 在 TEST_PLAN.md 问题表中登记 → 立即修复 → 刷新截图重验 → 通过后继续

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

| # | 问题 | 影响平台 | 状态 | 修复文件 |
|---|------|----------|------|----------|
| G1 | `@moluoxixi/vue` 未导出 `ArrayItems` 等组件，导致 `setupAntdVue()` 失败 | Vue 全部 | ✅ 已修复 | `packages/vue/src/index.ts` |
| G2 | `ConfigForm` 的 `FormActionsRenderer` 未传递 `onSubmit`/`onSubmitFailed` 给 `LayoutFormActions`，导致 Config 模式提交无反应 | Vue + React 全部 | ✅ 已修复 | `packages/vue/src/components/ConfigForm.ts`, `packages/react/src/components/ConfigForm.tsx` |
| G3 | `SchemaField` 对 `type:'array'` + 显式组件（如 CheckboxGroup/Transfer）错误使用 `FormArrayField` 渲染，导致选项不显示 | Vue + React 全部 | ✅ 已修复 | `packages/vue/src/components/SchemaField.ts`, `packages/react/src/components/SchemaField.tsx` |
| G4 | React playground `PaginatedSearchForm/config.tsx` JSX 语法错误 | React | ✅ 已修复 | `playground-react/src/antd/05-datasource/PaginatedSearchForm/config.tsx` |
| G5 | Element Plus 缺少 CSS 导入，导致图标（InputNumber箭头/Select下拉/DatePicker日历）尺寸失控 | Vue EP 全部 | ✅ 已修复 | `packages/ui-element-plus/src/index.ts` 顶部添加 `import 'element-plus/dist/index.css'` |
| G6 | React BasicForm config.tsx 缺少 `decoratorProps.actions` 配置，导致无提交/重置按钮 | React | ✅ 已修复 | `playground-react/src/antd/01-basic/BasicForm/config.tsx` |
| G7 | `LayoutFormActions` 在 Field 模式的 readOnly/disabled 下未自动隐藏提交/重置按钮 | 全部 | ✅ 已修复 | `packages/ui-antd-vue/src/components/LayoutFormActions.ts`, `packages/ui-element-plus/src/components/LayoutFormActions.ts`, `packages/ui-antd/src/components/LayoutFormActions.tsx` |
| G8 | React `ConfigForm` 缺少 schema 变化时同步 `form.pattern` 的 useEffect，导致三态切换不生效 | React | ✅ 已修复 | `packages/react/src/components/ConfigForm.tsx` 添加 useEffect 同步 pattern/labelPosition/labelWidth |
| G9 | antd-vue 垂直布局（`labelCol.span=24`）冒号消失，因 antd CSS 伪元素自动隐藏。改为手动追加冒号到 label 文本，禁用 antd 内置 colon | Vue AntdVue | ✅ 已修复 | `packages/ui-antd-vue/src/components/FormItem.ts` 设 `colon: false`，label 追加 ` :` |
| G10 | 阅读态/禁用态仍显示必填 `*` 标记。参考 Formily `takeAsterisk`，pattern 非 editable 时隐藏 | 全部 | ✅ 已修复 | FormItem（3个UI库）添加 `pattern` prop + ReactiveField（Vue+React）传递 `pattern` |
| G11 | React ReactiveField `{...componentProps}` 在 value/onChange 之后展开可能覆盖核心绑定 | React | ✅ 已修复 | `packages/react/src/components/ReactiveField.tsx` 调整 props 顺序 |

### 场景级问题

| # | 场景 | 平台 | 问题 | 状态 | 修复文件 |
|---|------|------|------|------|----------|
| S1 | BasicForm | React Antd | Playwright fill/pressSequentially/dispatchEvent 均无法触发 React+MobX 受控组件的 onChange→setValue 链路，DOM 值正确但 MobX model 值未更新，导致提交结果全空。需深入排查 ReactiveField 的值绑定机制。Checkbox 点击、Radio 点击、Switch 切换也有同样问题。 | 🔧 调查中 | `packages/react/src/components/ReactiveField.tsx` |

---

## 详细测试结果

> 每个场景 18 项：3 平台 × 2 模式 × 3 态
> ✅ 通过 | ❌ 失败 | ⏳ 待测 | 🔧 修复中 | ⚠️ 有问题但不阻塞

### 场景 1：基础表单（BasicForm）

覆盖：Input / Password / Textarea / InputNumber / Select / RadioGroup / CheckboxGroup / Switch / DatePicker

| 平台 | Config 编辑 | Config 阅读 | Config 禁用 | Field 编辑 | Field 阅读 | Field 禁用 |
|------|:-----------:|:-----------:|:-----------:|:----------:|:----------:|:----------:|
| Vue AntdVue | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Vue ElementPlus | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| React Antd | ⚠️ | ✅ | ✅ | ⏳ | ⏳ | ⏳ |

**验证详情：**
- Vue AntdVue Config 编辑态：UI 截图正常，11个字段+必填标记+提交重置按钮 ✅ | 填写全部字段提交结果正确 ✅ | 重置恢复初始值 ✅ | 空提交3个必填校验错误 ✅
- Vue AntdVue Config 阅读态：UI 截图确认纯文本+按钮隐藏 ✅ | ⚠️ 必填`*`标记仍显示（小问题不阻塞）
- Vue AntdVue Config 禁用态：UI 截图灰色输入框 ✅ | 所有字段 disabled ✅ | Switch 点击超时确认不可操作 ✅ | 按钮隐藏 ✅
- Vue AntdVue Field 编辑态：UI 截图正常+placeholder 显示 ✅ | 填写提交结果正确 ✅ | 重置成功 ✅
- Vue AntdVue Field 阅读态：按钮隐藏修复后通过 ✅（修复 G7）
- Vue ElementPlus Config 编辑态：CSS 导入修复后 UI 正常 ✅（修复 G5）| 提交/重置/校验全通过 ✅
- Vue ElementPlus Config 阅读态：快照确认纯文本+按钮隐藏 ✅
- Vue ElementPlus Config 禁用态：快照确认全部 disabled+按钮隐藏 ✅
- Vue AntdVue Field 禁用态：UI 截图灰色+按钮隐藏（G7修复）✅
- Vue ElementPlus Field 编辑态：UI 截图完美+Element Plus 样式正确（G5修复）✅ | 提交结果正确 ✅
- Vue ElementPlus Field 阅读态：UI 截图纯文本+密码遮蔽+按钮隐藏 ✅
- Vue ElementPlus Field 禁用态：UI 截图灰色 disabled+按钮隐藏 ✅
- React Antd Config 编辑态：UI 截图正常，11个字段+必填标记+按钮 ✅ | ⚠️ Playwright 输入未触发 MobX 更新（S1 问题，待修复）
- React Antd Config 阅读态：UI 截图纯文本+按钮隐藏 ✅（修复 G8 后通过）
- React Antd Config 禁用态：UI 截图灰色 disabled+按钮隐藏 ✅

### 场景 2：表单布局（LayoutForm）

覆盖：labelPosition / labelWidth、4 种布局切换（水平/垂直/行内/栅格两列）

| 平台 | Config 编辑 | Config 阅读 | Config 禁用 | Field 编辑 | Field 阅读 | Field 禁用 |
|------|:-----------:|:-----------:|:-----------:|:----------:|:----------:|:----------:|
| Vue AntdVue | ✅ | ✅ | ✅ | ⏳ | ⏳ | ⏳ |
| Vue ElementPlus | ✅ | ✅ | ✅ | ⏳ | ⏳ | ⏳ |
| React Antd | ⚠️ | ✅ | ✅ | ⏳ | ⏳ | ⏳ |

**验证详情：**
- Vue AntdVue Config：4 种布局 UI 截图全部正确（水平/垂直/行内/栅格两列）✅ | 填写提交正确 ✅ | 阅读态纯文本+按钮隐藏 ✅ | 禁用态全部 disabled ✅
- Vue ElementPlus Config：水平+栅格两列 UI 截图正确（标签右对齐+冒号）✅ | 阅读态+禁用态正确 ✅
- React Antd Config：UI 正确但缺少提交按钮（decoratorProps.actions 缺失）⚠️ | 阅读态+禁用态三态切换正常（G8 修复生效）✅

### 场景 3：必填与格式验证（BasicValidationForm）

覆盖：required / email / phone / URL / minLength / maxLength / pattern

| 平台 | Config 编辑 | Config 阅读 | Config 禁用 | Field 编辑 | Field 阅读 | Field 禁用 |
|------|:-----------:|:-----------:|:-----------:|:----------:|:----------:|:----------:|
| Vue AntdVue | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| Vue ElementPlus | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| React Antd | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |

### 场景 4：默认值（DefaultValueForm）

覆盖：静态默认值、动态计算联动、重置恢复

| 平台 | Config 编辑 | Config 阅读 | Config 禁用 | Field 编辑 | Field 阅读 | Field 禁用 |
|------|:-----------:|:-----------:|:-----------:|:----------:|:----------:|:----------:|
| Vue AntdVue | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| Vue ElementPlus | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| React Antd | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |

### 场景 5：显隐联动（VisibilityLinkageForm）

覆盖：个人/企业切换、嵌套显隐、excludeWhenHidden

| 平台 | Config 编辑 | Config 阅读 | Config 禁用 | Field 编辑 | Field 阅读 | Field 禁用 |
|------|:-----------:|:-----------:|:-----------:|:----------:|:----------:|:----------:|
| Vue AntdVue | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| Vue ElementPlus | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| React Antd | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |

### 场景 6~56：待展开

> 后续场景在测试到时逐个展开，避免文档过长。格式与上述一致。

---

## 测试总量统计

| 平台 | 场景数 | 模式 | 三态 | 测试项总计 |
|------|--------|------|------|-----------|
| Vue AntdVue | 56 | 2（Config/Field） | 3 | 336 |
| Vue ElementPlus | 56 | 2 | 3 | 336 |
| React Antd | 56 | 2 | 3 | 336 |
| **合计** | | | | **1008** |

## 测试进度

| 分组 | 场景数 | 已完成 | 通过 | 失败 | 进度 |
|------|--------|--------|------|------|------|
| 01-basic | 4 | 15/72 | 14 | 1⚠️ | 21% |
| 02-linkage | 6 | 0/108 | 0 | 0 | 0% |
| 03-validation | 3 | 0/54 | 0 | 0 | 0% |
| 04-complex-data | 4 | 0/72 | 0 | 0 | 0% |
| 05-datasource | 3 | 0/54 | 0 | 0 | 0% |
| 06-layout | 4 | 0/72 | 0 | 0 | 0% |
| 07-dynamic | 3 | 0/54 | 0 | 0 | 0% |
| 08-components | 12 | 0/216 | 0 | 0 | 0% |
| 09-state | 5 | 0/90 | 0 | 0 | 0% |
| 10-misc | 4 | 0/72 | 0 | 0 | 0% |
| 11-advanced | 8 | 0/144 | 0 | 0 | 0% |
| **合计** | **56** | **15/1008** | **14** | **1⚠️** | **1.5%** |
