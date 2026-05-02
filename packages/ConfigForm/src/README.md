# ConfigForm

`src` 目录是 `@moluoxixi/config-form` 的源码实现。完整使用文档见包根目录的 `README.md`。

## 核心约定

- 字段通过 `defineField({ field, component, schema, ... })` 创建；需要绑定业务模型时使用 `defineFieldFor<T>()`；slot 内对象节点也必须通过 `defineField(...)` 创建。
- `defineField` 返回带内部标记的纯配置对象；字段默认值、组件解析、token 解析和状态判断统一由 runtime 管线完成。
- 表单值通过 `modelValue` / `v-model` 同步。
- 默认值来自字段 `defaultValue`，外部 `modelValue` 会覆盖默认值。
- `validator(value, values)` 可用于跨字段或异步校验。
- 非标准组件事件通过 `getValueFromEvent(...args)` 显式提取字段值，默认只取第一个事件参数。
- 隐藏和禁用字段默认不进入 submit 输出，可用 `submitWhenHidden` / `submitWhenDisabled` 开启。
- `slots` 可传文本、渲染函数、由 `defineField` 创建的容器组件节点或真实字段节点数组；无 `field` 的节点只渲染组件本体，有 `field` 的节点才绑定表单值和校验。
- slot 渲染函数如果返回真实字段节点，字段生命周期选项必须不依赖 slot scope；表单初始化会用空 scope 收集字段拓扑。
- runtime 默认严格处理组件/插件冲突；如果需要覆盖行为，必须显式传入 `conflictStrategy`。

## 样式命名空间

默认类名前缀是 `cf`。如果运行时传入 `namespace`，业务侧引入 SCSS 时也需要使用相同 `$namespace`。
