<template>
  <div>
    <h2>表单布局</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">水平 / 垂直 / 行内 / 栅格布局</p>
    <div style="margin-bottom: 16px">
      <span style="font-weight: 600; margin-right: 12px">布局类型：</span>
      <ASegmented v-model:value="layoutType" :options="LAYOUT_OPTIONS" />
    </div>
    <PlaygroundForm :schema="schema" :initial-values="initialValues" />
  </div>
</template>

<script setup lang="ts">
/**
 * 场景 2：表单布局（Ant Design Vue）
 */
import { computed, ref } from 'vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { Segmented as ASegmented } from 'ant-design-vue'
import type { FormSchema } from '@moluoxixi/schema'
import PlaygroundForm from '../../components/PlaygroundForm.vue'

setupAntdVue()

const LAYOUT_OPTIONS = [{ label: '水平', value: 'horizontal' }, { label: '垂直', value: 'vertical' }, { label: '行内', value: 'inline' }, { label: '栅格两列', value: 'grid-2col' }]

type LayoutType = 'horizontal' | 'vertical' | 'inline' | 'grid-2col'

const layoutType = ref<LayoutType>('horizontal')

const initialValues = { name: '', email: '', phone: '', department: undefined, role: '', joinDate: '' }

const FIELDS: FormSchema['fields'] = {
  name: { type: 'string', label: '姓名', required: true, component: 'Input', wrapper: 'FormItem', placeholder: '请输入姓名' },
  email: { type: 'string', label: '邮箱', required: true, component: 'Input', wrapper: 'FormItem', placeholder: '请输入邮箱', rules: [{ format: 'email', message: '无效邮箱' }] },
  phone: { type: 'string', label: '手机号', component: 'Input', wrapper: 'FormItem', placeholder: '请输入手机号' },
  department: { type: 'string', label: '部门', component: 'Select', wrapper: 'FormItem', placeholder: '请选择', enum: [{ label: '技术部', value: 'tech' }, { label: '产品部', value: 'product' }, { label: '设计部', value: 'design' }] },
  role: { type: 'string', label: '职位', component: 'Input', wrapper: 'FormItem', placeholder: '请输入职位' },
  joinDate: { type: 'string', label: '入职日期', component: 'DatePicker', wrapper: 'FormItem' },
}

const schema = computed<FormSchema>(() => {
  const s: FormSchema = { form: { labelWidth: '100px' }, fields: { ...FIELDS } }
  switch (layoutType.value) {
    case 'horizontal': s.form!.labelPosition = 'right'; s.form!.direction = 'vertical'; break
    case 'vertical': s.form!.labelPosition = 'top'; s.form!.direction = 'vertical'; break
    case 'inline': s.form!.labelPosition = 'right'; s.form!.direction = 'inline'; break
    case 'grid-2col': s.form!.labelPosition = 'right'; s.layout = { type: 'grid', columns: 2, gutter: 24 }; break
  }
  return s
})
</script>
