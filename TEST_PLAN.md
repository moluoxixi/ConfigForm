# Playground 测试计划

## 测试矩阵

| 维度 | 值 |
|------|------|
| 场景数 | React 48 / Vue 56（含 8 个 Vue 独有场景） |
| 模式 | Config（ConfigForm + Schema）/ Field（FormProvider + FormField + fieldProps） |
| 三态 | 编辑态 / 阅读态 / 禁用态 |
| 框架 | React 18 / Vue 3 |
| UI 库 | Ant Design（React）/ Ant Design Vue / Element Plus |

### 开发服务器

- Vue: http://localhost:3001 (playground-vue)
- React: http://localhost:3002 (playground-react)

### 文件完成度

| 平台 | Config | Field | 合计 |
|------|--------|-------|------|
| React Antd | 48/48 ✅ | 48/48 ✅ | 96 个文件 |
| Vue AntdVue | 56/56 ✅ | 56/56 ✅ | 112 个文件 |
| Vue ElementPlus | 48/48 🔧 | 48/48 🔧 | 96 个文件（部分需修复）|

### 已发现问题

| 编号 | UI 库 | 问题描述 | 状态 |
|------|-------|----------|------|
| 001 | element-plus | 缺少 StatusTabs 组件 | ✅ 已修复 |
| 002 | element-plus | 使用 FormSchema 而非 ISchema | 🔧 修复中 |
| 003 | element-plus | 直接使用 el-input/el-select 而非 FormField | 🔧 修复中 |
| 004 | element-plus | 使用 el-radio-group 切换模式而非 StatusTabs | 🔧 修复中 |
| 005 | antd-vue | 部分 config.vue 手动判断 mode === 'readOnly'/'disabled' | 🔧 修复中 |

### 修复记录

| 日期 | 修复内容 |
|------|----------|
| 2026-02-08 | 创建 element-plus StatusTabs 组件 |
| 2026-02-08 | 修复 element-plus/BasicForm (config + field) |
| 2026-02-08 | 修复 element-plus/ArrayFieldForm (config + field) - 改为 ConfigForm + ISchema |
| 2026-02-08 | 修复 element-plus/BasicValidationForm (config + field) |
| 2026-02-08 | 修复 element-plus/LayoutForm (config + field) |
| 2026-02-08 | 修复 element-plus/CardGroupForm (config + field) |
| 2026-02-08 | 修复 element-plus/StepForm (config + field) - config 改为 ConfigForm + ISchema |
| 2026-02-08 | 修复 element-plus/EditableTableForm (config + field) - config 改为 ConfigForm + ISchema |
| 2026-02-08 | 修复 element-plus/DynamicFieldForm (config + field) - config 改为动态 Schema 切换 |
| 2026-02-08 | 修复 element-plus/PaginatedSearchForm config - 改为 ConfigForm + ISchema |
| 2026-02-08 | 修复 element-plus/ObjectArrayNestedForm (config + field) - config 改为 ConfigForm + ISchema |
| 2026-02-08 | 创建 element-plus/ValueLinkageForm field |
| 2026-02-08 | 创建 element-plus/VisibilityLinkageForm field |
| 2026-02-08 | 创建 element-plus/TabGroupForm field |
| 2026-02-08 | 创建 element-plus/CollapseGroupForm field |
| 2026-02-08 | 修复 antd-vue/ArrayFieldForm config - 改为 ConfigForm + ISchema |
| 2026-02-08 | 修复 antd-vue/EditableTableForm config - 改为 ConfigForm + ISchema |
| 2026-02-08 | 修复 antd-vue/DynamicFieldForm config - 改为动态 Schema 切换 |
| 2026-02-08 | 修复 antd-vue/ObjectArrayNestedForm config - 改为 ConfigForm + ISchema |
| 2026-02-08 | 修复 antd-vue/PaginatedSearchForm config - 改为 ConfigForm + ISchema |

### 测试标准

每个场景需测试 **Config** 和 **Field** 两种模式，每种模式测试 **编辑态 / 阅读态 / 禁用态** 三态，共 6 项。

#### 编辑态验证项（最详细）

1. 组件正确渲染：标题、描述、StatusTabs Segmented、FormItem 标签、必填 * 标记
2. 交互测试：在必填字段输入有效值 → 点击"提交" → 验证绿色 Alert 显示正确 JSON
3. 重置测试：点击"重置" → 验证所有字段恢复初始值
4. 校验测试：不填必填字段提交 → 验证红色错误提示；输入格式错误值 → 验证字段级错误
5. 截图保存：`.playwright-mcp/s{编号}-{场景}-{模式}-editable.png`

#### 阅读态验证项

1. 所有字段变为纯文本（无输入框/选择器），有值显示值，无值显示"—"
2. 提交/重置按钮完全隐藏
3. Snapshot 中不应有可交互表单元素
4. 截图保存：`*-readonly.png`

#### 禁用态验证项

1. 所有字段保持输入框形态但灰色不可交互，Snapshot 中所有元素含 `states: [disabled]`
2. 提交/重置按钮完全隐藏
3. 尝试点击输入框/Switch 确认无法操作
4. 截图保存：`*-disabled.png`

#### 问题处理

发现问题 → 截图保存（`-BUG` 后缀）→ 立即修复 → 刷新重验 → 通过后继续

### 实现规范

| 文件类型 | 组件 | 规则 |
|----------|------|------|
| config | StatusTabs + ConfigForm | 纯 schema 声明，withMode 注入模式，actions 配置提交/重置 |
| field | StatusTabs + FormProvider + FormField | fieldProps 声明式，LayoutFormActions 提交/重置，registerComponent 注册自定义组件 |

**field 文件禁止**：手动 FormItem、手动 mode === 'readOnly'/'disabled' 判断（框架 ReactiveField 自动处理）

---

## 场景总览

### 基础场景（1-4）

| # | 场景 | 文件夹 | 覆盖能力 |
|---|------|--------|----------|
| 1 | 基础表单 | BasicForm | Input/Password/Textarea/InputNumber/Select/RadioGroup/CheckboxGroup/Switch/DatePicker |
| 2 | 表单布局 | LayoutForm | labelPosition/labelWidth、4 种布局切换 |
| 3 | 必填与格式验证 | BasicValidationForm | required/email/phone/URL/minLength/maxLength/pattern |
| 4 | 默认值 | DefaultValueForm | 静态默认值、动态计算联动、重置恢复 |

### 联动场景（5-10）

| # | 场景 | 文件夹 | 覆盖能力 |
|---|------|--------|----------|
| 5 | 显隐联动 | VisibilityLinkageForm | 个人/企业切换、嵌套显隐、excludeWhenHidden |
| 6 | 值联动 | ValueLinkageForm | 姓名拼接、大写转换、国家→区号映射、省市区聚合 |
| 7 | 属性联动 | PropertyLinkageForm | 开关控制 disabled、类型切换 placeholder/required/componentProps |
| 8 | 级联选择 | CascadeSelectForm | 省→市→区三级联动、选择后下级清空重载 |
| 9 | 计算字段 | ComputedFieldForm | 乘法/折扣/聚合/条件计税自动计算 |
| 10 | 条件必填 | ConditionalRequiredForm | 开关→字段必填、金额阈值→审批人必填 |

### 验证场景（11-13）

| # | 场景 | 文件夹 | 覆盖能力 |
|---|------|--------|----------|
| 11 | 自定义验证 | CustomValidationForm | 车牌正则、手机号函数、密码多规则、IP 地址、warning 级别 |
| 12 | 异步验证 | AsyncValidationForm | 用户名唯一性、邮箱可用性、防抖 + AbortSignal |
| 13 | 跨字段验证 | CrossFieldValidationForm | 密码一致、比例总和 100%、超预算 |

### 复杂数据（14-17）

| # | 场景 | 文件夹 | 覆盖能力 |
|---|------|--------|----------|
| 14 | 嵌套对象 | NestedObjectForm | void Card 分组、多层嵌套路径、提交扁平数据 |
| 15 | 数组字段 | ArrayFieldForm | FormArrayField 增删排序复制、子字段校验 |
| 16 | 可编辑表格 | EditableTableForm | Table 行内编辑、计算联动、添加删除行 |
| 17 | 对象数组嵌套 | ObjectArrayNestedForm | 联系人 + 嵌套电话数组（两层 FormArrayField） |

### 数据源（18-20）

| # | 场景 | 文件夹 | 覆盖能力 |
|---|------|--------|----------|
| 18 | 异步选项 | AsyncOptionsForm | field.loadDataSource + requestAdapter mock |
| 19 | 依赖数据源 | DependentDataSourceForm | 品牌→型号→配置三级远程链 + API 日志 |
| 20 | 分页搜索 | PaginatedSearchForm | 搜索过滤 + 分页加载 + 防抖 |

### 布局分组（21-24）

| # | 场景 | 文件夹 | 覆盖能力 |
|---|------|--------|----------|
| 21 | 分步表单 | StepForm | Steps 导航 + 步骤验证拦截 + 预览 + 提交重置 |
| 22 | 标签页分组 | TabGroupForm | Tab 切换保留数据 + 跨 Tab 提交 |
| 23 | 折叠面板 | CollapseGroupForm | 展开折叠 + 跨面板提交 |
| 24 | 卡片分组 | CardGroupForm | 多卡片填写 + 卡片内验证 + 提交重置 |

### 动态表单（25-27）

| # | 场景 | 文件夹 | 覆盖能力 |
|---|------|--------|----------|
| 25 | 动态增删字段 | DynamicFieldForm | 运行时 createField/removeField、动态字段参与提交 |
| 26 | 动态 Schema | DynamicSchemaForm | 切换个人/企业/学生→字段集变化 |
| 27 | 模板复用 | TemplateReuseForm | 切换员工/客户/供应商→公共 + 扩展字段组合 |

### 自定义组件（28-39）

| # | 场景 | 文件夹 | 覆盖能力 |
|---|------|--------|----------|
| 28 | 富文本编辑器 | RichTextForm | ReactQuill / Textarea 降级、HTML 预览 |
| 29 | 文件上传 | FileUploadForm | antd Upload / picture-card Upload |
| 30 | 地图选点 | MapPickerForm | 模拟地图 + 经纬度/地址同步 |
| 31 | 颜色选择器 | ColorPickerForm | 原生 color input + HEX 输入 + 预设色板 + 主题预览 |
| 32 | 代码编辑器 | CodeEditorForm | Textarea 模拟 / 语言切换 / 代码高亮预览 |
| 33 | JSON 编辑器 | JsonEditorForm | JSON 格式化 / 压缩 / 语法检测 |
| 34 | 手写签名 | SignaturePadForm | Canvas 绘制 / 清空 / base64 数据同步 |
| 35 | 穿梭框 | TransferForm | antd Transfer / 搜索过滤 / Tag 展示 |
| 36 | 树形选择 | TreeSelectForm | antd TreeSelect 单选/多选 / Tag 展示 |
| 37 | Markdown 编辑器 | MarkdownEditorForm | 分栏编辑 + 实时预览 |
| 38 | 图标选择器 | IconSelectorForm | 搜索过滤 + 图标网格 + 点击选中 |
| 39 | Cron 编辑器 | CronEditorForm | Cron 输入 + 快捷预设 + 实时解析描述 |

### 表单状态（40-44）

| # | 场景 | 文件夹 | 覆盖能力 |
|---|------|--------|----------|
| 40 | 数据转换 | DataTransformForm | format/parse/transform、原始值 vs 转换值 |
| 41 | 多表单协作 | MultiFormForm | 主表单 + 子表单 + 弹窗表单 + 联合提交 |
| 42 | 表单快照 | FormSnapshotForm | 暂存/恢复/删除草稿 |
| 43 | 撤销重做 | UndoRedoForm | Ctrl+Z 撤销 / Ctrl+Shift+Z 重做 / 历史栈 |
| 44 | 生命周期 | LifecycleForm | onValuesChange / onFieldValueChange / 自动保存 / 事件日志 |

### 其他能力（45-48）

| # | 场景 | 文件夹 | 覆盖能力 |
|---|------|--------|----------|
| 45 | 字段权限 | PermissionForm | 角色切换→字段可见性 + 读写权限 |
| 46 | 国际化 | I18nForm | 中/英/日切换→标签/placeholder/验证消息 |
| 47 | 表单比对 | FormDiffForm | 修改→变更高亮 + 原始值提示 + 变更摘要 |
| 48 | 打印导出 | PrintExportForm | 打印 + 导出 JSON + 导出 CSV |

### Vue 独有扩展场景（49-56）

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

## 详细测试项 - Vue Ant Design Vue

> 每个场景 6 项：Config 编辑/阅读/禁用 + Field 编辑/阅读/禁用
> 截图命名：`s{编号}-{场景名}-{config|field}-{editable|readonly|disabled}.png`
> 缺陷截图：末尾加 `-BUG`

#### 基础场景（1-4）

- [x] 1.基础表单-Config-编辑态 ✅
- [x] 1.基础表单-Config-阅读态 ✅
- [x] 1.基础表单-Config-禁用态 ✅
- [x] 1.基础表单-Field-编辑态 ✅（修复编码乱码后通过）
- [x] 1.基础表单-Field-阅读态 ✅
- [x] 1.基础表单-Field-禁用态 ✅
- [ ] 2.表单布局-Config-编辑态
- [ ] 2.表单布局-Config-阅读态
- [ ] 2.表单布局-Config-禁用态
- [ ] 2.表单布局-Field-编辑态
- [ ] 2.表单布局-Field-阅读态
- [ ] 2.表单布局-Field-禁用态
- [ ] 3.必填与格式验证-Config-编辑态
- [ ] 3.必填与格式验证-Config-阅读态
- [ ] 3.必填与格式验证-Config-禁用态
- [ ] 3.必填与格式验证-Field-编辑态
- [ ] 3.必填与格式验证-Field-阅读态
- [ ] 3.必填与格式验证-Field-禁用态
- [ ] 4.默认值-Config-编辑态
- [ ] 4.默认值-Config-阅读态
- [ ] 4.默认值-Config-禁用态
- [ ] 4.默认值-Field-编辑态
- [ ] 4.默认值-Field-阅读态
- [ ] 4.默认值-Field-禁用态

#### 联动场景（5-10）

- [ ] 5.显隐联动-Config-编辑态/阅读态/禁用态
- [ ] 5.显隐联动-Field-编辑态/阅读态/禁用态
- [ ] 6.值联动-Config-编辑态/阅读态/禁用态
- [ ] 6.值联动-Field-编辑态/阅读态/禁用态
- [ ] 7.属性联动-Config-编辑态/阅读态/禁用态
- [ ] 7.属性联动-Field-编辑态/阅读态/禁用态
- [ ] 8.级联选择-Config-编辑态/阅读态/禁用态
- [ ] 8.级联选择-Field-编辑态/阅读态/禁用态
- [ ] 9.计算字段-Config-编辑态/阅读态/禁用态
- [ ] 9.计算字段-Field-编辑态/阅读态/禁用态
- [ ] 10.条件必填-Config-编辑态/阅读态/禁用态
- [ ] 10.条件必填-Field-编辑态/阅读态/禁用态

#### 验证场景（11-13）

- [ ] 11.自定义验证-Config-编辑态/阅读态/禁用态
- [ ] 11.自定义验证-Field-编辑态/阅读态/禁用态
- [ ] 12.异步验证-Config-编辑态/阅读态/禁用态
- [ ] 12.异步验证-Field-编辑态/阅读态/禁用态
- [ ] 13.跨字段验证-Config-编辑态/阅读态/禁用态
- [ ] 13.跨字段验证-Field-编辑态/阅读态/禁用态

#### 复杂数据（14-17）

- [ ] 14.嵌套对象-Config-编辑态/阅读态/禁用态
- [ ] 14.嵌套对象-Field-编辑态/阅读态/禁用态
- [ ] 15.数组字段-Config-编辑态/阅读态/禁用态
- [ ] 15.数组字段-Field-编辑态/阅读态/禁用态
- [ ] 16.可编辑表格-Config-编辑态/阅读态/禁用态
- [ ] 16.可编辑表格-Field-编辑态/阅读态/禁用态
- [ ] 17.对象数组嵌套-Config-编辑态/阅读态/禁用态
- [ ] 17.对象数组嵌套-Field-编辑态/阅读态/禁用态

#### 数据源（18-20）

- [ ] 18.异步选项-Config-编辑态/阅读态/禁用态
- [ ] 18.异步选项-Field-编辑态/阅读态/禁用态
- [ ] 19.依赖数据源-Config-编辑态/阅读态/禁用态
- [ ] 19.依赖数据源-Field-编辑态/阅读态/禁用态
- [ ] 20.分页搜索-Config-编辑态/阅读态/禁用态
- [ ] 20.分页搜索-Field-编辑态/阅读态/禁用态

#### 布局分组（21-24）

- [ ] 21.分步表单-Config-编辑态/阅读态/禁用态
- [ ] 21.分步表单-Field-编辑态/阅读态/禁用态
- [ ] 22.标签页分组-Config-编辑态/阅读态/禁用态
- [ ] 22.标签页分组-Field-编辑态/阅读态/禁用态
- [ ] 23.折叠面板-Config-编辑态/阅读态/禁用态
- [ ] 23.折叠面板-Field-编辑态/阅读态/禁用态
- [ ] 24.卡片分组-Config-编辑态/阅读态/禁用态
- [ ] 24.卡片分组-Field-编辑态/阅读态/禁用态

#### 动态表单（25-27）

- [ ] 25.动态增删字段-Config-编辑态/阅读态/禁用态
- [ ] 25.动态增删字段-Field-编辑态/阅读态/禁用态
- [ ] 26.动态 Schema-Config-编辑态/阅读态/禁用态
- [ ] 26.动态 Schema-Field-编辑态/阅读态/禁用态
- [ ] 27.模板复用-Config-编辑态/阅读态/禁用态
- [ ] 27.模板复用-Field-编辑态/阅读态/禁用态

#### 自定义组件（28-39）

- [ ] 28.富文本编辑器-Config-编辑态/阅读态/禁用态
- [ ] 28.富文本编辑器-Field-编辑态/阅读态/禁用态
- [ ] 29.文件上传-Config-编辑态/阅读态/禁用态
- [ ] 29.文件上传-Field-编辑态/阅读态/禁用态
- [ ] 30.地图选点-Config-编辑态/阅读态/禁用态
- [ ] 30.地图选点-Field-编辑态/阅读态/禁用态
- [ ] 31.颜色选择器-Config-编辑态/阅读态/禁用态
- [ ] 31.颜色选择器-Field-编辑态/阅读态/禁用态
- [ ] 32.代码编辑器-Config-编辑态/阅读态/禁用态
- [ ] 32.代码编辑器-Field-编辑态/阅读态/禁用态
- [ ] 33.JSON 编辑器-Config-编辑态/阅读态/禁用态
- [ ] 33.JSON 编辑器-Field-编辑态/阅读态/禁用态
- [ ] 34.手写签名-Config-编辑态/阅读态/禁用态
- [ ] 34.手写签名-Field-编辑态/阅读态/禁用态
- [ ] 35.穿梭框-Config-编辑态/阅读态/禁用态
- [ ] 35.穿梭框-Field-编辑态/阅读态/禁用态
- [ ] 36.树形选择-Config-编辑态/阅读态/禁用态
- [ ] 36.树形选择-Field-编辑态/阅读态/禁用态
- [ ] 37.Markdown-Config-编辑态/阅读态/禁用态
- [ ] 37.Markdown-Field-编辑态/阅读态/禁用态
- [ ] 38.图标选择器-Config-编辑态/阅读态/禁用态
- [ ] 38.图标选择器-Field-编辑态/阅读态/禁用态
- [ ] 39.Cron 编辑器-Config-编辑态/阅读态/禁用态
- [ ] 39.Cron 编辑器-Field-编辑态/阅读态/禁用态

#### 表单状态（40-44）

- [ ] 40.数据转换-Config-编辑态/阅读态/禁用态
- [ ] 40.数据转换-Field-编辑态/阅读态/禁用态
- [ ] 41.多表单协作-Config-编辑态/阅读态/禁用态
- [ ] 41.多表单协作-Field-编辑态/阅读态/禁用态
- [ ] 42.表单快照-Config-编辑态/阅读态/禁用态
- [ ] 42.表单快照-Field-编辑态/阅读态/禁用态
- [ ] 43.撤销重做-Config-编辑态/阅读态/禁用态
- [ ] 43.撤销重做-Field-编辑态/阅读态/禁用态
- [ ] 44.生命周期-Config-编辑态/阅读态/禁用态
- [ ] 44.生命周期-Field-编辑态/阅读态/禁用态

#### 其他能力（45-48）

- [ ] 45.字段权限-Config-编辑态/阅读态/禁用态
- [ ] 45.字段权限-Field-编辑态/阅读态/禁用态
- [ ] 46.国际化-Config-编辑态/阅读态/禁用态
- [ ] 46.国际化-Field-编辑态/阅读态/禁用态
- [ ] 47.表单比对-Config-编辑态/阅读态/禁用态
- [ ] 47.表单比对-Field-编辑态/阅读态/禁用态
- [ ] 48.打印导出-Config-编辑态/阅读态/禁用态
- [ ] 48.打印导出-Field-编辑态/阅读态/禁用态

#### Vue 独有扩展（49-56）

- [ ] 49.Grid 栅格布局-Config-编辑态/阅读态/禁用态
- [ ] 49.Grid 栅格布局-Field-编辑态/阅读态/禁用态
- [ ] 50.Effects 副作用-Config-编辑态/阅读态/禁用态
- [ ] 50.Effects 副作用-Field-编辑态/阅读态/禁用态
- [ ] 51.大表单性能-Config-编辑态/阅读态/禁用态
- [ ] 51.大表单性能-Field-编辑态/阅读态/禁用态
- [ ] 52.自定义装饰器-Config-编辑态/阅读态/禁用态
- [ ] 52.自定义装饰器-Field-编辑态/阅读态/禁用态
- [ ] 53.Schema 表达式-Config-编辑态/阅读态/禁用态
- [ ] 53.Schema 表达式-Field-编辑态/阅读态/禁用态
- [ ] 54.oneOf 联合 Schema-Config-编辑态/阅读态/禁用态
- [ ] 54.oneOf 联合 Schema-Field-编辑态/阅读态/禁用态
- [ ] 55.SSR 兼容性-Config-编辑态/阅读态/禁用态
- [ ] 55.SSR 兼容性-Field-编辑态/阅读态/禁用态
- [ ] 56.虚拟滚动-Config-编辑态/阅读态/禁用态
- [ ] 56.虚拟滚动-Field-编辑态/阅读态/禁用态

---

## 其他平台测试项

### Vue - Element Plus

（48 个场景 × Config/Field × 3 态 = 288 项）

- [ ] 1.基础表单 ~ 48.打印导出（Config + Field × 3 态）

**额外关注点**：readonly 纯文本渲染、FormItem labelPosition/labelWidth、Select multiple

### React - Ant Design

（48 个场景 × Config/Field × 3 态 = 288 项）

- [ ] 1.基础表单 ~ 48.打印导出（Config + Field × 3 态）

**额外关注点**：observer() MobX 响应式、form.pattern = mode render prop 同步、LayoutFormActions htmlType="submit"

---

## 场景覆盖率分析

### 已覆盖的核心能力

| 能力 | 对应场景 | 覆盖度 |
|------|---------|--------|
| 基础字段类型（Input/Select/Switch/DatePicker 等） | 1 | 完整 |
| 表单布局（labelPosition/labelWidth） | 2 | 完整 |
| 验证（必填/格式/自定义/异步/跨字段） | 3,11,12,13 | 完整 |
| 默认值与重置 | 4 | 完整 |
| 联动（显隐/值/属性/级联/计算/条件必填） | 5-10 | 完整 |
| 嵌套对象（void 分组 + 数据路径分离） | 14 | 完整 |
| 数组字段（增删排序/可编辑表格/嵌套数组） | 15-17 | 完整 |
| 异步数据源（远程加载/依赖链/分页搜索） | 18-20 | 完整 |
| 布局容器（Steps/Tabs/Collapse/Card） | 21-24 | 完整 |
| 动态表单（动态增删字段/动态 Schema/模板复用） | 25-27 | 完整 |
| 自定义组件集成 | 28-39 | 完整 |
| 数据转换（format/parse/transform） | 40 | 完整 |
| 多表单协作 | 41 | 完整 |
| 表单快照/撤销重做 | 42-43 | 完整 |
| 生命周期事件 | 44 | 完整 |
| 字段权限控制 | 45 | 完整 |
| 国际化 | 46 | 完整 |
| 表单比对 | 47 | 完整 |
| 打印导出 | 48 | 完整 |
| Grid 栅格布局 | 49 | Vue 独有 |
| Effects 链式副作用 | 50 | Vue 独有 |
| 大表单性能 | 51 | Vue 独有 |
| 自定义装饰器 | 52 | Vue 独有 |
| Schema 表达式 | 53 | Vue 独有 |
| oneOf 联合 Schema | 54 | Vue 独有 |
| SSR 兼容性 | 55 | Vue 独有 |
| 虚拟滚动 | 56 | Vue 独有 |

### 测试总量统计

| 平台 | 场景数 | 模式 | 三态 | 测试项总计 |
|------|--------|------|------|-----------|
| Vue AntdVue | 56 | 2（Config/Field） | 3 | 336 |
| Vue ElementPlus | 48 | 2 | 3 | 288 |
| React Antd | 48 | 2 | 3 | 288 |
| **合计** | | | | **912** |
