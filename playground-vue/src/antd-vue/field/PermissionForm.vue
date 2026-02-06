<template>
  <div>
    <h2>字段级权限控制</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">基于角色的字段可见性 + 读写权限矩阵</p>
    <ASpace direction="vertical" :style="{ width: '100%', marginBottom: '16px' }">
      <ASegmented v-model:value="mode" :options="MODE_OPTIONS" />
      <ASpace><span style="font-weight: 600">当前角色：</span><ASegmented v-model:value="role" :options="[{label:'管理员',value:'admin'},{label:'经理',value:'manager'},{label:'员工',value:'staff'},{label:'访客',value:'guest'}]" /></ASpace>
    </ASpace>
    <ACard size="small" style="margin-bottom: 16px"><span style="font-weight: 600">权限矩阵（当前角色：{{ role }}）</span><div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px"><ATag v-for="d in FIELD_DEFS" :key="d.name" :color="PERM_MATRIX[d.name]?.[role] === 'editable' ? 'green' : PERM_MATRIX[d.name]?.[role] === 'readOnly' ? 'orange' : 'red'">{{ d.label }}: {{ PERM_MATRIX[d.name]?.[role] ?? 'hidden' }}</ATag></div></ACard>
    <FormProvider :form="form"><form @submit.prevent="handleSubmit" novalidate>
      <FormField v-for="d in FIELD_DEFS" :key="d.name" v-slot="{ field }" :name="d.name">
        <AFormItem v-if="field.visible" :label="field.label" :required="field.required">
          <AInputNumber v-if="d.name === 'salary'" :value="(field.value as number)" @update:value="field.setValue($event)" :disabled="field.pattern === 'disabled' || mode === 'disabled'" :readonly="field.pattern === 'readOnly' || mode === 'readOnly'" style="width: 100%" />
          <ATextarea v-else-if="d.name === 'remark'" :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" :disabled="field.pattern === 'disabled' || mode === 'disabled'" />
          <AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" :disabled="field.pattern === 'disabled' || mode === 'disabled'" :readonly="field.pattern === 'readOnly' || mode === 'readOnly'" />
        </AFormItem>
      </FormField>
      <ASpace v-if="mode === 'editable'"><AButton type="primary" html-type="submit">提交</AButton><AButton @click="form.reset()">重置</AButton></ASpace>
    </form></FormProvider>
    <AAlert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" message="提交结果" style="margin-top: 16px"><template #description><pre style="margin: 0; white-space: pre-wrap">{{ result }}</pre></template></AAlert>
  </div>
</template>
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { Button as AButton, Space as ASpace, Alert as AAlert, Segmented as ASegmented, Input as AInput, InputNumber as AInputNumber, FormItem as AFormItem, Card as ACard, Textarea as ATextarea, Tag as ATag } from 'ant-design-vue'
import type { FieldPattern } from '@moluoxixi/shared'
setupAntdVue()
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
