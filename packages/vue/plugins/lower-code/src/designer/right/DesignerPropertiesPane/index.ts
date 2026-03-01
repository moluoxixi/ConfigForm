import type { ISchema } from '@moluoxixi/core'
import type {
  DesignerContainerNode,
  DesignerFieldComponent,
  DesignerFieldNode,
  DesignerFieldType,
  DesignerFormConfig,
  DesignerNode,
  DesignerSectionNode,
} from '@moluoxixi/plugin-lower-code-core'
import type { PropType, VNodeChild } from 'vue'
import type { LowCodeDesignerComponentDefinition, LowCodeDesignerDecoratorDefinition, LowCodeDesignerEditableProp } from '../../types'
import {
  addSectionToContainer,
  containerUsesSections,
  defaultComponentForType,
  normalizeNode,
  parseEnumDraft,
  removeSectionFromContainer,
  updateSectionById,
} from '@moluoxixi/plugin-lower-code-core'
import { ConfigForm } from '@moluoxixi/ui-basic-vue'
import { computed, defineComponent, h, nextTick, onUpdated, ref, watch } from 'vue'
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
    fieldComponentOptions: { type: Array as PropType<string[]>, /**
                                                                 * 功能：处理参数消化、状态变更与调用链行为同步。
                                                                 * @returns 返回当前分支执行后的处理结果。
                                                                 */
      /**
       * 功能：处理参数消化、状态变更与调用链行为同步。
       * @returns 返回当前分支执行后的处理结果。
       */
      default: () => [] },
    componentDefinitions: {
      type: Object as PropType<Record<string, LowCodeDesignerComponentDefinition> | undefined>,
      default: undefined,
    },
    decoratorDefinitions: {
      type: Object as PropType<Record<string, LowCodeDesignerDecoratorDefinition> | undefined>,
      default: undefined,
    },
    componentPropsByComponent: {
      type: Object as PropType<Record<string, Record<string, unknown>>>,
      /**
       * 功能：处理参数消化、状态变更与调用链行为同步。
       * @returns 返回当前分支执行后的处理结果。
       */
      default: () => ({}),
    },
    decoratorOptions: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    defaultDecoratorsByComponent: {
      type: Object as PropType<Record<string, string> | undefined>,
      default: undefined,
    },
    formConfig: {
      type: Object as PropType<DesignerFormConfig>,
      required: true,
    },
    onUpdateFormConfig: {
      type: Function as PropType<(updater: (prev: DesignerFormConfig) => DesignerFormConfig) => void>,
      required: true,
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
  /**
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * @param props 参数 props 为当前功能所需的输入信息。
   * @returns 返回当前分支执行后的处理结果。
   */
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
    const resolvedDecoratorName = computed(() => {
      const selectedField = props.selectedField
      if (!selectedField)
        return ''
      return selectedField.decorator || props.defaultDecoratorsByComponent?.[selectedField.component] || ''
    })
    const selectedDecoratorDefinition = computed(() => {
      const name = resolvedDecoratorName.value
      if (!name)
        return null
      return props.decoratorDefinitions?.[name] ?? null
    })
    const decoratorEditableProps = computed<LowCodeDesignerEditableProp[]>(() =>
      selectedDecoratorDefinition.value?.editableProps ?? [])

    const defaultDraft = ref('')
    const rulesDraft = ref('')
    const reactionsDraft = ref('')
    const dataSourceDraft = ref('')
    const componentPropsDraft = ref('')
    const decoratorPropsDraft = ref('')
    const validateTriggerDraft = ref('')
    const showAdvanced = ref(false)
    const scrollHost = ref<Record<'component' | 'form', HTMLElement | null>>({ component: null, form: null })
    const lastScrollTop = ref<Record<'component' | 'form', number>>({ component: 0, form: 0 })
    const restoringScroll = ref<Record<'component' | 'form', boolean>>({ component: false, form: false })

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

    function renderDecoratorPropEditor(editableProp: LowCodeDesignerEditableProp): VNodeChild {
      const selectedField = props.selectedField
      if (!selectedField)
        return null
      const propValue = readDecoratorPropValue(selectedField, editableProp)
      const disabled = props.readonly
      const hint = editableProp.description
        ? h('div', { style: { marginTop: '4px', color: '#94a3b8', fontSize: '11px' } }, editableProp.description)
        : null
      const updateProp = (value: unknown): void => {
        props.updateField(selectedField.id, (field) => {
          const nextProps = { ...(field.decoratorProps ?? {}) }
          if (value === undefined || value === '')
            delete nextProps[editableProp.key]
          else
            nextProps[editableProp.key] = value
          return {
            ...field,
            decoratorProps: Object.keys(nextProps).length > 0 ? nextProps : undefined,
          }
        })
      }

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
      const map: Record<string, DesignerFieldType> = {
        Input: 'string',
        Textarea: 'string',
        Select: 'string',
        InputNumber: 'number',
        Switch: 'boolean',
        DatePicker: 'date',
      }
      return map[component] ?? fallback
    }

    watch(
      () => props.selectedField?.id,
      () => {
        const selectedField = props.selectedField
        if (!selectedField) {
          defaultDraft.value = ''
          rulesDraft.value = ''
          reactionsDraft.value = ''
          dataSourceDraft.value = ''
          componentPropsDraft.value = ''
          decoratorPropsDraft.value = ''
          validateTriggerDraft.value = ''
          return
        }
        defaultDraft.value = formatJson(selectedField.defaultValue)
        rulesDraft.value = formatJson(selectedField.rules ?? [])
        reactionsDraft.value = formatJson(selectedField.reactions ?? [])
        dataSourceDraft.value = formatJson(selectedField.dataSource)
        componentPropsDraft.value = formatJson(selectedField.componentProps ?? {})
        decoratorPropsDraft.value = formatJson(selectedField.decoratorProps ?? {})
        const trigger = selectedField.validateTrigger
        validateTriggerDraft.value = Array.isArray(trigger) ? trigger.join(',') : (trigger ?? '')
      },
      { immediate: true },
    )

    onUpdated(() => {
      (['component', 'form'] as const).forEach((tab) => {
        const host = scrollHost.value[tab]
        if (!host)
          return
        const target = lastScrollTop.value[tab]
        if (Math.abs(host.scrollTop - target) < 1)
          return
        restoringScroll.value[tab] = true
        nextTick(() => {
          const active = scrollHost.value[tab]
          if (!active)
            return
          active.scrollTop = target
          requestAnimationFrame(() => {
            restoringScroll.value[tab] = false
          })
        })
      })
    })

    /**
     * resolve Meta：负责“解析resolve Meta”的核心实现与调用衔接。
     * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
     * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
     *
     * 说明：该注释描述 resolve Meta 的主要职责边界，便于维护者快速理解函数在链路中的定位。
     */
    function resolveMeta(): string {
      if (props.selectedField)
        return `字段 · ${props.selectedField.name}`
      if (props.selectedContainer)
        return `容器 · ${props.selectedContainer.component}`
      if (props.selectedSection)
        return `分组 · ${props.selectedSection.name}`
      return '未选择节点'
    }

    /**
     * read Editable Prop Value：负责编排该能力的主流程。
     * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
     * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
     *
     * 说明：该函数聚焦于 read Editable Prop Value 的单一职责，调用方可通过函数名快速理解输入输出语义。
     */
    function readEditablePropValue(field: DesignerFieldNode, editableProp: LowCodeDesignerEditableProp): unknown {
      const presetValue = props.componentPropsByComponent[field.component]?.[editableProp.key]
      if (presetValue !== undefined)
        return presetValue
      const currentValue = field.componentProps?.[editableProp.key]
      if (currentValue === undefined)
        return editableProp.defaultValue
      return currentValue
    }

    function readDecoratorPropValue(field: DesignerFieldNode, editableProp: LowCodeDesignerEditableProp): unknown {
      const presetValue = selectedDecoratorDefinition.value?.defaultProps?.[editableProp.key]
      const currentValue = field.decoratorProps?.[editableProp.key]
      if (currentValue === undefined) {
        if (presetValue !== undefined)
          return presetValue
        return editableProp.defaultValue
      }
      return currentValue
    }

    /**
     * render Editable Prop Editor：负责“渲染render Editable Prop Editor”的核心实现与调用衔接。
     * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
     * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
     *
     * 说明：该注释描述 render Editable Prop Editor 的主要职责边界，便于维护者快速理解函数在链路中的定位。
     */
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
              /**
               * 功能：处理参数消化、状态变更与调用链行为同步。
               * @param event 参数 event 为事件对象，用于提供交互上下文。
               */
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
              /**
               * 功能：处理参数消化、状态变更与调用链行为同步。
               * @param event 参数 event 为事件对象，用于提供交互上下文。
               */
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
              /**
               * 功能：处理参数消化、状态变更与调用链行为同步。
               * @param event 参数 event 为事件对象，用于提供交互上下文。
               */
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
              /**
               * 功能：处理参数消化、状态变更与调用链行为同步。
               * @param event 参数 event 为事件对象，用于提供交互上下文。
               */
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
              /**
               * 功能：处理参数消化、状态变更与调用链行为同步。
               * @param event 参数 event 为事件对象，用于提供交互上下文。
               */
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

    const updateFormConfigState = (patch: Partial<DesignerFormConfig>): void => {
      if (props.readonly)
        return
      props.onUpdateFormConfig(prev => ({ ...prev, ...patch }))
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
      const selectedField = props.selectedField
      if (!selectedField)
        return
      props.updateField(selectedField.id, (field) => {
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
      const selectedField = props.selectedField
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
      const selectedField = props.selectedField
      if (!selectedField)
        return
      props.updateField(selectedField.id, (field) => {
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

    const renderDefaultValueEditor = (): VNodeChild => {
      const selectedField = props.selectedField
      if (!selectedField)
        return null
      const resolvedType = resolveTypeByComponent(selectedField.component, selectedField.type)
      const currentDefault = selectedField.defaultValue

      if (resolvedType === 'number') {
        return h('label', { style: labelStyle }, [
          '默认值',
          h('input', {
            type: 'number',
            value: typeof currentDefault === 'number' ? String(currentDefault) : '',
            disabled: props.readonly,
            style: inputStyle,
            onInput: (event: Event) => {
              const target = event.target as HTMLInputElement | null
              const draft = (target?.value ?? '').trim()
              props.updateField(selectedField.id, field => ({ ...field, defaultValue: draft ? Number(draft) : undefined }))
            },
          }),
        ])
      }

      if (resolvedType === 'boolean') {
        return h('label', {
          style: { display: 'inline-flex', gap: '6px', alignItems: 'center', fontSize: '12px', marginBottom: '8px' },
        }, [
          h('input', {
            type: 'checkbox',
            checked: Boolean(currentDefault),
            disabled: props.readonly,
            onChange: (event: Event) => {
              const target = event.target as HTMLInputElement | null
              props.updateField(selectedField.id, field => ({ ...field, defaultValue: Boolean(target?.checked) }))
            },
          }),
          '默认值',
        ])
      }

      if (resolvedType === 'date') {
        return h('label', { style: labelStyle }, [
          '默认值',
          h('input', {
            type: 'date',
            value: typeof currentDefault === 'string' ? currentDefault : '',
            disabled: props.readonly,
            style: inputStyle,
            onInput: (event: Event) => {
              const target = event.target as HTMLInputElement | null
              props.updateField(selectedField.id, field => ({ ...field, defaultValue: target?.value || undefined }))
            },
          }),
        ])
      }

      if (selectedField.component === 'Select' && selectedField.enumOptions.length > 0) {
        return h('label', { style: labelStyle }, [
          '默认值',
          h('select', {
            value: typeof currentDefault === 'string' ? currentDefault : '',
            disabled: props.readonly,
            style: inputStyle,
            onChange: (event: Event) => {
              const target = event.target as HTMLSelectElement | null
              props.updateField(selectedField.id, field => ({ ...field, defaultValue: target?.value || undefined }))
            },
          }, [
            h('option', { value: '' }, '请选择'),
            ...selectedField.enumOptions.map(option => h('option', { value: option.value, key: option.value }, option.label)),
          ]),
        ])
      }

      return h('label', { style: labelStyle }, [
        '默认值',
        h('input', {
          value: typeof currentDefault === 'string' ? currentDefault : '',
          disabled: props.readonly,
          style: inputStyle,
          onInput: (event: Event) => {
            const target = event.target as HTMLInputElement | null
            props.updateField(selectedField.id, field => ({ ...field, defaultValue: target?.value || undefined }))
          },
        }),
      ])
    }

    const panelSectionStyle = {
      border: '1px solid #e5edf7',
      borderRadius: '10px',
      padding: '10px',
      background: '#fbfdff',
      boxShadow: '0 6px 12px rgba(15, 23, 42, 0.04)',
    } as const

    const panelFormStyle = {
      display: 'grid',
      gap: '8px',
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

    const renderFormConfig = (): VNodeChild => h('div', { style: panelFormStyle }, [
      h('div', { style: panelSectionStyle }, [
        h('div', { style: { fontSize: '12px', fontWeight: 700, marginBottom: '8px' } }, '表单基础'),
        h('label', { style: labelStyle }, [
          '表单模式',
          h('select', {
            value: props.formConfig.pattern,
            style: inputStyle,
            onChange: (event: Event) => {
              const target = event.target as HTMLSelectElement | null
              updateFormConfigState({ pattern: (target?.value ?? 'default') as DesignerFormConfig['pattern'] })
            },
          }, [
            h('option', { value: 'default' }, '默认（可编辑）'),
            h('option', { value: 'editable' }, '可编辑'),
            h('option', { value: 'preview' }, '预览'),
            h('option', { value: 'disabled' }, '禁用'),
          ]),
        ]),
        h('label', { style: labelStyle }, [
          '标签位置',
          h('div', { class: 'cf-lc-segment' }, [
            ...(['top', 'left', 'right'] as const).map(option => h('button', {
              type: 'button',
              class: ['cf-lc-segment-button', props.formConfig.labelPosition === option ? 'is-active' : ''],
              onClick: () => updateFormConfigState({ labelPosition: option }),
            }, option === 'top' ? '上' : option === 'left' ? '左' : '右')),
          ]),
        ]),
        h('label', { style: labelStyle }, [
          '标签宽度',
          h('input', {
            value: props.formConfig.labelWidth ?? '',
            placeholder: '例如 96 或 96px',
            style: inputStyle,
            onInput: (event: Event) => {
              const target = event.target as HTMLInputElement | null
              updateFormConfigState({ labelWidth: parseNumberish(target?.value ?? '') })
            },
          }),
        ]),
        h('label', { style: labelStyle }, [
          '校验触发',
          h('select', {
            value: props.formConfig.validateTrigger,
            style: inputStyle,
            onChange: (event: Event) => {
              const target = event.target as HTMLSelectElement | null
              updateFormConfigState({ validateTrigger: (target?.value ?? 'default') as DesignerFormConfig['validateTrigger'] })
            },
          }, [
            h('option', { value: 'default' }, '默认'),
            h('option', { value: 'change' }, 'change'),
            h('option', { value: 'blur' }, 'blur'),
            h('option', { value: 'submit' }, 'submit'),
          ]),
        ]),
      ]),

      h('div', { style: panelSectionStyle }, [
        h('div', { style: { fontSize: '12px', fontWeight: 700, marginBottom: '8px' } }, '布局设置'),
        h('label', { style: labelStyle }, [
          '布局模式',
          h('select', {
            value: props.formConfig.layoutType,
            style: inputStyle,
            onChange: (event: Event) => {
              const target = event.target as HTMLSelectElement | null
              updateFormConfigState({ layoutType: (target?.value ?? 'default') as DesignerFormConfig['layoutType'] })
            },
          }, [
            h('option', { value: 'default' }, '默认'),
            h('option', { value: 'grid' }, '网格'),
            h('option', { value: 'inline' }, '行内'),
          ]),
        ]),
        props.formConfig.layoutType === 'grid'
          ? h('div', { class: 'cf-lc-control-grid' }, [
              h('label', { style: { ...labelStyle, marginBottom: '6px' }, class: 'cf-lc-control-label--compact' }, [
                '列数',
                h('input', {
                  type: 'number',
                  value: props.formConfig.layoutColumns ?? '',
                  style: inputStyle,
                  onInput: (event: Event) => {
                    const target = event.target as HTMLInputElement | null
                    updateFormConfigState({ layoutColumns: parseNumber(target?.value ?? '') })
                  },
                }),
              ]),
              h('label', { style: { ...labelStyle, marginBottom: '6px' }, class: 'cf-lc-control-label--compact' }, [
                '列间距',
                h('input', {
                  type: 'number',
                  value: props.formConfig.layoutGutter ?? '',
                  style: inputStyle,
                  onInput: (event: Event) => {
                    const target = event.target as HTMLInputElement | null
                    updateFormConfigState({ layoutGutter: parseNumber(target?.value ?? '') })
                  },
                }),
              ]),
            ])
          : null,
        props.formConfig.layoutType === 'inline'
          ? h('label', { style: labelStyle }, [
              '行内间距',
              h('input', {
                type: 'number',
                value: props.formConfig.layoutGap ?? '',
                style: inputStyle,
                onInput: (event: Event) => {
                  const target = event.target as HTMLInputElement | null
                  updateFormConfigState({ layoutGap: parseNumber(target?.value ?? '') })
                },
              }),
            ])
          : null,
      ]),

      h('div', { style: panelSectionStyle }, [
        h('div', { style: { fontSize: '12px', fontWeight: 700, marginBottom: '8px' } }, '操作区'),
        h('label', {
          style: { display: 'inline-flex', gap: '6px', alignItems: 'center', fontSize: '12px', marginBottom: '8px' },
        }, [
          h('input', {
            type: 'checkbox',
            checked: props.formConfig.showSubmit,
            onChange: (event: Event) => {
              const target = event.target as HTMLInputElement | null
              updateFormConfigState({ showSubmit: Boolean(target?.checked) })
            },
          }),
          '显示提交按钮',
        ]),
        h('label', {
          style: { display: 'inline-flex', gap: '6px', alignItems: 'center', fontSize: '12px', marginBottom: '8px' },
        }, [
          h('input', {
            type: 'checkbox',
            checked: props.formConfig.showReset,
            onChange: (event: Event) => {
              const target = event.target as HTMLInputElement | null
              updateFormConfigState({ showReset: Boolean(target?.checked) })
            },
          }),
          '显示重置按钮',
        ]),
        h('label', { style: labelStyle }, [
          '提交文案',
          h('input', {
            value: props.formConfig.submitText ?? '',
            disabled: !props.formConfig.showSubmit,
            style: inputStyle,
            onInput: (event: Event) => {
              const target = event.target as HTMLInputElement | null
              updateFormConfigState({ submitText: target?.value ?? '' })
            },
          }),
        ]),
        h('label', { style: labelStyle }, [
          '重置文案',
          h('input', {
            value: props.formConfig.resetText ?? '',
            disabled: !props.formConfig.showReset,
            style: inputStyle,
            onInput: (event: Event) => {
              const target = event.target as HTMLInputElement | null
              updateFormConfigState({ resetText: target?.value ?? '' })
            },
          }),
        ]),
        h('label', { style: labelStyle }, [
          '对齐方式',
          h('select', {
            value: props.formConfig.actionsAlign,
            style: inputStyle,
            onChange: (event: Event) => {
              const target = event.target as HTMLSelectElement | null
              updateFormConfigState({ actionsAlign: (target?.value ?? 'center') as DesignerFormConfig['actionsAlign'] })
            },
          }, [
            h('option', { value: 'left' }, '居左'),
            h('option', { value: 'center' }, '居中'),
            h('option', { value: 'right' }, '居右'),
          ]),
        ]),
      ]),
    ])

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

    const renderBody = (tab: 'component' | 'form'): VNodeChild => h('div', {
        class: 'cf-lc-side-scroll',
        style: { flex: '1 1 auto', minHeight: 0, padding: '12px' },
        ref: (element: HTMLElement | null) => { scrollHost.value[tab] = element },
        onScroll: (event: Event) => {
          if (restoringScroll.value[tab])
            return
          const target = event.target as HTMLElement | null
          if (target)
            lastScrollTop.value[tab] = target.scrollTop
        },
      }, [
        tab === 'form'
          ? renderFormConfig()
          : null,
        tab === 'component' && props.selectedField
          ? h('div', { style: panelFormStyle }, [
              h('div', { style: panelSectionStyle }, [
                h('div', { style: { fontSize: '12px', fontWeight: 700, marginBottom: '8px' } }, '基础信息'),
                h('label', { style: labelStyle }, [
                  '字段标题（Label）',
                  h('input', {
                    value: props.selectedField.title,
                    disabled: props.readonly,
                    style: inputStyle,
                    /**
                     * 功能：处理参数消化、状态变更与调用链行为同步。
                     * @param event 参数 event 为事件对象，用于提供交互上下文。
                     */
                    onInput: (event: Event) => {
                      const target = event.target as HTMLInputElement | null
                      props.updateField(props.selectedField!.id, field => ({ ...field, title: target?.value || field.title }))
                    },
                  }),
                ]),
                h('label', { style: labelStyle }, [
                  '字段标识（Name）',
                  h('input', {
                    value: props.selectedField.name,
                    disabled: props.readonly,
                    style: inputStyle,
                    /**
                     * 功能：处理参数消化、状态变更与调用链行为同步。
                     * @param event 参数 event 为事件对象，用于提供交互上下文。
                     */
                    onInput: (event: Event) => {
                      const target = event.target as HTMLInputElement | null
                      props.updateField(props.selectedField!.id, field => normalizeNode({ ...field, name: target?.value ?? field.name }, props.nodes) as DesignerFieldNode)
                    },
                  }),
                ]),
              ]),
              h('div', { style: panelSectionStyle }, [
                h('div', { style: { fontSize: '12px', fontWeight: 700, marginBottom: '8px' } }, '渲染设置'),
                h('div', { style: { fontSize: '12px', color: '#64748b', marginBottom: '6px' } }, [
                  '数据类型：',
                  h('code', {
                    style: {
                      marginLeft: '6px',
                      padding: '1px 6px',
                      borderRadius: '6px',
                      border: '1px solid #dbe4f0',
                      background: '#f8fbff',
                      fontSize: '11px',
                      color: '#334155',
                    },
                  }, resolveTypeByComponent(props.selectedField.component, props.selectedField.type)),
                ]),
                h('label', { style: labelStyle }, [
                  '渲染组件',
                  h('select', {
                    value: props.selectedField.component,
                    disabled: props.readonly,
                    style: inputStyle,
                    /**
                     * 功能：处理参数消化、状态变更与调用链行为同步。
                     * @param event 参数 event 为事件对象，用于提供交互上下文。
                     */
                    onChange: (event: Event) => {
                      const target = event.target as HTMLSelectElement | null
                      const component = (target?.value ?? props.selectedField!.component) as DesignerFieldComponent
                      const nextType = resolveTypeByComponent(component, props.selectedField!.type)
                      const nextProps = component === props.selectedField!.component
                        ? props.selectedField!.componentProps
                        : (props.componentPropsByComponent[component] ?? {})
                      props.updateField(props.selectedField!.id, field => normalizeNode({
                        ...field,
                        component,
                        type: nextType,
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
                    /**
                     * 功能：处理参数消化、状态变更与调用链行为同步。
                     * @param event 参数 event 为事件对象，用于提供交互上下文。
                     */
                    onChange: (event: Event) => {
                      const target = event.target as HTMLInputElement | null
                      props.updateField(props.selectedField!.id, field => ({ ...field, required: Boolean(target?.checked) }))
                    },
                  }),
                  '必填字段',
                ]),
              ]),
              h('div', { style: panelSectionStyle }, [
                h('div', { style: { fontSize: '12px', fontWeight: 700, marginBottom: '8px' } }, '显示与状态'),
                h('label', {
                  style: { display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, marginBottom: '6px' },
                }, [
                  h('input', {
                    type: 'checkbox',
                    checked: props.selectedField.visible !== false,
                    disabled: props.readonly,
                    onChange: (event: Event) => {
                      const target = event.target as HTMLInputElement | null
                      props.updateField(props.selectedField!.id, field => ({ ...field, visible: Boolean(target?.checked) }))
                    },
                  }),
                  '可见',
                ]),
                h('label', {
                  style: { display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, marginBottom: '6px', marginLeft: '10px' },
                }, [
                  h('input', {
                    type: 'checkbox',
                    checked: Boolean(props.selectedField.disabled),
                    disabled: props.readonly,
                    onChange: (event: Event) => {
                      const target = event.target as HTMLInputElement | null
                      props.updateField(props.selectedField!.id, field => ({ ...field, disabled: Boolean(target?.checked) }))
                    },
                  }),
                  '禁用',
                ]),
                h('label', {
                  style: { display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, marginBottom: '6px', marginLeft: '10px' },
                }, [
                  h('input', {
                    type: 'checkbox',
                    checked: Boolean(props.selectedField.preview),
                    disabled: props.readonly,
                    onChange: (event: Event) => {
                      const target = event.target as HTMLInputElement | null
                      props.updateField(props.selectedField!.id, field => ({ ...field, preview: Boolean(target?.checked) }))
                    },
                  }),
                  '预览态',
                ]),
                h('label', { style: labelStyle }, [
                  '字段模式',
                  h('select', {
                    value: props.selectedField.pattern ?? '',
                    disabled: props.readonly,
                    style: inputStyle,
                    onChange: (event: Event) => {
                      const target = event.target as HTMLSelectElement | null
                      const value = target?.value ?? ''
                      props.updateField(props.selectedField!.id, field => ({ ...field, pattern: value ? (value as DesignerFieldNode['pattern']) : undefined }))
                    },
                  }, [
                    h('option', { value: '' }, '默认（可编辑）'),
                    h('option', { value: 'editable' }, '可编辑'),
                    h('option', { value: 'disabled' }, '禁用'),
                    h('option', { value: 'preview' }, '预览'),
                  ]),
                ]),
              ]),
              h('div', { style: panelSectionStyle }, [
                h('div', { style: { fontSize: '12px', fontWeight: 700, marginBottom: '8px' } }, '默认值与提交'),
                renderDefaultValueEditor(),
                h('label', { style: labelStyle }, [
                  '提交路径',
                  h('input', {
                    value: props.selectedField.submitPath ?? '',
                    disabled: props.readonly,
                    style: inputStyle,
                    onInput: (event: Event) => {
                      const target = event.target as HTMLInputElement | null
                      const next = target?.value ?? ''
                      props.updateField(props.selectedField!.id, field => ({ ...field, submitPath: next || undefined }))
                    },
                  }),
                ]),
                h('label', {
                  style: { display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, marginBottom: '6px' },
                }, [
                  h('input', {
                    type: 'checkbox',
                    checked: Boolean(props.selectedField.excludeWhenHidden),
                    disabled: props.readonly,
                    onChange: (event: Event) => {
                      const target = event.target as HTMLInputElement | null
                      props.updateField(props.selectedField!.id, field => ({ ...field, excludeWhenHidden: Boolean(target?.checked) }))
                    },
                  }),
                  '隐藏时不提交',
                ]),
                h('label', { style: labelStyle }, [
                  '显示格式化（表达式）',
                  h('input', {
                    value: props.selectedField.displayFormat ?? '',
                    disabled: props.readonly,
                    style: inputStyle,
                    onInput: (event: Event) => {
                      const target = event.target as HTMLInputElement | null
                      const next = target?.value ?? ''
                      props.updateField(props.selectedField!.id, field => ({ ...field, displayFormat: next || undefined }))
                    },
                  }),
                ]),
                h('label', { style: labelStyle }, [
                  '输入解析（表达式）',
                  h('input', {
                    value: props.selectedField.inputParse ?? '',
                    disabled: props.readonly,
                    style: inputStyle,
                    onInput: (event: Event) => {
                      const target = event.target as HTMLInputElement | null
                      const next = target?.value ?? ''
                      props.updateField(props.selectedField!.id, field => ({ ...field, inputParse: next || undefined }))
                    },
                  }),
                ]),
                h('label', { style: labelStyle }, [
                  '提交转换（表达式）',
                  h('input', {
                    value: props.selectedField.submitTransform ?? '',
                    disabled: props.readonly,
                    style: inputStyle,
                    onInput: (event: Event) => {
                      const target = event.target as HTMLInputElement | null
                      const next = target?.value ?? ''
                      props.updateField(props.selectedField!.id, field => ({ ...field, submitTransform: next || undefined }))
                    },
                  }),
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
                        /**
                         * 功能：处理参数消化、状态变更与调用链行为同步。
                         * @param event 参数 event 为事件对象，用于提供交互上下文。
                         */
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
              h('div', { style: panelSectionStyle }, [
                h('div', { style: { fontSize: '12px', fontWeight: 700, marginBottom: '8px' } }, '高级配置'),
                h('button', {
                  type: 'button',
                  style: {
                    border: '1px solid #d0dbe9',
                    background: '#fff',
                    color: '#334155',
                    borderRadius: '8px',
                    padding: '4px 10px',
                    fontSize: '12px',
                    cursor: 'pointer',
                  },
                  onClick: () => { showAdvanced.value = !showAdvanced.value },
                }, showAdvanced.value ? '收起高级配置' : '展开高级配置'),
              ]),
              showAdvanced.value
                ? [
                    h('div', { style: panelSectionStyle }, [
                      h('div', { style: { fontSize: '12px', fontWeight: 700, marginBottom: '8px' } }, '高级默认值'),
                      h('label', { style: labelStyle }, [
                        '默认值（JSON）',
                        h('textarea', {
                          value: defaultDraft.value,
                          disabled: props.readonly,
                          style: { ...inputStyle, minHeight: '96px', resize: 'vertical', fontFamily: 'Consolas, monospace' },
                          onInput: (event: Event) => {
                            const target = event.target as HTMLTextAreaElement | null
                            defaultDraft.value = target?.value ?? ''
                          },
                          onBlur: () => {
                            const parsed = parseJsonDraft(defaultDraft.value)
                            if (!parsed.ok)
                              return
                            props.updateField(props.selectedField!.id, field => ({ ...field, defaultValue: parsed.value }))
                          },
                        }),
                      ]),
                    ]),
                    h('div', { style: panelSectionStyle }, [
                      h('div', { style: { fontSize: '12px', fontWeight: 700, marginBottom: '8px' } }, '数据源'),
                      h('label', { style: labelStyle }, [
                        'dataSource（JSON）',
                        h('textarea', {
                          value: dataSourceDraft.value,
                          disabled: props.readonly,
                          style: { ...inputStyle, minHeight: '96px', resize: 'vertical', fontFamily: 'Consolas, monospace' },
                          onInput: (event: Event) => {
                            const target = event.target as HTMLTextAreaElement | null
                            dataSourceDraft.value = target?.value ?? ''
                          },
                          onBlur: () => {
                            const parsed = parseJsonDraft(dataSourceDraft.value)
                            if (!parsed.ok)
                              return
                            props.updateField(props.selectedField!.id, field => ({ ...field, dataSource: parsed.value }))
                          },
                        }),
                      ]),
                    ]),
                    h('div', { style: panelSectionStyle }, [
                      h('div', { style: { fontSize: '12px', fontWeight: 700, marginBottom: '8px' } }, '校验规则'),
                      h('label', { style: labelStyle }, [
                        'validateTrigger（逗号分隔）',
                        h('input', {
                          value: validateTriggerDraft.value,
                          disabled: props.readonly,
                          style: inputStyle,
                          onInput: (event: Event) => {
                            const target = event.target as HTMLInputElement | null
                            validateTriggerDraft.value = target?.value ?? ''
                          },
                          onBlur: () => {
                            props.updateField(props.selectedField!.id, field => ({ ...field, validateTrigger: normalizeValidateTrigger(validateTriggerDraft.value) }))
                          },
                        }),
                      ]),
                      h('label', { style: labelStyle }, [
                        'rules（JSON 数组）',
                        h('textarea', {
                          value: rulesDraft.value,
                          disabled: props.readonly,
                          style: { ...inputStyle, minHeight: '110px', resize: 'vertical', fontFamily: 'Consolas, monospace' },
                          onInput: (event: Event) => {
                            const target = event.target as HTMLTextAreaElement | null
                            rulesDraft.value = target?.value ?? ''
                          },
                          onBlur: () => {
                            const parsed = parseJsonDraft(rulesDraft.value)
                            if (!parsed.ok)
                              return
                            if (parsed.value === undefined) {
                              props.updateField(props.selectedField!.id, field => ({ ...field, rules: undefined }))
                              return
                            }
                            if (Array.isArray(parsed.value))
                              props.updateField(props.selectedField!.id, field => ({ ...field, rules: parsed.value }))
                          },
                        }),
                      ]),
                    ]),
                    h('div', { style: panelSectionStyle }, [
                      h('div', { style: { fontSize: '12px', fontWeight: 700, marginBottom: '8px' } }, '联动规则'),
                      h('label', { style: labelStyle }, [
                        'reactions（JSON 数组）',
                        h('textarea', {
                          value: reactionsDraft.value,
                          disabled: props.readonly,
                          style: { ...inputStyle, minHeight: '110px', resize: 'vertical', fontFamily: 'Consolas, monospace' },
                          onInput: (event: Event) => {
                            const target = event.target as HTMLTextAreaElement | null
                            reactionsDraft.value = target?.value ?? ''
                          },
                          onBlur: () => {
                            const parsed = parseJsonDraft(reactionsDraft.value)
                            if (!parsed.ok)
                              return
                            if (parsed.value === undefined) {
                              props.updateField(props.selectedField!.id, field => ({ ...field, reactions: undefined }))
                              return
                            }
                            if (Array.isArray(parsed.value))
                              props.updateField(props.selectedField!.id, field => ({ ...field, reactions: parsed.value }))
                          },
                        }),
                      ]),
                    ]),
                    h('div', { style: panelSectionStyle }, [
                      h('div', { style: { fontSize: '12px', fontWeight: 700, marginBottom: '8px' } }, '装饰器参数'),
                      h('label', { style: labelStyle }, [
                        'decoratorProps（JSON）',
                        h('textarea', {
                          value: decoratorPropsDraft.value,
                          disabled: props.readonly,
                          style: { ...inputStyle, minHeight: '96px', resize: 'vertical', fontFamily: 'Consolas, monospace' },
                          onInput: (event: Event) => {
                            const target = event.target as HTMLTextAreaElement | null
                            decoratorPropsDraft.value = target?.value ?? ''
                          },
                          onBlur: () => {
                            const parsed = parseJsonDraft(decoratorPropsDraft.value)
                            if (!parsed.ok)
                              return
                            if (parsed.value && typeof parsed.value === 'object' && !Array.isArray(parsed.value)) {
                              props.updateField(props.selectedField!.id, field => ({ ...field, decoratorProps: parsed.value as Record<string, unknown> }))
                              return
                            }
                            if (parsed.value === undefined)
                              props.updateField(props.selectedField!.id, field => ({ ...field, decoratorProps: undefined }))
                          },
                        }),
                      ]),
                    ]),
                    h('div', { style: panelSectionStyle }, [
                      h('div', { style: { fontSize: '12px', fontWeight: 700, marginBottom: '8px' } }, '组件参数（高级）'),
                      h('label', { style: labelStyle }, [
                        'componentProps（JSON）',
                        h('textarea', {
                          value: componentPropsDraft.value,
                          disabled: props.readonly,
                          style: { ...inputStyle, minHeight: '96px', resize: 'vertical', fontFamily: 'Consolas, monospace' },
                          onInput: (event: Event) => {
                            const target = event.target as HTMLTextAreaElement | null
                            componentPropsDraft.value = target?.value ?? ''
                          },
                          onBlur: () => {
                            const parsed = parseJsonDraft(componentPropsDraft.value)
                            if (!parsed.ok)
                              return
                            if (parsed.value && typeof parsed.value === 'object' && !Array.isArray(parsed.value)) {
                              props.updateField(props.selectedField!.id, field => ({ ...field, componentProps: parsed.value as Record<string, unknown> }))
                              return
                            }
                            if (parsed.value === undefined)
                              props.updateField(props.selectedField!.id, field => ({ ...field, componentProps: {} }))
                          },
                        }),
                      ]),
                    ]),
                  ]
                : null,
              h('div', { style: panelSectionStyle }, [
                h('div', { style: { fontSize: '12px', fontWeight: 700, marginBottom: '8px' } }, '布局与装饰'),
                h('label', { style: labelStyle }, [
                  '栅格占比',
                  h('input', {
                    type: 'number',
                    value: typeof props.selectedField.span === 'number' ? String(props.selectedField.span) : '',
                    disabled: props.readonly,
                    style: inputStyle,
                    onInput: (event: Event) => {
                      const target = event.target as HTMLInputElement | null
                      const draft = (target?.value ?? '').trim()
                      props.updateField(props.selectedField!.id, field => ({ ...field, span: draft ? Number(draft) : undefined }))
                    },
                  }),
                ]),
                h('label', { style: labelStyle }, [
                  '排序权重',
                  h('input', {
                    type: 'number',
                    value: typeof props.selectedField.order === 'number' ? String(props.selectedField.order) : '',
                    disabled: props.readonly,
                    style: inputStyle,
                    onInput: (event: Event) => {
                      const target = event.target as HTMLInputElement | null
                      const draft = (target?.value ?? '').trim()
                      props.updateField(props.selectedField!.id, field => ({ ...field, order: draft ? Number(draft) : undefined }))
                    },
                  }),
                ]),
                h('label', { style: labelStyle }, [
                  '装饰器',
                  h('select', {
                    value: props.selectedField.decorator ?? '',
                    disabled: props.readonly,
                    style: inputStyle,
                    onChange: (event: Event) => {
                      const target = event.target as HTMLSelectElement | null
                      const next = target?.value ?? ''
                      const nextDecorator = next || undefined
                      const nextDefaults = nextDecorator
                        ? (props.decoratorDefinitions?.[nextDecorator]?.defaultProps ?? {})
                        : {}
                      props.updateField(props.selectedField!.id, field => ({
                        ...field,
                        decorator: nextDecorator,
                        decoratorProps: nextDecorator && Object.keys(nextDefaults).length > 0
                          ? { ...nextDefaults }
                          : undefined,
                      }))
                      decoratorPropsDraft.value = formatJson(nextDefaults)
                    },
                  }, [
                    h('option', { value: '' }, '默认'),
                    ...props.decoratorOptions.map(option => h('option', { key: option, value: option }, option)),
                  ]),
                ]),
              ]),
              decoratorEditableProps.value.length > 0
                ? h('div', { style: panelSectionStyle }, [
                    h('div', { style: { fontSize: '12px', fontWeight: 700, marginBottom: '8px' } }, [
                      '装饰器配置（',
                      resolvedDecoratorName.value || '默认',
                      ')',
                    ]),
                    ...decoratorEditableProps.value.map(renderDecoratorPropEditor),
                  ])
                : null,
              h('div', { style: panelSectionStyle }, [
                h('div', { style: { fontSize: '12px', fontWeight: 700, marginBottom: '8px' } }, '外观样式'),
                h('label', { style: labelStyle }, [
                  '元素 ID',
                  h('input', {
                    value: typeof props.selectedField.componentProps?.id === 'string' ? props.selectedField.componentProps?.id : '',
                    disabled: props.readonly,
                    style: inputStyle,
                    onInput: (event: Event) => {
                      const target = event.target as HTMLInputElement | null
                      updateLocalComponentProp('id', target?.value || undefined)
                    },
                  }),
                ]),
                h('label', { style: labelStyle }, [
                  'CSS 类名',
                  h('input', {
                    value: typeof props.selectedField.componentProps?.className === 'string' ? props.selectedField.componentProps?.className : '',
                    disabled: props.readonly,
                    style: inputStyle,
                    onInput: (event: Event) => {
                      const target = event.target as HTMLInputElement | null
                      updateLocalComponentProp('className', target?.value || undefined)
                    },
                  }),
                ]),
                h('div', { class: 'cf-lc-control-grid' }, [
                  h('label', { style: { ...labelStyle, marginBottom: '6px' }, class: 'cf-lc-control-label--compact' }, [
                    '宽度',
                    h('input', {
                      value: readStyleValue('width'),
                      disabled: props.readonly,
                      placeholder: 'auto / 100%',
                      style: inputStyle,
                      onInput: (event: Event) => {
                        const target = event.target as HTMLInputElement | null
                        updateStyleValue('width', target?.value ?? '')
                      },
                    }),
                  ]),
                  h('label', { style: { ...labelStyle, marginBottom: '6px' }, class: 'cf-lc-control-label--compact' }, [
                    '高度',
                    h('input', {
                      value: readStyleValue('height'),
                      disabled: props.readonly,
                      placeholder: 'auto / 32px',
                      style: inputStyle,
                      onInput: (event: Event) => {
                        const target = event.target as HTMLInputElement | null
                        updateStyleValue('height', target?.value ?? '')
                      },
                    }),
                  ]),
                  h('label', { style: { ...labelStyle, marginBottom: '6px' }, class: 'cf-lc-control-label--compact' }, [
                    '最小宽度',
                    h('input', {
                      value: readStyleValue('minWidth'),
                      disabled: props.readonly,
                      placeholder: '例如 120px',
                      style: inputStyle,
                      onInput: (event: Event) => {
                        const target = event.target as HTMLInputElement | null
                        updateStyleValue('minWidth', target?.value ?? '')
                      },
                    }),
                  ]),
                  h('label', { style: { ...labelStyle, marginBottom: '6px' }, class: 'cf-lc-control-label--compact' }, [
                    '最小高度',
                    h('input', {
                      value: readStyleValue('minHeight'),
                      disabled: props.readonly,
                      placeholder: '例如 32px',
                      style: inputStyle,
                      onInput: (event: Event) => {
                        const target = event.target as HTMLInputElement | null
                        updateStyleValue('minHeight', target?.value ?? '')
                      },
                    }),
                  ]),
                  h('label', { style: { ...labelStyle, marginBottom: '6px' }, class: 'cf-lc-control-label--compact' }, [
                    '最大宽度',
                    h('input', {
                      value: readStyleValue('maxWidth'),
                      disabled: props.readonly,
                      placeholder: '例如 480px',
                      style: inputStyle,
                      onInput: (event: Event) => {
                        const target = event.target as HTMLInputElement | null
                        updateStyleValue('maxWidth', target?.value ?? '')
                      },
                    }),
                  ]),
                  h('label', { style: { ...labelStyle, marginBottom: '6px' }, class: 'cf-lc-control-label--compact' }, [
                    '最大高度',
                    h('input', {
                      value: readStyleValue('maxHeight'),
                      disabled: props.readonly,
                      placeholder: '例如 320px',
                      style: inputStyle,
                      onInput: (event: Event) => {
                        const target = event.target as HTMLInputElement | null
                        updateStyleValue('maxHeight', target?.value ?? '')
                      },
                    }),
                  ]),
                ]),
                h('div', { class: 'cf-lc-control-grid' }, [
                  h('label', { style: { ...labelStyle, marginBottom: '6px' }, class: 'cf-lc-control-label--compact' }, [
                    '上外边距',
                    h('input', {
                      value: readStyleValue('marginTop'),
                      disabled: props.readonly,
                      placeholder: '例如 8px',
                      style: inputStyle,
                      onInput: (event: Event) => {
                        const target = event.target as HTMLInputElement | null
                        updateStyleValue('marginTop', target?.value ?? '')
                      },
                    }),
                  ]),
                  h('label', { style: { ...labelStyle, marginBottom: '6px' }, class: 'cf-lc-control-label--compact' }, [
                    '右外边距',
                    h('input', {
                      value: readStyleValue('marginRight'),
                      disabled: props.readonly,
                      placeholder: '例如 8px',
                      style: inputStyle,
                      onInput: (event: Event) => {
                        const target = event.target as HTMLInputElement | null
                        updateStyleValue('marginRight', target?.value ?? '')
                      },
                    }),
                  ]),
                  h('label', { style: { ...labelStyle, marginBottom: '6px' }, class: 'cf-lc-control-label--compact' }, [
                    '下外边距',
                    h('input', {
                      value: readStyleValue('marginBottom'),
                      disabled: props.readonly,
                      placeholder: '例如 8px',
                      style: inputStyle,
                      onInput: (event: Event) => {
                        const target = event.target as HTMLInputElement | null
                        updateStyleValue('marginBottom', target?.value ?? '')
                      },
                    }),
                  ]),
                  h('label', { style: { ...labelStyle, marginBottom: '6px' }, class: 'cf-lc-control-label--compact' }, [
                    '左外边距',
                    h('input', {
                      value: readStyleValue('marginLeft'),
                      disabled: props.readonly,
                      placeholder: '例如 8px',
                      style: inputStyle,
                      onInput: (event: Event) => {
                        const target = event.target as HTMLInputElement | null
                        updateStyleValue('marginLeft', target?.value ?? '')
                      },
                    }),
                  ]),
                ]),
                h('div', { class: 'cf-lc-control-grid' }, [
                  h('label', { style: { ...labelStyle, marginBottom: '6px' }, class: 'cf-lc-control-label--compact' }, [
                    '上内边距',
                    h('input', {
                      value: readStyleValue('paddingTop'),
                      disabled: props.readonly,
                      placeholder: '例如 8px',
                      style: inputStyle,
                      onInput: (event: Event) => {
                        const target = event.target as HTMLInputElement | null
                        updateStyleValue('paddingTop', target?.value ?? '')
                      },
                    }),
                  ]),
                  h('label', { style: { ...labelStyle, marginBottom: '6px' }, class: 'cf-lc-control-label--compact' }, [
                    '右内边距',
                    h('input', {
                      value: readStyleValue('paddingRight'),
                      disabled: props.readonly,
                      placeholder: '例如 8px',
                      style: inputStyle,
                      onInput: (event: Event) => {
                        const target = event.target as HTMLInputElement | null
                        updateStyleValue('paddingRight', target?.value ?? '')
                      },
                    }),
                  ]),
                  h('label', { style: { ...labelStyle, marginBottom: '6px' }, class: 'cf-lc-control-label--compact' }, [
                    '下内边距',
                    h('input', {
                      value: readStyleValue('paddingBottom'),
                      disabled: props.readonly,
                      placeholder: '例如 8px',
                      style: inputStyle,
                      onInput: (event: Event) => {
                        const target = event.target as HTMLInputElement | null
                        updateStyleValue('paddingBottom', target?.value ?? '')
                      },
                    }),
                  ]),
                  h('label', { style: { ...labelStyle, marginBottom: '6px' }, class: 'cf-lc-control-label--compact' }, [
                    '左内边距',
                    h('input', {
                      value: readStyleValue('paddingLeft'),
                      disabled: props.readonly,
                      placeholder: '例如 8px',
                      style: inputStyle,
                      onInput: (event: Event) => {
                        const target = event.target as HTMLInputElement | null
                        updateStyleValue('paddingLeft', target?.value ?? '')
                      },
                    }),
                  ]),
                ]),
              ]),
              componentEditableProps.value.length > 0
                ? h('div', { style: panelSectionStyle }, [
                    h('div', { style: { fontSize: '12px', fontWeight: 700, marginBottom: '8px' } }, `组件属性（${props.selectedField.component}）`),
                    ...componentEditableProps.value.map(renderEditablePropEditor),
                  ])
                : null,
            ])
          : null,

        tab === 'component' && props.selectedContainer
          ? h('div', { style: panelFormStyle }, [
              h('div', { style: panelSectionStyle }, [
                h('div', { style: { fontSize: '12px', fontWeight: 700, marginBottom: '8px' } }, '容器信息'),
                h('label', { style: labelStyle }, [
                  '容器标题',
                  h('input', {
                    value: props.selectedContainer.title,
                    disabled: props.readonly,
                    style: inputStyle,
                    /**
                     * 功能：处理参数消化、状态变更与调用链行为同步。
                     * @param event 参数 event 为事件对象，用于提供交互上下文。
                     */
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
                    /**
                     * 功能：处理参数消化、状态变更与调用链行为同步。
                     * @param event 参数 event 为事件对象，用于提供交互上下文。
                     */
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
                            /**
                             * 功能：处理参数消化、状态变更与调用链行为同步。
                             */
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
                          /**
                           * 功能：处理参数消化、状态变更与调用链行为同步。
                           * @param event 参数 event 为事件对象，用于提供交互上下文。
                           */
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
                          /**
                           * 功能：处理参数消化、状态变更与调用链行为同步。
                           * @param event 参数 event 为事件对象，用于提供交互上下文。
                           */
                          onInput: (event: Event) => {
                            const target = event.target as HTMLInputElement | null
                            props.onUpdateNodes(nodes => updateSectionById(nodes, section.id, old => ({ ...old, name: target?.value || old.name })))
                          },
                        }),
                      ]),
                      !props.readonly
                        ? h('button', {
                            type: 'button',
                            /**
                             * 功能：处理参数消化、状态变更与调用链行为同步。
                             */
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
            ])
          : null,

        tab === 'component' && !props.selectedField && !props.selectedContainer && props.selectedSection
          ? h('div', { style: panelFormStyle }, [
              h('div', { style: panelSectionStyle }, [
                h('div', { style: { fontSize: '12px', fontWeight: 700, marginBottom: '8px' } }, '分组信息'),
                h('label', { style: labelStyle }, [
                  '分组标题',
                  h('input', {
                    value: props.selectedSection.title,
                    disabled: props.readonly,
                    style: inputStyle,
                    /**
                     * 功能：处理参数消化、状态变更与调用链行为同步。
                     * @param event 参数 event 为事件对象，用于提供交互上下文。
                     */
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
                    /**
                     * 功能：处理参数消化、状态变更与调用链行为同步。
                     * @param event 参数 event 为事件对象，用于提供交互上下文。
                     */
                    onInput: (event: Event) => {
                      const target = event.target as HTMLInputElement | null
                      props.onUpdateNodes(nodes => updateSectionById(nodes, props.selectedSection!.id, old => ({ ...old, name: target?.value || old.name })))
                    },
                  }),
                ]),
              ]),
            ])
          : null,

        tab === 'component' && !props.selectedField && !props.selectedContainer && !props.selectedSection
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
        tab === 'component'
          ? renderFooter()
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

    const paneSchema = computed<ISchema>(() => {
      const componentTab = {
        type: 'void',
        componentProps: { title: '组件' },
        properties: {
          content: {
            type: 'void',
            component: 'DesignerPropertiesSlotRenderer',
            componentProps: { render: () => renderBody('component') },
          },
        },
      }
      const formTab = {
        type: 'void',
        componentProps: { title: '表单' },
        properties: {
          content: {
            type: 'void',
            component: 'DesignerPropertiesSlotRenderer',
            componentProps: { render: () => renderBody('form') },
          },
        },
      }
      const hasSelection = Boolean(props.selectedField || props.selectedContainer || props.selectedSection)
      return {
        type: 'object',
        properties: {
          tabs: {
            type: 'void',
            component: 'LayoutTabs',
            properties: hasSelection
              ? { component: componentTab, form: formTab }
              : { form: formTab, component: componentTab },
          },
        },
      }
    })

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
          gridTemplateRows: 'auto 1fr',
        },
      }, [
        renderHeader(),
        h(ConfigForm, {
          class: 'cf-lc-pane-configform-shell cf-lc-properties-pane-form',
          style: {
            flex: '1 1 auto',
            height: '100%',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
          },
          schema: paneSchema.value,
          components: {
            DesignerPropertiesSlotRenderer,
          },
          formTag: false,
        }),
      ]),
    ])
  },
})

