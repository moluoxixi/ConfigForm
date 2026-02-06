<template>
  <div>
    <h2>分步表单</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">Steps 导航 / 步骤验证 / 预览汇总</p>
    <el-radio-group v-model="mode" size="small" style="margin-bottom: 16px">
      <el-radio-button v-for="opt in MODE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</el-radio-button>
    </el-radio-group>
    <el-steps :active="step" style="margin-bottom: 24px">
      <el-step v-for="s in STEPS" :key="s.title" :title="s.title" />
    </el-steps>
    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit" novalidate>
        <el-card v-if="step === 0" shadow="never" header="基本信息">
          <el-row :gutter="24">
            <el-col :span="12"><FormField v-slot="{ field }" name="name"><div style="margin-bottom: 16px"><label style="display: block; margin-bottom: 4px; font-weight: 500">{{ field.label }} *</label><el-input :model-value="(field.value as string) ?? ''" @update:model-value="field.setValue($event)" placeholder="姓名" :disabled="mode === 'disabled'" /><div v-if="field.errors.length" style="color: #f56c6c; font-size: 12px; margin-top: 4px">{{ field.errors[0].message }}</div></div></FormField></el-col>
            <el-col :span="12"><FormField v-slot="{ field }" name="phone"><div style="margin-bottom: 16px"><label style="display: block; margin-bottom: 4px; font-weight: 500">{{ field.label }} *</label><el-input :model-value="(field.value as string) ?? ''" @update:model-value="field.setValue($event)" placeholder="手机号" :disabled="mode === 'disabled'" /><div v-if="field.errors.length" style="color: #f56c6c; font-size: 12px; margin-top: 4px">{{ field.errors[0].message }}</div></div></FormField></el-col>
            <el-col :span="12"><FormField v-slot="{ field }" name="email"><div style="margin-bottom: 16px"><label style="display: block; margin-bottom: 4px; font-weight: 500">{{ field.label }} *</label><el-input :model-value="(field.value as string) ?? ''" @update:model-value="field.setValue($event)" placeholder="邮箱" :disabled="mode === 'disabled'" /><div v-if="field.errors.length" style="color: #f56c6c; font-size: 12px; margin-top: 4px">{{ field.errors[0].message }}</div></div></FormField></el-col>
          </el-row>
        </el-card>
        <el-card v-if="step === 1" shadow="never" header="工作信息">
          <el-row :gutter="24">
            <el-col :span="12"><FormField v-slot="{ field }" name="company"><div style="margin-bottom: 16px"><label style="display: block; margin-bottom: 4px; font-weight: 500">{{ field.label }} *</label><el-input :model-value="(field.value as string) ?? ''" @update:model-value="field.setValue($event)" placeholder="公司" :disabled="mode === 'disabled'" /></div></FormField></el-col>
            <el-col :span="12"><FormField v-slot="{ field }" name="position"><div style="margin-bottom: 16px"><label style="display: block; margin-bottom: 4px; font-weight: 500">{{ field.label }} *</label><el-input :model-value="(field.value as string) ?? ''" @update:model-value="field.setValue($event)" placeholder="职位" :disabled="mode === 'disabled'" /></div></FormField></el-col>
          </el-row>
        </el-card>
        <el-card v-if="step === 2" shadow="never" header="确认信息">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="姓名">{{ form.getFieldValue('name') || '—' }}</el-descriptions-item>
            <el-descriptions-item label="手机号">{{ form.getFieldValue('phone') || '—' }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ form.getFieldValue('email') || '—' }}</el-descriptions-item>
            <el-descriptions-item label="公司">{{ form.getFieldValue('company') || '—' }}</el-descriptions-item>
            <el-descriptions-item label="职位">{{ form.getFieldValue('position') || '—' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
        <div style="display: flex; justify-content: space-between; margin-top: 16px">
          <div><el-button v-if="step > 0" @click="step--">上一步</el-button></div>
          <el-space>
            <el-button v-if="step < 2" type="primary" @click="handleNext">下一步</el-button>
            <el-button v-if="step === 2 && mode === 'editable'" type="primary" native-type="submit">确认提交</el-button>
          </el-space>
        </div>
      </form>
    </FormProvider>
    <el-alert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" :description="result" show-icon style="margin-top: 16px" />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/vue'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import type { FieldPattern } from '@moluoxixi/shared'
setupElementPlus()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const step = ref(0)
const result = ref('')
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
async function handleSubmit(): Promise<void> { const res = await form.submit(); if (res.errors.length > 0) { result.value = '验证失败: ' + res.errors.map(e => e.message).join(', ') } else { result.value = JSON.stringify(res.values, null, 2) } }
</script>
