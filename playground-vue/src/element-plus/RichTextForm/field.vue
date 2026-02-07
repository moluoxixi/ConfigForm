<template>
  <div>
    <h2>富文本编辑器</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      富文本集成 / 三种模式（未安装三方库时使用 Textarea 降级）
    </p>
    <ElRadioGroup v-model="mode" size="small" style="margin-bottom: 16px">
      <ElRadioButton v-for="opt in MODE_OPTIONS" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </ElRadioButton>
    </ElRadioGroup>
    <FormProvider :form="form">
      <form novalidate @submit.prevent="handleSubmit">
        <FormField v-slot="{ field }" name="title">
          <ElFormItem :label="field.label" :required="field.required">
            <ElInput :model-value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" :readonly="mode === 'readOnly'" @update:model-value="field.setValue($event)" />
          </ElFormItem>
        </FormField>
        <FormField v-slot="{ field }" name="content">
          <ElFormItem :label="field.label" :required="field.required">
            <div v-if="mode !== 'editable'" style="padding: 12px; border: 1px solid #dcdfe6; border-radius: 4px; min-height: 100px; background: #f5f7fa" :style="{ opacity: mode === 'disabled' ? 0.6 : 1 }" v-html="(field.value as string) || '<span style=color:#999>暂无内容</span>'" />
            <ElInput v-else type="textarea" :model-value="(field.value as string) ?? ''" :rows="8" placeholder="输入 HTML 内容（实际项目可接入 @wangeditor/editor-for-vue）" @update:model-value="field.setValue($event)" />
          </ElFormItem>
        </FormField>
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
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { ElAlert, ElButton, ElFormItem, ElInput, ElRadioButton, ElRadioGroup, ElSpace } from 'element-plus'
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
async function handleSubmit(): Promise<void> {
  const res = await form.submit()
  result.value = res.errors.length > 0 ? `验证失败: ${res.errors.map(e => e.message).join(', ')}` : JSON.stringify(res.values, null, 2)
}
</script>
