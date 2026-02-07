<template>
  <div>
    <h2>动态增删字段</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      运行时添加/移除字段
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <ACard v-if="mode === 'editable'" size="small" title="添加新字段" style="margin-bottom: 16px">
          <ASpace>
            <AInput v-model:value="newLabel" placeholder="字段标签" style="width: 200px" /><ASelect v-model:value="newType" :options="[{ label: '文本', value: 'text' }, { label: '数字', value: 'number' }, { label: '选择', value: 'select' }]" style="width: 120px" /><AButton type="primary" :disabled="!newLabel.trim()" @click="addField">
              添加
            </AButton>
          </ASpace>
          <div style="margin-top: 8px; color: #999; font-size: 12px">
            已添加 {{ dynamicFields.length }} 个动态字段
          </div>
        </ACard>
        <FormField v-slot="{ field }" name="title">
          <AFormItem :label="field.label" :required="field.required">
            <AInput :value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" :readonly="mode === 'readOnly'" @update:value="field.setValue($event)" />
          </AFormItem>
        </FormField>
        <FormField v-for="df in dynamicFields" :key="df.id" v-slot="{ field }" :name="df.name">
          <AFormItem :label="field.label">
            <ASpace style="width: 100%">
              <ASelect v-if="df.fieldType === 'select'" :value="(field.value as string)" :options="[{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }, { label: 'C', value: 'c' }]" placeholder="请选择" style="width: 200px" :disabled="mode === 'disabled'" @change="(v: string) => field.setValue(v)" />
              <AInput v-else :value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" :readonly="mode === 'readOnly'" style="width: 200px" @update:value="field.setValue($event)" />
              <AButton v-if="mode === 'editable'" danger @click="removeField(df.id)">
                删除
              </AButton>
            </ASpace>
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
import { Button as AButton, Card as ACard, FormItem as AFormItem, Input as AInput, Select as ASelect, Space as ASpace } from 'ant-design-vue'
import { onMounted, ref, watch } from 'vue'

setupAntdVue()
const st = ref<InstanceType<typeof StatusTabs>>()

const newLabel = ref('')
const newType = ref('text')
let counter = 0

interface DynField { id: string, name: string, label: string, fieldType: string }
const dynamicFields = ref<DynField[]>([])

const form = useCreateForm({ initialValues: { title: '' } })
onMounted(() => {
  form.createField({ name: 'title', label: '表单标题', required: true })
})

function addField(): void {
  if (!newLabel.value.trim())
    return
  counter++
  const id = `dyn_${counter}`
  form.createField({ name: id, label: newLabel.value.trim() })
  dynamicFields.value.push({ id, name: id, label: newLabel.value.trim(), fieldType: newType.value })
  newLabel.value = ''
}
function removeField(id: string): void {
  form.removeField(id)
  dynamicFields.value = dynamicFields.value.filter(f => f.id !== id)
}
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
