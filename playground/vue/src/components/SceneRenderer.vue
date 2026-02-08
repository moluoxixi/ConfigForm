<template>
  <div>
    <h2>{{ props.config.title }}{{ props.mode === 'field' ? '（Field 版）' : '' }}</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      {{ props.config.description }}{{ props.mode === 'field' ? ' — FormField + fieldProps 实现' : '' }}
    </p>

    <!-- Config 模式 -->
    <StatusTabs v-if="props.mode === 'config'" ref="st" v-slot="{ mode, showResult }">
      <ConfigForm
        :schema="withMode(props.config.schema, mode)"
        :initial-values="props.config.initialValues"
        @submit="showResult"
        @submit-failed="(e: any) => st?.showErrors(e)"
      />
    </StatusTabs>

    <!-- Field 模式 -->
    <StatusTabs v-else ref="stField" v-slot="{ showResult }">
      <FormProvider :form="fieldForm">
        <FormField
          v-for="field in props.config.fields"
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
        <LayoutFormActions @submit="showResult" @submit-failed="(e: any) => stField?.showErrors(e)" />
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
/**
 * 场景渲染器
 *
 * 根据 SceneConfig 通用渲染 Config / Field 两种模式。
 * 通过 watch 响应 config/mode 变化，无需外部 key 强制销毁重建。
 */
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/core'
import type { SceneConfig } from '@playground/shared'
import { LayoutFormActions, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { ConfigForm, FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { ref, watch } from 'vue'

const props = defineProps<{
  config: SceneConfig
  mode: 'config' | 'field'
}>()

const st = ref<InstanceType<typeof StatusTabs>>()
const stField = ref<InstanceType<typeof StatusTabs>>()

/** Field 模式表单实例 */
const fieldForm = useCreateForm({
  labelWidth: (props.config.schema.decoratorProps?.labelWidth as string) ?? '120px',
  initialValues: { ...props.config.initialValues },
})

/** config 变化时重置 Field 模式的表单 */
watch(() => props.config, (newConfig) => {
  fieldForm.labelWidth = (newConfig.schema.decoratorProps?.labelWidth as string) ?? '120px'
  fieldForm.reset()
  Object.assign(fieldForm.values, { ...newConfig.initialValues })
  Object.assign(fieldForm.initialValues, { ...newConfig.initialValues })
})

/** 同步三态 */
watch(() => stField.value?.mode, (v) => {
  if (v) fieldForm.pattern = v as FieldPattern
}, { immediate: true })

/** 注入 pattern 到 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}
</script>
