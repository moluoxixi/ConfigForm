export type { FieldConfig, OptionItem, SceneConfig } from './types'

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
  '09-state': '表单状态',
  '10-misc': '其他能力',
  '11-advanced': '扩展场景',
}

/**
 * 场景注册表
 *
 * key = 场景名（如 'BasicForm'），value = { group, loader }
 * 使用懒加载（dynamic import）避免一次性加载所有场景配置。
 */
export const sceneRegistry: Record<string, { group: string, loader: () => Promise<{ default: import('./types').SceneConfig }> }> = {
  /* 01-basic */
  BasicForm: { group: '01-basic', loader: () => import('./01-basic/BasicForm') },
  LayoutForm: { group: '01-basic', loader: () => import('./01-basic/LayoutForm') },
  BasicValidationForm: { group: '01-basic', loader: () => import('./01-basic/BasicValidationForm') },
  DefaultValueForm: { group: '01-basic', loader: () => import('./01-basic/DefaultValueForm') },

  /* 02-linkage */
  VisibilityLinkageForm: { group: '02-linkage', loader: () => import('./02-linkage/VisibilityLinkageForm') },
  ValueLinkageForm: { group: '02-linkage', loader: () => import('./02-linkage/ValueLinkageForm') },
  PropertyLinkageForm: { group: '02-linkage', loader: () => import('./02-linkage/PropertyLinkageForm') },
  CascadeSelectForm: { group: '02-linkage', loader: () => import('./02-linkage/CascadeSelectForm') },
  ComputedFieldForm: { group: '02-linkage', loader: () => import('./02-linkage/ComputedFieldForm') },
  ConditionalRequiredForm: { group: '02-linkage', loader: () => import('./02-linkage/ConditionalRequiredForm') },

  /* 03-validation */
  AsyncValidationForm: { group: '03-validation', loader: () => import('./03-validation/AsyncValidationForm') },
  CrossFieldValidationForm: { group: '03-validation', loader: () => import('./03-validation/CrossFieldValidationForm') },
  CustomValidationForm: { group: '03-validation', loader: () => import('./03-validation/CustomValidationForm') },

  /* 04-complex-data */
  ArrayFieldForm: { group: '04-complex-data', loader: () => import('./04-complex-data/ArrayFieldForm') },
  EditableTableForm: { group: '04-complex-data', loader: () => import('./04-complex-data/EditableTableForm') },
  NestedObjectForm: { group: '04-complex-data', loader: () => import('./04-complex-data/NestedObjectForm') },
  ObjectArrayNestedForm: { group: '04-complex-data', loader: () => import('./04-complex-data/ObjectArrayNestedForm') },

  /* 05-datasource */
  AsyncOptionsForm: { group: '05-datasource', loader: () => import('./05-datasource/AsyncOptionsForm') },
  DependentDataSourceForm: { group: '05-datasource', loader: () => import('./05-datasource/DependentDataSourceForm') },
  PaginatedSearchForm: { group: '05-datasource', loader: () => import('./05-datasource/PaginatedSearchForm') },

  /* 06-layout */
  CardGroupForm: { group: '06-layout', loader: () => import('./06-layout/CardGroupForm') },
  CollapseGroupForm: { group: '06-layout', loader: () => import('./06-layout/CollapseGroupForm') },
  StepForm: { group: '06-layout', loader: () => import('./06-layout/StepForm') },
  TabGroupForm: { group: '06-layout', loader: () => import('./06-layout/TabGroupForm') },

  /* 07-dynamic */
  DynamicFieldForm: { group: '07-dynamic', loader: () => import('./07-dynamic/DynamicFieldForm') },
  DynamicSchemaForm: { group: '07-dynamic', loader: () => import('./07-dynamic/DynamicSchemaForm') },
  TemplateReuseForm: { group: '07-dynamic', loader: () => import('./07-dynamic/TemplateReuseForm') },

  /* 08-components */
  CodeEditorForm: { group: '08-components', loader: () => import('./08-components/CodeEditorForm') },
  ColorPickerForm: { group: '08-components', loader: () => import('./08-components/ColorPickerForm') },
  CronEditorForm: { group: '08-components', loader: () => import('./08-components/CronEditorForm') },
  FileUploadForm: { group: '08-components', loader: () => import('./08-components/FileUploadForm') },
  IconSelectorForm: { group: '08-components', loader: () => import('./08-components/IconSelectorForm') },
  JsonEditorForm: { group: '08-components', loader: () => import('./08-components/JsonEditorForm') },
  MapPickerForm: { group: '08-components', loader: () => import('./08-components/MapPickerForm') },
  MarkdownEditorForm: { group: '08-components', loader: () => import('./08-components/MarkdownEditorForm') },
  RichTextForm: { group: '08-components', loader: () => import('./08-components/RichTextForm') },
  SignaturePadForm: { group: '08-components', loader: () => import('./08-components/SignaturePadForm') },
  TransferForm: { group: '08-components', loader: () => import('./08-components/TransferForm') },
  TreeSelectForm: { group: '08-components', loader: () => import('./08-components/TreeSelectForm') },

  /* 09-state */
  DataTransformForm: { group: '09-state', loader: () => import('./09-state/DataTransformForm') },
  FormSnapshotForm: { group: '09-state', loader: () => import('./09-state/FormSnapshotForm') },
  LifecycleForm: { group: '09-state', loader: () => import('./09-state/LifecycleForm') },
  MultiFormForm: { group: '09-state', loader: () => import('./09-state/MultiFormForm') },
  UndoRedoForm: { group: '09-state', loader: () => import('./09-state/UndoRedoForm') },

  /* 10-misc */
  FormDiffForm: { group: '10-misc', loader: () => import('./10-misc/FormDiffForm') },
  I18nForm: { group: '10-misc', loader: () => import('./10-misc/I18nForm') },
  PermissionForm: { group: '10-misc', loader: () => import('./10-misc/PermissionForm') },
  PrintExportForm: { group: '10-misc', loader: () => import('./10-misc/PrintExportForm') },

  /* 11-advanced */
  CustomDecoratorForm: { group: '11-advanced', loader: () => import('./11-advanced/CustomDecoratorForm') },
  EffectsForm: { group: '11-advanced', loader: () => import('./11-advanced/EffectsForm') },
  GridLayoutForm: { group: '11-advanced', loader: () => import('./11-advanced/GridLayoutForm') },
  LargeFormPerf: { group: '11-advanced', loader: () => import('./11-advanced/LargeFormPerf') },
  OneOfSchemaForm: { group: '11-advanced', loader: () => import('./11-advanced/OneOfSchemaForm') },
  SchemaExpressionForm: { group: '11-advanced', loader: () => import('./11-advanced/SchemaExpressionForm') },
  SSRCompatForm: { group: '11-advanced', loader: () => import('./11-advanced/SSRCompatForm') },
  VirtualScrollForm: { group: '11-advanced', loader: () => import('./11-advanced/VirtualScrollForm') },
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
