<template>
  <div>
    <h2>颜色选择器</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">原生 color input + 预设色板 / HEX 输入</p>
    <el-radio-group v-model="mode" size="small" style="margin-bottom: 16px">
      <el-radio-button v-for="opt in MODE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</el-radio-button>
    </el-radio-group>
    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit" novalidate>
        <FormField v-slot="{ field }" name="themeName"><el-form-item :label="field.label"><el-input :model-value="(field.value as string) ?? ''" @update:model-value="field.setValue($event)" :disabled="mode === 'disabled'" /></el-form-item></FormField>
        <FormField v-for="cn in colorNames" :key="cn" v-slot="{ field }" :name="cn">
          <el-form-item :label="field.label">
            <el-space v-if="mode !== 'editable'"><div :style="{ width: '32px', height: '32px', background: (field.value as string) || '#fff', border: '1px solid #dcdfe6', borderRadius: '4px' }" /><code>{{ field.value }}</code></el-space>
            <div v-else>
              <el-space style="margin-bottom: 8px"><input type="color" :value="(field.value as string) ?? '#000'" @input="field.setValue(($event.target as HTMLInputElement).value)" style="width: 48px; height: 48px; border: none; cursor: pointer; padding: 0" /><el-input :model-value="(field.value as string) ?? ''" @update:model-value="field.setValue($event)" style="width: 120px" /><div :style="{ width: '32px', height: '32px', background: (field.value as string) || '#fff', border: '1px solid #dcdfe6', borderRadius: '4px' }" /></el-space>
              <div style="display: flex; gap: 4px">
                <div v-for="c in PRESETS" :key="c" @click="field.setValue(c)" :style="{ width: '24px', height: '24px', background: c, borderRadius: '4px', cursor: 'pointer', border: field.value === c ? '2px solid #333' : '1px solid #dcdfe6' }" />
              </div>
            </div>
          </el-form-item>
        </FormField>
        <div :style="{ padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #eee', background: (form.getFieldValue('bgColor') as string) || '#fff', color: (form.getFieldValue('textColor') as string) || '#333' }">
          <h4 :style="{ color: (form.getFieldValue('primaryColor') as string) || '#409eff' }">主题预览</h4>
          <p>文字颜色预览</p>
          <button :style="{ background: (form.getFieldValue('primaryColor') as string) || '#409eff', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: '4px' }">主色调按钮</button>
        </div>
        <el-space v-if="mode === 'editable'"><el-button type="primary" native-type="submit">提交</el-button><el-button @click="form.reset()">重置</el-button></el-space>
      </form>
    </FormProvider>
    <el-alert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" :description="result" show-icon style="margin-top: 16px" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/vue'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import { ElButton, ElSpace, ElAlert, ElRadioGroup, ElRadioButton, ElInput, ElFormItem } from 'element-plus'
import type { FieldPattern } from '@moluoxixi/shared'

setupElementPlus()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const PRESETS = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#606266', '#303133', '#000000']
const colorNames = ['primaryColor', 'bgColor', 'textColor']

const form = useCreateForm({ initialValues: { themeName: '自定义主题', primaryColor: '#409eff', bgColor: '#ffffff', textColor: '#333333' } })
onMounted(() => { form.createField({ name: 'themeName', label: '主题名称', required: true }); form.createField({ name: 'primaryColor', label: '主色调', required: true }); form.createField({ name: 'bgColor', label: '背景色' }); form.createField({ name: 'textColor', label: '文字颜色' }) })
async function handleSubmit(): Promise<void> { const res = await form.submit(); result.value = res.errors.length > 0 ? '验证失败: ' + res.errors.map(e => e.message).join(', ') : JSON.stringify(res.values, null, 2) }
</script>
