# Playground 测试计划

## 测试矩阵

| 维度 | 值 |
|------|------|
| 场景数 | 48 |
| 模式 | Config（Schema 驱动）/ Field（自定义渲染） |
| 三态 | 编辑态 / 阅读态 / 禁用态 |
| 框架 | Vue 3 / React 18 |
| UI 库 | Ant Design Vue / Element Plus / Ant Design（React） |

### 开发服务器

- Vue: http://localhost:3001 (playground-vue)
- React: http://localhost:3002 (playground-react)

### 测试标准

每个场景必须验证：
- **编辑态**：填写 + 校验 + 提交验证 JSON + 重置恢复
- **阅读态**：字段纯文本显示 + 操作按钮隐藏
- **禁用态**：字段 disabled + 操作按钮隐藏

### 场景文件完成度

| 平台 | Config 模式 | Field 模式 | 说明 |
|------|------------|-----------|------|
| Vue AntdVue | 27/48 (1-27) | 21/48 (28-48) | config 缺 28-48，field 缺 1-27 |
| Vue ElementPlus | 27/48 (1-27) | 21/48 (28-48) | 同上 |
| React Antd | 27/48 (1-27) | 21/48 (28-48) | 同上 |

---

## Vue - Ant Design Vue - Config 模式

### 基础场景

- [x] Vue-AntdVue-Config-1.基础表单-编辑态: 填写全部字段类型、必填校验、提交验证JSON、重置恢复 ✅
- [x] Vue-AntdVue-Config-1.基础表单-阅读态: 字段纯文本、按钮隐藏 ✅
- [x] Vue-AntdVue-Config-1.基础表单-禁用态: 字段disabled、按钮隐藏 ✅
- [ ] Vue-AntdVue-Config-2.表单布局-编辑态: 4种布局切换、labelWidth生效、提交重置
- [ ] Vue-AntdVue-Config-2.表单布局-阅读态+禁用态: 布局保持、按钮隐藏
- [ ] Vue-AntdVue-Config-3.必填与格式验证-编辑态: 空提交必填错误、邮箱/手机/URL格式校验、正确值提交
- [ ] Vue-AntdVue-Config-3.必填与格式验证-阅读态+禁用态: 无校验触发
- [ ] Vue-AntdVue-Config-4.默认值-编辑态: 静态默认值、动态计算联动、重置恢复默认值
- [ ] Vue-AntdVue-Config-4.默认值-阅读态+禁用态: 默认值正常显示

### 联动场景

- [ ] Vue-AntdVue-Config-5.显隐联动-编辑态: 个人/企业切换显隐、开关控制多字段、嵌套显隐、提交排除隐藏字段
- [ ] Vue-AntdVue-Config-5.显隐联动-阅读态+禁用态: 联动状态保持
- [ ] Vue-AntdVue-Config-6.值联动-编辑态: 姓名拼接、大写转换、国家→区号映射、省市区聚合
- [ ] Vue-AntdVue-Config-6.值联动-阅读态+禁用态: 计算值正确显示
- [ ] Vue-AntdVue-Config-7.属性联动-编辑态: 开关控制disabled、类型切换placeholder/required
- [ ] Vue-AntdVue-Config-7.属性联动-阅读态+禁用态: 属性状态保持
- [ ] Vue-AntdVue-Config-8.级联选择-编辑态: 省→市→区三级联动、选择后下级清空重载
- [ ] Vue-AntdVue-Config-8.级联选择-阅读态+禁用态: 已选值显示
- [ ] Vue-AntdVue-Config-9.计算字段-编辑态: 乘法/折扣/聚合/条件计税自动计算
- [ ] Vue-AntdVue-Config-9.计算字段-阅读态+禁用态: 计算结果正确
- [ ] Vue-AntdVue-Config-10.条件必填-编辑态: 开关→发票必填、金额阈值→审批人必填
- [ ] Vue-AntdVue-Config-10.条件必填-阅读态+禁用态: 必填标记正确

### 验证场景

- [ ] Vue-AntdVue-Config-11.自定义验证-编辑态: 车牌正则、手机号函数、密码多规则
- [ ] Vue-AntdVue-Config-11.自定义验证-阅读态+禁用态: 无错误提示
- [ ] Vue-AntdVue-Config-12.异步验证-编辑态: admin用户名已注册、邮箱异步校验
- [ ] Vue-AntdVue-Config-12.异步验证-阅读态+禁用态: 不触发异步
- [ ] Vue-AntdVue-Config-13.跨字段验证-编辑态: 密码不一致、比例总和100%、超预算
- [ ] Vue-AntdVue-Config-13.跨字段验证-阅读态+禁用态: 无交叉验证

### 复杂数据

- [ ] Vue-AntdVue-Config-14.嵌套对象-编辑态: void Card分组、提交扁平数据（void不参与路径）
- [ ] Vue-AntdVue-Config-14.嵌套对象-阅读态+禁用态: 嵌套值显示
- [ ] Vue-AntdVue-Config-15.数组字段-编辑态: 增删排序、提交无脏数据、重置
- [ ] Vue-AntdVue-Config-15.数组字段-阅读态+禁用态: 只读/禁用、操作按钮隐藏
- [ ] Vue-AntdVue-Config-16.可编辑表格-编辑态: 行内编辑、计算联动、添加删除行
- [ ] Vue-AntdVue-Config-16.可编辑表格-阅读态+禁用态: 纯文本/禁用
- [ ] Vue-AntdVue-Config-17.对象数组嵌套-编辑态: 联系人+嵌套电话数组增删、提交嵌套JSON
- [ ] Vue-AntdVue-Config-17.对象数组嵌套-阅读态+禁用态: 纯文本/禁用

### 数据源

- [ ] Vue-AntdVue-Config-18.异步选项-编辑态: 初始加载+切换类型异步加载+loading+placeholder动态
- [ ] Vue-AntdVue-Config-18.异步选项-阅读态+禁用态: 纯文本/disabled
- [ ] Vue-AntdVue-Config-19.依赖数据源-编辑态: 品牌→型号→配置三级远程链+API日志
- [ ] Vue-AntdVue-Config-19.依赖数据源-阅读态+禁用态: 纯文本/disabled
- [ ] Vue-AntdVue-Config-20.分页搜索-编辑态: 搜索过滤+分页加载+防抖
- [ ] Vue-AntdVue-Config-20.分页搜索-阅读态+禁用态: disabled

### 布局分组

- [ ] Vue-AntdVue-Config-21.分步表单-编辑态: Steps导航+步骤验证拦截+预览+提交重置
- [ ] Vue-AntdVue-Config-21.分步表单-阅读态+禁用态: 步骤可见、按钮隐藏
- [ ] Vue-AntdVue-Config-22.标签页分组-编辑态: Tab切换保留数据+跨Tab提交
- [ ] Vue-AntdVue-Config-22.标签页分组-阅读态+禁用态: Tab切换正常
- [ ] Vue-AntdVue-Config-23.折叠面板-编辑态: 展开折叠+跨面板提交
- [ ] Vue-AntdVue-Config-23.折叠面板-阅读态+禁用态: 面板正常
- [ ] Vue-AntdVue-Config-24.卡片分组-编辑态: 多卡片填写+卡片内验证+提交重置
- [ ] Vue-AntdVue-Config-24.卡片分组-阅读态+禁用态: 卡片正常

### 动态表单

- [ ] Vue-AntdVue-Config-25.动态增删字段-编辑态: 添加/删除动态字段、参与提交
- [ ] Vue-AntdVue-Config-25.动态增删字段-阅读态+禁用态: 只读、添加隐藏
- [ ] Vue-AntdVue-Config-26.动态Schema-编辑态: 切换个人/企业/学生→字段数变化
- [ ] Vue-AntdVue-Config-26.动态Schema-阅读态+禁用态: 场景切换正常
- [ ] Vue-AntdVue-Config-27.模板复用-编辑态: 切换员工/客户/供应商→公共+扩展字段
- [ ] Vue-AntdVue-Config-27.模板复用-阅读态+禁用态: 模板切换正常

### 复杂组件

- [ ] Vue-AntdVue-Config-28.富文本编辑器-编辑态: 输入HTML、Textarea降级、提交
- [ ] Vue-AntdVue-Config-28.富文本编辑器-阅读态+禁用态: 预览/不可编辑
- [ ] Vue-AntdVue-Config-29.文件上传-编辑态: 选择文件、Upload交互、提交文件列表
- [ ] Vue-AntdVue-Config-29.文件上传-阅读态+禁用态: 上传按钮隐藏
- [ ] Vue-AntdVue-Config-30.地图选点-编辑态: 模拟选点、经纬度同步
- [ ] Vue-AntdVue-Config-30.地图选点-阅读态+禁用态: 不可点击
- [ ] Vue-AntdVue-Config-31.颜色选择器-编辑态: 选择颜色、预设色板、HEX输入
- [ ] Vue-AntdVue-Config-31.颜色选择器-阅读态+禁用态: 色块展示/不可选
- [ ] Vue-AntdVue-Config-32.代码编辑器-编辑态: 输入代码、语言切换
- [ ] Vue-AntdVue-Config-32.代码编辑器-阅读态+禁用态: 代码预览/不可编辑
- [ ] Vue-AntdVue-Config-33.JSON编辑器-编辑态: 输入JSON、格式化、语法错误检测
- [ ] Vue-AntdVue-Config-33.JSON编辑器-阅读态+禁用态: 预览/不可编辑
- [ ] Vue-AntdVue-Config-34.手写签名-编辑态: Canvas绘制、清空、数据同步
- [ ] Vue-AntdVue-Config-34.手写签名-阅读态+禁用态: 图片预览/不可绘制
- [ ] Vue-AntdVue-Config-35.穿梭框-编辑态: 勾选穿梭+搜索过滤+提交
- [ ] Vue-AntdVue-Config-35.穿梭框-阅读态+禁用态: Tag展示/不可操作
- [ ] Vue-AntdVue-Config-36.树形选择-编辑态: 单选/多选部门+提交
- [ ] Vue-AntdVue-Config-36.树形选择-阅读态+禁用态: Tag展示/不可选
- [ ] Vue-AntdVue-Config-37.Markdown-编辑态: 编辑+实时预览
- [ ] Vue-AntdVue-Config-37.Markdown-阅读态+禁用态: 纯预览/不可编辑
- [ ] Vue-AntdVue-Config-38.图标选择器-编辑态: 搜索过滤+点击选中
- [ ] Vue-AntdVue-Config-38.图标选择器-阅读态+禁用态: 只显示选中
- [ ] Vue-AntdVue-Config-39.Cron编辑器-编辑态: 输入Cron+快捷预设+实时解析
- [ ] Vue-AntdVue-Config-39.Cron编辑器-阅读态+禁用态: 解析结果展示

### 表单状态

- [ ] Vue-AntdVue-Config-40.数据转换-编辑态: format/parse/transform、原始值vs转换值
- [ ] Vue-AntdVue-Config-40.数据转换-阅读态+禁用态: 转换后值显示
- [ ] Vue-AntdVue-Config-41.多表单协作-编辑态: 主表单+子表单+联合提交
- [ ] Vue-AntdVue-Config-41.多表单协作-阅读态+禁用态: 两表单只读
- [ ] Vue-AntdVue-Config-42.表单快照-编辑态: 暂存/恢复/删除草稿
- [ ] Vue-AntdVue-Config-42.表单快照-阅读态+禁用态: 草稿列表可见不可暂存
- [ ] Vue-AntdVue-Config-43.撤销重做-编辑态: Ctrl+Z撤销/Ctrl+Shift+Z重做
- [ ] Vue-AntdVue-Config-43.撤销重做-阅读态+禁用态: 按钮禁用
- [ ] Vue-AntdVue-Config-44.生命周期-编辑态: onChange/onSubmit/onReset日志
- [ ] Vue-AntdVue-Config-44.生命周期-阅读态+禁用态: 日志面板可见

### 其他能力

- [ ] Vue-AntdVue-Config-45.字段权限-编辑态: 切换角色→字段可见性+读写权限变化
- [ ] Vue-AntdVue-Config-45.字段权限-阅读态+禁用态: 权限叠加正确
- [ ] Vue-AntdVue-Config-46.国际化-编辑态: 切换中/英/日→标签/placeholder/验证消息切换
- [ ] Vue-AntdVue-Config-46.国际化-阅读态+禁用态: 多语言标签正确
- [ ] Vue-AntdVue-Config-47.表单比对-编辑态: 修改→变更高亮+原始值提示+变更摘要
- [ ] Vue-AntdVue-Config-47.表单比对-阅读态+禁用态: 高亮保持
- [ ] Vue-AntdVue-Config-48.打印导出-编辑态: 打印+导出JSON+导出CSV
- [ ] Vue-AntdVue-Config-48.打印导出-阅读态+禁用态: 导出按钮可用

---

## Vue - Ant Design Vue - Field 模式

### 基础场景

- [x] Vue-AntdVue-Field-1.基础表单-编辑态: FormField + fieldProps 声明式渲染，校验、提交、重置均正常 ✅
- [x] Vue-AntdVue-Field-1.基础表单-阅读态+禁用态: 纯文本/disabled 自动处理正确 ✅
- [ ] Vue-AntdVue-Field-2.表单布局-编辑态: 手动控制 labelWidth、布局排列
- [ ] Vue-AntdVue-Field-2.表单布局-阅读态+禁用态: 布局保持
- [ ] Vue-AntdVue-Field-3.必填与格式验证-编辑态: rules 手动配置、格式校验
- [ ] Vue-AntdVue-Field-3.必填与格式验证-阅读态+禁用态: 无校验
- [ ] Vue-AntdVue-Field-4.默认值-编辑态: initialValue 手动设置、重置恢复
- [ ] Vue-AntdVue-Field-4.默认值-阅读态+禁用态: 默认值显示

### 联动场景

- [ ] Vue-AntdVue-Field-5.显隐联动-编辑态: v-if/v-show 手动联动、提交排除隐藏
- [ ] Vue-AntdVue-Field-5.显隐联动-阅读态+禁用态: 联动状态保持
- [ ] Vue-AntdVue-Field-6.值联动-编辑态: watch + setValue 手动联动
- [ ] Vue-AntdVue-Field-6.值联动-阅读态+禁用态: 计算值正确
- [ ] Vue-AntdVue-Field-7.属性联动-编辑态: 手动 setComponentProps/disable/enable
- [ ] Vue-AntdVue-Field-7.属性联动-阅读态+禁用态: 状态保持
- [ ] Vue-AntdVue-Field-8.级联选择-编辑态: 手动 loadDataSource 三级联动
- [ ] Vue-AntdVue-Field-8.级联选择-阅读态+禁用态: 已选值显示
- [ ] Vue-AntdVue-Field-9.计算字段-编辑态: computed/watch 实现自动计算
- [ ] Vue-AntdVue-Field-9.计算字段-阅读态+禁用态: 计算结果正确
- [ ] Vue-AntdVue-Field-10.条件必填-编辑态: 动态 addRule/removeRule
- [ ] Vue-AntdVue-Field-10.条件必填-阅读态+禁用态: 必填标记正确

### 验证场景

- [ ] Vue-AntdVue-Field-11.自定义验证-编辑态: rules 配置 validator 函数
- [ ] Vue-AntdVue-Field-11.自定义验证-阅读态+禁用态: 无错误提示
- [ ] Vue-AntdVue-Field-12.异步验证-编辑态: asyncValidator 配置
- [ ] Vue-AntdVue-Field-12.异步验证-阅读态+禁用态: 不触发
- [ ] Vue-AntdVue-Field-13.跨字段验证-编辑态: getFieldValue 跨字段对比
- [ ] Vue-AntdVue-Field-13.跨字段验证-阅读态+禁用态: 无交叉验证

### 复杂数据

- [ ] Vue-AntdVue-Field-14.嵌套对象-编辑态: FormObjectField + FormVoidField 组合
- [ ] Vue-AntdVue-Field-14.嵌套对象-阅读态+禁用态: 嵌套值显示
- [ ] Vue-AntdVue-Field-15.数组字段-编辑态: FormArrayField v-slot 增删排序
- [ ] Vue-AntdVue-Field-15.数组字段-阅读态+禁用态: 只读/操作隐藏
- [ ] Vue-AntdVue-Field-16.可编辑表格-编辑态: Table + FormField 行内编辑
- [ ] Vue-AntdVue-Field-16.可编辑表格-阅读态+禁用态: 纯文本
- [ ] Vue-AntdVue-Field-17.对象数组嵌套-编辑态: 嵌套 FormArrayField
- [ ] Vue-AntdVue-Field-17.对象数组嵌套-阅读态+禁用态: 纯文本

### 数据源

- [ ] Vue-AntdVue-Field-18.异步选项-编辑态: field.loadDataSource 手动调用
- [ ] Vue-AntdVue-Field-18.异步选项-阅读态+禁用态: 纯文本
- [ ] Vue-AntdVue-Field-19.依赖数据源-编辑态: watch 触发 loadDataSource
- [ ] Vue-AntdVue-Field-19.依赖数据源-阅读态+禁用态: 纯文本
- [ ] Vue-AntdVue-Field-20.分页搜索-编辑态: 手动 fetchDataSource + 防抖
- [ ] Vue-AntdVue-Field-20.分页搜索-阅读态+禁用态: disabled

### 布局分组

- [ ] Vue-AntdVue-Field-21.分步表单-编辑态: FormVoidField + LayoutSteps 手动组装
- [ ] Vue-AntdVue-Field-21.分步表单-阅读态+禁用态: 步骤可见
- [ ] Vue-AntdVue-Field-22.标签页分组-编辑态: FormVoidField + LayoutTabs
- [ ] Vue-AntdVue-Field-22.标签页分组-阅读态+禁用态: Tab 正常
- [ ] Vue-AntdVue-Field-23.折叠面板-编辑态: FormVoidField + LayoutCollapse
- [ ] Vue-AntdVue-Field-23.折叠面板-阅读态+禁用态: 面板正常
- [ ] Vue-AntdVue-Field-24.卡片分组-编辑态: FormVoidField + LayoutCard
- [ ] Vue-AntdVue-Field-24.卡片分组-阅读态+禁用态: 卡片正常

### 动态表单

- [ ] Vue-AntdVue-Field-25.动态增删字段-编辑态: form.createField/removeField 动态管理
- [ ] Vue-AntdVue-Field-25.动态增删字段-阅读态+禁用态: 只读
- [ ] Vue-AntdVue-Field-26.动态Schema-编辑态: 动态切换 schema ref
- [ ] Vue-AntdVue-Field-26.动态Schema-阅读态+禁用态: 切换正常
- [ ] Vue-AntdVue-Field-27.模板复用-编辑态: mergeSchema 组合基础+扩展
- [ ] Vue-AntdVue-Field-27.模板复用-阅读态+禁用态: 切换正常

### 复杂组件

- [ ] Vue-AntdVue-Field-28.富文本编辑器-编辑态: 自定义组件 + FormField v-slot
- [ ] Vue-AntdVue-Field-28.富文本编辑器-阅读态+禁用态: 预览
- [ ] Vue-AntdVue-Field-29.文件上传-编辑态: Upload 组件 + FormField
- [ ] Vue-AntdVue-Field-29.文件上传-阅读态+禁用态: 按钮隐藏
- [ ] Vue-AntdVue-Field-30.地图选点-编辑态: 自定义地图组件
- [ ] Vue-AntdVue-Field-30.地图选点-阅读态+禁用态: 不可点击
- [ ] Vue-AntdVue-Field-31.颜色选择器-编辑态: ColorPicker 组件
- [ ] Vue-AntdVue-Field-31.颜色选择器-阅读态+禁用态: 色块
- [ ] Vue-AntdVue-Field-32.代码编辑器-编辑态: Monaco/CodeMirror 集成
- [ ] Vue-AntdVue-Field-32.代码编辑器-阅读态+禁用态: 预览
- [ ] Vue-AntdVue-Field-33.JSON编辑器-编辑态: JSON 格式化+语法检测
- [ ] Vue-AntdVue-Field-33.JSON编辑器-阅读态+禁用态: 预览
- [ ] Vue-AntdVue-Field-34.手写签名-编辑态: Canvas 绘制
- [ ] Vue-AntdVue-Field-34.手写签名-阅读态+禁用态: 图片预览
- [ ] Vue-AntdVue-Field-35.穿梭框-编辑态: Transfer 组件
- [ ] Vue-AntdVue-Field-35.穿梭框-阅读态+禁用态: Tag 展示
- [ ] Vue-AntdVue-Field-36.树形选择-编辑态: TreeSelect 组件
- [ ] Vue-AntdVue-Field-36.树形选择-阅读态+禁用态: Tag 展示
- [ ] Vue-AntdVue-Field-37.Markdown-编辑态: Markdown 编辑器
- [ ] Vue-AntdVue-Field-37.Markdown-阅读态+禁用态: 纯预览
- [ ] Vue-AntdVue-Field-38.图标选择器-编辑态: 图标搜索+选择
- [ ] Vue-AntdVue-Field-38.图标选择器-阅读态+禁用态: 只显示
- [ ] Vue-AntdVue-Field-39.Cron编辑器-编辑态: Cron 输入+解析
- [ ] Vue-AntdVue-Field-39.Cron编辑器-阅读态+禁用态: 解析结果

### 表单状态

- [ ] Vue-AntdVue-Field-40.数据转换-编辑态: format/parse/transform 手动配置
- [ ] Vue-AntdVue-Field-40.数据转换-阅读态+禁用态: 转换值显示
- [ ] Vue-AntdVue-Field-41.多表单协作-编辑态: 多个 FormProvider 协作
- [ ] Vue-AntdVue-Field-41.多表单协作-阅读态+禁用态: 两表单只读
- [ ] Vue-AntdVue-Field-42.表单快照-编辑态: 手动暂存/恢复 form.values
- [ ] Vue-AntdVue-Field-42.表单快照-阅读态+禁用态: 不可暂存
- [ ] Vue-AntdVue-Field-43.撤销重做-编辑态: 手动实现 undo/redo 栈
- [ ] Vue-AntdVue-Field-43.撤销重做-阅读态+禁用态: 按钮禁用
- [ ] Vue-AntdVue-Field-44.生命周期-编辑态: form.onValuesChange 等回调日志
- [ ] Vue-AntdVue-Field-44.生命周期-阅读态+禁用态: 日志可见

### 其他能力

- [ ] Vue-AntdVue-Field-45.字段权限-编辑态: 手动 show/hide/enable/disable
- [ ] Vue-AntdVue-Field-45.字段权限-阅读态+禁用态: 权限叠加
- [ ] Vue-AntdVue-Field-46.国际化-编辑态: 动态切换 label/placeholder
- [ ] Vue-AntdVue-Field-46.国际化-阅读态+禁用态: 多语言标签
- [ ] Vue-AntdVue-Field-47.表单比对-编辑态: form.values vs initialValues diff
- [ ] Vue-AntdVue-Field-47.表单比对-阅读态+禁用态: 高亮保持
- [ ] Vue-AntdVue-Field-48.打印导出-编辑态: 手动导出 JSON/CSV
- [ ] Vue-AntdVue-Field-48.打印导出-阅读态+禁用态: 导出可用

---

## Vue - Element Plus - Config 模式

（与 Vue-AntdVue-Config 完全相同的 48 场景 × 3 态测试项，UI 组件替换为 Element Plus）

- [ ] Vue-ElementPlus-Config-1.基础表单 ~ Vue-ElementPlus-Config-48.打印导出

**额外关注点**：
- readonly 渲染为纯文本（与 antd-vue 行为一致）
- LayoutTabs/LayoutCollapse/LayoutSteps/LayoutStepActions 布局正常
- FormItem labelPosition/labelWidth 生效
- Select 使用 multiple 而非 mode

---

## Vue - Element Plus - Field 模式

（与 Vue-AntdVue-Field 完全相同的 48 场景 × 3 态测试项）

- [ ] Vue-ElementPlus-Field-1.基础表单 ~ Vue-ElementPlus-Field-48.打印导出

---

## React - Ant Design - Config 模式

（与 Vue-AntdVue-Config 完全相同的 48 场景 × 3 态测试项，组件替换为 React + Ant Design）

- [ ] React-Antd-Config-1.基础表单 ~ React-Antd-Config-48.打印导出

**额外关注点**：
- observer() 包裹确保 MobX 响应式更新
- useEffect 清理确保无内存泄漏
- ConfigForm 自动渲染 actions 按钮
- ReactiveField 传递 labelPosition/labelWidth

---

## React - Ant Design - Field 模式

（与 Vue-AntdVue-Field 完全相同的 48 场景 × 3 态测试项）

- [ ] React-Antd-Field-1.基础表单 ~ React-Antd-Field-48.打印导出

---

## 场景覆盖率分析

### 已覆盖的 Formily 核心能力

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

### 扩展场景（已实现）

| 序号 | 场景 | 说明 | 状态 |
|------|------|------|------|
| 49 | Grid 栅格布局 | span 属性控制字段占比，24 栅格制 | 已实现 |
| 50 | Effects 链式副作用 | createForm({ effects }) 中使用 onFieldValueChange / onValuesChange | 已实现 |
| 51 | 大表单性能 | 50/100/200 字段的渲染性能基准测试 | 已实现 |
| 52 | 自定义装饰器 | CardDecorator + InlineDecorator 自定义 decorator 组件 | 已实现 |
| 53 | Schema 表达式 | 函数式 reactions 实现等价的 Formily 表达式联动 | 已实现 |
| 54 | oneOf/anyOf 联合 Schema | 动态 Schema 切换模拟 oneOf 鉴别字段 | 已实现 |
| 55 | SSR 兼容性 | 核心库无 DOM 依赖检查（createForm/compileSchema/validate） | 已实现 |
| 56 | 虚拟滚动 | 纯 CSS 偏移虚拟滚动，支持百级数组项 | 已实现 |

### 场景文件缺失清单

需要补充的文件（每个场景需要 config + field 两个文件）：

**Vue AntdVue 缺失 field 模式**（场景 1-27，共 27 个文件）：
`BasicForm/field.vue` ~ `TemplateReuseForm/field.vue`

**Vue AntdVue 缺失 config 模式**（场景 28-48，共 21 个文件）：
`RichTextForm/config.vue` ~ `PrintExportForm/config.vue`

**Vue ElementPlus** 和 **React Antd** 同样各缺相同的 48 个文件。

**总计缺失**：48 × 3 平台 = **144 个场景文件**待补充。
