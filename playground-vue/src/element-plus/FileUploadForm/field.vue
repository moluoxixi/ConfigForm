<template>
  <div>
    <h2>文件、图片上传</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      Element Plus Upload / 文件+图片上传 / 三种模式
    </p>
    <div style="display:inline-flex;margin-bottom:16px">
      <button v-for="(opt, idx) in MODE_OPTIONS" :key="opt.value" type="button" :style="{ padding: '5px 15px', fontSize: '14px', border: '1px solid #dcdfe6', background: mode === opt.value ? '#409eff' : '#fff', color: mode === opt.value ? '#fff' : '#606266', cursor: 'pointer', marginLeft: idx > 0 ? '-1px' : '0', borderRadius: idx === 0 ? '4px 0 0 4px' : idx === MODE_OPTIONS.length - 1 ? '0 4px 4px 0' : '0' }" @click="mode = opt.value as FieldPattern">
        {{ opt.label }}
      </button>
    </div>
    <FormProvider :form="form">
      <form novalidate @submit.prevent="handleSubmit">
        <FormField v-slot="{ field }" name="title">
          <div style="margin-bottom:18px">
            <label style="display:block;font-size:14px;color:#606266;margin-bottom:4px">{{ field.label }}</label>
            <input :value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" style="width:100%;padding:0 11px;height:32px;border:1px solid #dcdfe6;border-radius:4px;font-size:14px;outline:none;box-sizing:border-box" @input="field.setValue(($event.target as HTMLInputElement).value)">
          </div>
        </FormField>
        <!-- TODO: ElUpload 待替换为自定义上传组件 -->
        <div style="margin-bottom:18px">
          <label style="display:block;font-size:14px;color:#606266;margin-bottom:4px">附件上传</label>
          <ElUpload v-model:file-list="fileList" :disabled="mode !== 'editable'" :auto-upload="false">
            <button type="button" style="padding:8px 15px;background:#fff;color:#606266;border:1px solid #dcdfe6;border-radius:4px;cursor:pointer;font-size:14px">选择文件</button>
          </ElUpload>
        </div>
        <!-- TODO: ElUpload 待替换为自定义图片上传组件 -->
        <div style="margin-bottom:18px">
          <label style="display:block;font-size:14px;color:#606266;margin-bottom:4px">图片上传</label>
          <ElUpload v-model:file-list="imageList" list-type="picture-card" :disabled="mode !== 'editable'" :auto-upload="false" :limit="6">
            <span v-if="mode === 'editable' && imageList.length < 6" style="font-size:24px;color:#909399">+</span>
          </ElUpload>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <button type="submit" style="padding:8px 15px;background:#409eff;color:#fff;border:1px solid #409eff;border-radius:4px;cursor:pointer;font-size:14px">提交</button>
          <button type="button" style="padding:8px 15px;background:#fff;color:#606266;border:1px solid #dcdfe6;border-radius:4px;cursor:pointer;font-size:14px" @click="form.reset()">重置</button>
        </div>
      </form>
    </FormProvider>
    <div v-if="result" :style="{ padding: '8px 16px', borderRadius: '4px', fontSize: '13px', marginTop: '16px', background: result.startsWith('验证失败') ? '#fef0f0' : '#f0f9eb', border: result.startsWith('验证失败') ? '1px solid #fde2e2' : '1px solid #e1f3d8', color: result.startsWith('验证失败') ? '#f56c6c' : '#67c23a' }">
      {{ result }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
/* TODO: ElUpload 待替换为自定义上传组件 */
import { ElUpload } from 'element-plus'
import { onMounted, ref } from 'vue'

setupElementPlus()

/** 模式选项 */
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]

const mode = ref<FieldPattern>('editable')
const result = ref('')
const fileList = ref<unknown[]>([])
const imageList = ref<unknown[]>([])
const form = useCreateForm({ initialValues: { title: '' } })
onMounted(() => {
  form.createField({ name: 'title', label: '标题', required: true })
})

/** 提交处理 */
async function handleSubmit(): Promise<void> {
  const res = await form.submit()
  result.value = res.errors.length > 0
    ? `验证失败: ${res.errors.map(e => e.message).join(', ')}`
    : JSON.stringify({
      ...res.values,
      files: (fileList.value as Array<{ name: string }>).map(f => f.name),
      images: (imageList.value as Array<{ name: string }>).map(f => f.name),
    }, null, 2)
}
</script>
