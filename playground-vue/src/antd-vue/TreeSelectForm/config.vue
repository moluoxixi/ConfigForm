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
import type { FieldPattern } from '@moluoxixi/shared'
import { setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { ConfigForm, registerComponent } from '@moluoxixi/vue'
/**
 * 树形选择 — Config 模式
 *
 * 自定义 TreeSelectPicker 组件注册后，在 schema 中通过 component: 'TreeSelectPicker' 引用。
 */
import { Tag as ATag, TreeSelect as ATreeSelect } from 'ant-design-vue'
import { defineComponent, h, ref } from 'vue'

setupAntdVue()

/** 树形节点 */
interface TreeNode { title: string; value: string; children?: TreeNode[] }

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
        return h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '4px' } }, values.map(v => h(ATag, { color: 'blue', key: v }, () => v)))
      }
      return h(ATreeSelect, { value: props.value, treeData: props.treeData, placeholder: props.placeholder, treeDefaultExpandAll: true, treeCheckable: props.treeCheckable, disabled: props.disabled, style: props.style, onChange: (v: string | string[]) => props.onChange?.(v) })
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
