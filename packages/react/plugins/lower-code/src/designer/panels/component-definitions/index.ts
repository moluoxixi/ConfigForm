import type { LowCodeDesignerComponentDefinition, LowCodeDesignerEditableProp } from '../../types'

const InputDefinition: LowCodeDesignerComponentDefinition = {
  label: '输入框',
  description: '用于单行文本输入，适合账号、标题、关键字等短文本。',
  fieldType: 'string',
  defaultProps: {
    placeholder: '请输入',
  },
  editableProps: [
    {
      key: 'placeholder',
      label: '占位提示',
      editor: 'text',
      defaultValue: '请输入',
    },
    {
      key: 'maxLength',
      label: '最大长度',
      editor: 'number',
    },
    {
      key: 'allowClear',
      label: '允许清空',
      editor: 'switch',
      defaultValue: true,
    },
  ],
}

const TextareaDefinition: LowCodeDesignerComponentDefinition = {
  label: '多行文本',
  description: '用于多行文本输入，适合备注、描述等内容。',
  fieldType: 'string',
  defaultProps: {
    placeholder: '请输入',
    rows: 3,
  },
  editableProps: [
    {
      key: 'placeholder',
      label: '占位提示',
      editor: 'text',
      defaultValue: '请输入',
    },
    {
      key: 'rows',
      label: '行数',
      editor: 'number',
      defaultValue: 3,
    },
    {
      key: 'maxLength',
      label: '最大长度',
      editor: 'number',
    },
    {
      key: 'allowClear',
      label: '允许清空',
      editor: 'switch',
      defaultValue: true,
    },
  ],
}

const SelectDefinition: LowCodeDesignerComponentDefinition = {
  label: '下拉选择',
  description: '用于选择枚举数据，支持单选/多选与搜索。',
  fieldType: 'string',
  defaultProps: {
    placeholder: '请选择',
    allowClear: true,
  },
  editableProps: [
    {
      key: 'placeholder',
      label: '占位提示',
      editor: 'text',
      defaultValue: '请选择',
    },
    {
      key: 'allowClear',
      label: '允许清空',
      editor: 'switch',
      defaultValue: true,
    },
    {
      key: 'mode',
      label: '选择模式',
      editor: 'select',
      options: [
        { label: '单选', value: '' },
        { label: '多选', value: 'multiple' },
        { label: '标签', value: 'tags' },
      ],
    },
  ],
}

const InputNumberDefinition: LowCodeDesignerComponentDefinition = {
  label: '数字输入',
  description: '用于数值输入，支持最小/最大值与步进。',
  fieldType: 'number',
  defaultProps: {
    min: 0,
  },
  editableProps: [
    {
      key: 'min',
      label: '最小值',
      editor: 'number',
      defaultValue: 0,
    },
    {
      key: 'max',
      label: '最大值',
      editor: 'number',
    },
    {
      key: 'step',
      label: '步长',
      editor: 'number',
      defaultValue: 1,
    },
  ],
}

const SwitchDefinition: LowCodeDesignerComponentDefinition = {
  label: '开关',
  description: '用于布尔值开关。',
  fieldType: 'boolean',
  defaultProps: {},
  editableProps: [
    {
      key: 'checkedChildren',
      label: '开启文案',
      editor: 'text',
    },
    {
      key: 'unCheckedChildren',
      label: '关闭文案',
      editor: 'text',
    },
  ],
}

const DatePickerDefinition: LowCodeDesignerComponentDefinition = {
  label: '日期选择',
  description: '用于日期选择，支持格式配置。',
  fieldType: 'date',
  defaultProps: {
    placeholder: '请选择日期',
  },
  editableProps: [
    {
      key: 'placeholder',
      label: '占位提示',
      editor: 'text',
      defaultValue: '请选择日期',
    },
    {
      key: 'format',
      label: '显示格式',
      editor: 'text',
      defaultValue: 'YYYY-MM-DD',
    },
  ],
}

export const BUILTIN_RIGHT_COMPONENT_DEFINITIONS: Record<string, LowCodeDesignerComponentDefinition> = {
  Input: InputDefinition,
  Textarea: TextareaDefinition,
  Select: SelectDefinition,
  InputNumber: InputNumberDefinition,
  Switch: SwitchDefinition,
  DatePicker: DatePickerDefinition,
}

function cloneEditableProp(editableProp: LowCodeDesignerEditableProp): LowCodeDesignerEditableProp {
  return {
    ...editableProp,
    options: editableProp.options?.map(option => ({ ...option })),
  }
}

function mergeEditableProps(
  base: LowCodeDesignerEditableProp[] | undefined,
  override: LowCodeDesignerEditableProp[] | undefined,
): LowCodeDesignerEditableProp[] | undefined {
  if (!base && !override)
    return undefined

  const mergedMap = new Map<string, LowCodeDesignerEditableProp>()
  for (const editableProp of base ?? [])
    mergedMap.set(editableProp.key, cloneEditableProp(editableProp))

  for (const editableProp of override ?? []) {
    const prev = mergedMap.get(editableProp.key)
    if (!prev) {
      mergedMap.set(editableProp.key, cloneEditableProp(editableProp))
      continue
    }

    mergedMap.set(editableProp.key, {
      ...prev,
      ...editableProp,
      options: editableProp.options
        ? editableProp.options.map(option => ({ ...option }))
        : prev.options,
    })
  }

  return Array.from(mergedMap.values())
}

function mergeDefinition(
  base: LowCodeDesignerComponentDefinition | undefined,
  override: LowCodeDesignerComponentDefinition | undefined,
): LowCodeDesignerComponentDefinition {
  return {
    ...base,
    ...override,
    defaultProps: {
      ...(base?.defaultProps ?? {}),
      ...(override?.defaultProps ?? {}),
    },
    editableProps: mergeEditableProps(base?.editableProps, override?.editableProps),
  }
}

export function mergeDesignerComponentDefinitions(
  customDefinitions: Record<string, LowCodeDesignerComponentDefinition> | undefined,
): Record<string, LowCodeDesignerComponentDefinition> {
  const allNames = new Set<string>([
    ...Object.keys(BUILTIN_RIGHT_COMPONENT_DEFINITIONS),
    ...Object.keys(customDefinitions ?? {}),
  ])

  const merged: Record<string, LowCodeDesignerComponentDefinition> = {}
  for (const name of allNames) {
    merged[name] = mergeDefinition(
      BUILTIN_RIGHT_COMPONENT_DEFINITIONS[name],
      customDefinitions?.[name],
    )
  }

  return merged
}
