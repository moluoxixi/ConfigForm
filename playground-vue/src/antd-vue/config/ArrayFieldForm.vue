<template>
  <div>
    <h2>数组字段</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">增删 / 排序 / 复制 / min-max 数量限制</p>
    <ASegmented v-model:value="mode" :options="MODE_OPTIONS" style="margin-bottom: 16px" />
    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit" novalidate>
        <FormField v-slot="{ field }" name="groupName">
          <AFormItem :label="field.label" :required="field.required"><AInput :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" :disabled="mode === 'disabled'" :readonly="mode === 'readOnly'" style="width: 300px" /></AFormItem>
        </FormField>
        <FormArrayField v-slot="{ arrayField }" name="contacts" :field-props="{ minItems: 1, maxItems: 8, itemTemplate: () => ({ name: '', phone: '', email: '' }) }">
          <div style="margin-bottom: 16px">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px">
              <span style="font-weight: 600">联系人列表 ({{ ((arrayField.value as unknown[]) ?? []).length }}/8)</span>
              <AButton v-if="mode === 'editable'" type="primary" size="small" :disabled="!arrayField.canAdd" @click="arrayField.push({ name: '', phone: '', email: '' })">添加</AButton>
            </div>
            <div v-for="(_, idx) in ((arrayField.value as unknown[]) ?? [])" :key="idx" :style="{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 1fr auto', gap: '8px', padding: '8px 12px', background: idx % 2 === 0 ? '#fafafa' : '#fff', borderRadius: '4px', alignItems: 'center' }">
              <span style="color: #999">#{{ idx + 1 }}</span>
              <FormField v-slot="{ field }" :name="`contacts.${idx}.name`"><span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span><AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" placeholder="姓名" size="small" :disabled="mode === 'disabled'" /></FormField>
              <FormField v-slot="{ field }" :name="`contacts.${idx}.phone`"><span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span><AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" placeholder="电话" size="small" :disabled="mode === 'disabled'" /></FormField>
              <FormField v-slot="{ field }" :name="`contacts.${idx}.email`"><span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span><AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" placeholder="邮箱" size="small" :disabled="mode === 'disabled'" /></FormField>
              <ASpace v-if="mode === 'editable'" :size="4">
                <AButton size="small" :disabled="idx === 0" @click="arrayField.moveUp(idx)">↑</AButton>
                <AButton size="small" :disabled="idx === ((arrayField.value as unknown[]) ?? []).length - 1" @click="arrayField.moveDown(idx)">↓</AButton>
                <AButton size="small" danger :disabled="!arrayField.canRemove" @click="arrayField.remove(idx)">删</AButton>
              </ASpace>
            </div>
          </div>
        </FormArrayField>
        <AButton v-if="mode === 'editable'" type="primary" html-type="submit">提交</AButton>
      </form>
    </FormProvider>
    <AAlert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" message="提交结果" style="margin-top: 16px"><template #description><pre style="margin: 0; white-space: pre-wrap">{{ result }}</pre></template></AAlert>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FormProvider, FormField, FormArrayField, useCreateForm } from '@moluoxixi/vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { Button as AButton, Space as ASpace, Alert as AAlert, Segmented as ASegmented, Input as AInput, FormItem as AFormItem } from 'ant-design-vue'
import type { FieldPattern } from '@moluoxixi/shared'

setupAntdVue()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const form = useCreateForm({ initialValues: { groupName: '默认分组', contacts: [{ name: '', phone: '', email: '' }] } })
onMounted(() => { form.createField({ name: 'groupName', label: '分组名称', required: true }) })
async function handleSubmit(): Promise<void> { const res = await form.submit(); if (res.errors.length > 0) { result.value = '验证失败: ' + res.errors.map(e => e.message).join(', ') } else { result.value = JSON.stringify(res.values, null, 2) } }
</script>
