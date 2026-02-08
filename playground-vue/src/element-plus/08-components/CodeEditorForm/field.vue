<template>
  <div>
    <h2>代码编辑器</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      Textarea 模拟（可接入 monaco-editor-vue3）
    </p>
    <StatusTabs ref="st" v-slot="{ showResult }">
      <FormProvider :form="form">
          <FormField name="title" :field-props="{ label: '标题', required: true, component: 'Input', componentProps: { placeholder: '请输入标题', style: 'width: 250px' } }" />
          <FormField name="language" :field-props="{ label: '语言', component: 'Select', dataSource: LANGUAGE_OPTIONS, componentProps: { style: 'width: 160px' } }" />
          <FormField name="code" :field-props="{ label: '代码', required: true, component: 'CodeEditor' }" />
          <!-- 提交/重置按钮（仅编辑态可见） -->
          <LayoutFormActions @submit="showResult" @submit-failed="(e: any) => st?.showErrors(e)" />
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { FieldPattern } from '@moluoxixi/core'
import { LayoutFormActions, setupElementPlus, StatusTabs } from '@moluoxixi/ui-element-plus'
import { FormField, FormProvider, registerComponent, useCreateForm } from '@moluoxixi/vue'
import { defineComponent, h, ref, watch } from 'vue'

setupElementPlus()

// ========== 自定义组件：代码编辑器 ==========

/** 代码块公共样式 */
const CODE_STYLE = {
  fontFamily: 'Consolas, Monaco, monospace',
  fontSize: '13px',
  background: '#1e1e1e',
  color: '#d4d4d4',
}

/**
 * 代码编辑器组件
 *
 * - 编辑态：textarea 编辑器
 * - 只读/禁用态：pre 代码块展示
 */
const CodeEditor = defineComponent({
  name: 'CodeEditor',
  props: {
    value: { type: String, default: '' },
    onChange: { type: Function as PropType<(v: string) => void>, default: undefined },
    disabled: { type: Boolean, default: false },
    readOnly: { type: Boolean, default: false },
  },
  setup(props) {
    return (): ReturnType<typeof h> => {
      /* 只读或禁用：展示 pre 代码块 */
      if (props.readOnly || props.disabled) {
        return h('pre', {
          style: {
            ...CODE_STYLE,
            padding: '16px',
            borderRadius: '8px',
            overflow: 'auto',
            maxHeight: '400px',
            margin: 0,
            opacity: props.disabled ? 0.6 : 1,
          },
        }, props.value || '// 暂无代码')
      }

      /* 编辑态：textarea */
      return h('textarea', {
        value: props.value ?? '',
        rows: 12,
        style: {
          ...CODE_STYLE,
          width: '100%',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid #d9d9d9',
          resize: 'vertical',
          outline: 'none',
        },
        onInput: (e: Event) => props.onChange?.((e.target as HTMLTextAreaElement).value),
      })
    }
  },
})

registerComponent('CodeEditor', CodeEditor, { defaultWrapper: 'FormItem' })

// ========== 表单配置 ==========

const st = ref<InstanceType<typeof StatusTabs>>()

/** 语言选项 */
const LANGUAGE_OPTIONS = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Python', value: 'python' },
  { label: 'JSON', value: 'json' },
]

const form = useCreateForm({
  initialValues: {
    title: '代码片段',
    language: 'javascript',
    code: 'function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\nconsole.log(fibonacci(10));',
  },
})

/** 同步 StatusTabs 的 mode 到 form.pattern */
watch(() => st.value?.mode, (v) => {
  if (v)
    form.pattern = v as FieldPattern
}, { immediate: true })
</script>
