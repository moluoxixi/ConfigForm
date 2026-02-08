<template>
  <div>
    <h2>代码编辑器</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">Textarea 模拟代码编辑器 — ConfigForm + Schema 实现</p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <ConfigForm
        :schema="withMode(schema, mode)"
        :initial-values="initialValues"
        @submit="showResult"
        @submit-failed="(e: any) => st?.showErrors(e)"
      />
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/core'
import { setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { ConfigForm, registerComponent } from '@moluoxixi/vue'
/**
 * 代码编辑器 — Config 模式
 *
 * 自定义 CodeEditor 组件注册后，在 schema 中通过 component: 'CodeEditor' 引用。
 * ConfigForm 自动解析组件并渲染，三态由 ReactiveField 自动处理。
 */
import { defineComponent, h, ref } from 'vue'

setupAntdVue()

/** 代码块公共样式 */
const CODE_STYLE = {
  fontFamily: 'Consolas, Monaco, monospace',
  fontSize: '13px',
  background: '#1e1e1e',
  color: '#d4d4d4',
}

/** 代码编辑器组件 */
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
      if (props.readOnly || props.disabled) {
        return h('pre', {
          style: { ...CODE_STYLE, padding: '16px', borderRadius: '8px', overflow: 'auto', maxHeight: '400px', margin: 0, opacity: props.disabled ? 0.6 : 1 },
        }, props.value || '// 暂无代码')
      }
      return h('textarea', {
        value: props.value ?? '',
        rows: 12,
        style: { ...CODE_STYLE, width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d9d9d9', resize: 'vertical', outline: 'none' },
        onInput: (e: Event) => props.onChange?.((e.target as HTMLTextAreaElement).value),
      })
    }
  },
})

registerComponent('CodeEditor', CodeEditor, { defaultWrapper: 'FormItem' })

const st = ref<InstanceType<typeof StatusTabs>>()

const initialValues = {
  title: '代码片段',
  language: 'javascript',
  code: 'function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\nconsole.log(fibonacci(10));',
}

const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
  properties: {
    title: { type: 'string', title: '标题', required: true, componentProps: { placeholder: '请输入标题', style: 'width: 250px' } },
    language: { type: 'string', title: '语言', enum: [{ label: 'JavaScript', value: 'javascript' }, { label: 'TypeScript', value: 'typescript' }, { label: 'Python', value: 'python' }, { label: 'JSON', value: 'json' }], componentProps: { style: 'width: 160px' } },
    code: { type: 'string', title: '代码', required: true, component: 'CodeEditor' },
  },
}

/** 将 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}
</script>
