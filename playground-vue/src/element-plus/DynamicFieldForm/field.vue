<template>
  <div>
    <h2>动态增删字段（Field 版）</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      运行时添加/移除字段 — FormField + FormArrayField 实现
    </p>
    <StatusTabs ref="st" v-slot="{ showResult }">
      <FormProvider :form="form">
        <form novalidate @submit.prevent="handleSubmit(showResult)">
          <!-- 固定字段 -->
          <FormField name="title" :field-props="{ label: '表单标题', required: true, component: 'Input', componentProps: { placeholder: '请输入标题' } }" />
          <!-- 使用 FormArrayField 管理动态字段 -->
          <FormArrayField name="dynamicItems" :field-props="{
            label: '动态字段',
            minItems: 0,
            maxItems: 20,
            itemTemplate: () => ({ label: '', value: '', type: 'text' }),
          }" />
          <LayoutFormActions @reset="form.reset()" />
        </form>
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
/**
 * 动态增删字段 — Field 模式（Element Plus）
 *
 * 使用 FormProvider + FormArrayField 管理动态字段。
 * 每个数组项包含 label、value、type 三个子字段，
 * 增删操作由 FormArrayField（ArrayBase）自动处理。
 * 框架根据 form.pattern 自动控制操作按钮显隐。
 */
import type { FieldPattern } from '@moluoxixi/shared'
import { LayoutFormActions, setupElementPlus, StatusTabs } from '@moluoxixi/ui-element-plus'
import { FormArrayField, FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { ref, watch } from 'vue'

setupElementPlus()
const st = ref<InstanceType<typeof StatusTabs>>()

const form = useCreateForm({
  initialValues: {
    title: '',
    dynamicItems: [
      { label: '姓名', value: '', type: 'text' },
    ],
  },
})

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
</script>
