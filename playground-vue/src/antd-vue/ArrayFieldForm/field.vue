<template>
  <div>
    <h2>数组字段（Field 版）</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      增删 / 排序 / min-max 数量限制 — FormArrayField 自动渲染
    </p>
    <StatusTabs ref="st" v-slot="{ showResult }">
      <FormProvider :form="form">
          <FormField name="groupName" :field-props="{ label: '分组名称', required: true, component: 'Input', componentProps: { placeholder: '请输入分组名称', style: 'width: 300px' } }" />
          <!-- FormArrayField 自动渲染数组项和操作按钮，无需 v-for -->
          <FormArrayField name="contacts" :field-props="{
            label: '联系人列表',
            minItems: 1,
            maxItems: 8,
            itemTemplate: () => ({ name: '', phone: '', email: '' }),
          }" />
          <LayoutFormActions @submit="showResult" @submit-failed="(e: any) => st?.showErrors(e)" />
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
/**
 * 数组字段 — Field 模式（Ant Design Vue）
 *
 * 使用 FormProvider + FormArrayField 实现数组字段增删排序。
 * FormArrayField 无 slot 时自动基于 itemTemplate 渲染，
 * 操作按钮通过 ArrayBase 子组件声明式渲染，
 * 框架根据 form.pattern 自动控制按钮显隐。
 */
import type { FieldPattern } from '@moluoxixi/core'
import { LayoutFormActions, setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormArrayField, FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { ref, watch } from 'vue'

setupAntdVue()
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
</script>
