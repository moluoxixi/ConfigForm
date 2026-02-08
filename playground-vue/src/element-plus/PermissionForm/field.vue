<template>
  <div>
    <h2>字段级权限控制</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      基于角色的字段可见性 + 读写权限矩阵
    </p>
    <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; margin-bottom: 16px">
      <div style="display: flex; gap: 8px">
        <button v-for="opt in MODE_OPTIONS" :key="opt.value" type="button" :style="{ padding: '4px 12px', borderRadius: '4px', border: '1px solid #dcdfe6', background: mode === opt.value ? '#409eff' : '#fff', color: mode === opt.value ? '#fff' : '#606266', cursor: 'pointer', fontSize: '12px' }" @click="mode = opt.value as FieldPattern">
          {{ opt.label }}
        </button>
      </div>
      <div style="display: flex; gap: 8px; align-items: center">
        <span style="font-weight: 600">当前角色：</span>
        <button v-for="r in ROLE_OPTIONS" :key="r.value" type="button" :style="{ padding: '4px 12px', borderRadius: '4px', border: '1px solid #dcdfe6', background: role === r.value ? '#409eff' : '#fff', color: role === r.value ? '#fff' : '#606266', cursor: 'pointer', fontSize: '12px' }" @click="role = r.value as Role">
          {{ r.label }}
        </button>
      </div>
    </div>
    <div style="border: 1px solid #e4e7ed; border-radius: 4px; padding: 16px; margin-bottom: 16px">
      <span style="font-weight: 600">权限矩阵（当前角色：{{ role }}）</span>
      <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px">
        <span v-for="d in FIELD_DEFS" :key="d.name" :style="getPermTagStyle(PERM_MATRIX[d.name]?.[role] ?? 'hidden')">
          {{ d.label }}: {{ PERM_MATRIX[d.name]?.[role] ?? 'hidden' }}
        </span>
      </div>
    </div>
    <FormProvider :form="form">
        <FormField v-for="d in FIELD_DEFS" :key="d.name" v-slot="{ field }" :name="d.name">
          <div v-if="field.visible" style="margin-bottom: 18px">
            <label style="display: block; margin-bottom: 4px; font-size: 14px; color: #606266">
              <span v-if="field.required" style="color: #f56c6c; margin-right: 4px">*</span>{{ field.label }}
            </label>
            <input v-if="d.name === 'salary'" type="number" :value="(field.value as number)" :disabled="field.pattern === 'disabled' || mode === 'disabled'" :readonly="field.pattern === 'readOnly' || mode === 'readOnly'" style="width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 14px; box-sizing: border-box" @input="field.setValue(Number(($event.target as HTMLInputElement).value) || 0)" />
            <textarea v-else-if="d.name === 'remark'" :value="(field.value as string) ?? ''" :disabled="field.pattern === 'disabled' || mode === 'disabled'" :readonly="field.pattern === 'readOnly' || mode === 'readOnly'" style="width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 14px; resize: vertical; box-sizing: border-box" @input="field.setValue(($event.target as HTMLTextAreaElement).value)" />
            <input v-else :value="(field.value as string) ?? ''" :disabled="field.pattern === 'disabled' || mode === 'disabled'" :readonly="field.pattern === 'readOnly' || mode === 'readOnly'" style="width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 14px; box-sizing: border-box" @input="field.setValue(($event.target as HTMLInputElement).value)" />
          </div>
        </FormField>
        <div style="display: flex; gap: 8px">
          <button type="submit" style="padding: 8px 16px; background: #409eff; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 14px">
            提交
          </button>
          <button type="button" style="padding: 8px 16px; background: #fff; color: #606266; border: 1px solid #dcdfe6; border-radius: 4px; cursor: pointer; font-size: 14px" @click="form.reset()">
            重置
          </button>
        </div>
    </FormProvider>
    <div v-if="result" :style="{ marginTop: '16px', padding: '12px 16px', borderRadius: '4px', background: result.startsWith('验证失败') ? '#fef0f0' : '#f0f9eb', color: result.startsWith('验证失败') ? '#f56c6c' : '#67c23a', border: result.startsWith('验证失败') ? '1px solid #fde2e2' : '1px solid #e1f3d8' }">
      <strong>提交结果</strong>
      <div style="margin-top: 4px; white-space: pre-wrap">{{ result }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { onMounted, ref, watch } from 'vue'

setupElementPlus()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const ROLE_OPTIONS = [{ label: '管理员', value: 'admin' }, { label: '经理', value: 'manager' }, { label: '员工', value: 'staff' }, { label: '访客', value: 'guest' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
type Role = 'admin' | 'manager' | 'staff' | 'guest'
const role = ref<Role>('admin')
const FIELD_DEFS = [{ name: 'name', label: '姓名' }, { name: 'email', label: '邮箱' }, { name: 'salary', label: '薪资' }, { name: 'department', label: '部门' }, { name: 'level', label: '职级' }, { name: 'remark', label: '备注' }]
const PERM_MATRIX: Record<string, Record<Role, string>> = { name: { admin: 'editable', manager: 'editable', staff: 'editable', guest: 'readOnly' }, email: { admin: 'editable', manager: 'editable', staff: 'readOnly', guest: 'hidden' }, salary: { admin: 'editable', manager: 'readOnly', staff: 'hidden', guest: 'hidden' }, department: { admin: 'editable', manager: 'editable', staff: 'readOnly', guest: 'readOnly' }, level: { admin: 'editable', manager: 'readOnly', staff: 'hidden', guest: 'hidden' }, remark: { admin: 'editable', manager: 'editable', staff: 'editable', guest: 'hidden' } }
/** 权限标签样式 */
function getPermTagStyle(perm: string): Record<string, string> {
  const styles: Record<string, { bg: string; color: string; border: string }> = {
    editable: { bg: '#f0f9eb', color: '#67c23a', border: '#e1f3d8' },
    readOnly: { bg: '#fdf6ec', color: '#e6a23c', border: '#faecd8' },
    hidden: { bg: '#fef0f0', color: '#f56c6c', border: '#fde2e2' },
  }
  const s = styles[perm] ?? styles.hidden
  return { display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', background: s.bg, color: s.color, border: `1px solid ${s.border}` }
}
const form = useCreateForm({ initialValues: { name: '张三', email: 'zhangsan@company.com', salary: 25000, department: '技术部', level: 'P7', remark: '' } })
onMounted(() => {
  FIELD_DEFS.forEach(d => form.createField({ name: d.name, label: d.label }))
})
watch([role, mode], () => {
  FIELD_DEFS.forEach((d) => {
    const f = form.getField(d.name)
    if (!f)
      return
    const perm = PERM_MATRIX[d.name]?.[role.value] ?? 'hidden'
    f.visible = perm !== 'hidden'
    if (mode.value === 'editable') {
      f.pattern = (perm === 'readOnly' ? 'readOnly' : 'editable') as FieldPattern
    }
    else {
      f.pattern = mode.value
    }
  })
}, { immediate: true })
</script>
