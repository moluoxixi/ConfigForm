<template>
  <div>
    <h2>文件、图片上传</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">antd Upload / 文件+图片上传 / 三种模式</p>
    <ASegmented v-model:value="mode" :options="MODE_OPTIONS" style="margin-bottom: 16px" />
    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit" novalidate>
        <FormField v-slot="{ field }" name="title"><AFormItem :label="field.label"><span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span><AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" :disabled="mode === 'disabled'" /></AFormItem></FormField>
        <AFormItem label="附件上传"><AUpload :file-list="fileList" :before-upload="() => false" @change="(info: any) => fileList = info.fileList" :disabled="mode !== 'editable'"><AButton v-if="mode === 'editable'">选择文件</AButton></AUpload></AFormItem>
        <AFormItem label="图片上传"><AUpload list-type="picture-card" :file-list="imageList" :before-upload="() => false" @change="(info: any) => imageList = info.fileList" :disabled="mode !== 'editable'"><div v-if="mode === 'editable' && imageList.length < 6"><span>+</span><div style="margin-top: 4px">上传</div></div></AUpload></AFormItem>
        <ASpace v-if="mode === 'editable'"><AButton type="primary" html-type="submit">提交</AButton><AButton @click="form.reset()">重置</AButton></ASpace>
      </form>
    </FormProvider>
    <AAlert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" message="提交结果" style="margin-top: 16px"><template #description><pre style="margin: 0; white-space: pre-wrap">{{ result }}</pre></template></AAlert>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { Button as AButton, Space as ASpace, Alert as AAlert, Segmented as ASegmented, Input as AInput, FormItem as AFormItem, Upload as AUpload } from 'ant-design-vue'
import type { FieldPattern } from '@moluoxixi/shared'

setupAntdVue()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const fileList = ref<any[]>([])
const imageList = ref<any[]>([])
const form = useCreateForm({ initialValues: { title: '' } })
onMounted(() => { form.createField({ name: 'title', label: '标题', required: true }) })
async function handleSubmit(): Promise<void> { const res = await form.submit(); result.value = res.errors.length > 0 ? '验证失败: ' + res.errors.map(e => e.message).join(', ') : JSON.stringify({ ...res.values, files: fileList.value.map(f => f.name), images: imageList.value.map(f => f.name) }, null, 2) }
</script>
