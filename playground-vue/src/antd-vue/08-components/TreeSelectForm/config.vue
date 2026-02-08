<template>
  <div>
    <h2>树形选择</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">antd TreeSelect / 单选+多选 / 组织树 — ConfigForm + Schema 实现</p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <ConfigForm
        :schema="withMode(schema, mode)"
        :initial-values="initialValues"
        @submit="showResult"
        @submit-failed="(e: any) => st?.showErrors(e)"
      />
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/core'
import { setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { ConfigForm, registerComponent } from '@moluoxixi/vue'
/**
 * 树形选择 — Config 模式
 *
 * 自定义 TreeSelectPicker 组件注册后，在 schema 中通过 component: 'TreeSelectPicker' 引用。
 */
import { defineComponent, h, ref } from 'vue'

setupAntdVue()

/** 树形节点 */
interface TreeNode { title: string; value: string; children?: TreeNode[] }

/** 递归展平树数据为 option 列表 */
function flattenTree(nodes: TreeNode[], depth = 0): Array<{ title: string; value: string; depth: number }> {
  const result: Array<{ title: string; value: string; depth: number }> = []
  for (const node of nodes) {
    result.push({ title: node.title, value: node.value, depth })
    if (node.children) result.push(...flattenTree(node.children, depth + 1))
  }
  return result
}

/** 树形选择器组件 */
const TreeSelectPicker = defineComponent({
  name: 'TreeSelectPicker',
  props: {
    value: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    onChange: { type: Function as PropType<(v: string | string[]) => void>, default: undefined },
    disabled: { type: Boolean, default: false },
    readOnly: { type: Boolean, default: false },
    treeData: { type: Array as PropType<TreeNode[]>, default: () => [] },
    treeCheckable: { type: Boolean, default: false },
    placeholder: { type: String, default: '' },
    style: { type: [String, Object] as PropType<string | Record<string, string>>, default: undefined },
  },
  setup(props) {
    return (): ReturnType<typeof h> => {
      if (props.readOnly) {
        const values = Array.isArray(props.value) ? props.value : props.value ? [props.value] : []
        if (values.length === 0) return h('span', { style: { color: '#999' } }, '—')
        return h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '4px' } }, values.map(v => h('span', { key: v, style: { display: 'inline-block', padding: '0 7px', fontSize: '12px', lineHeight: '20px', borderRadius: '4px', border: '1px solid #91caff', color: '#1677ff', background: '#e6f4ff' } }, v)))
      }
      const flatOptions = flattenTree(props.treeData)
      if (props.treeCheckable) {
        const selected = Array.isArray(props.value) ? props.value : []
        return h('div', { style: { border: '1px solid #d9d9d9', borderRadius: '6px', padding: '8px', maxHeight: '220px', overflowY: 'auto', ...(typeof props.style === 'object' ? props.style : {}) } }, flatOptions.map(opt =>
          h('label', { key: opt.value, style: { display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 0', paddingLeft: `${opt.depth * 16}px`, cursor: props.disabled ? 'not-allowed' : 'pointer', opacity: props.disabled ? 0.5 : 1 } }, [
            h('input', { type: 'checkbox', checked: selected.includes(opt.value), disabled: props.disabled, onChange: () => { const next = selected.includes(opt.value) ? selected.filter(v => v !== opt.value) : [...selected, opt.value]; props.onChange?.(next) } }),
            h('span', null, opt.title),
          ]),
        ))
      }
      return h('select', { value: props.value ?? '', disabled: props.disabled, style: { width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: '6px', fontSize: '14px', ...(typeof props.style === 'object' ? props.style : {}) }, onChange: (e: Event) => props.onChange?.((e.target as HTMLSelectElement).value) }, [
        h('option', { value: '', disabled: true }, props.placeholder || '请选择'),
        ...flatOptions.map(opt => h('option', { key: opt.value, value: opt.value, style: { paddingLeft: `${opt.depth * 12}px` } }, '\u00A0'.repeat(opt.depth * 2) + opt.title)),
      ])
    }
  },
})

registerComponent('TreeSelectPicker', TreeSelectPicker, { defaultWrapper: 'FormItem' })

const st = ref<InstanceType<typeof StatusTabs>>()

/** 组织树数据 */
const TREE: TreeNode[] = [{ title: '总公司', value: 'root', children: [{ title: '技术中心', value: 'tech', children: [{ title: '前端组', value: 'frontend' }, { title: '后端组', value: 'backend' }] }, { title: '产品中心', value: 'product', children: [{ title: '产品设计', value: 'pd' }, { title: '用户研究', value: 'ux' }] }] }]

const initialValues = { memberName: '', department: undefined, accessDepts: [] as string[] }

const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
  properties: {
    memberName: { type: 'string', title: '成员姓名', required: true, componentProps: { placeholder: '请输入姓名', style: 'width: 300px' } },
    department: { type: 'string', title: '所属部门', required: true, component: 'TreeSelectPicker', componentProps: { treeData: TREE, placeholder: '请选择部门', style: 'width: 300px' } },
    accessDepts: { type: 'string', title: '可访问部门', component: 'TreeSelectPicker', componentProps: { treeData: TREE, treeCheckable: true, placeholder: '多选可访问部门', style: 'width: 100%' } },
  },
}

/** 将 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}
</script>
