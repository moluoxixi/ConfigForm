<template>
  <div>
    <h2>地图选点</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">模拟地图选点（可接入 @vuemap/vue-amap）</p>
    <el-alert type="info" show-icon style="margin-bottom: 16px" title="此为模拟地图，点击区域可选点。" />
    <el-radio-group v-model="mode" size="small" style="margin-bottom: 16px">
      <el-radio-button v-for="opt in MODE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</el-radio-button>
    </el-radio-group>
    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit" novalidate>
        <FormField v-slot="{ field }" name="locationName"><el-form-item :label="field.label"><el-input :model-value="(field.value as string) ?? ''" @update:model-value="field.setValue($event)" :disabled="mode === 'disabled'" /></el-form-item></FormField>
        <el-form-item label="地图选点">
          <div @click="handleMapClick" :style="{ width: '100%', height: '300px', background: 'linear-gradient(135deg, #e0f7fa, #a5d6a7)', borderRadius: '8px', border: '1px solid #dcdfe6', position: 'relative', cursor: mode !== 'editable' ? 'not-allowed' : 'crosshair', opacity: mode === 'disabled' ? 0.6 : 1 }">
            <div :style="{ position: 'absolute', left: `${((lng - 73) / 62) * 100}%`, top: `${((53 - lat) / 50) * 100}%`, transform: 'translate(-50%, -100%)', transition: 'all 0.2s', fontSize: '32px', color: '#f56c6c' }">📍</div>
            <div style="position: absolute; bottom: 8px; right: 8px; background: rgba(255,255,255,0.9); padding: 4px 8px; border-radius: 4px; font-size: 12px">经度: {{ lng.toFixed(4) }} | 纬度: {{ lat.toFixed(4) }}</div>
          </div>
        </el-form-item>
        <el-space style="margin-bottom: 16px">
          <FormField v-slot="{ field }" name="lng"><el-form-item label="经度" style="margin-bottom: 0"><el-input-number :model-value="(field.value as number)" @update:model-value="field.setValue($event)" :disabled="mode !== 'editable'" :step="0.0001" style="width: 150px" /></el-form-item></FormField>
          <FormField v-slot="{ field }" name="lat"><el-form-item label="纬度" style="margin-bottom: 0"><el-input-number :model-value="(field.value as number)" @update:model-value="field.setValue($event)" :disabled="mode !== 'editable'" :step="0.0001" style="width: 150px" /></el-form-item></FormField>
        </el-space>
        <el-button v-if="mode === 'editable'" type="primary" native-type="submit">提交</el-button>
      </form>
    </FormProvider>
    <el-alert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" :description="result" show-icon style="margin-top: 16px" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/vue'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import { ElButton, ElSpace, ElAlert, ElRadioGroup, ElRadioButton, ElInput, ElInputNumber, ElFormItem } from 'element-plus'
import type { FieldPattern } from '@moluoxixi/shared'

setupElementPlus()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const form = useCreateForm({ initialValues: { locationName: '天安门广场', lng: 116.3912, lat: 39.9075 } })
const lng = computed(() => (form.getFieldValue('lng') as number) ?? 116)
const lat = computed(() => (form.getFieldValue('lat') as number) ?? 39)

onMounted(() => { form.createField({ name: 'locationName', label: '地点名称', required: true }); form.createField({ name: 'lng', label: '经度' }); form.createField({ name: 'lat', label: '纬度' }) })
function handleMapClick(e: MouseEvent): void { if (mode.value !== 'editable') return; const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect(); const x = e.clientX - rect.left; const y = e.clientY - rect.top; form.setFieldValue('lng', Math.round((73 + (x / rect.width) * 62) * 10000) / 10000); form.setFieldValue('lat', Math.round((53 - (y / rect.height) * 50) * 10000) / 10000) }
async function handleSubmit(): Promise<void> { const res = await form.submit(); result.value = res.errors.length > 0 ? '验证失败: ' + res.errors.map(e => e.message).join(', ') : JSON.stringify(res.values, null, 2) }
</script>
