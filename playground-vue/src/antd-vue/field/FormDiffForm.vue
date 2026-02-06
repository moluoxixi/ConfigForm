<template>
  <div>
    <h2>表单比对</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">变更高亮 / 原始值 vs 当前值 / 变更摘要</p>
    <ASegmented v-model:value="mode" :options="MODE_OPTIONS" style="margin-bottom: 16px" />
    <ACard size="small" style="margin-bottom: 16px"><ASpace><span style="font-weight: 600">变更摘要：</span><ATag v-if="changedFields.length === 0" color="green">无变更</ATag><template v-else><ATag color="orange">{{ changedFields.length }} 个已修改</ATag><ATag v-for="d in changedFields" :key="d.name" color="red">{{ d.label }}</ATag></template></ASpace></ACard>
    <FormProvider :form="form"><form @submit.prevent="handleSubmit" novalidate>
      <FormField v-for="d in FIELD_DEFS" :key="d.name" v-slot="{ field }" :name="d.name">
        <AFormItem :label="d.label" :style="{ background: isChanged(d.name) ? '#fffbe6' : undefined, padding: isChanged(d.name) ? '4px 8px' : undefined, borderRadius: '4px' }" :help="isChanged(d.name) ? `原始值: ${String(ORIGINAL[d.name] ?? '—')}` : undefined">
          <AInputNumber v-if="d.type === 'number'" :value="(field.value as number)" @update:value="field.setValue($event)" :disabled="mode === 'disabled'" style="width: 100%" />
          <ATextarea v-else-if="d.type === 'textarea'" :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" :disabled="mode === 'disabled'" :rows="2" />
          <AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" :disabled="mode === 'disabled'" />
        </AFormItem>
      </FormField>
      <AButton v-if="mode === 'editable'" type="primary" html-type="submit">提交</AButton>
    </form></FormProvider>
    <AAlert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" message="提交结果" style="margin-top: 16px"><template #description><pre style="margin: 0; white-space: pre-wrap">{{ result }}</pre></template></AAlert>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { Button as AButton, Space as ASpace, Alert as AAlert, Segmented as ASegmented, Input as AInput, InputNumber as AInputNumber, FormItem as AFormItem, Card as ACard, Textarea as ATextarea, Tag as ATag } from 'ant-design-vue'
import type { FieldPattern } from '@moluoxixi/shared'
setupAntdVue()
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
