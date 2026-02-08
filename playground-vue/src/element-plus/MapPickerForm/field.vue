<template>
  <div>
    <h2>地图选点</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      模拟地图选点（可接入 @vuemap/vue-amap）
    </p>
    <div style="margin-bottom: 16px; padding: 12px 16px; border-radius: 4px; background: #f4f4f5; color: #909399; border: 1px solid #e9e9eb; display: flex; align-items: center; gap: 8px">
      <span>ℹ️</span>
      <span>此为模拟地图，点击区域可选点。</span>
    </div>
    <div style="display: flex; gap: 8px; margin-bottom: 16px">
      <button v-for="opt in MODE_OPTIONS" :key="opt.value" type="button" :style="{ padding: '4px 12px', borderRadius: '4px', border: '1px solid #dcdfe6', background: mode === opt.value ? '#409eff' : '#fff', color: mode === opt.value ? '#fff' : '#606266', cursor: 'pointer', fontSize: '12px' }" @click="mode = opt.value as FieldPattern">
        {{ opt.label }}
      </button>
    </div>
    <FormProvider :form="form">
        <FormField v-slot="{ field }" name="locationName">
          <div style="margin-bottom: 18px">
            <label style="display: block; margin-bottom: 4px; font-size: 14px; color: #606266">{{ field.label }}</label>
            <input :value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" style="width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 14px; box-sizing: border-box" @input="field.setValue(($event.target as HTMLInputElement).value)" />
          </div>
        </FormField>
        <div style="margin-bottom: 18px">
          <label style="display: block; margin-bottom: 4px; font-size: 14px; color: #606266">地图选点</label>
          <div :style="{ width: '100%', height: '300px', background: 'linear-gradient(135deg, #e0f7fa, #a5d6a7)', borderRadius: '8px', border: '1px solid #dcdfe6', position: 'relative', cursor: mode !== 'editable' ? 'not-allowed' : 'crosshair', opacity: mode === 'disabled' ? 0.6 : 1 }" @click="handleMapClick">
            <div :style="{ position: 'absolute', left: `${((lng - 73) / 62) * 100}%`, top: `${((53 - lat) / 50) * 100}%`, transform: 'translate(-50%, -100%)', transition: 'all 0.2s', fontSize: '32px', color: '#f56c6c' }">
              📍
            </div>
            <div style="position: absolute; bottom: 8px; right: 8px; background: rgba(255,255,255,0.9); padding: 4px 8px; border-radius: 4px; font-size: 12px">
              经度: {{ lng.toFixed(4) }} | 纬度: {{ lat.toFixed(4) }}
            </div>
          </div>
        </div>
        <div style="display: flex; gap: 16px; margin-bottom: 16px">
          <FormField v-slot="{ field }" name="lng">
            <div style="margin-bottom: 0">
              <label style="display: block; margin-bottom: 4px; font-size: 14px; color: #606266">经度</label>
              <input type="number" :value="(field.value as number)" :disabled="mode !== 'editable'" step="0.0001" style="width: 150px; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 14px; box-sizing: border-box" @input="field.setValue(Number(($event.target as HTMLInputElement).value) || 0)" />
            </div>
          </FormField>
          <FormField v-slot="{ field }" name="lat">
            <div style="margin-bottom: 0">
              <label style="display: block; margin-bottom: 4px; font-size: 14px; color: #606266">纬度</label>
              <input type="number" :value="(field.value as number)" :disabled="mode !== 'editable'" step="0.0001" style="width: 150px; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 14px; box-sizing: border-box" @input="field.setValue(Number(($event.target as HTMLInputElement).value) || 0)" />
            </div>
          </FormField>
        </div>
        <div style="display: flex; gap: 8px">
          <button type="submit" style="padding: 8px 16px; background: #409eff; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 14px">
            提交
          </button>
          <button type="button" style="padding: 8px 16px; background: #fff; color: #606266; border: 1px solid #dcdfe6; border-radius: 4px; cursor: pointer; font-size: 14px" @click="form.reset()">
            重置
          </button>
        </div>
    </FormProvider>
    <div v-if="result" :style="{ marginTop: '16px', padding: '12px 16px', borderRadius: '4px', background: result.startsWith('验证失败') ? '#fef0f0' : '#f0f9eb', color: result.startsWith('验证失败') ? '#f56c6c' : '#67c23a', border: result.startsWith('验证失败') ? '1px solid #fde2e2' : '1px solid #e1f3d8' }">
      <div style="white-space: pre-wrap">{{ result }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { computed, onMounted, ref } from 'vue'

setupElementPlus()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const form = useCreateForm({ initialValues: { locationName: '天安门广场', lng: 116.3912, lat: 39.9075 } })
const lng = computed(() => (form.getFieldValue('lng') as number) ?? 116)
const lat = computed(() => (form.getFieldValue('lat') as number) ?? 39)

onMounted(() => {
  form.createField({ name: 'locationName', label: '地点名称', required: true })
  form.createField({ name: 'lng', label: '经度' })
  form.createField({ name: 'lat', label: '纬度' })
})
function handleMapClick(e: MouseEvent): void {
  if (mode.value !== 'editable')
    return
  const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  form.setFieldValue('lng', Math.round((73 + (x / rect.width) * 62) * 10000) / 10000)
  form.setFieldValue('lat', Math.round((53 - (y / rect.height) * 50) * 10000) / 10000)
}
</script>
