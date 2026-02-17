
/// <reference path="./jsoneditor.d.ts" />
import type { DesignerContainerNode, DesignerFieldComponent, DesignerFieldNode, DesignerFieldType, DesignerNode } from '@moluoxixi/plugin-lower-code-core'
import type { CSSProperties, PropType, VNode } from 'vue'
import { cloneDeep } from '@moluoxixi/core'
import {
  addSectionToContainer,
  allowedComponents,
  containerTarget,
  containerUsesSections,
  defaultComponentForType,
  defaultNodeFromMaterial,
  duplicateNodeById,
  findNodeById,
  findSectionById,
  insertNodeByTarget,
  isFieldNode,
  keyToTarget,
  MATERIALS,
  moveNodeByTarget,
  nodesToSchema,
  normalizeNode,
  parseEnumDraft,
  previewValueByNode,
  removeNodeById,
  removeSectionFromContainer,
  rootTarget,
  schemaSignature,
  schemaToNodes,
  sectionTarget,
  targetToKey,
  updateNodeById,
  updateSectionById,
} from '@moluoxixi/plugin-lower-code-core'
import JSONEditor from 'jsoneditor'
import Sortable from 'sortablejs'
import { computed, defineComponent, h, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import 'jsoneditor/dist/jsoneditor.css'

const panelStyle: CSSProperties = { border: '1px solid #e5e7eb', borderRadius: '12px', background: '#fff' }
const panelTitleStyle: CSSProperties = { margin: '0', padding: '12px 16px', fontSize: '13px', fontWeight: 700, borderBottom: '1px solid #f0f0f0' }
const inputStyle: CSSProperties = { width: '100%', border: '1px solid #d9d9d9', borderRadius: '6px', padding: '6px 8px', fontSize: '13px', boxSizing: 'border-box' }
const labelStyle: CSSProperties = { display: 'block', fontSize: '12px', color: '#666', marginBottom: '8px', fontWeight: 600 }

function collectPreviewFields(nodes: DesignerNode[]): DesignerFieldNode[] {
  const fields: DesignerFieldNode[] = []
  const walk = (items: DesignerNode[]): void => {
    for (const item of items) {
      if (isFieldNode(item)) {
        fields.push(item)
        continue
      }
      if (containerUsesSections(item.component)) {
        for (const section of item.sections)
          walk(section.children)
      }
      else {
        walk(item.children)
      }
    }
  }
  walk(nodes)
  return fields
}

function collectDropTargetKeys(nodes: DesignerNode[]): string[] {
  const keys = [targetToKey(rootTarget())]
  const walk = (items: DesignerNode[]): void => {
    for (const item of items) {
      if (item.kind !== 'container')
        continue
      if (containerUsesSections(item.component)) {
        for (const section of item.sections) {
          keys.push(targetToKey(sectionTarget(section.id)))
          walk(section.children)
        }
        continue
      }
      keys.push(targetToKey(containerTarget(item.id)))
      walk(item.children)
    }
  }
  walk(nodes)
  return keys
}

function renderPreviewControl(node: DesignerFieldNode): VNode {
  if (node.component === 'Textarea')
    return h('textarea', { rows: 3, disabled: true, placeholder: `请输入${node.title}`, style: { ...inputStyle, resize: 'vertical', minHeight: '72px', background: '#f8f8f8' } })
  if (node.component === 'Select')
    return h('select', { disabled: true, style: { ...inputStyle, background: '#f8f8f8' } }, node.enumOptions.map(option => h('option', { key: option.value, value: option.value }, option.label)))
  if (node.component === 'InputNumber')
    return h('input', { type: 'number', disabled: true, readonly: true, value: String(previewValueByNode(node)), style: { ...inputStyle, background: '#f8f8f8' } })
  if (node.component === 'Switch')
    return h('label', { style: { display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#555' } }, [h('input', { type: 'checkbox', disabled: true, checked: Boolean(previewValueByNode(node)) }), '开关值'])
  if (node.component === 'DatePicker')
    return h('input', { type: 'date', disabled: true, readonly: true, value: String(previewValueByNode(node)), style: { ...inputStyle, background: '#f8f8f8' } })
  return h('input', { type: 'text', disabled: true, readonly: true, value: String(previewValueByNode(node)), placeholder: `请输入${node.title}`, style: { ...inputStyle, background: '#f8f8f8' } })
}

function restoreDraggedDomPosition(event: Sortable.SortableEvent): void {
  const item = event.item as HTMLElement | null
  const from = event.from as HTMLElement | null
  if (!item || !from)
    return

  const oldIndex = event.oldIndex ?? -1
  if (oldIndex < 0)
    return

  const moveToIndex = (container: HTMLElement, target: HTMLElement, index: number): void => {
    const siblings = Array.from(container.children).filter(child => child !== target)
    if (index >= siblings.length) {
      container.appendChild(target)
      return
    }
    const anchor = siblings[index]
    if (anchor)
      container.insertBefore(target, anchor)
    else
      container.appendChild(target)
  }

  moveToIndex(from, item, oldIndex)
}

export const LowCodeDesigner = defineComponent({
  name: 'LowerCodeDesigner',
  props: {
    modelValue: { type: Object as PropType<unknown>, default: undefined },
    disabled: { type: Boolean, default: false },
    preview: { type: Boolean, default: false },
    minCanvasHeight: { type: Number, default: 420 },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const readonly = computed(() => Boolean(props.disabled || props.preview))
    const nodes = ref<DesignerNode[]>(schemaToNodes(props.modelValue))
    const selectedId = ref<string | null>(nodes.value[0]?.id ?? null)
    const enumDraft = ref('')

    const materialHost = ref<HTMLElement | null>(null)
    const canvasHost = ref<HTMLElement | null>(null)
    const editorHost = ref<HTMLElement | null>(null)
    const editor = ref<JSONEditor | null>(null)
    const sortables = ref<Sortable[]>([])
    let remountTimer: ReturnType<typeof setTimeout> | null = null

    const builtSchema = computed(() => nodesToSchema(nodes.value))
    const builtSig = computed(() => schemaSignature(builtSchema.value))
    const valueSig = computed(() => schemaSignature(props.modelValue))
    const lastSeenValueSig = ref(valueSig.value)

    const selectedNode = computed(() => (selectedId.value ? findNodeById(nodes.value, selectedId.value) : null))
    const selectedSection = computed(() => (selectedId.value ? findSectionById(nodes.value, selectedId.value) : null))
    const selectedField = computed(() => (selectedNode.value?.kind === 'field' ? selectedNode.value : null))
    const selectedContainer = computed(() => (selectedNode.value?.kind === 'container' ? selectedNode.value : null))
    const previewFields = computed(() => collectPreviewFields(nodes.value))
    const dropTargetSig = computed(() => collectDropTargetKeys(nodes.value).sort().join('|'))

    watch(valueSig, (nextSig) => {
      if (nextSig === lastSeenValueSig.value)
        return
      lastSeenValueSig.value = nextSig
      if (nextSig === builtSig.value)
        return
      const nextNodes = schemaToNodes(props.modelValue)
      nodes.value = nextNodes
      selectedId.value = nextNodes[0]?.id ?? null
    })

    watch(builtSchema, (schema) => {
      if (valueSig.value !== builtSig.value)
        emit('update:modelValue', schema)
    }, { deep: true })

    watch([nodes, selectedId], () => {
      if (!selectedId.value) {
        selectedId.value = nodes.value[0]?.id ?? null
        return
      }
      if (!findNodeById(nodes.value, selectedId.value) && !findSectionById(nodes.value, selectedId.value))
        selectedId.value = nodes.value[0]?.id ?? null
    }, { deep: true })

    watch(selectedField, (field) => {
      if (!field || field.component !== 'Select') {
        enumDraft.value = ''
        return
      }
      enumDraft.value = field.enumOptions.map(option => `${option.label}:${option.value}`).join('\n')
    }, { immediate: true })

    function destroySortables(): void {
      sortables.value.forEach(sortable => sortable.destroy())
      sortables.value = []
    }

    async function mountSortables(): Promise<void> {
      await nextTick()
      destroySortables()

      if (materialHost.value) {
        sortables.value.push(Sortable.create(materialHost.value, {
          group: { name: 'configform-lower-code-tree', pull: 'clone', put: false },
          sort: false,
          animation: 160,
          forceFallback: true,
          fallbackOnBody: true,
          disabled: readonly.value,
          draggable: '[data-material-id]',
          ghostClass: 'cf-lc-ghost',
        }))
      }

      if (!canvasHost.value)
        return
      const lists = Array.from(canvasHost.value.querySelectorAll<HTMLElement>('[data-cf-drop-list="true"]'))
      for (const list of lists) {
        sortables.value.push(Sortable.create(list, {
          group: { name: 'configform-lower-code-tree', pull: true, put: true },
          animation: 180,
          forceFallback: true,
          fallbackOnBody: true,
          disabled: readonly.value,
          draggable: '.cf-lc-node',
          ghostClass: 'cf-lc-ghost',
          onAdd: (event) => {
            const item = event.item as HTMLElement
            const materialId = item.dataset.materialId
            if (!materialId)
              return
            item.remove()
            const target = keyToTarget((event.to as HTMLElement).dataset.targetKey)
            const material = MATERIALS.find(m => m.id === materialId)
            if (!target || !material)
              return
            const insertIndex = Math.max(0, event.newIndex ?? 0)
            nodes.value = insertNodeByTarget(nodes.value, target, insertIndex, defaultNodeFromMaterial(material, []))
          },
          onEnd: (event) => {
            const item = event.item as HTMLElement
            if (item.dataset.materialId)
              return
            restoreDraggedDomPosition(event)
            const fromTarget = keyToTarget((event.from as HTMLElement).dataset.targetKey)
            const toTarget = keyToTarget((event.to as HTMLElement).dataset.targetKey)
            const oldIndex = event.oldIndex ?? -1
            const newIndex = event.newIndex ?? -1
            if (!fromTarget || !toTarget || oldIndex < 0 || newIndex < 0)
              return
            nodes.value = moveNodeByTarget(nodes.value, fromTarget, toTarget, oldIndex, newIndex)
            const nodeId = item.dataset.nodeId
            if (nodeId)
              selectedId.value = nodeId
          },
        }))
      }
    }

    function scheduleMountSortables(): void {
      if (remountTimer)
        clearTimeout(remountTimer)
      remountTimer = setTimeout(() => {
        remountTimer = null
        void mountSortables()
      }, 80)
    }

    function updateField(nodeId: string, updater: (field: DesignerFieldNode) => DesignerFieldNode): void {
      nodes.value = updateNodeById(nodes.value, nodeId, node => (node.kind === 'field' ? updater(node) : node))
    }
    function updateContainer(nodeId: string, updater: (container: DesignerContainerNode) => DesignerContainerNode): void {
      nodes.value = updateNodeById(nodes.value, nodeId, node => (node.kind === 'container' ? updater(node) : node))
    }
    function removeNode(nodeId: string): void {
      nodes.value = removeNodeById(nodes.value, nodeId)
      if (selectedId.value === nodeId)
        selectedId.value = null
    }
    function duplicateNode(nodeId: string): void {
      nodes.value = duplicateNodeById(nodes.value, nodeId)
    }
    function renderDropList(items: DesignerNode[], targetKey: string, depth: number, emptyText: string): VNode {
      return h('div', {
        'data-cf-drop-list': 'true',
        'data-target-key': targetKey,
        style: {
          minHeight: depth === 0 ? `${props.minCanvasHeight}px` : '56px',
          padding: depth === 0 ? '12px' : '8px',
          border: depth === 0 ? '1px dashed #d9d9d9' : '1px dashed #e8e8e8',
          borderRadius: '10px',
          background: depth === 0 ? '#fcfdff' : '#fafcff',
          display: 'grid',
          gap: '8px',
        },
      }, [
        ...items.map(node => renderNodeCard(node, depth)),
        items.length === 0 ? h('div', { style: { color: '#9ca3af', fontSize: '12px' } }, emptyText) : null,
      ])
    }

    function renderNodeCard(node: DesignerNode, depth: number): VNode {
      const selected = selectedId.value === node.id
      if (node.kind === 'field') {
        return h('div', {
          key: node.id,
          class: 'cf-lc-node',
          'data-node-id': node.id,
          onClick: () => { selectedId.value = node.id },
          style: {
            border: selected ? '2px solid #1677ff' : '1px solid #d9d9d9',
            borderRadius: '10px',
            padding: '10px',
            background: selected ? '#f0f7ff' : '#fff',
            cursor: readonly.value ? 'default' : 'move',
          },
        }, [
          h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' } }, [
            h('div', { style: { minWidth: 0 } }, [
              h('div', { style: { fontSize: '13px', fontWeight: 700, color: '#1f2937' } }, node.title),
              h('div', { style: { marginTop: '2px', fontSize: '12px', color: '#6b7280' } }, `${node.name} · ${node.component}${node.required ? ' · 必填' : ''}`),
            ]),
            !readonly.value
              ? h('div', { style: { display: 'flex', gap: '6px' } }, [
                  h('button', {
                    type: 'button',
                    onClick: (event: Event) => {
                      event.stopPropagation()
                      duplicateNode(node.id)
                    },
                    style: { border: '1px solid #d9d9d9', color: '#555', background: '#fff', borderRadius: '6px', padding: '2px 8px', fontSize: '12px', cursor: 'pointer' },
                  }, '复制'),
                  h('button', {
                    type: 'button',
                    onClick: (event: Event) => {
                      event.stopPropagation()
                      removeNode(node.id)
                    },
                    style: { border: '1px solid #ffd6d6', color: '#cf1322', background: '#fff5f5', borderRadius: '6px', padding: '2px 8px', fontSize: '12px', cursor: 'pointer' },
                  }, '删除'),
                ])
              : null,
          ]),
        ])
      }

      const sectionChildren = containerUsesSections(node.component)
        ? node.sections.map((section) => {
            const sectionSelected = selectedId.value === section.id
            return h('div', {
              key: section.id,
              style: { border: sectionSelected ? '2px solid #69b1ff' : '1px solid #d9e6f4', borderRadius: '8px', background: '#fff' },
              onClick: (event: Event) => {
                event.stopPropagation()
                selectedId.value = section.id
              },
            }, [
              h('div', {
                style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', padding: '6px 8px', borderBottom: '1px dashed #e5edf7', background: '#f9fbff' },
              }, [
                h('div', { style: { fontSize: '12px', fontWeight: 600, color: '#4b5563' } }, [section.title, h('span', { style: { color: '#9ca3af', fontWeight: 400 } }, ` (${section.name})`)]),
                !readonly.value ? h('button', {
                  type: 'button',
                  onClick: (event: Event) => {
                    event.stopPropagation()
                    nodes.value = removeSectionFromContainer(nodes.value, node.id, section.id)
                  },
                  style: { border: '1px solid #ffe1e1', color: '#cf1322', background: '#fff', borderRadius: '6px', padding: '1px 6px', fontSize: '12px', cursor: 'pointer' },
                }, '删分组') : null,
              ]),
              renderDropList(section.children, targetToKey(sectionTarget(section.id)), depth + 1, '拖拽字段到该分组'),
            ])
          })
        : [renderDropList(node.children, targetToKey(containerTarget(node.id)), depth + 1, '拖拽字段到该容器')]

      return h('div', {
        key: node.id,
        class: 'cf-lc-node',
        'data-node-id': node.id,
        onClick: () => { selectedId.value = node.id },
        style: { border: selected ? '2px solid #1677ff' : '1px solid #cfd8e3', borderRadius: '10px', background: '#fff', overflow: 'hidden', cursor: readonly.value ? 'default' : 'move' },
      }, [
        h('div', {
          style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '8px 10px', borderBottom: '1px solid #eef2f7', background: '#f7f9fc' },
        }, [
          h('div', { style: { minWidth: 0 } }, [
            h('div', { style: { fontSize: '13px', fontWeight: 700, color: '#1f2937' } }, node.title),
            h('div', { style: { marginTop: '2px', fontSize: '12px', color: '#6b7280' } }, `${node.name} · ${node.component}`),
          ]),
          !readonly.value ? h('div', { style: { display: 'flex', gap: '6px' } }, [
            containerUsesSections(node.component) ? h('button', {
              type: 'button',
              onClick: (event: Event) => {
                event.stopPropagation()
                nodes.value = addSectionToContainer(nodes.value, node.id)
              },
              style: { border: '1px solid #cce6ff', color: '#1677ff', background: '#f0f7ff', borderRadius: '6px', padding: '2px 8px', fontSize: '12px', cursor: 'pointer' },
            }, '加分组') : null,
            h('button', {
              type: 'button',
              onClick: (event: Event) => {
                event.stopPropagation()
                duplicateNode(node.id)
              },
              style: { border: '1px solid #d9d9d9', color: '#555', background: '#fff', borderRadius: '6px', padding: '2px 8px', fontSize: '12px', cursor: 'pointer' },
            }, '复制'),
            h('button', {
              type: 'button',
              onClick: (event: Event) => {
                event.stopPropagation()
                removeNode(node.id)
              },
              style: { border: '1px solid #ffd6d6', color: '#cf1322', background: '#fff5f5', borderRadius: '6px', padding: '2px 8px', fontSize: '12px', cursor: 'pointer' },
            }, '删除'),
          ]) : null,
        ]),
        h('div', { style: { padding: '8px', display: 'grid', gap: '8px' } }, sectionChildren),
      ])
    }

    onMounted(async () => {
      if (editorHost.value) {
        editor.value = new JSONEditor(editorHost.value, {
          mode: 'view',
          modes: ['view', 'tree', 'code'],
          mainMenuBar: true,
          navigationBar: true,
          statusBar: true,
          search: true,
          onEditable: () => false,
        })
        try {
          editor.value.set(cloneDeep(builtSchema.value))
        }
        catch {
          editor.value.set({})
        }
      }
      await mountSortables()
    })

    watch([readonly, dropTargetSig], () => {
      scheduleMountSortables()
    }, { immediate: true })

    watch(builtSchema, (schema) => {
      if (!editor.value)
        return
      try {
        editor.value.set(cloneDeep(schema))
      }
      catch {
        editor.value.set({})
      }
    }, { immediate: true, deep: true })

    onBeforeUnmount(() => {
      if (remountTimer)
        clearTimeout(remountTimer)
      destroySortables()
      editor.value?.destroy()
      editor.value = null
    })
    return () => h('div', { style: { border: '1px solid #d9d9d9', borderRadius: '12px', overflow: 'hidden', background: '#fafafa' } }, [
      h('style', undefined, '.cf-lc-ghost { opacity: 0.45; border: 1px dashed #1677ff !important; }'),
      h('div', { style: { padding: '12px 16px', borderBottom: '1px solid #ececec', background: 'linear-gradient(90deg, #f8fbff 0%, #f7fff9 100%)' } }, [
        h('div', { style: { fontSize: '14px', fontWeight: 700, color: '#1f2937' } }, '低代码设计器（容器化树编辑）'),
        h('div', { style: { marginTop: '4px', color: '#6b7280', fontSize: '12px' } }, '支持字段与布局容器（Card / Tabs / Collapse）混排，拖拽到根节点、容器、分组并实时生成 schema。'),
      ]),

      h('div', { style: { display: 'grid', gridTemplateColumns: '220px minmax(520px, 1fr) 320px', gap: '12px', padding: '12px' } }, [
        h('section', { style: panelStyle }, [
          h('h4', { style: panelTitleStyle }, '物料区'),
          h('div', { ref: materialHost, style: { padding: '12px', display: 'grid', gap: '8px' } }, MATERIALS.map(item => h('div', {
            key: item.id,
            'data-material-id': item.id,
            style: { border: '1px solid #d5e4ff', borderRadius: '8px', padding: '8px 10px', background: '#f6f9ff', cursor: readonly.value ? 'not-allowed' : 'grab', opacity: readonly.value ? 0.6 : 1 },
          }, [
            h('div', { style: { fontSize: '13px', fontWeight: 600, color: '#1f2937' } }, item.label),
            h('div', { style: { marginTop: '2px', fontSize: '12px', color: '#6b7280' } }, item.description),
          ]))),
        ]),

        h('section', { style: panelStyle }, [
          h('h4', { style: panelTitleStyle }, '画布'),
          h('div', { ref: canvasHost, style: { padding: '12px' } }, [renderDropList(nodes.value, targetToKey(rootTarget()), 0, '从左侧拖拽一个字段或容器到这里开始设计。')]),
        ]),

        h('section', { style: panelStyle }, [
          h('h4', { style: panelTitleStyle }, '属性面板'),

          selectedField.value ? h('div', { style: { padding: '12px' } }, [
            h('label', { style: labelStyle }, ['字段标题', h('input', {
              value: selectedField.value.title,
              disabled: readonly.value,
              style: inputStyle,
              onInput: (e: Event) => {
                const t = e.target as HTMLInputElement | null
                updateField(selectedField.value!.id, field => ({ ...field, title: t?.value || field.title }))
              },
            })]),
            h('label', { style: labelStyle }, ['字段标识', h('input', {
              value: selectedField.value.name,
              disabled: readonly.value,
              style: inputStyle,
              onInput: (e: Event) => {
                const t = e.target as HTMLInputElement | null
                updateField(selectedField.value!.id, field => normalizeNode({ ...field, name: t?.value ?? field.name }, nodes.value) as DesignerFieldNode)
              },
            })]),
            h('label', { style: labelStyle }, ['数据类型', h('select', {
              value: selectedField.value.type,
              disabled: readonly.value,
              style: inputStyle,
              onChange: (e: Event) => {
                const t = e.target as HTMLSelectElement | null
                const type = (t?.value ?? selectedField.value!.type) as DesignerFieldType
                updateField(selectedField.value!.id, field => normalizeNode({ ...field, type, component: defaultComponentForType(type) }, nodes.value) as DesignerFieldNode)
              },
            }, [h('option', { value: 'string' }, 'string'), h('option', { value: 'number' }, 'number'), h('option', { value: 'boolean' }, 'boolean'), h('option', { value: 'date' }, 'date')])]),
            h('label', { style: labelStyle }, ['渲染组件', h('select', {
              value: selectedField.value.component,
              disabled: readonly.value,
              style: inputStyle,
              onChange: (e: Event) => {
                const t = e.target as HTMLSelectElement | null
                const component = (t?.value ?? selectedField.value!.component) as DesignerFieldComponent
                updateField(selectedField.value!.id, field => normalizeNode({ ...field, component }, nodes.value) as DesignerFieldNode)
              },
            }, allowedComponents(selectedField.value.type).map(component => h('option', { key: component, value: component }, component)))]),
            h('label', { style: { ...labelStyle, marginBottom: '8px' } }, [
              h('input', {
                type: 'checkbox',
                checked: selectedField.value.required,
                disabled: readonly.value,
                style: { marginRight: '6px' },
                onChange: (e: Event) => {
                  const t = e.target as HTMLInputElement | null
                  updateField(selectedField.value!.id, field => ({ ...field, required: Boolean(t?.checked) }))
                },
              }),
              '必填字段',
            ]),
            selectedField.value.component === 'Select'
              ? h('label', { style: labelStyle }, [
                  '枚举选项（label:value 每行一项）',
                  h('textarea', {
                    value: enumDraft.value,
                    disabled: readonly.value,
                    style: { ...inputStyle, minHeight: '96px', resize: 'vertical', fontFamily: 'Consolas, monospace' },
                    onInput: (e: Event) => {
                      const t = e.target as HTMLTextAreaElement | null
                      const text = t?.value ?? ''
                      enumDraft.value = text
                      updateField(selectedField.value!.id, field => ({ ...field, enumOptions: parseEnumDraft(text) }))
                    },
                  }),
                ])
              : null,
          ]) : null,

          selectedContainer.value ? h('div', { style: { padding: '12px' } }, [
            h('label', { style: labelStyle }, ['容器标题', h('input', {
              value: selectedContainer.value.title,
              disabled: readonly.value,
              style: inputStyle,
              onInput: (e: Event) => {
                const t = e.target as HTMLInputElement | null
                updateContainer(selectedContainer.value!.id, c => ({ ...c, title: t?.value || c.title }))
              },
            })]),
            h('label', { style: labelStyle }, ['容器标识', h('input', {
              value: selectedContainer.value.name,
              disabled: readonly.value,
              style: inputStyle,
              onInput: (e: Event) => {
                const t = e.target as HTMLInputElement | null
                updateContainer(selectedContainer.value!.id, c => normalizeNode({ ...c, name: t?.value ?? c.name }, nodes.value) as DesignerContainerNode)
              },
            })]),
            h('div', { style: { ...labelStyle, color: '#374151' } }, `容器类型：${selectedContainer.value.component}`),

            containerUsesSections(selectedContainer.value.component)
              ? h('div', [
                  h('div', {
                    style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0' },
                  }, [
                    h('span', { style: { fontSize: '12px', fontWeight: 700, color: '#4b5563' } }, '分组管理'),
                    !readonly.value
                      ? h('button', {
                          type: 'button',
                          onClick: () => {
                            nodes.value = addSectionToContainer(nodes.value, selectedContainer.value!.id)
                          },
                          style: { border: '1px solid #cce6ff', color: '#1677ff', background: '#f0f7ff', borderRadius: '6px', padding: '2px 8px', fontSize: '12px', cursor: 'pointer' },
                        }, '新增分组')
                      : null,
                  ]),
                  h('div', { style: { display: 'grid', gap: '8px' } }, selectedContainer.value.sections.map(section => h('div', {
                    key: section.id,
                    style: { border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px', background: '#fafafa' },
                  }, [
                    h('label', { style: labelStyle }, [
                      '分组标题',
                      h('input', {
                        value: section.title,
                        disabled: readonly.value,
                        style: inputStyle,
                        onInput: (e: Event) => {
                          const t = e.target as HTMLInputElement | null
                          nodes.value = updateSectionById(nodes.value, section.id, old => ({ ...old, title: t?.value || old.title }))
                        },
                      }),
                    ]),
                    h('label', { style: labelStyle }, [
                      '分组标识',
                      h('input', {
                        value: section.name,
                        disabled: readonly.value,
                        style: inputStyle,
                        onInput: (e: Event) => {
                          const t = e.target as HTMLInputElement | null
                          nodes.value = updateSectionById(nodes.value, section.id, old => ({ ...old, name: t?.value || old.name }))
                        },
                      }),
                    ]),
                    !readonly.value
                      ? h('button', {
                          type: 'button',
                          onClick: () => {
                            nodes.value = removeSectionFromContainer(nodes.value, selectedContainer.value!.id, section.id)
                          },
                          style: { border: '1px solid #ffe1e1', color: '#cf1322', background: '#fff', borderRadius: '6px', padding: '2px 8px', fontSize: '12px', cursor: 'pointer' },
                        }, '删除分组')
                      : null,
                  ]))),
                ])
              : null,
          ]) : null,
          !selectedField.value && !selectedContainer.value && selectedSection.value ? h('div', { style: { padding: '12px' } }, [
            h('label', { style: labelStyle }, ['分组标题', h('input', {
              value: selectedSection.value.title,
              disabled: readonly.value,
              style: inputStyle,
              onInput: (e: Event) => {
                const t = e.target as HTMLInputElement | null
                nodes.value = updateSectionById(nodes.value, selectedSection.value!.id, old => ({ ...old, title: t?.value || old.title }))
              },
            })]),
            h('label', { style: labelStyle }, ['分组标识', h('input', {
              value: selectedSection.value.name,
              disabled: readonly.value,
              style: inputStyle,
              onInput: (e: Event) => {
                const t = e.target as HTMLInputElement | null
                nodes.value = updateSectionById(nodes.value, selectedSection.value!.id, old => ({ ...old, name: t?.value || old.name }))
              },
            })]),
          ]) : null,

          !selectedField.value && !selectedContainer.value && !selectedSection.value ? h('div', { style: { padding: '12px', color: '#6b7280', fontSize: '12px' } }, '选择画布中的字段、容器或分组后，在这里编辑属性。') : null,
        ]),
      ]),

      h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '12px', paddingTop: '0' } }, [
        h('section', { style: panelStyle }, [
          h('h4', { style: panelTitleStyle }, 'Schema（JSONEditor）'),
          h('div', { ref: editorHost, style: { minHeight: '280px' } }),
        ]),
        h('section', { style: panelStyle }, [
          h('h4', { style: panelTitleStyle }, '实时预览'),
          h('div', { style: { borderTop: '1px solid #f0f0f0', padding: '12px', display: 'grid', gap: '10px' } }, [
            ...previewFields.value.map(item => h('div', {
              key: item.id,
              style: { border: '1px solid #ececec', borderRadius: '8px', padding: '10px', background: '#fff' },
            }, [
              h('div', { style: { fontSize: '12px', color: '#666', marginBottom: '6px', fontWeight: 600 } }, [
                `${item.required ? '* ' : ''}${item.title} `,
                h('span', { style: { color: '#9ca3af', fontWeight: 400 } }, `(${item.name})`),
              ]),
              renderPreviewControl(item),
            ])),
            previewFields.value.length === 0 ? h('div', { style: { color: '#9ca3af', fontSize: '12px' } }, '暂无字段，请从左侧物料区拖拽组件到画布。') : null,
          ]),
        ]),
      ]),
    ])
  },
})
