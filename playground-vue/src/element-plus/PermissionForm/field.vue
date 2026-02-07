<template>
  <div>
    <h2>字段级权限控制</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">基于角色的字段可见性 + 读写权限矩阵</p>
    <el-space direction="vertical" :style="{ width: '100%', marginBottom: '16px' }">
      <el-radio-group v-model="mode" size="small">
        <el-radio-button v-for="opt in MODE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</el-radio-button>
      </el-radio-group>
      <el-space><span style="font-weight: 600">当前角色：</span><el-radio-group v-model="role" size="small"><el-radio-button v-for="r in [{label:'管理员',value:'admin'},{label:'经理',value:'manager'},{label:'员工',value:'staff'},{label:'访客',value:'guest'}]" :key="r.value" :value="r.value">{{ r.label }}</el-radio-button></el-radio-group></el-space>
    </el-space>
    <el-card shadow="never" style="margin-bottom: 16px"><span style="font-weight: 600">权限矩阵（当前角色：{{ role }}）</span><div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px"><el-tag v-for="d in FIELD_DEFS" :key="d.name" :type="PERM_MATRIX[d.name]?.[role] === 'editable' ? 'success' : PERM_MATRIX[d.name]?.[role] === 'readOnly' ? 'warning' : 'danger'">{{ d.label }}: {{ PERM_MATRIX[d.name]?.[role] ?? 'hidden' }}</el-tag></div></el-card>
    <FormProvider :form="form"><form @submit.prevent="handleSubmit" novalidate>
      <FormField v-for="d in FIELD_DEFS" :key="d.name" v-slot="{ field }" :name="d.name">
        <el-form-item v-if="field.visible" :label="field.label" :required="field.required">
          <el-input-number v-if="d.name === 'salary'" :model-value="(field.value as number)" @update:model-value="field.setValue($event)" :disabled="field.pattern === 'disabled' || mode === 'disabled'" :readonly="field.pattern === 'readOnly' || mode === 'readOnly'" style="width: 100%" />
          <el-input v-else-if="d.name === 'remark'" type="textarea" :model-value="(field.value as string) ?? ''" @update:model-value="field.setValue($event)" :disabled="field.pattern === 'disabled' || mode === 'disabled'" :readonly="field.pattern === 'readOnly' || mode === 'readOnly'" />
          <el-input v-else :model-value="(field.value as string) ?? ''" @update:model-value="field.setValue($event)" :disabled="field.pattern === 'disabled' || mode === 'disabled'" :readonly="field.pattern === 'readOnly' || mode === 'readOnly'" />
        </el-form-item>
      </FormField>
      <el-space v-if="mode === 'editable'"><el-button type="primary" native-type="submit">提交</el-button><el-button @click="form.reset()">重置</el-button></el-space>
    </form></FormProvider>
    <el-alert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" title="提交结果" style="margin-top: 16px" :description="result" show-icon />
  </div>
</template>
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/vue'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import { ElButton, ElSpace, ElAlert, ElRadioGroup, ElRadioButton, ElInput, ElInputNumber, ElFormItem, ElCard, ElTag } from 'element-plus'
import type { FieldPattern } from '@moluoxixi/shared'
setupElementPlus()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
type Role = 'admin' | 'manager' | 'staff' | 'guest'
const role = ref<Role>('admin')
const FIELD_DEFS = [{ name: 'name', label: '姓名' }, { name: 'email', label: '邮箱' }, { name: 'salary', label: '薪资' }, { name: 'department', label: '部门' }, { name: 'level', label: '职级' }, { name: 'remark', label: '备注' }]
const PERM_MATRIX: Record<string, Record<Role, string>> = { name: { admin: 'editable', manager: 'editable', staff: 'editable', guest: 'readOnly' }, email: { admin: 'editable', manager: 'editable', staff: 'readOnly', guest: 'hidden' }, salary: { admin: 'editable', manager: 'readOnly', staff: 'hidden', guest: 'hidden' }, department: { admin: 'editable', manager: 'editable', staff: 'readOnly', guest: 'readOnly' }, level: { admin: 'editable', manager: 'readOnly', staff: 'hidden', guest: 'hidden' }, remark: { admin: 'editable', manager: 'editable', staff: 'editable', guest: 'hidden' } }
const form = useCreateForm({ initialValues: { name: '张三', email: 'zhangsan@company.com', salary: 25000, department: '技术部', level: 'P7', remark: '' } })
onMounted(() => { FIELD_DEFS.forEach(d => form.createField({ name: d.name, label: d.label })) })
watch([role, mode], () => { FIELD_DEFS.forEach(d => { const f = form.getField(d.name); if (!f) return; const perm = PERM_MATRIX[d.name]?.[role.value] ?? 'hidden'; f.visible = perm !== 'hidden'; if (mode.value === 'editable') { f.pattern = (perm === 'readOnly' ? 'readOnly' : 'editable') as FieldPattern } else { f.pattern = mode.value } }) }, { immediate: true })
async function handleSubmit(): Promise<void> { const res = await form.submit(); result.value = res.errors.length > 0 ? '验证失败: ' + res.errors.map(e => e.message).join(', ') : JSON.stringify(res.values, null, 2) }
</script>
