<template>
  <div>
    <h2>数组字段</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">增删 / 排序 / 复制 / min-max 数量限制</p>
    <PlaygroundForm :form="form">
      <template #default="{ mode }">
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
      </template>
    </PlaygroundForm>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { FormField, FormArrayField, useCreateForm } from '@moluoxixi/vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { Button as AButton, Space as ASpace, Input as AInput, FormItem as AFormItem } from 'ant-design-vue'
import PlaygroundForm from '../../components/PlaygroundForm.vue'

setupAntdVue()

const form = useCreateForm({ initialValues: { groupName: '默认分组', contacts: [{ name: '', phone: '', email: '' }] } })
onMounted(() => { form.createField({ name: 'groupName', label: '分组名称', required: true }) })
</script>
