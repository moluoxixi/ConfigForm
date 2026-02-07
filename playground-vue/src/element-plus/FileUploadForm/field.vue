<template>
  <div>
    <h2>文件、图片上传</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      Element Plus Upload / 文件+图片上传 / 三种模式
    </p>
    <ElRadioGroup v-model="mode" size="small" style="margin-bottom: 16px">
      <ElRadioButton v-for="opt in MODE_OPTIONS" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </ElRadioButton>
    </ElRadioGroup>
    <FormProvider :form="form">
      <form novalidate @submit.prevent="handleSubmit">
        <FormField v-slot="{ field }" name="title">
          <ElFormItem :label="field.label">
            <ElInput :model-value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" @update:model-value="field.setValue($event)" />
          </ElFormItem>
        </FormField>
        <ElFormItem label="附件上传">
          <ElUpload v-model:file-list="fileList" :disabled="mode !== 'editable'" :auto-upload="false">
            <ElButton v-if="mode === 'editable'">
              选择文件
            </ElButton>
          </ElUpload>
        </ElFormItem>
        <ElFormItem label="图片上传">
          <ElUpload v-model:file-list="imageList" list-type="picture-card" :disabled="mode !== 'editable'" :auto-upload="false" :limit="6">
            <ElIcon v-if="mode === 'editable' && imageList.length < 6">
              <Plus />
            </ElIcon>
          </ElUpload>
        </ElFormItem>
        <ElSpace v-if="mode === 'editable'">
          <ElButton type="primary" native-type="submit">
            提交
          </ElButton><ElButton @click="form.reset()">
            重置
          </ElButton>
        </ElSpace>
      </form>
    </FormProvider>
    <ElAlert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" :description="result" show-icon style="margin-top: 16px" />
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { Plus } from '@element-plus/icons-vue'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { ElAlert, ElButton, ElFormItem, ElIcon, ElInput, ElRadioButton, ElRadioGroup, ElSpace, ElUpload } from 'element-plus'
import { onMounted, ref } from 'vue'

setupElementPlus()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const fileList = ref<any[]>([])
const imageList = ref<any[]>([])
const form = useCreateForm({ initialValues: { title: '' } })
onMounted(() => {
  form.createField({ name: 'title', label: '标题', required: true })
})
async function handleSubmit(): Promise<void> {
  const res = await form.submit()
  result.value = res.errors.length > 0 ? `验证失败: ${res.errors.map(e => e.message).join(', ')}` : JSON.stringify({ ...res.values, files: fileList.value.map(f => f.name), images: imageList.value.map(f => f.name) }, null, 2)
}
</script>
