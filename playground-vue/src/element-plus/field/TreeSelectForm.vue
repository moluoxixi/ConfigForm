<template>
  <div>
    <h2>树形选择</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">Element Plus TreeSelect / 单选+多选 / 组织树结构</p>
    <el-radio-group v-model="mode" size="small" style="margin-bottom: 16px">
      <el-radio-button v-for="opt in MODE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</el-radio-button>
    </el-radio-group>
    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit" novalidate>
        <FormField v-slot="{ field }" name="memberName"><el-form-item :label="field.label"><el-input :model-value="(field.value as string) ?? ''" @update:model-value="field.setValue($event)" :disabled="mode === 'disabled'" style="width: 300px" /></el-form-item></FormField>
        <FormField v-slot="{ field }" name="department"><el-form-item :label="field.label"><el-tag v-if="mode === 'readOnly'" type="primary">{{ field.value ?? '—' }}</el-tag><el-tree-select v-else :model-value="(field.value as string)" @update:model-value="field.setValue($event)" :data="TREE" placeholder="请选择部门" style="width: 300px" default-expand-all :disabled="mode === 'disabled'" /></el-form-item></FormField>
        <FormField v-slot="{ field }" name="accessDepts"><el-form-item :label="field.label"><el-space v-if="mode === 'readOnly'" wrap><el-tag v-for="v in ((field.value as string[]) ?? [])" :key="v" type="success">{{ v }}</el-tag></el-space><el-tree-select v-else :model-value="(field.value as string[]) ?? []" @update:model-value="field.setValue($event)" :data="TREE" placeholder="多选可访问部门" style="width: 100%" default-expand-all multiple :disabled="mode === 'disabled'" /></el-form-item></FormField>
        <el-button v-if="mode === 'editable'" type="primary" native-type="submit">提交</el-button>
      </form>
    </FormProvider>
    <el-alert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" :description="result" show-icon style="margin-top: 16px" />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/vue'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import { ElButton, ElSpace, ElAlert, ElRadioGroup, ElRadioButton, ElInput, ElFormItem, ElTreeSelect, ElTag } from 'element-plus'
import type { FieldPattern } from '@moluoxixi/shared'
setupElementPlus()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const TREE = [{ label: '总公司', value: 'root', children: [{ label: '技术中心', value: 'tech', children: [{ label: '前端组', value: 'frontend' }, { label: '后端组', value: 'backend' }] }, { label: '产品中心', value: 'product', children: [{ label: '产品设计', value: 'pd' }, { label: '用户研究', value: 'ux' }] }] }]
const form = useCreateForm({ initialValues: { memberName: '', department: undefined, accessDepts: [] } })
onMounted(() => { form.createField({ name: 'memberName', label: '成员姓名', required: true }); form.createField({ name: 'department', label: '所属部门', required: true }); form.createField({ name: 'accessDepts', label: '可访问部门' }) })
async function handleSubmit(): Promise<void> { const res = await form.submit(); result.value = res.errors.length > 0 ? '验证失败: ' + res.errors.map(e => e.message).join(', ') : JSON.stringify(res.values, null, 2) }
</script>
