<template>
  <Segmented v-model:value="mode" :options="MODE_OPTIONS" style="margin-bottom: 16px" />

  <!-- Config 模式：传 schema 驱动 -->
  <ConfigForm
    v-if="props.schema"
    :key="mode"
    :schema="schemaWithPattern"
    :initial-values="savedValues"
    @values-change="onValuesChange"
    @submit="onSubmit"
    @submit-failed="onSubmitFailed"
  >
    <template #default="{ form: f }">
      <slot :form="f" :mode="mode">
        <Space v-if="mode === 'editable'" style="margin-top: 16px">
          <Button type="primary" html-type="submit">提交</Button>
          <Button @click="f.reset()">重置</Button>
        </Space>
      </slot>
    </template>
  </ConfigForm>

  <!-- Field 模式：传 form 实例 -->
  <FormProvider v-else-if="props.form" :form="props.form">
    <form @submit.prevent="handleFieldSubmit" novalidate>
      <slot :form="props.form" :mode="mode" />
      <Space v-if="mode === 'editable'" style="margin-top: 16px">
        <Button type="primary" html-type="submit">提交</Button>
        <Button @click="props.form!.reset()">重置</Button>
      </Space>
    </form>
  </FormProvider>

  <Alert
    v-if="result"
    :type="result.startsWith('验证失败') ? 'error' : 'success'"
    :message="props.resultTitle ?? '提交结果'"
    style="margin-top: 16px"
  >
    <template #description>
      <pre style="margin: 0; white-space: pre-wrap">{{ result }}</pre>
    </template>
  </Alert>
</template>

<script setup lang="ts">
/**
 * Playground 通用表单包装器
 *
 * 封装三态切换（编辑/阅读/禁用）、提交/重置按钮、结果展示。
 * 支持两种模式：
 * - Config 模式：传 schema，内部创建 ConfigForm
 * - Field 模式：传 form 实例，内部创建 FormProvider
 */
import { computed, ref, watch } from 'vue'
import { ConfigForm, FormProvider } from '@moluoxixi/vue'
import type { FormInstance } from '@moluoxixi/core'
import type { FormSchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'
import { Alert, Button, Segmented, Space } from 'ant-design-vue'

const props = withDefaults(defineProps<{
  /** Config 模式：传 schema */
  schema?: FormSchema
  /** Field 模式：传 form 实例 */
  form?: FormInstance
  /** 初始值（Config 模式用） */
  initialValues?: Record<string, unknown>
  /** 结果区标题 */
  resultTitle?: string
}>(), {
  resultTitle: '提交结果',
})

const MODE_OPTIONS = [
  { label: '编辑态', value: 'editable' as FieldPattern },
  { label: '阅读态', value: 'readOnly' as FieldPattern },
  { label: '禁用态', value: 'disabled' as FieldPattern },
]

const mode = ref<FieldPattern>('editable')
const result = ref('')
const savedValues = ref<Record<string, unknown>>({ ...props.initialValues })

/** Config 模式：将 mode 注入 schema.form.pattern */
const schemaWithPattern = computed<FormSchema>(() => ({
  ...props.schema!,
  form: { ...props.schema?.form, pattern: mode.value },
}))

/** Field 模式：同步 mode → form.pattern */
if (props.form) {
  watch(mode, (v) => { props.form!.pattern = v })
}

function onValuesChange(v: Record<string, unknown>): void {
  savedValues.value = v
}

function onSubmit(v: Record<string, unknown>): void {
  result.value = JSON.stringify(v, null, 2)
}

function onSubmitFailed(errors: Array<{ path: string, message: string }>): void {
  result.value = `验证失败:\n${errors.map(x => `[${x.path}] ${x.message}`).join('\n')}`
}

async function handleFieldSubmit(): Promise<void> {
  if (!props.form) return
  const res = await props.form.submit()
  if (res.errors.length > 0) {
    result.value = `验证失败:\n${res.errors.map(e => `[${e.path}] ${e.message}`).join('\n')}`
  }
  else {
    result.value = JSON.stringify(res.values, null, 2)
  }
}

defineExpose({ mode, result })
</script>
