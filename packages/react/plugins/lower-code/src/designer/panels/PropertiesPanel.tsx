import type {
  DesignerContainerNode,
  DesignerFieldComponent,
  DesignerFieldNode,
  DesignerFieldType,
  DesignerFormConfig,
  DesignerNode,
  DesignerSectionNode,
} from '@moluoxixi/plugin-lower-code-core'
import type React from 'react'
import type {
  LowCodeDesignerComponentDefinition,
  LowCodeDesignerDecoratorDefinition,
  LowCodeDesignerEditableProp,
} from '../types'
import {
  addSectionToContainer,
  containerUsesSections,
  defaultComponentForType,
  normalizeNode,
  parseEnumDraft,
  removeSectionFromContainer,
  updateSectionById,
} from '@moluoxixi/plugin-lower-code-core'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

interface PropertiesPanelProps {
  nodes: DesignerNode[]
  selectedField: DesignerFieldNode | null
  selectedContainer: DesignerContainerNode | null
  selectedSection: DesignerSectionNode | null
  tab?: 'component' | 'form'
  readonly?: boolean
  enumDraft: string
  setEnumDraft: (value: string) => void
  onUpdateNodes: (updater: (prev: DesignerNode[]) => DesignerNode[]) => void
  updateField: (nodeId: string, updater: (field: DesignerFieldNode) => DesignerFieldNode) => void
  updateContainer: (nodeId: string, updater: (container: DesignerContainerNode) => DesignerContainerNode) => void
  fieldComponentOptions: string[]
  componentDefinitions?: Record<string, LowCodeDesignerComponentDefinition>
  decoratorDefinitions?: Record<string, LowCodeDesignerDecoratorDefinition>
  componentPropsByComponent: Record<string, Record<string, unknown>>
  onUpdateComponentPropByComponentName: (componentName: string, propKey: string, value: unknown) => void
  decoratorOptions: string[]
  defaultDecoratorsByComponent?: Record<string, string>
  formConfig: DesignerFormConfig
  onUpdateFormConfig: (updater: (prev: DesignerFormConfig) => DesignerFormConfig) => void
}

export function PropertiesPanel(props: PropertiesPanelProps): React.ReactElement {
  const {
    nodes,
    selectedField,
    selectedContainer,
    selectedSection,
    tab,
    readonly = false,
    enumDraft,
    setEnumDraft,
    onUpdateNodes,
    updateField,
    updateContainer,
    fieldComponentOptions,
    componentDefinitions,
    decoratorDefinitions,
    componentPropsByComponent,
    onUpdateComponentPropByComponentName,
    decoratorOptions,
    defaultDecoratorsByComponent,
    formConfig,
    onUpdateFormConfig,
  } = props

  const [defaultDraft, setDefaultDraft] = useState('')
  const [rulesDraft, setRulesDraft] = useState('')
  const [reactionsDraft, setReactionsDraft] = useState('')
  const [dataSourceDraft, setDataSourceDraft] = useState('')
  const [componentPropsDraft, setComponentPropsDraft] = useState('')
  const [decoratorPropsDraft, setDecoratorPropsDraft] = useState('')
  const [validateTriggerDraft, setValidateTriggerDraft] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const scrollHostRef = useRef<HTMLDivElement | null>(null)
  const lastScrollTopRef = useRef(0)
  const restoringScrollRef = useRef(false)

  const resolvedTab = tab ?? 'component'
  const hasSelection = Boolean(selectedField || selectedContainer || selectedSection)

  const renderEmptyHint = (): React.ReactElement => (
    <div className="cf-lc-empty-hint">
      选择画布中的字段、容器或分组后，在这里编辑属性。
    </div>
  )

  const formatJson = (value: unknown): string => {
    if (value === undefined)
      return ''
    try {
      return JSON.stringify(value, null, 2)
    }
    catch {
      return ''
    }
  }

  const parseJsonDraft = (draft: string): { ok: boolean, value?: unknown } => {
    const trimmed = draft.trim()
    if (!trimmed)
      return { ok: true, value: undefined }
    try {
      return { ok: true, value: JSON.parse(trimmed) }
    }
    catch {
      return { ok: false }
    }
  }

  const normalizeValidateTrigger = (draft: string): DesignerFieldNode['validateTrigger'] => {
    const trimmed = draft.trim()
    if (!trimmed)
      return undefined
    const parts = trimmed.split(',').map(item => item.trim()).filter(Boolean)
    if (parts.length <= 1)
      return parts[0] as DesignerFieldNode['validateTrigger']
    return parts as DesignerFieldNode['validateTrigger']
  }

  const resolveTypeByComponent = (
    component: DesignerFieldComponent,
    fallback: DesignerFieldType,
  ): DesignerFieldType => {
    const definition = componentDefinitions?.[component]
    return definition?.fieldType ?? fallback
  }

  const selectableComponents = selectedField
    ? Array.from(new Set([selectedField.component, ...fieldComponentOptions]))
    : fieldComponentOptions

  const selectedFieldDefinition = selectedField
    ? componentDefinitions?.[selectedField.component] ?? null
    : null
  const componentEditableProps = selectedFieldDefinition?.editableProps ?? []

  const resolvedDecoratorName = selectedField
    ? (selectedField.decorator || defaultDecoratorsByComponent?.[selectedField.component] || '')
    : ''
  const selectedDecoratorDefinition = resolvedDecoratorName
    ? decoratorDefinitions?.[resolvedDecoratorName] ?? null
    : null
  const decoratorEditableProps = selectedDecoratorDefinition?.editableProps ?? []

  const readEditablePropValue = (
    field: DesignerFieldNode,
    editableProp: LowCodeDesignerEditableProp,
  ): unknown => {
    const preset = componentPropsByComponent[field.component] ?? {}
    if (editableProp.key in preset)
      return preset[editableProp.key]
    return selectedFieldDefinition?.defaultProps?.[editableProp.key]
  }

  const readDecoratorPropValue = (
    field: DesignerFieldNode,
    editableProp: LowCodeDesignerEditableProp,
  ): unknown => {
    const propValue = field.decoratorProps?.[editableProp.key]
    if (propValue !== undefined)
      return propValue
    const decoratorName = field.decorator || defaultDecoratorsByComponent?.[field.component] || ''
    const definition = decoratorName ? decoratorDefinitions?.[decoratorName] : undefined
    return definition?.defaultProps?.[editableProp.key]
  }

  useEffect(() => {
    if (!selectedField) {
      setDefaultDraft('')
      setRulesDraft('')
      setReactionsDraft('')
      setDataSourceDraft('')
      setComponentPropsDraft('')
      setDecoratorPropsDraft('')
      setValidateTriggerDraft('')
      return
    }
    setDefaultDraft(formatJson(selectedField.defaultValue))
    setRulesDraft(formatJson(selectedField.rules ?? []))
    setReactionsDraft(formatJson(selectedField.reactions ?? []))
    setDataSourceDraft(formatJson(selectedField.dataSource))
    setComponentPropsDraft(formatJson(selectedField.componentProps ?? {}))
    setDecoratorPropsDraft(formatJson(selectedField.decoratorProps ?? {}))
    const trigger = selectedField.validateTrigger
    setValidateTriggerDraft(Array.isArray(trigger) ? trigger.join(',') : (trigger ?? ''))
  }, [selectedField?.id])

  useLayoutEffect(() => {
    const host = scrollHostRef.current
    if (!host)
      return
    restoringScrollRef.current = true
    host.scrollTop = lastScrollTopRef.current
    const frame = requestAnimationFrame(() => {
      restoringScrollRef.current = false
    })
    return () => cancelAnimationFrame(frame)
  }, [resolvedTab, selectedField?.id, selectedContainer?.id, selectedSection?.id])

  const updateFieldComponentProp = (propKey: string, value: unknown): void => {
      if (!selectedField)
        return
      onUpdateComponentPropByComponentName(selectedField.component, propKey, value)
    }

  const updateFieldDecoratorProp = (propKey: string, value: unknown): void => {
    if (!selectedField)
      return
    updateField(selectedField.id, (field) => {
      const nextProps = { ...(field.decoratorProps ?? {}) }
      if (value === undefined || value === '')
        delete nextProps[propKey]
      else
        nextProps[propKey] = value
      return {
        ...field,
        decoratorProps: Object.keys(nextProps).length > 0 ? nextProps : undefined,
      }
    })
  }

  const updateFormConfigState = (patch: Partial<DesignerFormConfig>): void => {
    onUpdateFormConfig(prev => ({ ...prev, ...patch }))
  }

  const parseNumberish = (value: string): number | string | undefined => {
    const trimmed = value.trim()
    if (!trimmed)
      return undefined
    const numeric = Number(trimmed)
    if (!Number.isNaN(numeric))
      return numeric
    return trimmed
  }

  const parseNumber = (value: string): number | undefined => {
    const trimmed = value.trim()
    if (!trimmed)
      return undefined
    const numeric = Number(trimmed)
    return Number.isNaN(numeric) ? undefined : numeric
  }

  const updateLocalComponentProp = (propKey: string, value: unknown): void => {
    if (!selectedField)
      return
    updateField(selectedField.id, (field) => {
      const nextProps = { ...(field.componentProps ?? {}) }
      if (value === undefined || value === '')
        delete nextProps[propKey]
      else
        nextProps[propKey] = value
      return {
        ...field,
        componentProps: nextProps,
      }
    })
  }

  const readStyleValue = (key: string): string => {
    if (!selectedField)
      return ''
    const style = selectedField.componentProps?.style
    if (!style || typeof style !== 'object' || Array.isArray(style))
      return ''
    const value = (style as Record<string, unknown>)[key]
    if (value === undefined || value === null)
      return ''
    return String(value)
  }

  const updateStyleValue = (key: string, value: string): void => {
    if (!selectedField)
      return
    updateField(selectedField.id, (field) => {
      const style = field.componentProps?.style
      const nextStyle: Record<string, unknown> = (!style || typeof style !== 'object' || Array.isArray(style))
        ? {}
        : { ...(style as Record<string, unknown>) }
      const trimmed = value.trim()
      if (!trimmed)
        delete nextStyle[key]
      else
        nextStyle[key] = trimmed

      const nextProps = { ...(field.componentProps ?? {}) }
      if (Object.keys(nextStyle).length === 0)
        delete nextProps.style
      else
        nextProps.style = nextStyle

      return {
        ...field,
        componentProps: nextProps,
      }
    })
  }

  const renderDefaultValueEditor = (): React.ReactElement | null => {
    if (!selectedField)
      return null
    const resolvedType = resolveTypeByComponent(selectedField.component, selectedField.type)
    const currentDefault = selectedField.defaultValue

    if (resolvedType === 'number') {
      return (
        <label className="cf-lc-control-label">
          默认值
          <input
            className="cf-lc-control-input"
            type="number"
            value={typeof currentDefault === 'number' ? String(currentDefault) : ''}
            onChange={(event) => {
              const draft = event.target.value.trim()
              updateField(selectedField.id, field => ({
                ...field,
                defaultValue: draft ? Number(draft) : undefined,
              }))
            }}
          />
        </label>
      )
    }

    if (resolvedType === 'boolean') {
      return (
        <label className="cf-lc-inline-checkbox">
          <input
            type="checkbox"
            checked={Boolean(currentDefault)}
            onChange={event => updateField(selectedField.id, field => ({ ...field, defaultValue: event.target.checked }))} />
          默认值
        </label>
      )
    }

    if (resolvedType === 'date') {
      return (
        <label className="cf-lc-control-label">
          默认值
          <input
            className="cf-lc-control-input"
            type="date"
            value={typeof currentDefault === 'string' ? currentDefault : ''}
            onChange={event => updateField(selectedField.id, field => ({ ...field, defaultValue: event.target.value || undefined }))}
          />
        </label>
      )
    }

    if (selectedField.component === 'Select' && selectedField.enumOptions.length > 0) {
      return (
        <label className="cf-lc-control-label">
          默认值
          <select
            className="cf-lc-control-select"
            value={typeof currentDefault === 'string' ? currentDefault : ''}
            onChange={event => updateField(selectedField.id, field => ({ ...field, defaultValue: event.target.value || undefined }))}
          >
            <option value="">请选择</option>
            {selectedField.enumOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      )
    }

    return (
      <label className="cf-lc-control-label">
        默认值
        <input
          className="cf-lc-control-input"
          value={typeof currentDefault === 'string' ? currentDefault : ''}
          onChange={event => updateField(selectedField.id, field => ({ ...field, defaultValue: event.target.value || undefined }))}
        />
      </label>
    )
  }

  const renderFormConfig = (): React.ReactElement => (
    <div className="cf-lc-property-form">
      <div className="cf-lc-property-section">
        <div className="cf-lc-property-section-title">表单基础</div>
        <label className="cf-lc-control-label">
          表单模式
          <select
            className="cf-lc-control-select"
            value={formConfig.pattern}
            onChange={event => updateFormConfigState({ pattern: event.target.value as DesignerFormConfig['pattern'] })}
          >
            <option value="default">默认（可编辑）</option>
            <option value="editable">可编辑</option>
            <option value="preview">预览</option>
            <option value="disabled">禁用</option>
          </select>
        </label>

        <label className="cf-lc-control-label">
          标签位置
          <div className="cf-lc-segment">
            {(['top', 'left', 'right'] as const).map(option => (
              <button
                key={option}
                type="button"
                className={`cf-lc-segment-button${formConfig.labelPosition === option ? ' is-active' : ''}`}
                onClick={() => updateFormConfigState({ labelPosition: option })}
              >
                {option === 'top' ? '上' : option === 'left' ? '左' : '右'}
              </button>
            ))}
          </div>
        </label>

        <label className="cf-lc-control-label">
          标签宽度
          <input
            className="cf-lc-control-input"
            value={formConfig.labelWidth ?? ''}
            placeholder="例如 96 或 96px"
            onChange={event => updateFormConfigState({ labelWidth: parseNumberish(event.target.value) })}
          />
        </label>

        <label className="cf-lc-control-label">
          校验触发
          <select
            className="cf-lc-control-select"
            value={formConfig.validateTrigger}
            onChange={event => updateFormConfigState({ validateTrigger: event.target.value as DesignerFormConfig['validateTrigger'] })}
          >
            <option value="default">默认</option>
            <option value="change">change</option>
            <option value="blur">blur</option>
            <option value="submit">submit</option>
          </select>
        </label>
      </div>

      <div className="cf-lc-property-section">
        <div className="cf-lc-property-section-title">布局设置</div>
        <label className="cf-lc-control-label">
          布局模式
          <select
            className="cf-lc-control-select"
            value={formConfig.layoutType}
            onChange={event => updateFormConfigState({ layoutType: event.target.value as DesignerFormConfig['layoutType'] })}
          >
            <option value="default">默认</option>
            <option value="grid">网格</option>
            <option value="inline">行内</option>
          </select>
        </label>

        {formConfig.layoutType === 'grid' && (
          <div className="cf-lc-control-grid">
            <label className="cf-lc-control-label cf-lc-control-label--compact">
              列数
              <input
                className="cf-lc-control-input"
                type="number"
                value={formConfig.layoutColumns ?? ''}
                onChange={event => updateFormConfigState({ layoutColumns: parseNumber(event.target.value) })}
              />
            </label>
            <label className="cf-lc-control-label cf-lc-control-label--compact">
              列间距
              <input
                className="cf-lc-control-input"
                type="number"
                value={formConfig.layoutGutter ?? ''}
                onChange={event => updateFormConfigState({ layoutGutter: parseNumber(event.target.value) })}
              />
            </label>
          </div>
        )}

        {formConfig.layoutType === 'inline' && (
          <label className="cf-lc-control-label">
            行内间距
            <input
              className="cf-lc-control-input"
              type="number"
              value={formConfig.layoutGap ?? ''}
              onChange={event => updateFormConfigState({ layoutGap: parseNumber(event.target.value) })}
            />
          </label>
        )}
      </div>

      <div className="cf-lc-property-section">
        <div className="cf-lc-property-section-title">操作区</div>
        <label className="cf-lc-inline-checkbox">
          <input
            type="checkbox"
            checked={formConfig.showSubmit}
            onChange={event => updateFormConfigState({ showSubmit: event.target.checked })}
          />
          显示提交按钮
        </label>
        <label className="cf-lc-inline-checkbox">
          <input
            type="checkbox"
            checked={formConfig.showReset}
            onChange={event => updateFormConfigState({ showReset: event.target.checked })}
          />
          显示重置按钮
        </label>
        <label className="cf-lc-control-label">
          提交文案
          <input
            className="cf-lc-control-input"
            value={formConfig.submitText ?? ''}
            onChange={event => updateFormConfigState({ submitText: event.target.value })}
            disabled={!formConfig.showSubmit}
          />
        </label>
        <label className="cf-lc-control-label">
          重置文案
          <input
            className="cf-lc-control-input"
            value={formConfig.resetText ?? ''}
            onChange={event => updateFormConfigState({ resetText: event.target.value })}
            disabled={!formConfig.showReset}
          />
        </label>
        <label className="cf-lc-control-label">
          对齐方式
          <select
            className="cf-lc-control-select"
            value={formConfig.actionsAlign}
            onChange={event => updateFormConfigState({ actionsAlign: event.target.value as DesignerFormConfig['actionsAlign'] })}
          >
            <option value="left">居左</option>
            <option value="center">居中</option>
            <option value="right">居右</option>
          </select>
        </label>
      </div>
    </div>
  )

  return (
    <div
      className="cf-lc-side-scroll"
      ref={scrollHostRef}
      onScroll={(event) => {
        if (restoringScrollRef.current)
          return
        const target = event.currentTarget
        lastScrollTopRef.current = target.scrollTop
      }}
    >
      <fieldset className="cf-lc-property-fieldset" disabled={readonly}>
      {resolvedTab === 'form' && renderFormConfig()}
      {resolvedTab === 'component' && (
            <>
              {selectedField && (
                <div className="cf-lc-property-form">
              <div className="cf-lc-property-section">
                <div className="cf-lc-property-section-title">基础信息</div>
                <label className="cf-lc-control-label">
                  字段标题（Label）
                  <input
                    className="cf-lc-control-input"
                    value={selectedField.title}
                    onChange={event => updateField(selectedField.id, field => ({ ...field, title: event.target.value || field.title }))}
                  />
                </label>

                <label className="cf-lc-control-label">
                  字段标识（Name）
                  <input
                    className="cf-lc-control-input"
                    value={selectedField.name}
                    onChange={event => updateField(selectedField.id, field => normalizeNode({ ...field, name: event.target.value }, nodes) as DesignerFieldNode)}
                  />
                </label>

              </div>

              <div className="cf-lc-property-section">
                <div className="cf-lc-property-section-title">渲染设置</div>
                <div className="cf-lc-property-readonly">
                  数据类型：
                  {' '}
                  <code>{resolveTypeByComponent(selectedField.component, selectedField.type)}</code>
                </div>

                <label className="cf-lc-control-label">
                  渲染组件
                  <select
                    className="cf-lc-control-select"
                    value={selectedField.component}
                    onChange={(event) => {
                      const component = event.target.value as DesignerFieldComponent
                      const nextType = resolveTypeByComponent(component, selectedField.type)
                      const nextComponentProps = component === selectedField.component
                        ? selectedField.componentProps
                        : resolveComponentPreset(component)
                      updateField(selectedField.id, field => normalizeNode({
                        ...field,
                        component,
                        type: nextType,
                        componentProps: nextComponentProps,
                      }, nodes) as DesignerFieldNode)
                    }}
                  >
                    {selectableComponents.map(component => (
                      <option key={component} value={component}>
                        {component}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="cf-lc-inline-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedField.required}
                    onChange={event => updateField(selectedField.id, field => ({ ...field, required: event.target.checked }))}
                  />
                  必填字段
                </label>
              </div>

              <div className="cf-lc-property-section">
                <div className="cf-lc-property-section-title">显示与状态</div>
                <label className="cf-lc-inline-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedField.visible !== false}
                    onChange={event => updateField(selectedField.id, field => ({ ...field, visible: event.target.checked }))}
                  />
                  可见
                </label>
                <label className="cf-lc-inline-checkbox">
                  <input
                    type="checkbox"
                    checked={Boolean(selectedField.disabled)}
                    onChange={event => updateField(selectedField.id, field => ({ ...field, disabled: event.target.checked }))}
                  />
                  禁用
                </label>
                <label className="cf-lc-inline-checkbox">
                  <input
                    type="checkbox"
                    checked={Boolean(selectedField.preview)}
                    onChange={event => updateField(selectedField.id, field => ({ ...field, preview: event.target.checked }))}
                  />
                  预览态
                </label>
                <label className="cf-lc-control-label">
                  字段模式
                  <select
                    className="cf-lc-control-select"
                    value={selectedField.pattern ?? ''}
                    onChange={(event) => {
                      const value = event.target.value
                      updateField(selectedField.id, field => ({ ...field, pattern: value ? (value as DesignerFieldNode['pattern']) : undefined }))
                    }}
                  >
                    <option value="">默认（可编辑）</option>
                    <option value="editable">可编辑</option>
                    <option value="disabled">禁用</option>
                    <option value="preview">预览</option>
                  </select>
                </label>
              </div>

              <div className="cf-lc-property-section">
                <div className="cf-lc-property-section-title">默认值与提交</div>
                {renderDefaultValueEditor()}
                <label className="cf-lc-control-label">
                  提交路径
                  <input
                    className="cf-lc-control-input"
                    value={selectedField.submitPath ?? ''}
                    onChange={event => updateField(selectedField.id, field => ({ ...field, submitPath: event.target.value || undefined }))}
                  />
                </label>
                <label className="cf-lc-inline-checkbox">
                  <input
                    type="checkbox"
                    checked={Boolean(selectedField.excludeWhenHidden)}
                    onChange={event => updateField(selectedField.id, field => ({ ...field, excludeWhenHidden: event.target.checked }))}
                  />
                  隐藏时不提交
                </label>
                <label className="cf-lc-control-label">
                  显示格式化（表达式）
                  <input
                    className="cf-lc-control-input"
                    value={selectedField.displayFormat ?? ''}
                    onChange={event => updateField(selectedField.id, field => ({ ...field, displayFormat: event.target.value || undefined }))}
                  />
                </label>
                <label className="cf-lc-control-label">
                  输入解析（表达式）
                  <input
                    className="cf-lc-control-input"
                    value={selectedField.inputParse ?? ''}
                    onChange={event => updateField(selectedField.id, field => ({ ...field, inputParse: event.target.value || undefined }))}
                  />
                </label>
                <label className="cf-lc-control-label">
                  提交转换（表达式）
                  <input
                    className="cf-lc-control-input"
                    value={selectedField.submitTransform ?? ''}
                    onChange={event => updateField(selectedField.id, field => ({ ...field, submitTransform: event.target.value || undefined }))}
                  />
                </label>
              </div>

              {selectedField.component === 'Select' && (
                <div className="cf-lc-property-section">
                  <div className="cf-lc-property-section-title">选项配置</div>
                  <label className="cf-lc-control-label">
                    枚举选项（label:value 每行一项）
                    <textarea
                      className="cf-lc-control-textarea cf-lc-control-textarea--code"
                      value={enumDraft}
                      onChange={(event) => {
                        const text = event.target.value
                        setEnumDraft(text)
                        updateField(selectedField.id, field => ({
                          ...field,
                          enumOptions: parseEnumDraft(text),
                        }))
                      }}
                    />
                  </label>
                </div>
              )}

              <div className="cf-lc-property-section">
                <div className="cf-lc-property-section-title">高级配置</div>
                <button
                  type="button"
                  className="cf-lc-btn"
                  onClick={() => setShowAdvanced(prev => !prev)}
                >
                  {showAdvanced ? '收起高级配置' : '展开高级配置'}
                </button>
              </div>

              {showAdvanced && (
                <>
                  <div className="cf-lc-property-section">
                    <div className="cf-lc-property-section-title">高级默认值</div>
                    <label className="cf-lc-control-label">
                      默认值（JSON）
                      <textarea
                        className="cf-lc-control-textarea cf-lc-control-textarea--code"
                        value={defaultDraft}
                        onChange={event => setDefaultDraft(event.target.value)}
                        onBlur={() => {
                          if (!selectedField)
                            return
                          const parsed = parseJsonDraft(defaultDraft)
                          if (!parsed.ok)
                            return
                          updateField(selectedField.id, field => ({ ...field, defaultValue: parsed.value }))
                        }}
                      />
                    </label>
                  </div>

                  <div className="cf-lc-property-section">
                    <div className="cf-lc-property-section-title">数据源</div>
                    <label className="cf-lc-control-label">
                      dataSource（JSON）
                      <textarea
                        className="cf-lc-control-textarea cf-lc-control-textarea--code"
                        value={dataSourceDraft}
                        onChange={event => setDataSourceDraft(event.target.value)}
                        onBlur={() => {
                          if (!selectedField)
                            return
                          const parsed = parseJsonDraft(dataSourceDraft)
                          if (!parsed.ok)
                            return
                          updateField(selectedField.id, field => ({ ...field, dataSource: parsed.value }))
                        }}
                      />
                    </label>
                  </div>

                  <div className="cf-lc-property-section">
                    <div className="cf-lc-property-section-title">校验规则</div>
                    <label className="cf-lc-control-label">
                      validateTrigger（逗号分隔）
                      <input
                        className="cf-lc-control-input"
                        value={validateTriggerDraft}
                        onChange={event => setValidateTriggerDraft(event.target.value)}
                        onBlur={() => {
                          if (!selectedField)
                            return
                          updateField(selectedField.id, field => ({ ...field, validateTrigger: normalizeValidateTrigger(validateTriggerDraft) }))
                        }}
                      />
                    </label>
                    <label className="cf-lc-control-label">
                      rules（JSON 数组）
                      <textarea
                        className="cf-lc-control-textarea cf-lc-control-textarea--code"
                        value={rulesDraft}
                        onChange={event => setRulesDraft(event.target.value)}
                        onBlur={() => {
                          if (!selectedField)
                            return
                          const parsed = parseJsonDraft(rulesDraft)
                          if (!parsed.ok)
                            return
                          if (parsed.value === undefined) {
                            updateField(selectedField.id, field => ({ ...field, rules: undefined }))
                            return
                          }
                          if (Array.isArray(parsed.value)) {
                            updateField(selectedField.id, field => ({ ...field, rules: parsed.value }))
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div className="cf-lc-property-section">
                    <div className="cf-lc-property-section-title">联动规则</div>
                    <label className="cf-lc-control-label">
                      reactions（JSON 数组）
                      <textarea
                        className="cf-lc-control-textarea cf-lc-control-textarea--code"
                        value={reactionsDraft}
                        onChange={event => setReactionsDraft(event.target.value)}
                        onBlur={() => {
                          if (!selectedField)
                            return
                          const parsed = parseJsonDraft(reactionsDraft)
                          if (!parsed.ok)
                            return
                          if (parsed.value === undefined) {
                            updateField(selectedField.id, field => ({ ...field, reactions: undefined }))
                            return
                          }
                          if (Array.isArray(parsed.value)) {
                            updateField(selectedField.id, field => ({ ...field, reactions: parsed.value }))
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div className="cf-lc-property-section">
                    <div className="cf-lc-property-section-title">装饰器参数</div>
                    <label className="cf-lc-control-label">
                      decoratorProps（JSON）
                      <textarea
                        className="cf-lc-control-textarea cf-lc-control-textarea--code"
                        value={decoratorPropsDraft}
                        onChange={event => setDecoratorPropsDraft(event.target.value)}
                        onBlur={() => {
                          if (!selectedField)
                            return
                          const parsed = parseJsonDraft(decoratorPropsDraft)
                          if (!parsed.ok)
                            return
                          if (parsed.value && typeof parsed.value === 'object' && !Array.isArray(parsed.value)) {
                            updateField(selectedField.id, field => ({ ...field, decoratorProps: parsed.value as Record<string, unknown> }))
                            return
                          }
                          if (parsed.value === undefined) {
                            updateField(selectedField.id, field => ({ ...field, decoratorProps: undefined }))
                          }
                        }}
                      />
                    </label>
                  </div>
                </>
              )}

              <div className="cf-lc-property-section">
                <div className="cf-lc-property-section-title">布局与装饰</div>
                <label className="cf-lc-control-label">
                  栅格占比
                  <input
                    className="cf-lc-control-input"
                    type="number"
                    value={typeof selectedField.span === 'number' ? String(selectedField.span) : ''}
                    onChange={(event) => {
                      const draft = event.target.value.trim()
                      updateField(selectedField.id, field => ({
                        ...field,
                        span: draft ? Number(draft) : undefined,
                      }))
                    }}
                  />
                </label>
                <label className="cf-lc-control-label">
                  排序权重
                  <input
                    className="cf-lc-control-input"
                    type="number"
                    value={typeof selectedField.order === 'number' ? String(selectedField.order) : ''}
                    onChange={(event) => {
                      const draft = event.target.value.trim()
                      updateField(selectedField.id, field => ({
                        ...field,
                        order: draft ? Number(draft) : undefined,
                      }))
                    }}
                  />
                </label>
                <label className="cf-lc-control-label">
                  装饰器
                  <select
                    className="cf-lc-control-select"
                    value={selectedField.decorator ?? ''}
                    onChange={(event) => {
                      const nextDecorator = event.target.value || undefined
                      const nextDefaults = nextDecorator
                        ? (decoratorDefinitions?.[nextDecorator]?.defaultProps ?? {})
                        : {}
                      updateField(selectedField.id, field => ({
                        ...field,
                        decorator: nextDecorator,
                        decoratorProps: nextDecorator && Object.keys(nextDefaults).length > 0
                          ? { ...nextDefaults }
                          : undefined,
                      }))
                      setDecoratorPropsDraft(formatJson(nextDefaults))
                    }}
                  >
                    <option value="">默认</option>
                    {decoratorOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
              </div>

              {decoratorEditableProps.length > 0 && (
                <div className="cf-lc-property-section">
                  <div className="cf-lc-property-section-title">
                    装饰器配置（
                    {resolvedDecoratorName || '默认'}
                    ）
                  </div>
                  {decoratorEditableProps.map((editableProp) => {
                    const editor = editableProp.editor ?? 'text'
                    const propValue = readDecoratorPropValue(selectedField, editableProp)

                    if (editor === 'switch') {
                      return (
                        <label key={editableProp.key} className="cf-lc-inline-checkbox">
                          <input
                            type="checkbox"
                            checked={Boolean(propValue)}
                            onChange={event => updateFieldDecoratorProp(editableProp.key, event.target.checked)}
                          />
                          {editableProp.label}
                        </label>
                      )
                    }

                    if (editor === 'textarea') {
                      return (
                        <label key={editableProp.key} className="cf-lc-control-label">
                          {editableProp.label}
                          <textarea
                            className="cf-lc-control-textarea"
                            value={typeof propValue === 'string' ? propValue : ''}
                            onChange={(event) => {
                              const nextValue = event.target.value
                              updateFieldDecoratorProp(editableProp.key, nextValue || undefined)
                            }}
                          />
                          {editableProp.description && (
                            <span className="cf-lc-property-readonly">{editableProp.description}</span>
                          )}
                        </label>
                      )
                    }

                    if (editor === 'number') {
                      return (
                        <label key={editableProp.key} className="cf-lc-control-label">
                          {editableProp.label}
                          <input
                            className="cf-lc-control-input"
                            type="number"
                            value={typeof propValue === 'number' ? String(propValue) : ''}
                            onChange={(event) => {
                              const draft = event.target.value.trim()
                              if (!draft) {
                                updateFieldDecoratorProp(editableProp.key, undefined)
                                return
                              }
                              const parsed = Number(draft)
                              updateFieldDecoratorProp(editableProp.key, Number.isNaN(parsed) ? undefined : parsed)
                            }}
                          />
                          {editableProp.description && (
                            <span className="cf-lc-property-readonly">{editableProp.description}</span>
                          )}
                        </label>
                      )
                    }

                    if (editor === 'select') {
                      return (
                        <label key={editableProp.key} className="cf-lc-control-label">
                          {editableProp.label}
                          <select
                            className="cf-lc-control-select"
                            value={typeof propValue === 'string' ? propValue : ''}
                            onChange={(event) => {
                              const nextValue = event.target.value
                              updateFieldDecoratorProp(editableProp.key, nextValue || undefined)
                            }}
                          >
                            <option value="">请选择</option>
                            {(editableProp.options ?? []).map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          {editableProp.description && (
                            <span className="cf-lc-property-readonly">{editableProp.description}</span>
                          )}
                        </label>
                      )
                    }

                    return (
                      <label key={editableProp.key} className="cf-lc-control-label">
                        {editableProp.label}
                        <input
                          className="cf-lc-control-input"
                          value={typeof propValue === 'string' ? propValue : ''}
                          onChange={(event) => {
                            const nextValue = event.target.value
                            updateFieldDecoratorProp(editableProp.key, nextValue || undefined)
                          }}
                        />
                        {editableProp.description && (
                          <span className="cf-lc-property-readonly">{editableProp.description}</span>
                        )}
                      </label>
                    )
                  })}
                </div>
              )}

              <div className="cf-lc-property-section">
                <div className="cf-lc-property-section-title">外观样式</div>
                <label className="cf-lc-control-label">
                  元素 ID
                  <input
                    className="cf-lc-control-input"
                    value={typeof selectedField.componentProps?.id === 'string' ? selectedField.componentProps.id : ''}
                    onChange={event => updateLocalComponentProp('id', event.target.value || undefined)}
                  />
                </label>
                <label className="cf-lc-control-label">
                  CSS 类名
                  <input
                    className="cf-lc-control-input"
                    value={typeof selectedField.componentProps?.className === 'string' ? selectedField.componentProps.className : ''}
                    onChange={event => updateLocalComponentProp('className', event.target.value || undefined)}
                  />
                </label>

                <div className="cf-lc-control-grid">
                  <label className="cf-lc-control-label cf-lc-control-label--compact">
                    宽度
                    <input
                      className="cf-lc-control-input"
                      value={readStyleValue('width')}
                      placeholder="auto / 100%"
                      onChange={event => updateStyleValue('width', event.target.value)}
                    />
                  </label>
                  <label className="cf-lc-control-label cf-lc-control-label--compact">
                    高度
                    <input
                      className="cf-lc-control-input"
                      value={readStyleValue('height')}
                      placeholder="auto / 32px"
                      onChange={event => updateStyleValue('height', event.target.value)}
                    />
                  </label>
                  <label className="cf-lc-control-label cf-lc-control-label--compact">
                    最小宽度
                    <input
                      className="cf-lc-control-input"
                      value={readStyleValue('minWidth')}
                      placeholder="例如 120px"
                      onChange={event => updateStyleValue('minWidth', event.target.value)}
                    />
                  </label>
                  <label className="cf-lc-control-label cf-lc-control-label--compact">
                    最小高度
                    <input
                      className="cf-lc-control-input"
                      value={readStyleValue('minHeight')}
                      placeholder="例如 32px"
                      onChange={event => updateStyleValue('minHeight', event.target.value)}
                    />
                  </label>
                  <label className="cf-lc-control-label cf-lc-control-label--compact">
                    最大宽度
                    <input
                      className="cf-lc-control-input"
                      value={readStyleValue('maxWidth')}
                      placeholder="例如 480px"
                      onChange={event => updateStyleValue('maxWidth', event.target.value)}
                    />
                  </label>
                  <label className="cf-lc-control-label cf-lc-control-label--compact">
                    最大高度
                    <input
                      className="cf-lc-control-input"
                      value={readStyleValue('maxHeight')}
                      placeholder="例如 320px"
                      onChange={event => updateStyleValue('maxHeight', event.target.value)}
                    />
                  </label>
                </div>

                <div className="cf-lc-control-grid">
                  <label className="cf-lc-control-label cf-lc-control-label--compact">
                    上外边距
                    <input
                      className="cf-lc-control-input"
                      value={readStyleValue('marginTop')}
                      placeholder="例如 8px"
                      onChange={event => updateStyleValue('marginTop', event.target.value)}
                    />
                  </label>
                  <label className="cf-lc-control-label cf-lc-control-label--compact">
                    右外边距
                    <input
                      className="cf-lc-control-input"
                      value={readStyleValue('marginRight')}
                      placeholder="例如 8px"
                      onChange={event => updateStyleValue('marginRight', event.target.value)}
                    />
                  </label>
                  <label className="cf-lc-control-label cf-lc-control-label--compact">
                    下外边距
                    <input
                      className="cf-lc-control-input"
                      value={readStyleValue('marginBottom')}
                      placeholder="例如 8px"
                      onChange={event => updateStyleValue('marginBottom', event.target.value)}
                    />
                  </label>
                  <label className="cf-lc-control-label cf-lc-control-label--compact">
                    左外边距
                    <input
                      className="cf-lc-control-input"
                      value={readStyleValue('marginLeft')}
                      placeholder="例如 8px"
                      onChange={event => updateStyleValue('marginLeft', event.target.value)}
                    />
                  </label>
                </div>

                <div className="cf-lc-control-grid">
                  <label className="cf-lc-control-label cf-lc-control-label--compact">
                    上内边距
                    <input
                      className="cf-lc-control-input"
                      value={readStyleValue('paddingTop')}
                      placeholder="例如 8px"
                      onChange={event => updateStyleValue('paddingTop', event.target.value)}
                    />
                  </label>
                  <label className="cf-lc-control-label cf-lc-control-label--compact">
                    右内边距
                    <input
                      className="cf-lc-control-input"
                      value={readStyleValue('paddingRight')}
                      placeholder="例如 8px"
                      onChange={event => updateStyleValue('paddingRight', event.target.value)}
                    />
                  </label>
                  <label className="cf-lc-control-label cf-lc-control-label--compact">
                    下内边距
                    <input
                      className="cf-lc-control-input"
                      value={readStyleValue('paddingBottom')}
                      placeholder="例如 8px"
                      onChange={event => updateStyleValue('paddingBottom', event.target.value)}
                    />
                  </label>
                  <label className="cf-lc-control-label cf-lc-control-label--compact">
                    左内边距
                    <input
                      className="cf-lc-control-input"
                      value={readStyleValue('paddingLeft')}
                      placeholder="例如 8px"
                      onChange={event => updateStyleValue('paddingLeft', event.target.value)}
                    />
                  </label>
                </div>
              </div>

              {componentEditableProps.length > 0 && (
                <div className="cf-lc-property-section">
                  <div className="cf-lc-property-section-title">
                    组件属性（
                    {selectedField.component}
                    ）
                  </div>
                  {componentEditableProps.map((editableProp) => {
                    const editor = editableProp.editor ?? 'text'
                    const propValue = readEditablePropValue(selectedField, editableProp)

                    if (editor === 'switch') {
                      return (
                        <label key={editableProp.key} className="cf-lc-inline-checkbox">
                          <input
                            type="checkbox"
                            checked={Boolean(propValue)}
                            onChange={event => updateFieldComponentProp(editableProp.key, event.target.checked)}
                          />
                          {editableProp.label}
                        </label>
                      )
                    }

                    if (editor === 'textarea') {
                      return (
                        <label key={editableProp.key} className="cf-lc-control-label">
                          {editableProp.label}
                          <textarea
                            className="cf-lc-control-textarea"
                            value={typeof propValue === 'string' ? propValue : ''}
                            onChange={(event) => {
                              const nextValue = event.target.value
                              updateFieldComponentProp(editableProp.key, nextValue || undefined)
                            }}
                          />
                          {editableProp.description && (
                            <span className="cf-lc-property-readonly">{editableProp.description}</span>
                          )}
                        </label>
                      )
                    }

                    if (editor === 'number') {
                      return (
                        <label key={editableProp.key} className="cf-lc-control-label">
                          {editableProp.label}
                          <input
                            className="cf-lc-control-input"
                            type="number"
                            value={typeof propValue === 'number' ? String(propValue) : ''}
                            onChange={(event) => {
                              const draft = event.target.value.trim()
                              if (!draft) {
                                updateFieldComponentProp(editableProp.key, undefined)
                                return
                              }
                              const parsed = Number(draft)
                              updateFieldComponentProp(editableProp.key, Number.isNaN(parsed) ? undefined : parsed)
                            }}
                          />
                          {editableProp.description && (
                            <span className="cf-lc-property-readonly">{editableProp.description}</span>
                          )}
                        </label>
                      )
                    }

                    if (editor === 'select') {
                      return (
                        <label key={editableProp.key} className="cf-lc-control-label">
                          {editableProp.label}
                          <select
                            className="cf-lc-control-select"
                            value={typeof propValue === 'string' ? propValue : ''}
                            onChange={(event) => {
                              const nextValue = event.target.value
                              updateFieldComponentProp(editableProp.key, nextValue || undefined)
                            }}
                          >
                            <option value="">请选择</option>
                            {(editableProp.options ?? []).map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          {editableProp.description && (
                            <span className="cf-lc-property-readonly">{editableProp.description}</span>
                          )}
                        </label>
                      )
                    }

                    return (
                      <label key={editableProp.key} className="cf-lc-control-label">
                        {editableProp.label}
                        <input
                          className="cf-lc-control-input"
                          value={typeof propValue === 'string' ? propValue : ''}
                          onChange={(event) => {
                            const nextValue = event.target.value
                            updateFieldComponentProp(editableProp.key, nextValue || undefined)
                          }}
                        />
                        {editableProp.description && (
                          <span className="cf-lc-property-readonly">{editableProp.description}</span>
                        )}
                      </label>
                    )
                  })}
                </div>
              )}

              <div className="cf-lc-property-section">
                <div className="cf-lc-property-section-title">组件参数（高级）</div>
                <label className="cf-lc-control-label">
                  componentProps（JSON）
                  <textarea
                    className="cf-lc-control-textarea cf-lc-control-textarea--code"
                    value={componentPropsDraft}
                    onChange={event => setComponentPropsDraft(event.target.value)}
                    onBlur={() => {
                      if (!selectedField)
                        return
                      const parsed = parseJsonDraft(componentPropsDraft)
                      if (!parsed.ok)
                        return
                      if (parsed.value && typeof parsed.value === 'object' && !Array.isArray(parsed.value)) {
                        updateField(selectedField.id, field => ({ ...field, componentProps: parsed.value as Record<string, unknown> }))
                        return
                      }
                      if (parsed.value === undefined) {
                        updateField(selectedField.id, field => ({ ...field, componentProps: {} }))
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          )}

          {selectedContainer && (
            <div className="cf-lc-property-form">
              <div className="cf-lc-property-section">
                <div className="cf-lc-property-section-title">基础信息</div>
                <label className="cf-lc-control-label">
                  容器标题
                  <input
                    className="cf-lc-control-input"
                    value={selectedContainer.title}
                    onChange={event => updateContainer(selectedContainer.id, container => ({ ...container, title: event.target.value || container.title }))}
                  />
                </label>

                <label className="cf-lc-control-label">
                  容器标识
                  <input
                    className="cf-lc-control-input"
                    value={selectedContainer.name}
                    onChange={event => updateContainer(selectedContainer.id, container => normalizeNode({ ...container, name: event.target.value }, nodes) as DesignerContainerNode)}
                  />
                </label>

                <div className="cf-lc-property-readonly">
                  容器类型：
                  {' '}
                  <code>{selectedContainer.component}</code>
                </div>
              </div>

              {containerUsesSections(selectedContainer.component) && (
                <div className="cf-lc-property-section cf-lc-property-group">
                  <div className="cf-lc-property-group-head">
                    <span className="cf-lc-property-group-title">分组管理</span>
                    <button
                      type="button"
                      className="cf-lc-btn cf-lc-btn--primary"
                      onClick={() => onUpdateNodes(prev => addSectionToContainer(prev, selectedContainer.id))}
                    >
                      新增分组
                    </button>
                  </div>

                  <div className="cf-lc-property-group-list">
                    {selectedContainer.sections.map((section, index) => (
                      <div key={section.id} className="cf-lc-property-group-item">
                        <div className="cf-lc-property-group-index">
                          分组
                          {' '}
                          {index + 1}
                        </div>
                        <label className="cf-lc-control-label">
                          分组标题
                          <input
                            className="cf-lc-control-input"
                            value={section.title}
                            onChange={event => onUpdateNodes(prev => updateSectionById(prev, section.id, old => ({ ...old, title: event.target.value || old.title })))}
                          />
                        </label>

                        <label className="cf-lc-control-label">
                          分组标识
                          <input
                            className="cf-lc-control-input"
                            value={section.name}
                            onChange={event => onUpdateNodes(prev => updateSectionById(prev, section.id, old => ({ ...old, name: event.target.value || old.name })))}
                          />
                        </label>

                        <button
                          type="button"
                          className="cf-lc-btn cf-lc-btn--danger"
                          onClick={() => onUpdateNodes(prev => removeSectionFromContainer(prev, selectedContainer.id, section.id))}
                        >
                          删除分组
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

              {!selectedField && !selectedContainer && selectedSection && (
                <div className="cf-lc-property-form">
                  <div className="cf-lc-property-section">
                    <div className="cf-lc-property-section-title">分组信息</div>
                    <label className="cf-lc-control-label">
                      分组标题
                      <input
                        className="cf-lc-control-input"
                        value={selectedSection.title}
                        onChange={event => onUpdateNodes(prev => updateSectionById(prev, selectedSection.id, old => ({ ...old, title: event.target.value || old.title })))}
                      />
                    </label>

                    <label className="cf-lc-control-label">
                      分组标识
                      <input
                        className="cf-lc-control-input"
                        value={selectedSection.name}
                        onChange={event => onUpdateNodes(prev => updateSectionById(prev, selectedSection.id, old => ({ ...old, name: event.target.value || old.name })))}
                      />
                    </label>
                  </div>
                </div>
              )}

              {!selectedField && !selectedContainer && !selectedSection && renderEmptyHint()}
              {hasSelection && (
                <div className="cf-lc-side-note">
                  选中节点后，修改会实时更新画布与 Schema 预览。
                </div>
              )}
            </>
      )}
      </fieldset>
    </div>
  )
}

