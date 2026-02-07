<template>
  <div>
    <h2>文件、图片上传</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">antd Upload / 文件+图片上传 / 三种模式</p>
    <PlaygroundForm :form="form">
      <template #default="{ form: f, mode }">
        <FormField v-slot="{ field }" name="title"><AFormItem :label="field.label"><span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span><AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" :disabled="mode === 'disabled'" /></AFormItem></FormField>
        <AFormItem label="附件上传"><AUpload :file-list="fileList" :before-upload="() => false" @change="(info: any) => fileList = info.fileList" :disabled="mode !== 'editable'"><AButton v-if="mode === 'editable'">选择文件</AButton></AUpload></AFormItem>
        <AFormItem label="图片上传"><AUpload list-type="picture-card" :file-list="imageList" :before-upload="() => false" @change="(info: any) => imageList = info.fileList" :disabled="mode !== 'editable'"><div v-if="mode === 'editable' && imageList.length < 6"><span>+</span><div style="margin-top: 4px">上传</div></div></AUpload></AFormItem>
      </template>
    </PlaygroundForm>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FormField, useCreateForm } from '@moluoxixi/vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { Button as AButton, Input as AInput, FormItem as AFormItem, Upload as AUpload } from 'ant-design-vue'
import PlaygroundForm from '../../components/PlaygroundForm.vue'

setupAntdVue()
const fileList = ref<any[]>([])
const imageList = ref<any[]>([])
const form = useCreateForm({ initialValues: { title: '' } })
onMounted(() => { form.createField({ name: 'title', label: '标题', required: true }) })
</script>
