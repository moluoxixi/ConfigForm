# ConfigForm

`src` 目录是 `@moluoxixi/config-form` 的源码实现。完整使用文档见包根目录的 `README.md`。

## 核心约定

- 字段通过 `defineField({ field, component, schema, ... })` 创建。
- 强类型表单优先使用 `defineFieldFor<T>()`，让 `field`、`value`、`values` 精确关联。
- 表单值通过 `modelValue` / `v-model` 同步。
- 默认值来自字段 `defaultValue`，外部 `modelValue` 会覆盖默认值。
- `validator(value, values)` 可用于跨字段或异步校验。
- 隐藏和禁用字段默认不进入 submit 输出，可用 `submitWhenHidden` / `submitWhenDisabled` 开启。
- `slots` 可传文本、渲染函数、递归字段配置或配置数组；对象配置会继续由 `FormField` 渲染。

## 样式命名空间

默认类名前缀是 `cf`。如果运行时传入 `namespace`，业务侧引入 SCSS 时也需要使用相同 `$namespace`。
