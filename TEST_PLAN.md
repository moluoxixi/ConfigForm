# Playground 测试计划

## 测试矩阵：48 场景 × 3 模式 × 2 框架 × 多 UI 库

### 开发服务器
- Vue: http://localhost:3001 (playground-vue)
- React: http://localhost:3002 (playground-react)

### 测试标准
每个场景必须验证：编辑态（填写+校验+提交+重置）、阅读态（纯文本+按钮隐藏）、禁用态（disabled+按钮隐藏）

---

## Vue - Ant Design Vue - Config 模式

### 基础场景
- [ ] Vue-AntdVue-Config-1.基础表单-编辑态: 填写全部字段类型、必填校验、提交验证JSON、重置恢复
- [ ] Vue-AntdVue-Config-1.基础表单-阅读态: 字段纯文本、按钮隐藏
- [ ] Vue-AntdVue-Config-1.基础表单-禁用态: 字段disabled、按钮隐藏
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

（同上 48 场景，格式：Vue-AntdVue-Field-N.场景名-测试内容）

- [ ] Vue-AntdVue-Field-1.基础表单-编辑态
- [ ] Vue-AntdVue-Field-1.基础表单-阅读态+禁用态
（... 每个场景同上，此处省略完整列表，测试时逐个补充 ...）

---

## React - Ant Design - Config 模式

（同上 48 场景，格式：React-Antd-Config-N.场景名-测试内容）

- [ ] React-Antd-Config-1.基础表单-编辑态
- [ ] React-Antd-Config-1.基础表单-阅读态+禁用态
（... 每个场景同上 ...）

---

## React - Ant Design - Field 模式

- [ ] React-Antd-Field-1.基础表单-编辑态
- [ ] React-Antd-Field-1.基础表单-阅读态+禁用态
（... 每个场景同上 ...）

