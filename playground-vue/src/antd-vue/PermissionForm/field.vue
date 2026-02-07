<template>
  <div>
    <h2>字段级权限控制</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      基于角色的字段可见性 + 读写权限矩阵
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <ASpace style="margin-bottom: 16px">
          <span style="font-weight: 600">当前角色：</span><ASegmented v-model:value="role" :options="[{ label: '管理员', value: 'admin' }, { label: '经理', value: 'manager' }, { label: '员工', value: 'staff' }, { label: '访客', value: 'guest' }]" />
        </ASpace>
        <ACard size="small" style="margin-bottom: 16px">
          <span style="font-weight: 600">权限矩阵（当前角色：{{ role }}）</span><div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px">
            <ATag v-for="d in FIELD_DEFS" :key="d.name" :color="PERM_MATRIX[d.name]?.[role] === 'editable' ? 'green' : PERM_MATRIX[d.name]?.[role] === 'readOnly' ? 'orange' : 'red'">
              {{ d.label }}: {{ PERM_MATRIX[d.name]?.[role] ?? 'hidden' }}
            </ATag>
          </div>
        </ACard>
        <FormField v-for="d in FIELD_DEFS" :key="d.name" v-slot="{ field }" :name="d.name">
          <AFormItem v-if="field.visible" :label="field.label" :required="field.required">
            <AInputNumber v-if="d.name === 'salary'" :value="(field.value as number)" :disabled="field.pattern === 'disabled' || mode === 'disabled'" :readonly="field.pattern === 'readOnly' || mode === 'readOnly'" style="width: 100%" @update:value="field.setValue($event)" />
            <ATextarea v-else-if="d.name === 'remark'" :value="(field.value as string) ?? ''" :disabled="field.pattern === 'disabled' || mode === 'disabled'" @update:value="field.setValue($event)" />
            <AInput v-else :value="(field.value as string) ?? ''" :disabled="field.pattern === 'disabled' || mode === 'disabled'" :readonly="field.pattern === 'readOnly' || mode === 'readOnly'" @update:value="field.setValue($event)" />
          </AFormItem>
        </FormField>
        <div v-if="mode === 'editable'" style="margin-top: 16px; display: flex; gap: 8px">
          <button type="button" style="padding: 4px 15px; background: #1677ff; color: #fff; border: none; border-radius: 6px; cursor: pointer" @click="handleSubmit(showResult)">
            提交
          </button>
          <button type="button" style="padding: 4px 15px; background: #fff; border: 1px solid #d9d9d9; border-radius: 6px; cursor: pointer" @click="form.reset()">
            重置
          </button>
        </div>
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { Card as ACard, FormItem as AFormItem, Input as AInput, InputNumber as AInputNumber, Segmented as ASegmented, Space as ASpace, Tag as ATag, Textarea as ATextarea } from 'ant-design-vue'
import { onMounted, ref, watch } from 'vue'

setupAntdVue()
const st = ref<InstanceType<typeof StatusTabs>>()
type Role = 'admin' | 'manager' | 'staff' | 'guest'
const role = ref<Role>('admin')
const FIELD_DEFS = [{ name: 'name', label: '姓名' }, { name: 'email', label: '邮箱' }, { name: 'salary', label: '薪资' }, { name: 'department', label: '部门' }, { name: 'level', label: '职级' }, { name: 'remark', label: '备注' }]
const PERM_MATRIX: Record<string, Record<Role, string>> = { name: { admin: 'editable', manager: 'editable', staff: 'editable', guest: 'readOnly' }, email: { admin: 'editable', manager: 'editable', staff: 'readOnly', guest: 'hidden' }, salary: { admin: 'editable', manager: 'readOnly', staff: 'hidden', guest: 'hidden' }, department: { admin: 'editable', manager: 'editable', staff: 'readOnly', guest: 'readOnly' }, level: { admin: 'editable', manager: 'readOnly', staff: 'hidden', guest: 'hidden' }, remark: { admin: 'editable', manager: 'editable', staff: 'editable', guest: 'hidden' } }
const form = useCreateForm({ initialValues: { name: '张三', email: 'zhangsan@company.com', salary: 25000, department: '技术部', level: 'P7', remark: '' } })
onMounted(() => {
  FIELD_DEFS.forEach(d => form.createField({ name: d.name, label: d.label }))
})
watch([role, () => form.pattern], () => {
  FIELD_DEFS.forEach((d) => {
    const f = form.getField(d.name)
    if (!f)
      return
    const perm = PERM_MATRIX[d.name]?.[role.value] ?? 'hidden'
    f.visible = perm !== 'hidden'
    if (form.pattern === 'editable') {
      f.pattern = (perm === 'readOnly' ? 'readOnly' : 'editable') as FieldPattern
    }
    else {
      f.pattern = form.pattern
    }
  })
}, { immediate: true })
watch(() => st.value?.mode, (v) => {
  if (v)
    form.pattern = v as FieldPattern
}, { immediate: true })
async function handleSubmit(showResult: (data: Record<string, unknown>) => void): Promise<void> {
  const res = await form.submit()
  if (res.errors.length > 0) {
    st.value?.showErrors(res.errors)
  }
  else {
    showResult(res.values)
  }
}
</script>
