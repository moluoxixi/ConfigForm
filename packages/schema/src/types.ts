import type { FieldPattern, DataSourceItem } from '@moluoxixi/shared';
import type { ValidationRule, ValidationTrigger } from '@moluoxixi/validator';
import type { ReactionRule, DataSourceConfig } from '@moluoxixi/core';

/* ======================== 表单 Schema ======================== */

/** 完整表单 Schema 定义 */
export interface FormSchema<Values = Record<string, unknown>> {
  /** 表单级配置 */
  form?: FormSchemaConfig;
  /** 字段定义 */
  fields: Record<string, FieldSchema>;
  /** 布局定义 */
  layout?: LayoutSchema;
  /** 全局联动规则 */
  reactions?: ReactionRule[];
}

/** 表单级 Schema 配置 */
export interface FormSchemaConfig {
  /** 标签位置 */
  labelPosition?: 'top' | 'left' | 'right';
  /** 标签宽度 */
  labelWidth?: number | string;
  /** 尺寸 */
  size?: 'small' | 'default' | 'large';
  /** 布局方向 */
  direction?: 'vertical' | 'horizontal' | 'inline';
  /** 表单模式 */
  pattern?: FieldPattern;
  /** 验证触发时机 */
  validateTrigger?: ValidationTrigger | ValidationTrigger[];
}

/* ======================== 字段 Schema ======================== */

/** 字段 Schema 定义 */
export interface FieldSchema {
  /** 字段数据类型 */
  type: FieldSchemaType;
  /** 标签 */
  label?: string;
  /** 描述 */
  description?: string;
  /** 默认值 */
  defaultValue?: unknown;
  /** 占位符 */
  placeholder?: string;

  /* ---- 组件 ---- */
  /** 渲染组件 */
  component?: string;
  /** 组件 Props */
  componentProps?: Record<string, unknown>;
  /** 装饰器组件 */
  wrapper?: string;
  /** 装饰器 Props */
  wrapperProps?: Record<string, unknown>;

  /* ---- 行为 ---- */
  /** 是否可见 */
  visible?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readOnly?: boolean;
  /** 字段模式 */
  pattern?: FieldPattern;

  /* ---- 验证 ---- */
  /** 是否必填 */
  required?: boolean;
  /** 验证规则 */
  rules?: ValidationRule[];
  /** 验证触发时机 */
  validateTrigger?: ValidationTrigger | ValidationTrigger[];

  /* ---- 数据源 ---- */
  /** 数据源（静态或远程配置） */
  dataSource?: DataSourceConfig | DataSourceItem[];
  /** 枚举值（简写，等价于静态数据源） */
  enum?: Array<string | number | { label: string; value: unknown; disabled?: boolean }>;

  /* ---- 联动 ---- */
  /** 联动规则 */
  reactions?: ReactionRule[];

  /* ---- 数组 ---- */
  /** 数组项 Schema */
  items?: FieldSchema;
  /** 数组项最小数量 */
  minItems?: number;
  /** 数组项最大数量 */
  maxItems?: number;
  /** 新增项模板 */
  itemTemplate?: unknown;

  /* ---- 嵌套 ---- */
  /** 子字段 */
  properties?: Record<string, FieldSchema>;

  /* ---- 布局提示 ---- */
  /** 栅格占比 */
  span?: number;
  /** 排序权重 */
  order?: number;
  /** 所属分组 */
  group?: string;

  /* ---- 数据处理 ---- */
  /** 显示格式化 */
  format?: string | ((value: unknown) => unknown);
  /** 输入解析 */
  parse?: string | ((value: unknown) => unknown);
  /** 提交转换 */
  transform?: string | ((value: unknown) => unknown);
  /** 提交路径映射 */
  submitPath?: string;
  /** 隐藏时是否排除提交数据 */
  excludeWhenHidden?: boolean;

  /* ---- 国际化 ---- */
  /** 国际化 key */
  i18nKey?: string;

  /* ---- 扩展 ---- */
  /** 自定义扩展属性 */
  [key: `x-${string}`]: unknown;
}

/** 字段数据类型 */
export type FieldSchemaType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'array'
  | 'object'
  | 'void';

/* ======================== 布局 Schema ======================== */

/** 布局 Schema（联合类型） */
export type LayoutSchema =
  | GridLayout
  | StepLayout
  | TabLayout
  | GroupLayout;

/** 栅格布局 */
export interface GridLayout {
  type: 'grid';
  /** 列数 */
  columns: number;
  /** 间距 */
  gutter?: number;
  /** 响应式列数 */
  responsive?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  /** 栅格区域 */
  areas?: GridArea[];
}

/** 栅格区域 */
export interface GridArea {
  /** 区域名称 */
  name?: string;
  /** 包含的字段路径 */
  fields: string[];
  /** 占用列数 */
  span?: number;
}

/** 分步布局 */
export interface StepLayout {
  type: 'steps';
  steps: StepItem[];
}

export interface StepItem {
  title: string;
  description?: string;
  icon?: string;
  fields: string[];
  /** 切换下一步前是否验证 */
  validateOnNext?: boolean;
}

/** 标签页布局 */
export interface TabLayout {
  type: 'tabs';
  tabs: TabItem[];
}

export interface TabItem {
  title: string;
  icon?: string;
  fields: string[];
  /** 显示错误数量徽标 */
  showErrorBadge?: boolean;
}

/** 分组布局 */
export interface GroupLayout {
  type: 'groups';
  groups: GroupItem[];
}

export interface GroupItem {
  title: string;
  description?: string;
  /** 分组组件（Card / Collapse 等） */
  component?: string;
  fields: string[];
  /** 是否默认折叠 */
  collapsed?: boolean;
}

/* ======================== 编译结果 ======================== */

/** Schema 编译结果 */
export interface CompiledSchema {
  form: FormSchemaConfig;
  fields: Map<string, CompiledField>;
  layout?: LayoutSchema;
  /** 字段渲染顺序 */
  fieldOrder: string[];
}

/** 编译后的字段 */
export interface CompiledField {
  path: string;
  schema: FieldSchema;
  /** 推断出的组件名 */
  resolvedComponent: string;
  /** 是否是虚拟字段 */
  isVoid: boolean;
  /** 是否是数组字段 */
  isArray: boolean;
  /** 子字段路径 */
  children: string[];
}

/** Schema 编译选项 */
export interface CompileOptions {
  /** 类型 → 组件的映射 */
  componentMapping?: Record<string, string>;
  /** 默认装饰器组件 */
  defaultWrapper?: string;
}
