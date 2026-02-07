<template>
  <div>
    <h2>文件、图片上传</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      antd Upload / 文件+图片上传 / 三种模式
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <FormField v-slot="{ field }" name="title">
          <AFormItem :label="field.label">
            <span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span><AInput v-else :value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" @update:value="field.setValue($event)" />
          </AFormItem>
        </FormField>
        <AFormItem label="附件上传">
          <AUpload :file-list="fileList" :before-upload="() => false" :disabled="mode !== 'editable'" @change="(info: any) => fileList = info.fileList">
            <AButton v-if="mode === 'editable'">
              选择文件
            </AButton>
          </AUpload>
        </AFormItem>
        <AFormItem label="图片上传">
          <AUpload list-type="picture-card" :file-list="imageList" :before-upload="() => false" :disabled="mode !== 'editable'" @change="(info: any) => imageList = info.fileList">
            <div v-if="mode === 'editable' && imageList.length < 6">
              <span>+</span><div style="margin-top: 4px">
                上传
              </div>
            </div>
          </AUpload>
        </AFormItem>
        <div v-if="mode === 'editable'" style="margin-top: 16px; display: flex; gap: 8px">
          <button type="button" style="padding: 4px 15px; background: #1677ff; color: #fff; border: none; border-radius: 6px; cursor: pointer" @click="handleSubmit(showResult)">
            提交
          </button>
          <button type="button" style="padding: 4px 15px; background: #fff; border: 1px solid #d9d9d9; border-radius: 6px; cursor: pointer" @click="form.reset()">
            重置
          </button>
        </div>
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { Button as AButton, FormItem as AFormItem, Input as AInput, Upload as AUpload } from 'ant-design-vue'
import { onMounted, ref, watch } from 'vue'

setupAntdVue()

const st = ref<InstanceType<typeof StatusTabs>>()

const fileList = ref<any[]>([])
const imageList = ref<any[]>([])
const form = useCreateForm({ initialValues: { title: '' } })

/** 同步 StatusTabs 的 mode 到 form.pattern */
watch(() => st.value?.mode, (v) => {
  if (v)
    form.pattern = v as FieldPattern
}, { immediate: true })

/** 提交处理 */
async function handleSubmit(showResult: (data: Record<string, unknown>) => void): Promise<void> {
  const res = await form.submit()
  if (res.errors.length > 0) {
    st.value?.showErrors(res.errors)
  }
  else {
    showResult(res.values)
  }
}

onMounted(() => {
  form.createField({ name: 'title', label: '标题', required: true })
})
</script>
