<template>
  <StatusTabs ref="st" v-slot="{ showResult }">
    <FormProvider :form="form">
      <FormField
        v-for="field in props.fields"
        :key="field.name"
        :name="field.name"
        :field-props="{
          label: field.label,
          required: field.required,
          component: field.component,
          componentProps: field.componentProps,
          dataSource: field.dataSource,
          rules: field.rules,
          description: field.description,
        }"
      />
      <LayoutFormActions @submit="showResult" @submit-failed="(e: any) => st?.showErrors(e)" />
    </FormProvider>
  </StatusTabs>
</template>

<script setup lang="ts">
/**
 * 通用 Field 模式渲染器
 *
 * 根据 playground-shared 的 fields 配置动态渲染 FormField 列表。
 * 无需每个场景单独写 field.vue。
 */
import type { FieldPattern } from '@moluoxixi/core'
import type { FieldConfig } from '@moluoxixi/playground-shared'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { ref, watch } from 'vue'

/** 动态获取当前 UI 库的 StatusTabs 和 LayoutFormActions */
import { LayoutFormActions, StatusTabs } from '@moluoxixi/ui-antd-vue'

const props = withDefaults(defineProps<{
  fields: FieldConfig[]
  initialValues: Record<string, unknown>
  labelWidth?: string
}>(), {
  labelWidth: '120px',
})

const st = ref<InstanceType<typeof StatusTabs>>()

const form = useCreateForm({
  labelWidth: props.labelWidth,
  initialValues: { ...props.initialValues },
})

/** 同步 StatusTabs 的 mode 到 form.pattern */
watch(() => st.value?.mode, (v) => {
  if (v) form.pattern = v as FieldPattern
}, { immediate: true })
</script>
