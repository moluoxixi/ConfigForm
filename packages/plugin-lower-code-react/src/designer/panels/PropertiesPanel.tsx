import type {
  DesignerContainerNode,
  DesignerFieldComponent,
  DesignerFieldNode,
  DesignerFieldType,
  DesignerNode,
  DesignerSectionNode,
} from '@moluoxixi/plugin-lower-code-core'
import type React from 'react'
import type {
  LowCodeDesignerComponentDefinition,
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

interface PropertiesPanelProps {
  nodes: DesignerNode[]
  selectedField: DesignerFieldNode | null
  selectedContainer: DesignerContainerNode | null
  selectedSection: DesignerSectionNode | null
  enumDraft: string
  setEnumDraft: (value: string) => void
  onUpdateNodes: (updater: (prev: DesignerNode[]) => DesignerNode[]) => void
  updateField: (nodeId: string, updater: (field: DesignerFieldNode) => DesignerFieldNode) => void
  updateContainer: (nodeId: string, updater: (container: DesignerContainerNode) => DesignerContainerNode) => void
  fieldComponentOptions: string[]
  componentDefinitions?: Record<string, LowCodeDesignerComponentDefinition>
  componentPropsByComponent: Record<string, Record<string, unknown>>
  onUpdateComponentPropByComponentName: (componentName: string, propKey: string, value: unknown) => void
}

/**
 * render Empty Hint：负责“渲染render Empty Hint”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 render Empty Hint 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function renderEmptyHint(): React.ReactElement {
  return (
    <div className="cf-lc-empty-hint">
      选择画布中的字段、容器或分组后，在这里编辑属性。
    </div>
  )
}

/**
 * resolve Meta：负责“解析resolve Meta”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 resolve Meta 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function resolveMeta(
  selectedField: DesignerFieldNode | null,
  selectedContainer: DesignerContainerNode | null,
  selectedSection: DesignerSectionNode | null,
): string {
  if (selectedField)
    return `字段 · ${selectedField.name}`
  if (selectedContainer)
    return `容器 · ${selectedContainer.component}`
  if (selectedSection)
    return `分组 · ${selectedSection.name}`
  return '未选择节点'
}

/**
 * Properties Panel：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Properties Panel 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function PropertiesPanel({
  nodes,
  selectedField,
  selectedContainer,
  selectedSection,
  enumDraft,
  setEnumDraft,
  onUpdateNodes,
  updateField,
  updateContainer,
  fieldComponentOptions,
  componentDefinitions,
  componentPropsByComponent,
  onUpdateComponentPropByComponentName,
}: PropertiesPanelProps): React.ReactElement {
  const hasSelection = Boolean(selectedField || selectedContainer || selectedSection)
  const selectableComponents = selectedField
    ? Array.from(new Set([selectedField.component, ...fieldComponentOptions]))
    : fieldComponentOptions
  const activeComponentDefinition = selectedField
    ? componentDefinitions?.[selectedField.component]
    : undefined
  const componentEditableProps = activeComponentDefinition?.editableProps ?? []
  const resolveComponentPreset = (componentName: string): Record<string, unknown> => ({ ...(componentPropsByComponent[componentName] ?? {}) })

  const readEditablePropValue = (
    field: DesignerFieldNode,
    editableProp: LowCodeDesignerEditableProp,
  ): unknown => {
    const presetValue = componentPropsByComponent[field.component]?.[editableProp.key]
    if (presetValue !== undefined)
      return presetValue
    const currentValue = field.componentProps?.[editableProp.key]
    if (currentValue === undefined)
      return editableProp.defaultValue
    return currentValue
  }

  const updateFieldComponentProp = (propKey: string, value: unknown): void => {
    if (!selectedField)
      return
    onUpdateComponentPropByComponentName(selectedField.component, propKey, value)
  }

  return (
    <section className="cf-lc-panel cf-lc-panel--side">
      <div className="cf-lc-panel-body cf-lc-side-panel-body cf-lc-side-panel-shell">
        <div className="cf-lc-side-panel-header">
          <div className="cf-lc-side-panel-title">属性</div>
          <div className="cf-lc-side-panel-meta">{resolveMeta(selectedField, selectedContainer, selectedSection)}</div>
        </div>

        <div className="cf-lc-side-scroll">
          {selectedField && (
            <div className="cf-lc-property-form">
              <div className="cf-lc-property-section">
                <div className="cf-lc-property-section-title">基础信息</div>
                <label className="cf-lc-control-label">
                  字段标题
                  <input
                    className="cf-lc-control-input"
                    value={selectedField.title}
                    onChange={event => updateField(selectedField.id, field => ({ ...field, title: event.target.value || field.title }))}
                  />
                </label>

                <label className="cf-lc-control-label">
                  字段标识
                  <input
                    className="cf-lc-control-input"
                    value={selectedField.name}
                    onChange={event => updateField(selectedField.id, field => normalizeNode({ ...field, name: event.target.value }, nodes) as DesignerFieldNode)}
                  />
                </label>
              </div>

              <div className="cf-lc-property-section">
                <div className="cf-lc-property-section-title">渲染设置</div>
                <label className="cf-lc-control-label">
                  数据类型
                  <select
                    className="cf-lc-control-select"
                    value={selectedField.type}
                    onChange={(event) => {
                      const type = event.target.value as DesignerFieldType
                      const preferredComponent = defaultComponentForType(type)
                      const resolvedComponent = selectableComponents.includes(preferredComponent)
                        ? preferredComponent
                        : (selectableComponents[0] ?? selectedField.component)
                      const nextComponentProps = resolvedComponent === selectedField.component
                        ? selectedField.componentProps
                        : resolveComponentPreset(resolvedComponent)
                      updateField(selectedField.id, field => normalizeNode({
                        ...field,
                        type,
                        component: resolvedComponent,
                        componentProps: nextComponentProps,
                      }, nodes) as DesignerFieldNode)
                    }}
                  >
                    <option value="string">string</option>
                    <option value="number">number</option>
                    <option value="boolean">boolean</option>
                    <option value="date">date</option>
                  </select>
                </label>

                <label className="cf-lc-control-label">
                  渲染组件
                  <select
                    className="cf-lc-control-select"
                    value={selectedField.component}
                    onChange={(event) => {
                      const component = event.target.value as DesignerFieldComponent
                      const nextComponentProps = component === selectedField.component
                        ? selectedField.componentProps
                        : resolveComponentPreset(component)
                      updateField(selectedField.id, field => normalizeNode({
                        ...field,
                        component,
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
        </div>

        {hasSelection && (
          <div className="cf-lc-side-note">
            选中节点后，修改会实时更新画布与 Schema 预览。
          </div>
        )}
      </div>
    </section>
  )
}
