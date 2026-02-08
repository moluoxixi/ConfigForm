<template>
  <div>
    <h2>JSON 编辑器</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">JSON 编辑 + 格式化 + 语法检查 — ConfigForm + Schema 实现</p>
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
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/core'
import { setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { ConfigForm, registerComponent } from '@moluoxixi/vue'
/**
 * JSON 编辑器 — Config 模式
 *
 * 自定义 JsonEditor 组件注册后，在 schema 中通过 component: 'JsonEditor' 引用。
 */
import { defineComponent, h, ref } from 'vue'

setupAntdVue()

const MONO_STYLE = { fontFamily: 'Consolas, Monaco, monospace', fontSize: '13px' }

/** JSON 编辑器组件 */
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
    function validateJson(value: string): void {
      try { JSON.parse(value); jsonError.value = null } catch (e) { jsonError.value = (e as Error).message }
    }
    function handleChange(value: string): void { emit('update:modelValue', value); validateJson(value) }
    function formatJson(): void { try { emit('update:modelValue', JSON.stringify(JSON.parse(props.modelValue), null, 2)); jsonError.value = null } catch { /* ignore */ } }
    function minifyJson(): void { try { emit('update:modelValue', JSON.stringify(JSON.parse(props.modelValue))); jsonError.value = null } catch { /* ignore */ } }
    validateJson(props.modelValue)
    return () => {
      if (props.readonly) return h('pre', { style: { padding: '16px', borderRadius: '8px', background: '#f6f8fa', ...MONO_STYLE, overflow: 'auto', maxHeight: '400px' } }, props.modelValue || '{}')
      const children = []
      if (!props.disabled) {
        children.push(h('div', { style: { display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' } }, [
          h('button', { style: { padding: '2px 8px', fontSize: '13px', border: '1px solid #d9d9d9', borderRadius: '4px', background: '#fff', cursor: 'pointer' }, onClick: formatJson }, '格式化'),
          h('button', { style: { padding: '2px 8px', fontSize: '13px', border: '1px solid #d9d9d9', borderRadius: '4px', background: '#fff', cursor: 'pointer' }, onClick: minifyJson }, '压缩'),
          h('span', { style: { display: 'inline-block', padding: '0 7px', fontSize: '12px', lineHeight: '20px', borderRadius: '4px', border: jsonError.value ? '1px solid #ffa39e' : '1px solid #b7eb8f', color: jsonError.value ? '#cf1322' : '#389e0d', background: jsonError.value ? '#fff2f0' : '#f6ffed' } }, jsonError.value ? '语法错误' : '合法 JSON'),
        ]))
      }
      children.push(h('textarea', { value: props.modelValue ?? '', rows: 14, disabled: props.disabled, style: { ...MONO_STYLE, width: '100%', padding: '8px', border: '1px solid #d9d9d9', borderRadius: '6px', resize: 'vertical', boxSizing: 'border-box' }, onInput: (e: Event) => handleChange((e.target as HTMLTextAreaElement).value) }))
      if (jsonError.value) children.push(h('div', { style: { color: '#ff4d4f', fontSize: '12px', marginTop: '4px' } }, jsonError.value))
      return h('div', children)
    }
  },
})

registerComponent('JsonEditor', JsonEditor, { defaultWrapper: 'FormItem' })

const st = ref<InstanceType<typeof StatusTabs>>()

const initialValues = { configName: 'API 配置', jsonContent: JSON.stringify({ name: '张三', age: 28, roles: ['admin'] }, null, 2) }

const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
  properties: {
    configName: { type: 'string', title: '配置名称', required: true, componentProps: { placeholder: '请输入配置名称' } },
    jsonContent: { type: 'string', title: 'JSON 内容', required: true, component: 'JsonEditor' },
  },
}

/** 将 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}
</script>
