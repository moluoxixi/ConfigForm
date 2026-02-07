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
| Vue ElementPlus | 48/48 ✅ | 48/48 ✅ | 96 个文件 |

### 测试标准

每个场景的 Config 和 Field 版本均须验证：
- **编辑态**：填写 + 校验 + 提交验证 JSON + 重置恢复
- **阅读态**：字段纯文本显示 + 操作按钮隐藏
- **禁用态**：字段 disabled + 操作按钮隐藏

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

## 详细测试项

### Vue - Ant Design Vue - Config 模式

#### 基础场景

- [x] 1.基础表单-编辑态: 填写全部字段类型、必填校验、提交验证 JSON、重置恢复 ✅
- [x] 1.基础表单-阅读态: 字段纯文本、按钮隐藏 ✅
- [x] 1.基础表单-禁用态: 字段 disabled、按钮隐藏 ✅
- [ ] 2.表单布局-编辑态+阅读态+禁用态
- [ ] 3.必填与格式验证-编辑态+阅读态+禁用态
- [ ] 4.默认值-编辑态+阅读态+禁用态

#### 联动场景

- [ ] 5.显隐联动-编辑态+阅读态+禁用态
- [ ] 6.值联动-编辑态+阅读态+禁用态
- [ ] 7.属性联动-编辑态+阅读态+禁用态
- [ ] 8.级联选择-编辑态+阅读态+禁用态
- [ ] 9.计算字段-编辑态+阅读态+禁用态
- [ ] 10.条件必填-编辑态+阅读态+禁用态

#### 验证场景

- [ ] 11.自定义验证-编辑态+阅读态+禁用态
- [ ] 12.异步验证-编辑态+阅读态+禁用态
- [ ] 13.跨字段验证-编辑态+阅读态+禁用态

#### 复杂数据

- [ ] 14.嵌套对象-编辑态+阅读态+禁用态
- [ ] 15.数组字段-编辑态+阅读态+禁用态
- [ ] 16.可编辑表格-编辑态+阅读态+禁用态
- [ ] 17.对象数组嵌套-编辑态+阅读态+禁用态

#### 数据源

- [ ] 18.异步选项-编辑态+阅读态+禁用态
- [ ] 19.依赖数据源-编辑态+阅读态+禁用态
- [ ] 20.分页搜索-编辑态+阅读态+禁用态

#### 布局分组

- [ ] 21.分步表单-编辑态+阅读态+禁用态
- [ ] 22.标签页分组-编辑态+阅读态+禁用态
- [ ] 23.折叠面板-编辑态+阅读态+禁用态
- [ ] 24.卡片分组-编辑态+阅读态+禁用态

#### 动态表单

- [ ] 25.动态增删字段-编辑态+阅读态+禁用态
- [ ] 26.动态 Schema-编辑态+阅读态+禁用态
- [ ] 27.模板复用-编辑态+阅读态+禁用态

#### 自定义组件

- [ ] 28.富文本编辑器-编辑态+阅读态+禁用态
- [ ] 29.文件上传-编辑态+阅读态+禁用态
- [ ] 30.地图选点-编辑态+阅读态+禁用态
- [ ] 31.颜色选择器-编辑态+阅读态+禁用态
- [ ] 32.代码编辑器-编辑态+阅读态+禁用态
- [ ] 33.JSON 编辑器-编辑态+阅读态+禁用态
- [ ] 34.手写签名-编辑态+阅读态+禁用态
- [ ] 35.穿梭框-编辑态+阅读态+禁用态
- [ ] 36.树形选择-编辑态+阅读态+禁用态
- [ ] 37.Markdown-编辑态+阅读态+禁用态
- [ ] 38.图标选择器-编辑态+阅读态+禁用态
- [ ] 39.Cron 编辑器-编辑态+阅读态+禁用态

#### 表单状态

- [ ] 40.数据转换-编辑态+阅读态+禁用态
- [ ] 41.多表单协作-编辑态+阅读态+禁用态
- [ ] 42.表单快照-编辑态+阅读态+禁用态
- [ ] 43.撤销重做-编辑态+阅读态+禁用态
- [ ] 44.生命周期-编辑态+阅读态+禁用态

#### 其他能力

- [ ] 45.字段权限-编辑态+阅读态+禁用态
- [ ] 46.国际化-编辑态+阅读态+禁用态
- [ ] 47.表单比对-编辑态+阅读态+禁用态
- [ ] 48.打印导出-编辑态+阅读态+禁用态

#### Vue 独有扩展

- [ ] 49.Grid 栅格布局-编辑态+阅读态+禁用态
- [ ] 50.Effects 链式副作用-编辑态+阅读态+禁用态
- [ ] 51.大表单性能-编辑态+阅读态+禁用态
- [ ] 52.自定义装饰器-编辑态+阅读态+禁用态
- [ ] 53.Schema 表达式-编辑态+阅读态+禁用态
- [ ] 54.oneOf 联合 Schema-编辑态+阅读态+禁用态
- [ ] 55.SSR 兼容性-编辑态+阅读态+禁用态
- [ ] 56.虚拟滚动-编辑态+阅读态+禁用态

---

### Vue - Ant Design Vue - Field 模式

（与 Config 模式相同的 56 个场景 × 3 态测试项，使用 FormProvider + FormField + fieldProps 实现）

- [x] 1.基础表单-编辑态+阅读态+禁用态 ✅
- [ ] 2.表单布局 ~ 56.虚拟滚动

**额外关注点**：
- fieldProps 声明式自动获取 wrapper（FormItem）和 mode 处理
- registerComponent 注册的自定义组件正确接收 value/onChange/disabled/readOnly
- LayoutFormActions 提交/重置按钮在 form 元素内正常工作

---

### Vue - Element Plus - Config 模式

（与 Vue-AntdVue-Config 相同的 48 个场景 × 3 态测试项，UI 组件替换为 Element Plus）

- [ ] 1.基础表单 ~ 48.打印导出

**额外关注点**：
- readonly 渲染为纯文本
- LayoutTabs/LayoutCollapse/LayoutSteps/LayoutStepActions 布局正常
- FormItem labelPosition/labelWidth 生效
- Select 使用 multiple 而非 mode

---

### Vue - Element Plus - Field 模式

（与 Vue-AntdVue-Field 相同的 48 个场景 × 3 态测试项）

- [ ] 1.基础表单 ~ 48.打印导出

---

### React - Ant Design - Config 模式

（48 个场景 × 3 态测试项，使用 React + Ant Design + ConfigForm）

- [ ] 1.基础表单 ~ 48.打印导出

**额外关注点**：
- observer() 包裹确保 MobX 响应式更新
- useEffect 清理确保无内存泄漏
- ConfigForm 通过 withMode 同步 StatusTabs 模式
- LayoutFormActions 通过 htmlType="submit" 触发 form 提交

---

### React - Ant Design - Field 模式

（48 个场景 × 3 态测试项，使用 FormProvider + FormField + fieldProps）

- [ ] 1.基础表单 ~ 48.打印导出

**额外关注点**：
- form.pattern = mode 在 render prop 内同步
- FormField fieldProps 声明式自动渲染
- registerComponent 注册自定义组件后在 fieldProps.component 引用
- LayoutFormActions onReset 正确触发 form.reset()

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
