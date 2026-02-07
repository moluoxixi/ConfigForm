<template>
  <div>
    <h2>分页搜索数据源</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      远程搜索 / 分页加载 / 防抖 300ms — FormField + loadDataSource 实现
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <form @submit.prevent="handleSubmit(showResult)" novalidate>
          <FormField name="userId" :field-props="{ label: '选择用户', required: true, component: 'Select', componentProps: { showSearch: true, filterOption: false, style: 'width: 400px', placeholder: '输入关键词搜索用户' } }" />
          <LayoutFormActions v-if="mode === 'editable'" @reset="form.reset()" />
        </form>
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { LayoutFormActions, setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
/**
 * 分页搜索数据源 — Field 模式
 *
 * 使用 FormProvider + FormField + Select 组件实现分页搜索。
 * 实际项目中可通过 field.loadDataSource 加载远程数据。
 */
import { ref, watch } from 'vue'

setupAntdVue()
const st = ref<InstanceType<typeof StatusTabs>>()

const form = useCreateForm({
  initialValues: { userId: undefined },
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
