import type {
  DesignerContainerNode,
  DesignerFieldComponent,
  DesignerFieldNode,
  DesignerFieldType,
  DesignerNode,
  DesignerSectionNode,
} from '@moluoxixi/plugin-lower-code-core'
import type { ISchema } from '@moluoxixi/core'
import type { PropType, VNodeChild } from 'vue'
import type { LowCodeDesignerComponentDefinition, LowCodeDesignerEditableProp } from '../../types'
import {
  addSectionToContainer,
  containerUsesSections,
  defaultComponentForType,
  normalizeNode,
  nodesToSchema,
  parseEnumDraft,
  removeSectionFromContainer,
  schemaSignature,
  updateSectionById,
} from '@moluoxixi/plugin-lower-code-core'
import { ConfigForm } from '@moluoxixi/vue'
import { computed, defineComponent, h } from 'vue'
import { DesignerPropertiesSlotRenderer } from './components/DesignerPropertiesSlotRenderer'

export const DesignerPropertiesPane = defineComponent({
  name: 'DesignerPropertiesPane',
  props: {
    nodes: { type: Array as PropType<DesignerNode[]>, required: true },
    readonly: { type: Boolean, default: false },
    selectedField: { type: Object as PropType<DesignerFieldNode | null>, default: null },
    selectedContainer: { type: Object as PropType<DesignerContainerNode | null>, default: null },
    selectedSection: { type: Object as PropType<DesignerSectionNode | null>, default: null },
    enumDraft: { type: String, default: '' },
    fieldComponentOptions: { type: Array as PropType<string[]>, default: () => [] },
    componentDefinitions: {
      type: Object as PropType<Record<string, LowCodeDesignerComponentDefinition> | undefined>,
      default: undefined,
    },
    componentPropsByComponent: {
      type: Object as PropType<Record<string, Record<string, unknown>>>,
      default: () => ({}),
    },
    setEnumDraft: {
      type: Function as PropType<(value: string) => void>,
      required: true,
    },
    onUpdateNodes: {
      type: Function as PropType<(updater: (nodes: DesignerNode[]) => DesignerNode[]) => void>,
      required: true,
    },
    updateField: {
      type: Function as PropType<(nodeId: string, updater: (field: DesignerFieldNode) => DesignerFieldNode) => void>,
      required: true,
    },
    updateContainer: {
      type: Function as PropType<(nodeId: string, updater: (container: DesignerContainerNode) => DesignerContainerNode) => void>,
      required: true,
    },
    onUpdateComponentPropByComponentName: {
      type: Function as PropType<(componentName: string, propKey: string, value: unknown) => void>,
      required: true,
    },
  },
  setup(props) {
    const selectableComponents = computed(() => {
      const selectedField = props.selectedField
      if (!selectedField)
        return props.fieldComponentOptions
      return Array.from(new Set([selectedField.component, ...props.fieldComponentOptions]))
    })

    const selectedFieldDefinition = computed(() => {
      const selectedField = props.selectedField
      if (!selectedField)
        return null
      return props.componentDefinitions?.[selectedField.component] ?? null
    })

    const componentEditableProps = computed<LowCodeDesignerEditableProp[]>(() =>
      selectedFieldDefinition.value?.editableProps ?? [])

    function resolveMeta(): string {
      if (props.selectedField)
        return `字段 · ${props.selectedField.name}`
      if (props.selectedContainer)
        return `容器 · ${props.selectedContainer.component}`
      if (props.selectedSection)
        return `分组 · ${props.selectedSection.name}`
      return '未选择节点'
    }

    function readEditablePropValue(field: DesignerFieldNode, editableProp: LowCodeDesignerEditableProp): unknown {
      const presetValue = props.componentPropsByComponent[field.component]?.[editableProp.key]
      if (presetValue !== undefined)
        return presetValue
      const currentValue = field.componentProps?.[editableProp.key]
      if (currentValue === undefined)
        return editableProp.defaultValue
      return currentValue
    }

    function renderEditablePropEditor(editableProp: LowCodeDesignerEditableProp): VNodeChild {
      const selectedField = props.selectedField
      if (!selectedField)
        return null
      const propValue = readEditablePropValue(selectedField, editableProp)
      const updateProp = (value: unknown): void => {
        props.onUpdateComponentPropByComponentName(selectedField.component, editableProp.key, value)
      }
      const disabled = props.readonly
      const hint = editableProp.description
        ? h('div', { style: { marginTop: '4px', color: '#94a3b8', fontSize: '11px' } }, editableProp.description)
        : null

      switch (editableProp.editor ?? 'text') {
        case 'switch':
          return h('label', {
            key: editableProp.key,
            style: { display: 'inline-flex', gap: '6px', alignItems: 'center', fontSize: '12px', marginBottom: '8px' },
          }, [
            h('input', {
              type: 'checkbox',
              checked: Boolean(propValue),
              disabled,
              onChange: (event: Event) => {
                const target = event.target as HTMLInputElement | null
                updateProp(Boolean(target?.checked))
              },
            }),
            editableProp.label,
          ])
        case 'textarea':
          return h('label', { key: editableProp.key, style: { display: 'block', fontSize: '12px', marginBottom: '10px' } }, [
            editableProp.label,
            h('textarea', {
              value: typeof propValue === 'string' ? propValue : '',
              disabled,
              onInput: (event: Event) => {
                const target = event.target as HTMLTextAreaElement | null
                const next = target?.value ?? ''
                updateProp(next || undefined)
              },
              style: {
                marginTop: '5px',
                width: '100%',
                minHeight: '76px',
                border: '1px solid #dbe4f0',
                borderRadius: '8px',
                padding: '7px 8px',
                fontSize: '12px',
                resize: 'vertical',
                boxSizing: 'border-box',
              },
            }),
            hint,
          ])
        case 'number':
          return h('label', { key: editableProp.key, style: { display: 'block', fontSize: '12px', marginBottom: '10px' } }, [
            editableProp.label,
            h('input', {
              type: 'number',
              value: typeof propValue === 'number' ? String(propValue) : '',
              disabled,
              onInput: (event: Event) => {
                const target = event.target as HTMLInputElement | null
                const draft = (target?.value ?? '').trim()
                if (!draft) {
                  updateProp(undefined)
                  return
                }
                const parsed = Number(draft)
                updateProp(Number.isNaN(parsed) ? undefined : parsed)
              },
              style: {
                marginTop: '5px',
                width: '100%',
                border: '1px solid #dbe4f0',
                borderRadius: '8px',
                padding: '7px 8px',
                fontSize: '12px',
                boxSizing: 'border-box',
              },
            }),
            hint,
          ])
        case 'select':
          return h('label', { key: editableProp.key, style: { display: 'block', fontSize: '12px', marginBottom: '10px' } }, [
            editableProp.label,
            h('select', {
              value: typeof propValue === 'string' ? propValue : '',
              disabled,
              onChange: (event: Event) => {
                const target = event.target as HTMLSelectElement | null
                const next = target?.value ?? ''
                updateProp(next || undefined)
              },
              style: {
                marginTop: '5px',
                width: '100%',
                border: '1px solid #dbe4f0',
                borderRadius: '8px',
                padding: '7px 8px',
                fontSize: '12px',
                boxSizing: 'border-box',
              },
            }, [
              h('option', { value: '' }, '请选择'),
              ...(editableProp.options ?? []).map(option => h('option', { key: option.value, value: option.value }, option.label)),
            ]),
            hint,
          ])
        case 'text':
        default:
          return h('label', { key: editableProp.key, style: { display: 'block', fontSize: '12px', marginBottom: '10px' } }, [
            editableProp.label,
            h('input', {
              value: typeof propValue === 'string' ? propValue : '',
              disabled,
              onInput: (event: Event) => {
                const target = event.target as HTMLInputElement | null
                const next = target?.value ?? ''
                updateProp(next || undefined)
              },
              style: {
                marginTop: '5px',
                width: '100%',
                border: '1px solid #dbe4f0',
                borderRadius: '8px',
                padding: '7px 8px',
                fontSize: '12px',
                boxSizing: 'border-box',
              },
            }),
            hint,
          ])
      }
    }

    const panelSectionStyle = {
      border: '1px solid #e5edf7',
      borderRadius: '10px',
      padding: '10px',
      background: '#fbfdff',
      marginBottom: '8px',
    } as const

    const labelStyle = {
      display: 'block',
      fontSize: '12px',
      color: '#4b5563',
      fontWeight: 600,
      marginBottom: '10px',
    } as const

    const inputStyle = {
      marginTop: '5px',
      width: '100%',
      border: '1px solid #dbe4f0',
      borderRadius: '8px',
      padding: '7px 8px',
      fontSize: '12px',
      boxSizing: 'border-box',
    } as const

    const renderHeader = (): VNodeChild => h('div', {
      style: {
        padding: '12px',
        borderBottom: '1px solid #edf2f7',
        background: 'linear-gradient(180deg, #f8fbff 0%, #f5f9ff 100%)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '8px',
      },
    }, [
      h('strong', { style: { fontSize: '13px' } }, '属性'),
      h('span', { style: { fontSize: '11px', color: '#64748b' } }, resolveMeta()),
    ])

    const renderBody = (): VNodeChild => h('div', { style: { flex: '1 1 auto', minHeight: 0, padding: '12px', overflow: 'auto' } }, [
      props.selectedField ? h('div', [
        h('div', { style: panelSectionStyle }, [
          h('div', { style: { fontSize: '12px', fontWeight: 700, marginBottom: '8px' } }, '基础信息'),
          h('label', { style: labelStyle }, [
            '字段标题',
            h('input', {
              value: props.selectedField.title,
              disabled: props.readonly,
              style: inputStyle,
              onInput: (event: Event) => {
                const target = event.target as HTMLInputElement | null
                props.updateField(props.selectedField!.id, field => ({ ...field, title: target?.value || field.title }))
              },
            }),
          ]),
          h('label', { style: labelStyle }, [
            '字段标识',
            h('input', {
              value: props.selectedField.name,
              disabled: props.readonly,
              style: inputStyle,
              onInput: (event: Event) => {
                const target = event.target as HTMLInputElement | null
                props.updateField(props.selectedField!.id, field => normalizeNode({ ...field, name: target?.value ?? field.name }, props.nodes) as DesignerFieldNode)
              },
            }),
          ]),
        ]),
        h('div', { style: panelSectionStyle }, [
          h('div', { style: { fontSize: '12px', fontWeight: 700, marginBottom: '8px' } }, '渲染设置'),
          h('label', { style: labelStyle }, [
            '数据类型',
            h('select', {
              value: props.selectedField.type,
              disabled: props.readonly,
              style: inputStyle,
              onChange: (event: Event) => {
                const target = event.target as HTMLSelectElement | null
                const type = (target?.value ?? props.selectedField!.type) as DesignerFieldType
                const preferred = defaultComponentForType(type)
                const candidates = selectableComponents.value
                const resolved = candidates.includes(preferred)
                  ? preferred
                  : (candidates[0] ?? props.selectedField!.component)
                const nextProps = resolved === props.selectedField!.component
                  ? props.selectedField!.componentProps
                  : (props.componentPropsByComponent[resolved] ?? {})
                props.updateField(props.selectedField!.id, field => normalizeNode({
                  ...field,
                  type,
                  component: resolved,
                  componentProps: { ...nextProps },
                }, props.nodes) as DesignerFieldNode)
              },
            }, [
              h('option', { value: 'string' }, 'string'),
              h('option', { value: 'number' }, 'number'),
              h('option', { value: 'boolean' }, 'boolean'),
              h('option', { value: 'date' }, 'date'),
            ]),
          ]),
          h('label', { style: labelStyle }, [
            '渲染组件',
            h('select', {
              value: props.selectedField.component,
              disabled: props.readonly,
              style: inputStyle,
              onChange: (event: Event) => {
                const target = event.target as HTMLSelectElement | null
                const component = (target?.value ?? props.selectedField!.component) as DesignerFieldComponent
                const nextProps = component === props.selectedField!.component
                  ? props.selectedField!.componentProps
                  : (props.componentPropsByComponent[component] ?? {})
                props.updateField(props.selectedField!.id, field => normalizeNode({
                  ...field,
                  component,
                  componentProps: { ...nextProps },
                }, props.nodes) as DesignerFieldNode)
              },
            }, selectableComponents.value.map(component => h('option', { key: component, value: component }, component))),
          ]),
          h('label', {
            style: { display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 },
          }, [
            h('input', {
              type: 'checkbox',
              checked: props.selectedField.required,
              disabled: props.readonly,
              onChange: (event: Event) => {
                const target = event.target as HTMLInputElement | null
                props.updateField(props.selectedField!.id, field => ({ ...field, required: Boolean(target?.checked) }))
              },
            }),
            '必填字段',
          ]),
        ]),
        selectedFieldDefinition.value?.description
          ? h('div', { style: panelSectionStyle }, [
              h('div', { style: { fontSize: '12px', fontWeight: 700, marginBottom: '8px' } }, `组件说明（${props.selectedField.component}）`),
              h('div', {
                style: {
                  color: '#64748b',
                  fontSize: '12px',
                  lineHeight: 1.5,
                },
              }, selectedFieldDefinition.value.description),
            ])
          : null,
        props.selectedField.component === 'Select'
          ? h('div', { style: panelSectionStyle }, [
              h('label', { style: labelStyle }, [
                '枚举选项（label:value 每行一项）',
                h('textarea', {
                  value: props.enumDraft,
                  disabled: props.readonly,
                  style: { ...inputStyle, minHeight: '96px', resize: 'vertical', fontFamily: 'Consolas, monospace' },
                  onInput: (event: Event) => {
                    const target = event.target as HTMLTextAreaElement | null
                    const text = target?.value ?? ''
                    props.setEnumDraft(text)
                    props.updateField(props.selectedField!.id, field => ({
                      ...field,
                      enumOptions: parseEnumDraft(text),
                    }))
                  },
                }),
              ]),
            ])
          : null,
        componentEditableProps.value.length > 0
          ? h('div', { style: panelSectionStyle }, [
              h('div', { style: { fontSize: '12px', fontWeight: 700, marginBottom: '8px' } }, `组件属性（${props.selectedField.component}）`),
              ...componentEditableProps.value.map(renderEditablePropEditor),
            ])
          : null,
      ]) : null,

      props.selectedContainer ? h('div', [
        h('div', { style: panelSectionStyle }, [
          h('div', { style: { fontSize: '12px', fontWeight: 700, marginBottom: '8px' } }, '容器信息'),
          h('label', { style: labelStyle }, [
            '容器标题',
            h('input', {
              value: props.selectedContainer.title,
              disabled: props.readonly,
              style: inputStyle,
              onInput: (event: Event) => {
                const target = event.target as HTMLInputElement | null
                props.updateContainer(props.selectedContainer!.id, container => ({ ...container, title: target?.value || container.title }))
              },
            }),
          ]),
          h('label', { style: labelStyle }, [
            '容器标识',
            h('input', {
              value: props.selectedContainer.name,
              disabled: props.readonly,
              style: inputStyle,
              onInput: (event: Event) => {
                const target = event.target as HTMLInputElement | null
                props.updateContainer(props.selectedContainer!.id, container => normalizeNode({ ...container, name: target?.value ?? container.name }, props.nodes) as DesignerContainerNode)
              },
            }),
          ]),
          h('div', { style: { fontSize: '12px', color: '#64748b' } }, `容器类型：${props.selectedContainer.component}`),
        ]),
        containerUsesSections(props.selectedContainer.component)
          ? h('div', { style: panelSectionStyle }, [
              h('div', {
                style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
              }, [
                h('div', { style: { fontSize: '12px', fontWeight: 700 } }, '分组管理'),
                !props.readonly
                  ? h('button', {
                      type: 'button',
                      onClick: () => {
                        props.onUpdateNodes(nodes => addSectionToContainer(nodes, props.selectedContainer!.id))
                      },
                      style: {
                        border: '1px solid #bfdbfe',
                        borderRadius: '8px',
                        background: '#eff6ff',
                        color: '#1677ff',
                        fontSize: '12px',
                        padding: '4px 8px',
                        cursor: 'pointer',
                      },
                    }, '新增分组')
                  : null,
              ]),
              ...props.selectedContainer.sections.map((section, index) => h('div', {
                key: section.id,
                style: {
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px',
                  background: '#fff',
                  marginBottom: '8px',
                },
              }, [
                h('div', { style: { fontSize: '11px', color: '#64748b', marginBottom: '6px', fontWeight: 700 } }, `分组 ${index + 1}`),
                h('label', { style: labelStyle }, [
                  '分组标题',
                  h('input', {
                    value: section.title,
                    disabled: props.readonly,
                    style: inputStyle,
                    onInput: (event: Event) => {
                      const target = event.target as HTMLInputElement | null
                      props.onUpdateNodes(nodes => updateSectionById(nodes, section.id, old => ({ ...old, title: target?.value || old.title })))
                    },
                  }),
                ]),
                h('label', { style: labelStyle }, [
                  '分组标识',
                  h('input', {
                    value: section.name,
                    disabled: props.readonly,
                    style: inputStyle,
                    onInput: (event: Event) => {
                      const target = event.target as HTMLInputElement | null
                      props.onUpdateNodes(nodes => updateSectionById(nodes, section.id, old => ({ ...old, name: target?.value || old.name })))
                    },
                  }),
                ]),
                !props.readonly
                  ? h('button', {
                      type: 'button',
                      onClick: () => {
                        props.onUpdateNodes(nodes => removeSectionFromContainer(nodes, props.selectedContainer!.id, section.id))
                      },
                      style: {
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        background: '#fff5f5',
                        color: '#dc2626',
                        fontSize: '12px',
                        padding: '4px 8px',
                        cursor: 'pointer',
                      },
                    }, '删除分组')
                  : null,
              ])),
            ])
          : null,
      ]) : null,

      !props.selectedField && !props.selectedContainer && props.selectedSection
        ? h('div', { style: panelSectionStyle }, [
            h('div', { style: { fontSize: '12px', fontWeight: 700, marginBottom: '8px' } }, '分组信息'),
            h('label', { style: labelStyle }, [
              '分组标题',
              h('input', {
                value: props.selectedSection.title,
                disabled: props.readonly,
                style: inputStyle,
                onInput: (event: Event) => {
                  const target = event.target as HTMLInputElement | null
                  props.onUpdateNodes(nodes => updateSectionById(nodes, props.selectedSection!.id, old => ({ ...old, title: target?.value || old.title })))
                },
              }),
            ]),
            h('label', { style: labelStyle }, [
              '分组标识',
              h('input', {
                value: props.selectedSection.name,
                disabled: props.readonly,
                style: inputStyle,
                onInput: (event: Event) => {
                  const target = event.target as HTMLInputElement | null
                  props.onUpdateNodes(nodes => updateSectionById(nodes, props.selectedSection!.id, old => ({ ...old, name: target?.value || old.name })))
                },
              }),
            ]),
          ])
        : null,

      !props.selectedField && !props.selectedContainer && !props.selectedSection
        ? h('div', {
            style: {
              border: '1px dashed #dbe4f0',
              borderRadius: '10px',
              background: '#f8fbff',
              color: '#64748b',
              fontSize: '12px',
              lineHeight: 1.5,
              padding: '10px',
            },
          }, '选择画布中的字段、容器或分组后，在这里编辑属性。')
        : null,
    ])

    const renderFooter = (): VNodeChild => (props.selectedField || props.selectedContainer || props.selectedSection)
      ? h('div', {
          style: {
            borderTop: '1px dashed #e2e8f0',
            padding: '8px 12px',
            color: '#94a3b8',
            fontSize: '11px',
          },
        }, '修改会实时同步到画布与 Schema。')
      : null

    const paneSchema = computed<ISchema>(() => ({
      type: 'object',
      properties: {
        header: {
          type: 'void',
          component: 'DesignerPropertiesSlotRenderer',
          componentProps: { render: renderHeader },
        },
        body: {
          type: 'void',
          component: 'DesignerPropertiesSlotRenderer',
          componentProps: { render: renderBody },
        },
        footer: {
          type: 'void',
          component: 'DesignerPropertiesSlotRenderer',
          componentProps: { render: renderFooter },
        },
      },
    }))

    const paneRenderKey = computed(() => [
      schemaSignature(nodesToSchema(props.nodes)),
      props.selectedField?.id ?? '',
      props.selectedContainer?.id ?? '',
      props.selectedSection?.id ?? '',
      props.readonly ? '1' : '0',
    ].join(':'))

    return () => h('section', {
      style: {
        width: '340px',
        flex: '0 0 340px',
        border: '1px solid #dbe4f0',
        borderRadius: '12px',
        background: '#fff',
        overflow: 'hidden',
        minHeight: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      },
    }, [
      h('div', {
        style: {
          height: '100%',
          minHeight: 0,
          display: 'grid',
          gridTemplateRows: 'auto 1fr auto',
        },
      }, [
        h('div', {
          class: 'cf-lc-pane-configform-shell',
          style: {
            flex: '1 1 auto',
            height: '100%',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
          },
        }, [
          h(ConfigForm, {
            key: paneRenderKey.value,
            schema: paneSchema.value,
            components: {
              DesignerPropertiesSlotRenderer,
            },
          }),
        ]),
      ]),
    ])
  },
})
