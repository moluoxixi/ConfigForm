<template>
  <div>
    <h2>分步表单</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">Steps 导航 / 步骤验证 / 预览汇总</p>
    <PlaygroundForm :form="form">
      <template #default="{ mode }">
        <ASteps :current="step" :items="STEPS.map(s => ({ title: s.title }))" style="margin-bottom: 24px" />
        <ACard v-if="step === 0" title="基本信息">
          <ARow :gutter="24">
            <ACol :span="12"><FormField v-slot="{ field }" name="name"><div style="margin-bottom: 16px"><label style="display: block; margin-bottom: 4px; font-weight: 500">{{ field.label }} *</label><span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span><AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" placeholder="姓名" :disabled="mode === 'disabled'" /><div v-if="field.errors.length" style="color: #ff4d4f; font-size: 12px; margin-top: 4px">{{ field.errors[0].message }}</div></div></FormField></ACol>
            <ACol :span="12"><FormField v-slot="{ field }" name="phone"><div style="margin-bottom: 16px"><label style="display: block; margin-bottom: 4px; font-weight: 500">{{ field.label }} *</label><span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span><AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" placeholder="手机号" :disabled="mode === 'disabled'" /><div v-if="field.errors.length" style="color: #ff4d4f; font-size: 12px; margin-top: 4px">{{ field.errors[0].message }}</div></div></FormField></ACol>
            <ACol :span="12"><FormField v-slot="{ field }" name="email"><div style="margin-bottom: 16px"><label style="display: block; margin-bottom: 4px; font-weight: 500">{{ field.label }} *</label><span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span><AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" placeholder="邮箱" :disabled="mode === 'disabled'" /><div v-if="field.errors.length" style="color: #ff4d4f; font-size: 12px; margin-top: 4px">{{ field.errors[0].message }}</div></div></FormField></ACol>
          </ARow>
        </ACard>
        <ACard v-if="step === 1" title="工作信息">
          <ARow :gutter="24">
            <ACol :span="12"><FormField v-slot="{ field }" name="company"><div style="margin-bottom: 16px"><label style="display: block; margin-bottom: 4px; font-weight: 500">{{ field.label }} *</label><span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span><AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" placeholder="公司" :disabled="mode === 'disabled'" /></div></FormField></ACol>
            <ACol :span="12"><FormField v-slot="{ field }" name="position"><div style="margin-bottom: 16px"><label style="display: block; margin-bottom: 4px; font-weight: 500">{{ field.label }} *</label><span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span><AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" placeholder="职位" :disabled="mode === 'disabled'" /></div></FormField></ACol>
          </ARow>
        </ACard>
        <ACard v-if="step === 2" title="确认信息">
          <ADescriptions bordered :column="2">
            <ADescriptionsItem label="姓名">{{ form.getFieldValue('name') || '—' }}</ADescriptionsItem>
            <ADescriptionsItem label="手机号">{{ form.getFieldValue('phone') || '—' }}</ADescriptionsItem>
            <ADescriptionsItem label="邮箱">{{ form.getFieldValue('email') || '—' }}</ADescriptionsItem>
            <ADescriptionsItem label="公司">{{ form.getFieldValue('company') || '—' }}</ADescriptionsItem>
            <ADescriptionsItem label="职位">{{ form.getFieldValue('position') || '—' }}</ADescriptionsItem>
          </ADescriptions>
        </ACard>
        <div style="display: flex; justify-content: space-between; margin-top: 16px">
          <div><AButton v-if="step > 0" @click="step--">上一步</AButton></div>
          <AButton v-if="step < 2" type="primary" @click="handleNext">下一步</AButton>
        </div>
      </template>
    </PlaygroundForm>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FormField, useCreateForm } from '@moluoxixi/vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { Button as AButton, Card as ACard, Steps as ASteps, Row as ARow, Col as ACol, Input as AInput, Descriptions as ADescriptions, DescriptionsItem as ADescriptionsItem } from 'ant-design-vue'
import PlaygroundForm from '../../components/PlaygroundForm.vue'

setupAntdVue()

const step = ref(0)
const STEPS = [{ title: '基本信息', fields: ['name', 'phone', 'email'] }, { title: '工作信息', fields: ['company', 'position'] }, { title: '确认提交', fields: [] }]

const form = useCreateForm({ initialValues: { name: '', phone: '', email: '', company: '', position: '' } })
onMounted(() => {
  form.createField({ name: 'name', label: '姓名', required: true, rules: [{ minLength: 2, message: '至少 2 字' }] })
  form.createField({ name: 'phone', label: '手机号', required: true, rules: [{ format: 'phone', message: '无效手机号' }] })
  form.createField({ name: 'email', label: '邮箱', required: true, rules: [{ format: 'email', message: '无效邮箱' }] })
  form.createField({ name: 'company', label: '公司', required: true })
  form.createField({ name: 'position', label: '职位', required: true })
})
async function handleNext(): Promise<void> { const fields = STEPS[step.value].fields; const results = await Promise.all(fields.map(async n => { const f = form.getField(n); return f ? f.validate('submit') : [] })); if (results.flat().length === 0) step.value++ }
</script>
