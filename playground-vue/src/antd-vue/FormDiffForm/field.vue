<template>
  <div>
    <h2>表单比对</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">变更高亮 / 原始值 vs 当前值 / 变更摘要</p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <ACard size="small" style="margin-bottom: 16px"><ASpace><span style="font-weight: 600">变更摘要：</span><ATag v-if="changedFields.length === 0" color="green">无变更</ATag><template v-else><ATag color="orange">{{ changedFields.length }} 个已修改</ATag><ATag v-for="d in changedFields" :key="d.name" color="red">{{ d.label }}</ATag></template></ASpace></ACard>
        <FormField v-for="d in FIELD_DEFS" :key="d.name" v-slot="{ field }" :name="d.name">
          <AFormItem :label="d.label" :style="{ background: isChanged(d.name) ? '#fffbe6' : undefined, padding: isChanged(d.name) ? '4px 8px' : undefined, borderRadius: '4px' }" :help="isChanged(d.name) ? `原始值: ${String(ORIGINAL[d.name] ?? '—')}` : undefined">
            <template v-if="mode === 'readOnly'"><span v-if="d.type === 'textarea'" style="white-space:pre-wrap">{{ (field.value as string) || '—' }}</span><span v-else>{{ field.value ?? '—' }}</span></template>
            <template v-else><AInputNumber v-if="d.type === 'number'" :value="(field.value as number)" @update:value="field.setValue($event)" :disabled="mode === 'disabled'" style="width: 100%" />
            <ATextarea v-else-if="d.type === 'textarea'" :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" :disabled="mode === 'disabled'" :rows="2" />
            <AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" :disabled="mode === 'disabled'" /></template>
          </AFormItem>
        </FormField>
        <div v-if="mode === 'editable'" style="margin-top: 16px; display: flex; gap: 8px">
          <button type="button" @click="handleSubmit(showResult)" style="padding: 4px 15px; background: #1677ff; color: #fff; border: none; border-radius: 6px; cursor: pointer">提交</button>
          <button type="button" @click="form.reset()" style="padding: 4px 15px; background: #fff; border: 1px solid #d9d9d9; border-radius: 6px; cursor: pointer">重置</button>
        </div>
      </FormProvider>
    </StatusTabs>
  </div>
</template>
<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/vue'
import { setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { Space as ASpace, Input as AInput, InputNumber as AInputNumber, FormItem as AFormItem, Card as ACard, Textarea as ATextarea, Tag as ATag } from 'ant-design-vue'
import type { FieldPattern } from '@moluoxixi/shared'

setupAntdVue()

const st = ref<InstanceType<typeof StatusTabs>>()

const FIELD_DEFS = [{ name: 'name', label: '姓名', type: 'text' }, { name: 'email', label: '邮箱', type: 'text' }, { name: 'phone', label: '电话', type: 'text' }, { name: 'salary', label: '薪资', type: 'number' }, { name: 'department', label: '部门', type: 'text' }, { name: 'bio', label: '简介', type: 'textarea' }]
const ORIGINAL: Record<string, unknown> = { name: '张三', email: 'zhangsan@company.com', phone: '13800138000', salary: 25000, department: '技术部', bio: '5 年前端经验' }
const currentValues = ref<Record<string, unknown>>({ ...ORIGINAL })
const form = useCreateForm({ initialValues: { ...ORIGINAL } })

/** 同步 StatusTabs 的 mode 到 form.pattern */
watch(() => st.value?.mode, (v) => { if (v) form.pattern = v as FieldPattern }, { immediate: true })

/** 提交处理 */
async function handleSubmit(showResult: (data: Record<string, unknown>) => void): Promise<void> {
  const res = await form.submit()
  if (res.errors.length > 0) { st.value?.showErrors(res.errors) }
  else { showResult(res.values) }
}

onMounted(() => { FIELD_DEFS.forEach(d => form.createField({ name: d.name, label: d.label })); form.onValuesChange((v: Record<string, unknown>) => { currentValues.value = { ...v } }) })
function isChanged(name: string): boolean { return String(ORIGINAL[name] ?? '') !== String(currentValues.value[name] ?? '') }
const changedFields = computed(() => FIELD_DEFS.filter(d => isChanged(d.name)))
</script>
