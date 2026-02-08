# Playground 测试计划

## 测试矩阵

| 维度 | 值 |
|------|------|
| 场景数 | 56（3 个 UI 库共享同一份 schema） |
| 渲染 | ConfigForm + SchemaField 递归渲染（参考 Formily RecursionField） |
| 三态 | 编辑态 / 阅读态 / 禁用态（StatusTabs 切换） |
| 框架 | React 18 / Vue 3 |
| UI 库 | Ant Design（React）/ Ant Design Vue / Element Plus |

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

### 测试标准

每个场景测试 **编辑态 / 阅读态 / 禁用态** 三态。

#### 编辑态验证项

1. **UI 截图检查**：截取完整页面，确认 UI 组件库样式正确
2. **组件渲染检查**：标题、描述、StatusTabs、FormItem 标签冒号、必填 `*` 标记、所有字段类型正确
3. **交互+提交**：填写字段 → 点击"提交" → 验证结果表格所有值正确
4. **重置验证**：点击"重置" → 验证所有字段恢复初始值
5. **校验验证**：清空必填字段 → 提交 → 验证红色错误提示
6. **控制台检查**：无 error 级别日志

#### 阅读态验证项

1. 所有字段变为纯文本：有值显示值，无值显示"—"
2. 必填 `*` 标记隐藏
3. 提交/重置按钮隐藏
4. 无可交互表单元素

#### 禁用态验证项

1. 所有字段保持输入框形态但灰色不可交互（`[disabled]`）
2. 提交/重置按钮隐藏

#### 问题处理

发现问题 → 记录到问题表 → 立即修复 → 刷新重验 → 通过后继续

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

### 场景 13~56：待测

> 逐个测试时展开，格式同上。

---

## 测试总量统计

| 平台 | 场景数 | 三态 | 测试项总计 |
|------|--------|------|-----------|
| Vue AntdVue | 56 | 3 | 168 |
| Vue ElementPlus | 56 | 3 | 168 |
| React Antd | 56 | 3 | 168 |
| **合计** | | | **504** |
