import type { ISchema } from '@moluoxixi/core'
import type {
  DesignerContainerNode,
  DesignerFieldComponent,
  DesignerFieldNode,
  DesignerFieldType,
  DesignerNode,
  DesignerSectionNode,
} from '@moluoxixi/plugin-lower-code-core'
import type { PropType, VNodeChild } from 'vue'
import type { LowCodeDesignerComponentDefinition, LowCodeDesignerEditableProp } from '../../types'
import {
  addSectionToContainer,
  containerUsesSections,
  defaultComponentForType,
  nodesToSchema,
  normalizeNode,
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
    fieldComponentOptions: { type: Array as PropType<string[]>, /**
                                                                 * default：执行当前位置的功能逻辑。
                                                                 * 定位：`packages/plugin-lower-code-vue/src/designer/right/DesignerPropertiesPane/index.ts:36`。
                                                                 * 功能：处理参数消化、状态变更与调用链行为同步。
                                                                 * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                                                 * @returns 返回当前分支执行后的处理结果。
                                                                 */
      /**
       * default：执行当前位置的功能逻辑。
       * 定位：`packages/plugin-lower-code-vue/src/designer/right/DesignerPropertiesPane/index.ts:43`。
       * 功能：处理参数消化、状态变更与调用链行为同步。
       * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
       * @returns 返回当前分支执行后的处理结果。
       */
      default: () => [] },
    componentDefinitions: {
      type: Object as PropType<Record<string, LowCodeDesignerComponentDefinition> | undefined>,
      default: undefined,
    },
    componentPropsByComponent: {
      type: Object as PropType<Record<string, Record<string, unknown>>>,
      /**
       * default：执行当前位置的功能逻辑。
       * 定位：`packages/plugin-lower-code-vue/src/designer/right/DesignerPropertiesPane/index.ts:43`。
       * 功能：处理参数消化、状态变更与调用链行为同步。
       * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
       * @returns 返回当前分支执行后的处理结果。
       */
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
  /**
   * setup：执行当前位置的功能逻辑。
   * 定位：`packages/plugin-lower-code-vue/src/designer/right/DesignerPropertiesPane/index.ts:66`。
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
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
     * read Editable Prop Value：负责该函数职责对应的主流程编排。
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
      /**
       * updateProp?????????????????
       * ???`packages/plugin-lower-code-vue/src/designer/right/DesignerPropertiesPane/index.ts:166`?
       * ?????????????????????????????????
       * ??????????????????????????
       * @param value ?? value ????????????
       */
      const /**
             * updateProp：执行当前位置的功能逻辑。
             * 定位：`packages/plugin-lower-code-vue/src/designer/right/DesignerPropertiesPane/index.ts:130`。
             * 功能：处理参数消化、状态变更与调用链行为同步。
             * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
             * @param value 参数 value 为输入值，用于驱动后续逻辑。
             */
        updateProp = (value: unknown): void => {
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
               * onChange：执行当前位置的功能逻辑。
               * 定位：`packages/plugin-lower-code-vue/src/designer/right/DesignerPropertiesPane/index.ts:148`。
               * 功能：处理参数消化、状态变更与调用链行为同步。
               * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
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
               * onInput：执行当前位置的功能逻辑。
               * 定位：`packages/plugin-lower-code-vue/src/designer/right/DesignerPropertiesPane/index.ts:161`。
               * 功能：处理参数消化、状态变更与调用链行为同步。
               * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
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
               * onInput：执行当前位置的功能逻辑。
               * 定位：`packages/plugin-lower-code-vue/src/designer/right/DesignerPropertiesPane/index.ts:187`。
               * 功能：处理参数消化、状态变更与调用链行为同步。
               * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
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
               * onChange：执行当前位置的功能逻辑。
               * 定位：`packages/plugin-lower-code-vue/src/designer/right/DesignerPropertiesPane/index.ts:215`。
               * 功能：处理参数消化、状态变更与调用链行为同步。
               * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
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
               * onInput：执行当前位置的功能逻辑。
               * 定位：`packages/plugin-lower-code-vue/src/designer/right/DesignerPropertiesPane/index.ts:242`。
               * 功能：处理参数消化、状态变更与调用链行为同步。
               * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
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

    /**
     * renderHeader?????????????????
     * ???`packages/plugin-lower-code-vue/src/designer/right/DesignerPropertiesPane/index.ts:366`?
     * ?????????????????????????????????
     * ??????????????????????????
     * @returns ?????????????
     */
    const /**
           * renderHeader：执行当前位置的功能逻辑。
           * 定位：`packages/plugin-lower-code-vue/src/designer/right/DesignerPropertiesPane/index.ts:288`。
           * 功能：处理参数消化、状态变更与调用链行为同步。
           * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
           * @returns 返回当前分支执行后的处理结果。
           */
      renderHeader = (): VNodeChild => h('div', {
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

    /**
     * renderBody?????????????????
     * ???`packages/plugin-lower-code-vue/src/designer/right/DesignerPropertiesPane/index.ts:388`?
     * ?????????????????????????????????
     * ??????????????????????????
     * @returns ?????????????
     */
    const /**
           * renderBody：执行当前位置的功能逻辑。
           * 定位：`packages/plugin-lower-code-vue/src/designer/right/DesignerPropertiesPane/index.ts:303`。
           * 功能：处理参数消化、状态变更与调用链行为同步。
           * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
           * @returns 返回当前分支执行后的处理结果。
           */
      renderBody = (): VNodeChild => h('div', { style: { flex: '1 1 auto', minHeight: 0, padding: '12px', overflow: 'auto' } }, [
        props.selectedField
          ? h('div', [
              h('div', { style: panelSectionStyle }, [
                h('div', { style: { fontSize: '12px', fontWeight: 700, marginBottom: '8px' } }, '基础信息'),
                h('label', { style: labelStyle }, [
                  '字段标题',
                  h('input', {
                    value: props.selectedField.title,
                    disabled: props.readonly,
                    style: inputStyle,
                    /**
                     * onInput：执行当前位置的功能逻辑。
                     * 定位：`packages/plugin-lower-code-vue/src/designer/right/DesignerPropertiesPane/index.ts:314`。
                     * 功能：处理参数消化、状态变更与调用链行为同步。
                     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                     * @param event 参数 event 为事件对象，用于提供交互上下文。
                     */
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
                    /**
                     * onInput：执行当前位置的功能逻辑。
                     * 定位：`packages/plugin-lower-code-vue/src/designer/right/DesignerPropertiesPane/index.ts:326`。
                     * 功能：处理参数消化、状态变更与调用链行为同步。
                     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
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
                h('label', { style: labelStyle }, [
                  '数据类型',
                  h('select', {
                    value: props.selectedField.type,
                    disabled: props.readonly,
                    style: inputStyle,
                    /**
                     * onChange：执行当前位置的功能逻辑。
                     * 定位：`packages/plugin-lower-code-vue/src/designer/right/DesignerPropertiesPane/index.ts:341`。
                     * 功能：处理参数消化、状态变更与调用链行为同步。
                     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                     * @param event 参数 event 为事件对象，用于提供交互上下文。
                     */
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
                    /**
                     * onChange：执行当前位置的功能逻辑。
                     * 定位：`packages/plugin-lower-code-vue/src/designer/right/DesignerPropertiesPane/index.ts:372`。
                     * 功能：处理参数消化、状态变更与调用链行为同步。
                     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                     * @param event 参数 event 为事件对象，用于提供交互上下文。
                     */
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
                    /**
                     * onChange：执行当前位置的功能逻辑。
                     * 定位：`packages/plugin-lower-code-vue/src/designer/right/DesignerPropertiesPane/index.ts:393`。
                     * 功能：处理参数消化、状态变更与调用链行为同步。
                     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
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
                         * onInput：执行当前位置的功能逻辑。
                         * 定位：`packages/plugin-lower-code-vue/src/designer/right/DesignerPropertiesPane/index.ts:421`。
                         * 功能：处理参数消化、状态变更与调用链行为同步。
                         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
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
              componentEditableProps.value.length > 0
                ? h('div', { style: panelSectionStyle }, [
                    h('div', { style: { fontSize: '12px', fontWeight: 700, marginBottom: '8px' } }, `组件属性（${props.selectedField.component}）`),
                    ...componentEditableProps.value.map(renderEditablePropEditor),
                  ])
                : null,
            ])
          : null,

        props.selectedContainer
          ? h('div', [
              h('div', { style: panelSectionStyle }, [
                h('div', { style: { fontSize: '12px', fontWeight: 700, marginBottom: '8px' } }, '容器信息'),
                h('label', { style: labelStyle }, [
                  '容器标题',
                  h('input', {
                    value: props.selectedContainer.title,
                    disabled: props.readonly,
                    style: inputStyle,
                    /**
                     * onInput：执行当前位置的功能逻辑。
                     * 定位：`packages/plugin-lower-code-vue/src/designer/right/DesignerPropertiesPane/index.ts:453`。
                     * 功能：处理参数消化、状态变更与调用链行为同步。
                     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
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
                     * onInput：执行当前位置的功能逻辑。
                     * 定位：`packages/plugin-lower-code-vue/src/designer/right/DesignerPropertiesPane/index.ts:465`。
                     * 功能：处理参数消化、状态变更与调用链行为同步。
                     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
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
                             * onClick：执行当前位置的功能逻辑。
                             * 定位：`packages/plugin-lower-code-vue/src/designer/right/DesignerPropertiesPane/index.ts:482`。
                             * 功能：处理参数消化、状态变更与调用链行为同步。
                             * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
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
                           * onInput：执行当前位置的功能逻辑。
                           * 定位：`packages/plugin-lower-code-vue/src/designer/right/DesignerPropertiesPane/index.ts:514`。
                           * 功能：处理参数消化、状态变更与调用链行为同步。
                           * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
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
                           * onInput：执行当前位置的功能逻辑。
                           * 定位：`packages/plugin-lower-code-vue/src/designer/right/DesignerPropertiesPane/index.ts:526`。
                           * 功能：处理参数消化、状态变更与调用链行为同步。
                           * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
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
                             * onClick：执行当前位置的功能逻辑。
                             * 定位：`packages/plugin-lower-code-vue/src/designer/right/DesignerPropertiesPane/index.ts:535`。
                             * 功能：处理参数消化、状态变更与调用链行为同步。
                             * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
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

        !props.selectedField && !props.selectedContainer && props.selectedSection
          ? h('div', { style: panelSectionStyle }, [
              h('div', { style: { fontSize: '12px', fontWeight: 700, marginBottom: '8px' } }, '分组信息'),
              h('label', { style: labelStyle }, [
                '分组标题',
                h('input', {
                  value: props.selectedSection.title,
                  disabled: props.readonly,
                  style: inputStyle,
                  /**
                   * onInput：执行当前位置的功能逻辑。
                   * 定位：`packages/plugin-lower-code-vue/src/designer/right/DesignerPropertiesPane/index.ts:564`。
                   * 功能：处理参数消化、状态变更与调用链行为同步。
                   * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
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
                   * onInput：执行当前位置的功能逻辑。
                   * 定位：`packages/plugin-lower-code-vue/src/designer/right/DesignerPropertiesPane/index.ts:576`。
                   * 功能：处理参数消化、状态变更与调用链行为同步。
                   * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                   * @param event 参数 event 为事件对象，用于提供交互上下文。
                   */
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

    /**
     * renderFooter?????????????????
     * ???`packages/plugin-lower-code-vue/src/designer/right/DesignerPropertiesPane/index.ts:788`?
     * ?????????????????????????????????
     * ??????????????????????????
     * @returns ?????????????
     */
    const /**
           * renderFooter：执行当前位置的功能逻辑。
           * 定位：`packages/plugin-lower-code-vue/src/designer/right/DesignerPropertiesPane/index.ts:600`。
           * 功能：处理参数消化、状态变更与调用链行为同步。
           * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
           * @returns 返回当前分支执行后的处理结果。
           */
      renderFooter = (): VNodeChild => (props.selectedField || props.selectedContainer || props.selectedSection)
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
