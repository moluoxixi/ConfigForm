<template>
  <div>
    <h2>数组字段（Field 版）</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      增删 / 排序 / min-max 数量限制 — FormArrayField 自动渲染
    </p>
    <StatusTabs ref="st" v-slot="{ showResult }">
      <FormProvider :form="form">
        <form novalidate @submit.prevent="handleSubmit(showResult)">
          <FormField name="groupName" :field-props="{ label: '分组名称', required: true, component: 'Input', componentProps: { placeholder: '请输入分组名称', style: 'width: 300px' } }" />
          <!-- FormArrayField 自动渲染数组项和操作按钮，无需 v-for -->
          <FormArrayField name="contacts" :field-props="{
            label: '联系人列表',
            minItems: 1,
            maxItems: 8,
            itemTemplate: () => ({ name: '', phone: '', email: '' }),
          }" />
          <LayoutFormActions @reset="form.reset()" />
        </form>
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
/**
 * 数组字段 — Field 模式（Element Plus）
 *
 * 使用 FormProvider + FormArrayField 实现数组字段增删排序。
 * FormArrayField 无 slot 时自动基于 itemTemplate 渲染，
 * 操作按钮通过 ArrayBase 子组件声明式渲染，
 * 框架根据 form.pattern 自动控制按钮显隐。
 */
import type { FieldPattern } from '@moluoxixi/shared'
import { LayoutFormActions, setupElementPlus, StatusTabs } from '@moluoxixi/ui-element-plus'
import { FormArrayField, FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { ref, watch } from 'vue'

setupElementPlus()

const st = ref<InstanceType<typeof StatusTabs>>()

const form = useCreateForm({
  initialValues: {
    groupName: '默认分组',
    contacts: [{ name: '', phone: '', email: '' }],
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
