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
  '08-advanced': '进阶能力',
  '09-state': '状态管理',
}

/**
 * 场景注册表
 *
 * 33 个核心场景，覆盖所有已实现的核心功能。
 * 包含基础、联动、验证、复杂数据、数据源、布局、动态表单、进阶能力、状态管理。
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

  /* 07-dynamic — 动态表单（1 个，保留有实际交互的） */
  DynamicFieldForm: { group: '07-dynamic', loader: () => import('./07-dynamic/DynamicFieldForm') },

  /* 08-advanced — 进阶能力（8 个） */
  SchemaExpressionForm: { group: '08-advanced', loader: () => import('./11-advanced/SchemaExpressionForm') },
  ExpressionEngineForm: { group: '08-advanced', loader: () => import('./11-advanced/ExpressionEngineForm') },
  SchemaRefForm: { group: '08-advanced', loader: () => import('./11-advanced/SchemaRefForm') },
  EffectsForm: { group: '08-advanced', loader: () => import('./11-advanced/EffectsForm') },
  CustomDecoratorForm: { group: '08-advanced', loader: () => import('./11-advanced/CustomDecoratorForm') },
  OneOfSchemaForm: { group: '08-advanced', loader: () => import('./11-advanced/OneOfSchemaForm') },
  EffectsAPIForm: { group: '08-advanced', loader: () => import('./11-advanced/EffectsAPIForm') },

  /* 09-state — 状态管理（2 个） */
  LifecycleForm: { group: '09-state', loader: () => import('./09-state/LifecycleForm') },
  FormSnapshotForm: { group: '09-state', loader: () => import('./09-state/FormSnapshotForm') },
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
