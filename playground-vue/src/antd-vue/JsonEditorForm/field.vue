<template>
  <div>
    <h2>JSON 编辑器</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      JSON 编辑 + 格式化 + 实时语法检查
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <form @submit.prevent="handleSubmit(showResult)" novalidate>
          <FormField name="configName" :field-props="{ label: '配置名称', required: true, component: 'Input', componentProps: { placeholder: '请输入配置名称' } }" />
          <FormField name="jsonContent" :field-props="{ label: 'JSON 内容', required: true, component: 'JsonEditor' }" />
          <LayoutFormActions v-if="mode === 'editable'" @reset="form.reset()" />
        </form>
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { LayoutFormActions, setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider, registerComponent, useCreateForm } from '@moluoxixi/vue'
/**
 * JSON 编辑器表单 — Field 模式
 *
 * 自定义 JsonEditor 组件注册后，在 fieldProps 中通过 component: 'JsonEditor' 引用。
 * 编辑态提供格式化/压缩工具栏和实时语法检查；只读态渲染 pre；禁用态禁用输入。
 */
import { Button as AButton, Tag as ATag, Textarea as ATextarea } from 'ant-design-vue'
import { defineComponent, h, ref, watch } from 'vue'

setupAntdVue()

/** 等宽字体样式 */
const MONO_STYLE = { fontFamily: 'Consolas, Monaco, monospace', fontSize: '13px' }

/**
 * JSON 编辑器自定义组件
 *
 * - 编辑态：工具栏（格式化 / 压缩 / 校验状态） + 代码区 + 错误提示
 * - 禁用态：禁用的 Textarea
 * - 只读态：格式化 pre 展示
 */
const JsonEditor = defineComponent({
  name: 'JsonEditor',
  props: {
    modelValue: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const jsonError = ref<string | null>(null)

    /** 校验 JSON 合法性 */
    function validateJson(value: string): void {
      try {
        JSON.parse(value)
        jsonError.value = null
      }
      catch (e) {
        jsonError.value = (e as Error).message
      }
    }

    /** 值变更并校验 */
    function handleChange(value: string): void {
      emit('update:modelValue', value)
      validateJson(value)
    }

    /** 格式化 JSON（pretty print） */
    function formatJson(): void {
      try {
        const formatted = JSON.stringify(JSON.parse(props.modelValue), null, 2)
        emit('update:modelValue', formatted)
        jsonError.value = null
      }
      catch { /* 格式化失败时不处理 */ }
    }

    /** 压缩 JSON（单行） */
    function minifyJson(): void {
      try {
        const minified = JSON.stringify(JSON.parse(props.modelValue))
        emit('update:modelValue', minified)
        jsonError.value = null
      }
      catch { /* 压缩失败时不处理 */ }
    }

    /* 初始校验 */
    validateJson(props.modelValue)

    return () => {
      /* 只读态：pre 渲染 */
      if (props.readonly) {
        return h('pre', {
          style: { padding: '16px', borderRadius: '8px', background: '#f6f8fa', ...MONO_STYLE, overflow: 'auto', maxHeight: '400px' },
        }, props.modelValue || '{}')
      }

      const children = []

      /* 工具栏：仅编辑态显示 */
      if (!props.disabled) {
        children.push(
          h('div', { style: { display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' } }, [
            h(AButton, { size: 'small', onClick: formatJson }, () => '格式化'),
            h(AButton, { size: 'small', onClick: minifyJson }, () => '压缩'),
            h(ATag, { color: jsonError.value ? 'error' : 'success' }, () => jsonError.value ? '语法错误' : '合法 JSON'),
          ]),
        )
      }

      /* 文本输入区 */
      children.push(
        h(ATextarea, {
          'value': props.modelValue ?? '',
          'rows': 14,
          'disabled': props.disabled,
          'style': MONO_STYLE,
          'onUpdate:value': handleChange,
        }),
      )

      /* 错误提示 */
      if (jsonError.value) {
        children.push(
          h('div', { style: { color: '#ff4d4f', fontSize: '12px', marginTop: '4px' } }, jsonError.value),
        )
      }

      return h('div', children)
    }
  },
})

registerComponent('JsonEditor', JsonEditor, { defaultWrapper: 'FormItem' })

const st = ref<InstanceType<typeof StatusTabs>>()

const form = useCreateForm({
  initialValues: {
    configName: 'API 配置',
    jsonContent: JSON.stringify({ name: '张三', age: 28, roles: ['admin'] }, null, 2),
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
