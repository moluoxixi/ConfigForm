<template>
  <div>
    <h2>树形选择</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      antd TreeSelect / 单选+多选 / 组织树结构
    </p>
    <StatusTabs ref="st" v-slot="{ showResult }">
      <FormProvider :form="form">
          <FormField name="memberName" :field-props="{ label: '成员姓名', required: true, component: 'Input', componentProps: { placeholder: '请输入姓名', style: 'width: 300px' } }" />
          <FormField name="department" :field-props="{ label: '所属部门', required: true, component: 'TreeSelectPicker', componentProps: { treeData: TREE, placeholder: '请选择部门', style: 'width: 300px' } }" />
          <FormField name="accessDepts" :field-props="{ label: '可访问部门', component: 'TreeSelectPicker', componentProps: { treeData: TREE, treeCheckable: true, placeholder: '多选可访问部门', style: 'width: 100%' } }" />
          <LayoutFormActions @submit="showResult" @submit-failed="(e: any) => st?.showErrors(e)" />
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { FieldPattern } from '@moluoxixi/shared'
import { LayoutFormActions, setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider, registerComponent, useCreateForm } from '@moluoxixi/vue'
// TODO: ATreeSelect 暂时保留 ant-design-vue 依赖，后续替换为自定义树选择组件
import { TreeSelect as ATreeSelect } from 'ant-design-vue'
import { defineComponent, h, ref, watch } from 'vue'

setupAntdVue()

// ========== 自定义组件：树形选择器 ==========

/** 树形节点数据类型 */
interface TreeNode {
  title: string
  value: string
  children?: TreeNode[]
}

/**
 * 树形选择器组件
 *
 * - 编辑态：antd TreeSelect（支持单选 / 多选）
 * - 禁用态：antd TreeSelect（disabled）
 * - 只读态：Tag 标签展示选中值
 */
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
      /* 只读态：Tag 标签展示 */
      if (props.readOnly) {
        const values = Array.isArray(props.value) ? props.value : props.value ? [props.value] : []
        if (values.length === 0) {
          return h('span', { style: { color: '#999' } }, '—')
        }
        return h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '4px' } },
          values.map(v => h('span', { key: v, style: { display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', border: '1px solid #91caff', background: '#e6f4ff', color: '#0958d9' } }, v)),
        )
      }

      /* 编辑态 / 禁用态：antd TreeSelect */
      return h(ATreeSelect, {
        value: props.value,
        treeData: props.treeData,
        placeholder: props.placeholder,
        treeDefaultExpandAll: true,
        treeCheckable: props.treeCheckable,
        disabled: props.disabled,
        style: props.style,
        onChange: (v: string | string[]) => props.onChange?.(v),
      })
    }
  },
})

registerComponent('TreeSelectPicker', TreeSelectPicker, { defaultWrapper: 'FormItem' })

// ========== 表单配置 ==========

const st = ref<InstanceType<typeof StatusTabs>>()

/** 组织树数据 */
const TREE: TreeNode[] = [
  {
    title: '总公司',
    value: 'root',
    children: [
      {
        title: '技术中心',
        value: 'tech',
        children: [
          { title: '前端组', value: 'frontend' },
          { title: '后端组', value: 'backend' },
        ],
      },
      {
        title: '产品中心',
        value: 'product',
        children: [
          { title: '产品设计', value: 'pd' },
          { title: '用户研究', value: 'ux' },
        ],
      },
    ],
  },
]

const form = useCreateForm({
  initialValues: {
    memberName: '',
    department: undefined,
    accessDepts: [] as string[],
  },
})

/** 同步 StatusTabs 的 mode 到 form.pattern */
watch(() => st.value?.mode, (v) => {
  if (v)
    form.pattern = v as FieldPattern
}, { immediate: true })

</script>
