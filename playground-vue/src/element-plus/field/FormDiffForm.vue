<template>
  <div>
    <h2>表单比对</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">变更高亮 / 原始值 vs 当前值 / 变更摘要</p>
    <el-radio-group v-model="mode" size="small" style="margin-bottom: 16px">
      <el-radio-button v-for="opt in MODE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</el-radio-button>
    </el-radio-group>
    <el-card shadow="never" style="margin-bottom: 16px"><el-space><span style="font-weight: 600">变更摘要：</span><el-tag v-if="changedFields.length === 0" type="success">无变更</el-tag><template v-else><el-tag type="warning">{{ changedFields.length }} 个已修改</el-tag><el-tag v-for="d in changedFields" :key="d.name" type="danger">{{ d.label }}</el-tag></template></el-space></el-card>
    <FormProvider :form="form"><form @submit.prevent="handleSubmit" novalidate>
      <FormField v-for="d in FIELD_DEFS" :key="d.name" v-slot="{ field }" :name="d.name">
        <el-form-item :label="d.label" :style="{ background: isChanged(d.name) ? '#fffbe6' : undefined, padding: isChanged(d.name) ? '4px 8px' : undefined, borderRadius: '4px' }" :help="isChanged(d.name) ? `原始值: ${String(ORIGINAL[d.name] ?? '—')}` : undefined">
          <el-input-number v-if="d.type === 'number'" :model-value="(field.value as number)" @update:model-value="field.setValue($event)" :disabled="mode === 'disabled'" style="width: 100%" />
          <el-input v-else-if="d.type === 'textarea'" type="textarea" :model-value="(field.value as string) ?? ''" @update:model-value="field.setValue($event)" :disabled="mode === 'disabled'" :rows="2" />
          <el-input v-else :model-value="(field.value as string) ?? ''" @update:model-value="field.setValue($event)" :disabled="mode === 'disabled'" />
        </el-form-item>
      </FormField>
      <el-button v-if="mode === 'editable'" type="primary" native-type="submit">提交</el-button>
    </form></FormProvider>
    <el-alert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" title="提交结果" style="margin-top: 16px" :description="result" show-icon />
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/vue'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import { ElButton, ElSpace, ElAlert, ElRadioGroup, ElRadioButton, ElInput, ElInputNumber, ElFormItem, ElCard, ElTag } from 'element-plus'
import type { FieldPattern } from '@moluoxixi/shared'
setupElementPlus()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const FIELD_DEFS = [{ name: 'name', label: '姓名', type: 'text' }, { name: 'email', label: '邮箱', type: 'text' }, { name: 'phone', label: '电话', type: 'text' }, { name: 'salary', label: '薪资', type: 'number' }, { name: 'department', label: '部门', type: 'text' }, { name: 'bio', label: '简介', type: 'textarea' }]
const ORIGINAL: Record<string, unknown> = { name: '张三', email: 'zhangsan@company.com', phone: '13800138000', salary: 25000, department: '技术部', bio: '5 年前端经验' }
const currentValues = ref<Record<string, unknown>>({ ...ORIGINAL })
const form = useCreateForm({ initialValues: { ...ORIGINAL } })
onMounted(() => { FIELD_DEFS.forEach(d => form.createField({ name: d.name, label: d.label })); form.onValuesChange((v: Record<string, unknown>) => { currentValues.value = { ...v } }) })
function isChanged(name: string): boolean { return String(ORIGINAL[name] ?? '') !== String(currentValues.value[name] ?? '') }
const changedFields = computed(() => FIELD_DEFS.filter(d => isChanged(d.name)))
async function handleSubmit(): Promise<void> { const res = await form.submit(); result.value = res.errors.length > 0 ? '验证失败: ' + res.errors.map(e => e.message).join(', ') : JSON.stringify(res.values, null, 2) }
</script>
