<template>
  <div>
    <h2>
      颜色选择器</h2>
      <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
        原生 color input + 预设色板 / HEX 输入
      </p>
      <StatusTabs ref="st" v-slot="{ mode, showResult }">
        <ConfigForm
          :schema="withMode(schema, mode)"
          :initial-values="initialValues"
          @submit="showResult"
          @submit-failed="(e: any) => st?.showErrors(e)"
        />
      </StatusTabs>
    </h2>
  </div>
</template>

<script setup lang="ts">
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'
import { setupElementPlus, StatusTabs } from '@moluoxixi/ui-element-plus'
import { ConfigForm, registerComponent } from '@moluoxixi/vue'
/**
 * 场景 31：颜色选择器 - Config 模式
 *
 * 自定义 ColorPicker 组件注册后，在 schema 中通过 component: 'ColorPicker' 引用。
 * ConfigForm 自动解析组件并渲染，三态由 ReactiveField 自动处理。
 */
import { ref } from 'vue'
import ColorPicker from './components/ColorPicker.vue'

setupElementPlus()
registerComponent('ColorPicker', ColorPicker, { defaultWrapper: 'FormItem' })

const st = ref<InstanceType<typeof StatusTabs>>()

/** 预设色板 */
const PRESETS = ['#1677ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2', '#eb2f96', '#000000']

const initialValues = { themeName: '自定义主题', primaryColor: '#1677ff', bgColor: '#ffffff', textColor: '#333333' }

const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
  properties: {
    themeName: { type: 'string', title: '主题名称', required: true, componentProps: { placeholder: '请输入主题名称' } },
    primaryColor: { type: 'string', title: '主色调', required: true, component: 'ColorPicker', componentProps: { presets: PRESETS } },
    bgColor: { type: 'string', title: '背景色', component: 'ColorPicker', componentProps: { presets: PRESETS } },
    textColor: { type: 'string', title: '文字颜色', component: 'ColorPicker', componentProps: { presets: PRESETS } },
  },
}

/** 将 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}
</script>
