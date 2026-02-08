<template>
  <div>
    <h2>富文本编辑器</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      富文本集成 / 三种模式（未安装三方库时使用 Textarea 降级）
    </p>
    <div style="display: flex; gap: 8px; margin-bottom: 16px">
      <button v-for="opt in MODE_OPTIONS" :key="opt.value" type="button" :style="{ padding: '4px 12px', borderRadius: '4px', border: '1px solid #dcdfe6', background: mode === opt.value ? '#409eff' : '#fff', color: mode === opt.value ? '#fff' : '#606266', cursor: 'pointer', fontSize: '12px' }" @click="mode = opt.value as FieldPattern">
        {{ opt.label }}
      </button>
    </div>
    <FormProvider :form="form">
        <FormField v-slot="{ field }" name="title">
          <div style="margin-bottom: 18px">
            <label style="display: block; margin-bottom: 4px; font-size: 14px; color: #606266">
              <span v-if="field.required" style="color: #f56c6c; margin-right: 4px">*</span>{{ field.label }}
            </label>
            <input :value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" :readonly="mode === 'readOnly'" style="width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 14px; box-sizing: border-box" @input="field.setValue(($event.target as HTMLInputElement).value)" />
          </div>
        </FormField>
        <FormField v-slot="{ field }" name="content">
          <div style="margin-bottom: 18px">
            <label style="display: block; margin-bottom: 4px; font-size: 14px; color: #606266">
              <span v-if="field.required" style="color: #f56c6c; margin-right: 4px">*</span>{{ field.label }}
            </label>
            <div v-if="mode !== 'editable'" style="padding: 12px; border: 1px solid #dcdfe6; border-radius: 4px; min-height: 100px; background: #f5f7fa" :style="{ opacity: mode === 'disabled' ? 0.6 : 1 }" v-html="(field.value as string) || '<span style=color:#999>暂无内容</span>'" />
            <textarea v-else :value="(field.value as string) ?? ''" rows="8" placeholder="输入 HTML 内容（实际项目可接入 @wangeditor/editor-for-vue）" style="width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 14px; resize: vertical; box-sizing: border-box" @input="field.setValue(($event.target as HTMLTextAreaElement).value)" />
          </div>
        </FormField>
        <div style="display: flex; gap: 8px">
          <button type="submit" style="padding: 8px 16px; background: #409eff; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 14px">
            提交
          </button>
          <button type="button" style="padding: 8px 16px; background: #fff; color: #606266; border: 1px solid #dcdfe6; border-radius: 4px; cursor: pointer; font-size: 14px" @click="form.reset()">
            重置
          </button>
        </div>
    </FormProvider>
    <div v-if="result" :style="{ marginTop: '16px', padding: '12px 16px', borderRadius: '4px', background: result.startsWith('验证失败') ? '#fef0f0' : '#f0f9eb', color: result.startsWith('验证失败') ? '#f56c6c' : '#67c23a', border: result.startsWith('验证失败') ? '1px solid #fde2e2' : '1px solid #e1f3d8' }">
      <div style="white-space: pre-wrap">{{ result }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/core'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { onMounted, ref } from 'vue'

setupElementPlus()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const form = useCreateForm({ initialValues: { title: '示例文章', content: '<h2>标题</h2><p>这是<strong>富文本</strong>内容。</p>' } })
onMounted(() => {
  form.createField({ name: 'title', label: '标题', required: true })
  form.createField({ name: 'content', label: '正文', required: true })
})
</script>
