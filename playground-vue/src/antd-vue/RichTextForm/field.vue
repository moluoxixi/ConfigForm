<template>
  <div>
    <h2>富文本编辑器</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      富文本集成 / 三种模式（未安装三方库时使用 Textarea 降级）
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <FormField v-slot="{ field }" name="title">
          <AFormItem :label="field.label" :required="field.required">
            <AInput :value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" :readonly="mode === 'readOnly'" @update:value="field.setValue($event)" />
          </AFormItem>
        </FormField>
        <FormField v-slot="{ field }" name="content">
          <AFormItem :label="field.label" :required="field.required">
            <div v-if="mode !== 'editable'" style="padding: 12px; border: 1px solid #d9d9d9; border-radius: 6px; min-height: 100px; background: #fafafa" :style="{ opacity: mode === 'disabled' ? 0.6 : 1 }" v-html="(field.value as string) || '<span style=color:#999>暂无内容</span>'" />
            <ATextarea v-else :value="(field.value as string) ?? ''" :rows="8" placeholder="输入 HTML 内容（实际项目可接入 @wangeditor/editor-for-vue）" @update:value="field.setValue($event)" />
          </AFormItem>
        </FormField>
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
import { FormItem as AFormItem, Input as AInput, Textarea as ATextarea } from 'ant-design-vue'
import { onMounted, ref, watch } from 'vue'

setupAntdVue()
const st = ref<InstanceType<typeof StatusTabs>>()
const form = useCreateForm({ initialValues: { title: '示例文章', content: '<h2>标题</h2><p>这是<strong>富文本</strong>内容。</p>' } })
onMounted(() => {
  form.createField({ name: 'title', label: '标题', required: true })
  form.createField({ name: 'content', label: '正文', required: true })
})
watch(() => st.value?.mode, (v) => {
  if (v)
    form.pattern = v as FieldPattern
}, { immediate: true })
async function handleSubmit(showResult: (data: Record<string, unknown>) => void): Promise<void> {
  const res = await form.submit()
  if (res.errors.length > 0) {
    st.value?.showErrors(res.errors)
  }
  else {
    showResult(res.values)
  }
}
</script>
