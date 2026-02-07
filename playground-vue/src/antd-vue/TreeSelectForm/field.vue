<template>
  <div>
    <h2>树形选择</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">antd TreeSelect / 单选+多选 / 组织树结构</p>
    <PlaygroundForm :form="form">
      <template #default="{ form: f, mode }">
        <FormField v-slot="{ field }" name="memberName"><AFormItem :label="field.label"><AInput :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" :disabled="mode === 'disabled'" style="width: 300px" /></AFormItem></FormField>
        <FormField v-slot="{ field }" name="department"><AFormItem :label="field.label"><ATag v-if="mode === 'readOnly'" color="blue">{{ field.value ?? '—' }}</ATag><ATreeSelect v-else :value="(field.value as string)" @change="(v: string) => field.setValue(v)" :tree-data="TREE" placeholder="请选择部门" style="width: 300px" tree-default-expand-all :disabled="mode === 'disabled'" /></AFormItem></FormField>
        <FormField v-slot="{ field }" name="accessDepts"><AFormItem :label="field.label"><ASpace v-if="mode === 'readOnly'" wrap><ATag v-for="v in ((field.value as string[]) ?? [])" :key="v" color="green">{{ v }}</ATag></ASpace><ATreeSelect v-else :value="(field.value as string[]) ?? []" @change="(v: string[]) => field.setValue(v)" :tree-data="TREE" placeholder="多选可访问部门" style="width: 100%" tree-default-expand-all tree-checkable :disabled="mode === 'disabled'" /></AFormItem></FormField>
      </template>
    </PlaygroundForm>
  </div>
</template>
<script setup lang="ts">
import { onMounted } from 'vue'
import { FormField, useCreateForm } from '@moluoxixi/vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { Space as ASpace, Input as AInput, FormItem as AFormItem, TreeSelect as ATreeSelect, Tag as ATag } from 'ant-design-vue'
import PlaygroundForm from '../../components/PlaygroundForm.vue'
setupAntdVue()
const TREE = [{ title: '总公司', value: 'root', children: [{ title: '技术中心', value: 'tech', children: [{ title: '前端组', value: 'frontend' }, { title: '后端组', value: 'backend' }] }, { title: '产品中心', value: 'product', children: [{ title: '产品设计', value: 'pd' }, { title: '用户研究', value: 'ux' }] }] }]
const form = useCreateForm({ initialValues: { memberName: '', department: undefined, accessDepts: [] } })
onMounted(() => { form.createField({ name: 'memberName', label: '成员姓名', required: true }); form.createField({ name: 'department', label: '所属部门', required: true }); form.createField({ name: 'accessDepts', label: '可访问部门' }) })
</script>
