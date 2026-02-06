<template>
  <div>
    <h2>文件、图片上传</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">Element Plus Upload / 文件+图片上传 / 三种模式</p>
    <el-radio-group v-model="mode" size="small" style="margin-bottom: 16px">
      <el-radio-button v-for="opt in MODE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</el-radio-button>
    </el-radio-group>
    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit" novalidate>
        <FormField v-slot="{ field }" name="title"><el-form-item :label="field.label"><el-input :model-value="(field.value as string) ?? ''" @update:model-value="field.setValue($event)" :disabled="mode === 'disabled'" /></el-form-item></FormField>
        <el-form-item label="附件上传"><el-upload v-model:file-list="fileList" :disabled="mode !== 'editable'" :auto-upload="false"><el-button v-if="mode === 'editable'">选择文件</el-button></el-upload></el-form-item>
        <el-form-item label="图片上传"><el-upload v-model:file-list="imageList" list-type="picture-card" :disabled="mode !== 'editable'" :auto-upload="false" :limit="6"><el-icon v-if="mode === 'editable' && imageList.length < 6"><Plus /></el-icon></el-upload></el-form-item>
        <el-button v-if="mode === 'editable'" type="primary" native-type="submit">提交</el-button>
      </form>
    </FormProvider>
    <el-alert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" :description="result" show-icon style="margin-top: 16px" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/vue'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import { ElButton, ElAlert, ElRadioGroup, ElRadioButton, ElInput, ElFormItem, ElUpload, ElIcon } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FieldPattern } from '@moluoxixi/shared'

setupElementPlus()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const fileList = ref<any[]>([])
const imageList = ref<any[]>([])
const form = useCreateForm({ initialValues: { title: '' } })
onMounted(() => { form.createField({ name: 'title', label: '标题', required: true }) })
async function handleSubmit(): Promise<void> { const res = await form.submit(); result.value = res.errors.length > 0 ? '验证失败: ' + res.errors.map(e => e.message).join(', ') : JSON.stringify({ ...res.values, files: fileList.value.map(f => f.name), images: imageList.value.map(f => f.name) }, null, 2) }
</script>
