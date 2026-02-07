<template>
  <div>
    <h2>对象数组嵌套</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">联系人数组 → 每人含嵌套电话数组</p>
    <StatusTabs ref="st" result-title="提交结果（嵌套结构）" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <FormField v-slot="{ field }" name="teamName"><AFormItem :label="field.label" :required="field.required"><span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span><AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" style="width: 300px" :disabled="mode === 'disabled'" /></AFormItem></FormField>
        <FormArrayField v-slot="{ arrayField }" name="contacts" :field-props="{ minItems: 1, maxItems: 10, itemTemplate: () => ({ name: '', role: '', phones: [{ number: '', label: '手机' }] }) }">
          <div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px">
              <span style="font-weight: 600">团队成员 ({{ ((arrayField.value as unknown[]) ?? []).length }}/10)</span>
              <AButton v-if="mode === 'editable'" type="primary" :disabled="!arrayField.canAdd" @click="arrayField.push({ name: '', role: '', phones: [{ number: '', label: '手机' }] })">添加联系人</AButton>
            </div>
            <ACard v-for="(_, idx) in ((arrayField.value as unknown[]) ?? [])" :key="idx" size="small" :title="`联系人 #${idx + 1}`" style="margin-bottom: 12px">
              <template v-if="mode === 'editable'" #extra><AButton size="small" danger :disabled="!arrayField.canRemove" @click="arrayField.remove(idx)">删除</AButton></template>
              <ASpace>
                <FormField v-slot="{ field }" :name="`contacts.${idx}.name`"><span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span><AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" placeholder="姓名" addon-before="姓名" :disabled="mode === 'disabled'" /></FormField>
                <FormField v-slot="{ field }" :name="`contacts.${idx}.role`"><span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span><AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" placeholder="角色" addon-before="角色" :disabled="mode === 'disabled'" /></FormField>
              </ASpace>
              <FormArrayField v-slot="{ arrayField: phoneArray }" :name="`contacts.${idx}.phones`" :field-props="{ minItems: 1, maxItems: 5, itemTemplate: () => ({ number: '', label: '手机' }) }">
                <div style="padding: 8px 12px; background: #fafafa; border-radius: 4px; margin-top: 8px">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px">
                    <span style="color: #999; font-size: 12px">电话列表 ({{ ((phoneArray.value as unknown[]) ?? []).length }}/5)</span>
                    <AButton v-if="mode === 'editable'" size="small" type="dashed" :disabled="!phoneArray.canAdd" @click="phoneArray.push({ number: '', label: '手机' })">添加电话</AButton>
                  </div>
                  <ASpace v-for="(__, pIdx) in ((phoneArray.value as unknown[]) ?? [])" :key="pIdx" :size="4" style="width: 100%; margin-bottom: 4px">
                    <FormField v-slot="{ field }" :name="`contacts.${idx}.phones.${pIdx}.label`"><span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span><AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" placeholder="标签" size="small" style="width: 80px" :disabled="mode === 'disabled'" /></FormField>
                    <FormField v-slot="{ field }" :name="`contacts.${idx}.phones.${pIdx}.number`"><span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span><AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" placeholder="号码" size="small" style="width: 180px" :disabled="mode === 'disabled'" /></FormField>
                    <AButton v-if="mode === 'editable'" size="small" danger :disabled="!phoneArray.canRemove" @click="phoneArray.remove(pIdx)">删</AButton>
                  </ASpace>
                </div>
              </FormArrayField>
            </ACard>
          </div>
        </FormArrayField>
        <div v-if="mode === 'editable'" style="margin-top: 16px; display: flex; gap: 8px">
          <button type="button" @click="handleSubmit(showResult)" style="padding: 4px 15px; background: #1677ff; color: #fff; border: none; border-radius: 6px; cursor: pointer">提交</button>
          <button type="button" @click="form.reset()" style="padding: 4px 15px; background: #fff; border: 1px solid #d9d9d9; border-radius: 6px; cursor: pointer">重置</button>
        </div>
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { FormProvider, FormField, FormArrayField, useCreateForm } from '@moluoxixi/vue'
import { setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { Button as AButton, Space as ASpace, Input as AInput, Card as ACard, FormItem as AFormItem } from 'ant-design-vue'
import type { FieldPattern } from '@moluoxixi/shared'

setupAntdVue()
const st = ref<InstanceType<typeof StatusTabs>>()

const form = useCreateForm({ initialValues: { teamName: '开发团队', contacts: [{ name: '张三', role: '负责人', phones: [{ number: '13800138001', label: '手机' }] }, { name: '李四', role: '成员', phones: [{ number: '13800138002', label: '手机' }, { number: '010-12345678', label: '座机' }] }] } })
onMounted(() => { form.createField({ name: 'teamName', label: '团队名称', required: true }) })
watch(() => st.value?.mode, (v) => { if (v) form.pattern = v as FieldPattern }, { immediate: true })
async function handleSubmit(showResult: (data: Record<string, unknown>) => void): Promise<void> {
  const res = await form.submit()
  if (res.errors.length > 0) { st.value?.showErrors(res.errors) }
  else { showResult(res.values) }
}
</script>
