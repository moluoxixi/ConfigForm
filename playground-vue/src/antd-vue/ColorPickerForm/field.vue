<template>
  <div>
    <h2>颜色选择器</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      原生 color input + 预设色板 / HEX 输入
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <FormField v-slot="{ field }" name="themeName">
          <AFormItem :label="field.label">
            <span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span><AInput v-else :value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" @update:value="field.setValue($event)" />
          </AFormItem>
        </FormField>
        <FormField v-for="cn in colorNames" :key="cn" v-slot="{ field }" :name="cn">
          <AFormItem :label="field.label">
            <ASpace v-if="mode !== 'editable'">
              <div :style="{ width: '32px', height: '32px', background: (field.value as string) || '#fff', border: '1px solid #d9d9d9', borderRadius: '4px' }" /><code>{{ field.value }}</code>
            </ASpace>
            <div v-else>
              <ASpace style="margin-bottom: 8px">
                <input type="color" :value="(field.value as string) ?? '#000'" style="width: 48px; height: 48px; border: none; cursor: pointer; padding: 0" @input="field.setValue(($event.target as HTMLInputElement).value)"><AInput :value="(field.value as string) ?? ''" style="width: 120px" @update:value="field.setValue($event)" /><div :style="{ width: '32px', height: '32px', background: (field.value as string) || '#fff', border: '1px solid #d9d9d9', borderRadius: '4px' }" />
              </ASpace>
              <div style="display: flex; gap: 4px">
                <div v-for="c in PRESETS" :key="c" :style="{ width: '24px', height: '24px', background: c, borderRadius: '4px', cursor: 'pointer', border: field.value === c ? '2px solid #333' : '1px solid #d9d9d9' }" @click="field.setValue(c)" />
              </div>
            </div>
          </AFormItem>
        </FormField>
        <div :style="{ padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #eee', background: (form.getFieldValue('bgColor') as string) || '#fff', color: (form.getFieldValue('textColor') as string) || '#333' }">
          <h4 :style="{ color: (form.getFieldValue('primaryColor') as string) || '#1677ff' }">
            主题预览
          </h4>
          <p>文字颜色预览</p>
          <button :style="{ background: (form.getFieldValue('primaryColor') as string) || '#1677ff', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: '4px' }">
            主色调按钮
          </button>
        </div>
        <div v-if="mode === 'editable'" style="margin-top: 16px; display: flex; gap: 8px">
          <button type="button" style="padding: 4px 15px; background: #1677ff; color: #fff; border: none; border-radius: 6px; cursor: pointer" @click="handleSubmit(showResult)">
            提交
          </button>
          <button type="button" style="padding: 4px 15px; background: #fff; border: 1px solid #d9d9d9; border-radius: 6px; cursor: pointer" @click="form.reset()">
            重置
          </button>
        </div>
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { FormItem as AFormItem, Input as AInput, Space as ASpace } from 'ant-design-vue'
import { onMounted, ref, watch } from 'vue'

setupAntdVue()
const PRESETS = ['#1677ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2', '#eb2f96', '#000000']
const colorNames = ['primaryColor', 'bgColor', 'textColor']

const st = ref<InstanceType<typeof StatusTabs>>()

const form = useCreateForm({ initialValues: { themeName: '自定义主题', primaryColor: '#1677ff', bgColor: '#ffffff', textColor: '#333333' } })

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

onMounted(() => {
  form.createField({ name: 'themeName', label: '主题名称', required: true })
  form.createField({ name: 'primaryColor', label: '主色调', required: true })
  form.createField({ name: 'bgColor', label: '背景色' })
  form.createField({ name: 'textColor', label: '文字颜色' })
})
</script>
