export type { SceneConfig } from './types'

/** 场景分组标签 */
export const GROUP_LABELS: Record<string, string> = {
  '01-basic': '基础场景',
  '02-linkage': '联动场景',
  '03-validation': '验证场景',
  '04-complex-data': '复杂数据',
  '05-datasource': '数据源',
  '06-layout': '布局分组',
  '07-dynamic': '动态表单',
  '08-components': '复杂组件',
  '09-advanced': '进阶能力',
  '10-state': '状态管理',
  '11-misc': '其他能力',
  '12-plugin': '插件能力（低代码）',
}

/**
 * 场景注册表
 *
 * 覆盖所有已实现功能，包含核心表单 + 插件能力。
 */
export const sceneRegistry: Record<string, { group: string, loader: () => Promise<{ default: import('./types').SceneConfig }> }> = {
  /* 01-basic — 基础场景（4 个） */
  BasicForm: { group: '01-basic', loader: () => import('./01-basic/BasicForm') },
  LayoutForm: { group: '01-basic', loader: () => import('./01-basic/LayoutForm') },
  BasicValidationForm: { group: '01-basic', loader: () => import('./01-basic/BasicValidationForm') },
  DefaultValueForm: { group: '01-basic', loader: () => import('./01-basic/DefaultValueForm') },

  /* 02-linkage — 联动场景（6 个） */
  VisibilityLinkageForm: { group: '02-linkage', loader: () => import('./02-linkage/VisibilityLinkageForm') },
  ValueLinkageForm: { group: '02-linkage', loader: () => import('./02-linkage/ValueLinkageForm') },
  PropertyLinkageForm: { group: '02-linkage', loader: () => import('./02-linkage/PropertyLinkageForm') },
  CascadeSelectForm: { group: '02-linkage', loader: () => import('./02-linkage/CascadeSelectForm') },
  ComputedFieldForm: { group: '02-linkage', loader: () => import('./02-linkage/ComputedFieldForm') },
  ConditionalRequiredForm: { group: '02-linkage', loader: () => import('./02-linkage/ConditionalRequiredForm') },

  /* 03-validation — 验证场景（3 个） */
  AsyncValidationForm: { group: '03-validation', loader: () => import('./03-validation/AsyncValidationForm') },
  CrossFieldValidationForm: { group: '03-validation', loader: () => import('./03-validation/CrossFieldValidationForm') },
  CustomValidationForm: { group: '03-validation', loader: () => import('./03-validation/CustomValidationForm') },

  /* 04-complex-data — 复杂数据（5 个） */
  ArrayFieldForm: { group: '04-complex-data', loader: () => import('./04-complex-data/ArrayFieldForm') },
  EditableTableForm: { group: '04-complex-data', loader: () => import('./04-complex-data/EditableTableForm') },
  NestedObjectForm: { group: '04-complex-data', loader: () => import('./04-complex-data/NestedObjectForm') },
  ObjectArrayNestedForm: { group: '04-complex-data', loader: () => import('./04-complex-data/ObjectArrayNestedForm') },
  ObjectFieldDynamicForm: { group: '04-complex-data', loader: () => import('./04-complex-data/ObjectFieldDynamicForm') },

  /* 05-datasource — 数据源（3 个） */
  AsyncOptionsForm: { group: '05-datasource', loader: () => import('./05-datasource/AsyncOptionsForm') },
  DependentDataSourceForm: { group: '05-datasource', loader: () => import('./05-datasource/DependentDataSourceForm') },
  PaginatedSearchForm: { group: '05-datasource', loader: () => import('./05-datasource/PaginatedSearchForm') },

  /* 06-layout — 布局分组（4 个） */
  CardGroupForm: { group: '06-layout', loader: () => import('./06-layout/CardGroupForm') },
  CollapseGroupForm: { group: '06-layout', loader: () => import('./06-layout/CollapseGroupForm') },
  StepForm: { group: '06-layout', loader: () => import('./06-layout/StepForm') },
  TabGroupForm: { group: '06-layout', loader: () => import('./06-layout/TabGroupForm') },

  /* 07-dynamic — 动态表单（3 个） */
  DynamicFieldForm: { group: '07-dynamic', loader: () => import('./07-dynamic/DynamicFieldForm') },
  DynamicSchemaForm: { group: '07-dynamic', loader: () => import('./07-dynamic/DynamicSchemaForm') },
  TemplateReuseForm: { group: '07-dynamic', loader: () => import('./07-dynamic/TemplateReuseForm') },

  /* 08-components — 复杂组件（12 个） */
  RichTextForm: { group: '08-components', loader: () => import('./08-components/RichTextForm') },
  FileUploadForm: { group: '08-components', loader: () => import('./08-components/FileUploadForm') },
  MapPickerForm: { group: '08-components', loader: () => import('./08-components/MapPickerForm') },
  ColorPickerForm: { group: '08-components', loader: () => import('./08-components/ColorPickerForm') },
  CodeEditorForm: { group: '08-components', loader: () => import('./08-components/CodeEditorForm') },
  JsonEditorForm: { group: '08-components', loader: () => import('./08-components/JsonEditorForm') },
  SignaturePadForm: { group: '08-components', loader: () => import('./08-components/SignaturePadForm') },
  TransferForm: { group: '08-components', loader: () => import('./08-components/TransferForm') },
  TreeSelectForm: { group: '08-components', loader: () => import('./08-components/TreeSelectForm') },
  MarkdownEditorForm: { group: '08-components', loader: () => import('./08-components/MarkdownEditorForm') },
  IconSelectorForm: { group: '08-components', loader: () => import('./08-components/IconSelectorForm') },
  CronEditorForm: { group: '08-components', loader: () => import('./08-components/CronEditorForm') },

  /* 09-advanced — 进阶能力（9 个） */
  SchemaExpressionForm: { group: '09-advanced', loader: () => import('./11-advanced/SchemaExpressionForm') },
  ExpressionEngineForm: { group: '09-advanced', loader: () => import('./11-advanced/ExpressionEngineForm') },
  SchemaRefForm: { group: '09-advanced', loader: () => import('./11-advanced/SchemaRefForm') },
  EffectsForm: { group: '09-advanced', loader: () => import('./11-advanced/EffectsForm') },
  CustomDecoratorForm: { group: '09-advanced', loader: () => import('./11-advanced/CustomDecoratorForm') },
  OneOfSchemaForm: { group: '09-advanced', loader: () => import('./11-advanced/OneOfSchemaForm') },
  EffectsAPIForm: { group: '09-advanced', loader: () => import('./11-advanced/EffectsAPIForm') },
  GridLayoutForm: { group: '09-advanced', loader: () => import('./11-advanced/GridLayoutForm') },
  LargeFormPerf: { group: '09-advanced', loader: () => import('./11-advanced/LargeFormPerf') },

  /* 10-state — 状态管理（3 个） */
  LifecycleForm: { group: '10-state', loader: () => import('./09-state/LifecycleForm') },
  DataTransformForm: { group: '10-state', loader: () => import('./09-state/DataTransformForm') },
  FormSnapshotForm: { group: '10-state', loader: () => import('./09-state/FormSnapshotForm') },

  /* 11-misc — 其他能力（2 个） */
  I18nForm: { group: '11-misc', loader: () => import('./10-misc/I18nForm') },
  PrintExportForm: { group: '11-misc', loader: () => import('./10-misc/PrintExportForm') },

  /* 12-plugin — 插件能力 / 低代码（4 个） */
  UndoRedoForm: { group: '12-plugin', loader: () => import('./09-state/UndoRedoForm') },
  FormDiffForm: { group: '12-plugin', loader: () => import('./10-misc/FormDiffForm') },
  PermissionForm: { group: '12-plugin', loader: () => import('./10-misc/PermissionForm') },
  MultiFormForm: { group: '12-plugin', loader: () => import('./09-state/MultiFormForm') },
}

/** 场景分组列表（从 registry 自动生成） */
export function getSceneGroups(): Array<{ key: string, label: string, items: string[] }> {
  const groupMap = new Map<string, string[]>()

  for (const [name, { group }] of Object.entries(sceneRegistry)) {
    if (!groupMap.has(group)) groupMap.set(group, [])
    groupMap.get(group)!.push(name)
  }

  return Array.from(groupMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, items]) => ({
      key,
      label: GROUP_LABELS[key] ?? key,
      items: items.sort(),
    }))
}
