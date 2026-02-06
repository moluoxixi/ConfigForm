<template>
  <div>
    <h2>数据转换</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">format / parse / transform / submitPath</p>
    <el-radio-group v-model="mode" size="small" style="margin-bottom: 16px">
      <el-radio-button v-for="opt in MODE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</el-radio-button>
    </el-radio-group>
    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit" novalidate>
        <FormField v-for="name in FIELDS" :key="name" v-slot="{ field }" :name="name"><el-form-item :label="field.label" :help="field.description"><el-space><el-input :model-value="String(field.value ?? '')" @update:model-value="field.setValue($event)" :disabled="mode === 'disabled'" style="width: 300px" /><el-tag type="primary">原始: {{ JSON.stringify(field.value) }}</el-tag></el-space></el-form-item></FormField>
        <el-space v-if="mode === 'editable'" style="margin-top: 8px"><el-button type="primary" native-type="submit">提交（查看转换结果）</el-button><el-button @click="form.reset()">重置</el-button></el-space>
      </form>
    </FormProvider>
    <el-alert v-if="rawValues" type="info" title="表单原始值" style="margin-top: 16px" :description="rawValues" show-icon />
    <el-alert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" title="提交转换后" style="margin-top: 8px" :description="result" show-icon />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/vue'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import { ElButton, ElSpace, ElAlert, ElRadioGroup, ElRadioButton, ElInput, ElFormItem, ElTag } from 'element-plus'
import type { FieldPattern } from '@moluoxixi/shared'
setupElementPlus()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const rawValues = ref('')
const FIELDS = ['priceCent', 'phoneRaw', 'fullName', 'tags']
const form = useCreateForm({ initialValues: { priceCent: 9990, phoneRaw: '13800138000', fullName: '张三', tags: 'react,vue,typescript' } })
onMounted(() => {
  form.createField({ name: 'priceCent', label: '价格（分→元）', description: 'format: 分转元, parse: 元转分', format: (v: unknown) => v ? (Number(v) / 100).toFixed(2) : '', parse: (v: unknown) => Math.round(Number(v) * 100) })
  form.createField({ name: 'phoneRaw', label: '手机号（脱敏）', format: (v: unknown) => { const s = String(v ?? ''); return s.length === 11 ? `${s.slice(0, 3)}****${s.slice(7)}` : s } })
  form.createField({ name: 'fullName', label: '姓名' })
  form.createField({ name: 'tags', label: '标签（逗号分隔）', description: '提交时转为数组', transform: (v: unknown) => String(v ?? '').split(',').map(s => s.trim()).filter(Boolean) })
})
async function handleSubmit(): Promise<void> { rawValues.value = JSON.stringify(form.values, null, 2); const res = await form.submit(); result.value = res.errors.length > 0 ? '验证失败: ' + res.errors.map(e => e.message).join(', ') : JSON.stringify(res.values, null, 2) }
</script>
