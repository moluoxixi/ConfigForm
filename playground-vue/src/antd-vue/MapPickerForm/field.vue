<template>
  <div>
    <h2>地图选点</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">模拟地图选点（可接入 @vuemap/vue-amap）</p>
    <AAlert type="info" show-icon style="margin-bottom: 16px" message="此为模拟地图，点击区域可选点。" />
    <PlaygroundForm :form="form">
      <template #default="{ form: f, mode }">
        <FormField v-slot="{ field }" name="locationName"><AFormItem :label="field.label"><span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span><AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" :disabled="mode === 'disabled'" /></AFormItem></FormField>
        <AFormItem label="地图选点">
          <div @click="handleMapClick" :style="{ width: '100%', height: '300px', background: 'linear-gradient(135deg, #e0f7fa, #a5d6a7)', borderRadius: '8px', border: '1px solid #d9d9d9', position: 'relative', cursor: mode !== 'editable' ? 'not-allowed' : 'crosshair', opacity: mode === 'disabled' ? 0.6 : 1 }">
            <div :style="{ position: 'absolute', left: `${((lng - 73) / 62) * 100}%`, top: `${((53 - lat) / 50) * 100}%`, transform: 'translate(-50%, -100%)', transition: 'all 0.2s', fontSize: '32px', color: '#ff4d4f' }">📍</div>
            <div style="position: absolute; bottom: 8px; right: 8px; background: rgba(255,255,255,0.9); padding: 4px 8px; border-radius: 4px; font-size: 12px">经度: {{ lng.toFixed(4) }} | 纬度: {{ lat.toFixed(4) }}</div>
          </div>
        </AFormItem>
        <ASpace style="margin-bottom: 16px">
          <FormField v-slot="{ field }" name="lng"><AFormItem label="经度" style="margin-bottom: 0"><span v-if="mode === 'readOnly'">{{ field.value ?? '—' }}</span><AInputNumber v-else :value="(field.value as number)" @update:value="field.setValue($event)" :disabled="mode !== 'editable'" :step="0.0001" style="width: 150px" /></AFormItem></FormField>
          <FormField v-slot="{ field }" name="lat"><AFormItem label="纬度" style="margin-bottom: 0"><span v-if="mode === 'readOnly'">{{ field.value ?? '—' }}</span><AInputNumber v-else :value="(field.value as number)" @update:value="field.setValue($event)" :disabled="mode !== 'editable'" :step="0.0001" style="width: 150px" /></AFormItem></FormField>
        </ASpace>
      </template>
    </PlaygroundForm>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { FormField, useCreateForm } from '@moluoxixi/vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { Space as ASpace, Alert as AAlert, Input as AInput, InputNumber as AInputNumber, FormItem as AFormItem } from 'ant-design-vue'
import PlaygroundForm from '../../components/PlaygroundForm.vue'

setupAntdVue()
const form = useCreateForm({ initialValues: { locationName: '天安门广场', lng: 116.3912, lat: 39.9075 } })
const lng = computed(() => (form.getFieldValue('lng') as number) ?? 116)
const lat = computed(() => (form.getFieldValue('lat') as number) ?? 39)

onMounted(() => { form.createField({ name: 'locationName', label: '地点名称', required: true }); form.createField({ name: 'lng', label: '经度' }); form.createField({ name: 'lat', label: '纬度' }) })
function handleMapClick(e: MouseEvent): void { if (form.pattern !== 'editable') return; const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect(); const x = e.clientX - rect.left; const y = e.clientY - rect.top; form.setFieldValue('lng', Math.round((73 + (x / rect.width) * 62) * 10000) / 10000); form.setFieldValue('lat', Math.round((53 - (y / rect.height) * 50) * 10000) / 10000) }
</script>
