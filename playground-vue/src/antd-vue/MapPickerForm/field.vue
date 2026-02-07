<template>
  <div>
    <h2>地图选点</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      模拟地图选点（可接入 @vuemap/vue-amap）
    </p>
    <AAlert type="info" show-icon style="margin-bottom: 16px" message="此为模拟地图，点击区域可选点。" />
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <FormField v-slot="{ field }" name="locationName">
          <AFormItem :label="field.label">
            <span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span><AInput v-else :value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" @update:value="field.setValue($event)" />
          </AFormItem>
        </FormField>
        <AFormItem label="地图选点">
          <div :style="{ width: '100%', height: '300px', background: 'linear-gradient(135deg, #e0f7fa, #a5d6a7)', borderRadius: '8px', border: '1px solid #d9d9d9', position: 'relative', cursor: mode !== 'editable' ? 'not-allowed' : 'crosshair', opacity: mode === 'disabled' ? 0.6 : 1 }" @click="handleMapClick">
            <div :style="{ position: 'absolute', left: `${((lng - 73) / 62) * 100}%`, top: `${((53 - lat) / 50) * 100}%`, transform: 'translate(-50%, -100%)', transition: 'all 0.2s', fontSize: '32px', color: '#ff4d4f' }">
              📍
            </div>
            <div style="position: absolute; bottom: 8px; right: 8px; background: rgba(255,255,255,0.9); padding: 4px 8px; border-radius: 4px; font-size: 12px">
              经度: {{ lng.toFixed(4) }} | 纬度: {{ lat.toFixed(4) }}
            </div>
          </div>
        </AFormItem>
        <ASpace style="margin-bottom: 16px">
          <FormField v-slot="{ field }" name="lng">
            <AFormItem label="经度" style="margin-bottom: 0">
              <span v-if="mode === 'readOnly'">{{ field.value ?? '—' }}</span><AInputNumber v-else :value="(field.value as number)" :disabled="mode !== 'editable'" :step="0.0001" style="width: 150px" @update:value="field.setValue($event)" />
            </AFormItem>
          </FormField>
          <FormField v-slot="{ field }" name="lat">
            <AFormItem label="纬度" style="margin-bottom: 0">
              <span v-if="mode === 'readOnly'">{{ field.value ?? '—' }}</span><AInputNumber v-else :value="(field.value as number)" :disabled="mode !== 'editable'" :step="0.0001" style="width: 150px" @update:value="field.setValue($event)" />
            </AFormItem>
          </FormField>
        </ASpace>
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
import { Alert as AAlert, FormItem as AFormItem, Input as AInput, InputNumber as AInputNumber, Space as ASpace } from 'ant-design-vue'
import { computed, onMounted, ref, watch } from 'vue'

setupAntdVue()
const st = ref<InstanceType<typeof StatusTabs>>()
const form = useCreateForm({ initialValues: { locationName: '天安门广场', lng: 116.3912, lat: 39.9075 } })
const lng = computed(() => (form.getFieldValue('lng') as number) ?? 116)
const lat = computed(() => (form.getFieldValue('lat') as number) ?? 39)

onMounted(() => {
  form.createField({ name: 'locationName', label: '地点名称', required: true })
  form.createField({ name: 'lng', label: '经度' })
  form.createField({ name: 'lat', label: '纬度' })
})
function handleMapClick(e: MouseEvent): void {
  if (form.pattern !== 'editable')
    return
  const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  form.setFieldValue('lng', Math.round((73 + (x / rect.width) * 62) * 10000) / 10000)
  form.setFieldValue('lat', Math.round((53 - (y / rect.height) * 50) * 10000) / 10000)
}
watch(() => st.value?.mode, (v) => {
  if (v)
    form.pattern = v as FieldPattern
}, { immediate: true })
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
