<template>
  <div>
    <h2>地图选点</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      模拟地图选点（可接入 @vuemap/vue-amap）
    </p>
    <div style="margin-bottom: 16px; padding: 8px 12px; background: #e6f4ff; border: 1px solid #91caff; border-radius: 6px; color: #0958d9; font-size: 14px; display: flex; align-items: center; gap: 8px">
      <span>ℹ️</span>
      <span>此为模拟地图，点击区域可选点。</span>
    </div>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <form @submit.prevent="handleSubmit(showResult)" novalidate>
          <FormField name="locationName" :field-props="{ label: '地点名称', required: true, component: 'Input', componentProps: { placeholder: '请输入地点名称' } }" />
          <!-- 模拟地图区域（非表单字段组件，作为附加内容） -->
          <div style="margin-bottom: 16px">
            <div style="font-weight: 600; margin-bottom: 8px">地图选点</div>
            <div
              :style="{
                width: '100%',
                height: '300px',
                background: 'linear-gradient(135deg, #e0f7fa, #a5d6a7)',
                borderRadius: '8px',
                border: '1px solid #d9d9d9',
                position: 'relative',
                cursor: mode !== 'editable' ? 'not-allowed' : 'crosshair',
                opacity: mode === 'disabled' ? 0.6 : 1,
              }"
              @click="handleMapClick"
            >
              <div
                :style="{
                  position: 'absolute',
                  left: `${((lng - 73) / 62) * 100}%`,
                  top: `${((53 - lat) / 50) * 100}%`,
                  transform: 'translate(-50%, -100%)',
                  transition: 'all 0.2s',
                  fontSize: '32px',
                  color: '#ff4d4f',
                }"
              >
                📍
              </div>
              <div style="position: absolute; bottom: 8px; right: 8px; background: rgba(255,255,255,0.9); padding: 4px 8px; border-radius: 4px; font-size: 12px">
                经度: {{ lng.toFixed(4) }} | 纬度: {{ lat.toFixed(4) }}
              </div>
            </div>
          </div>
          <!-- 经纬度输入 -->
          <div style="display: flex; gap: 16px; margin-bottom: 16px">
            <FormField name="lng" :field-props="{ label: '经度', component: 'InputNumber', componentProps: { step: 0.0001, style: 'width: 150px' } }" />
            <FormField name="lat" :field-props="{ label: '纬度', component: 'InputNumber', componentProps: { step: 0.0001, style: 'width: 150px' } }" />
          </div>
          <LayoutFormActions @reset="form.reset()" />
        </form>
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { LayoutFormActions, setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
/**
 * 地图选点表单 — Field 模式
 *
 * 标准字段（地点名称、经纬度）使用 FormField + fieldProps。
 * 模拟地图为附加内容（非表单字段组件），通过 form.setFieldValue 更新经纬度。
 */
import { computed, ref, watch } from 'vue'

setupAntdVue()

const st = ref<InstanceType<typeof StatusTabs>>()

const form = useCreateForm({
  initialValues: { locationName: '天安门广场', lng: 116.3912, lat: 39.9075 },
})

/** 经纬度计算属性（用于地图渲染） */
const lng = computed(() => (form.getFieldValue('lng') as number) ?? 116)
const lat = computed(() => (form.getFieldValue('lat') as number) ?? 39)

/** 地图点击：计算经纬度并写入表单 */
function handleMapClick(e: MouseEvent): void {
  if (form.pattern !== 'editable') return
  const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  form.setFieldValue('lng', Math.round((73 + (x / rect.width) * 62) * 10000) / 10000)
  form.setFieldValue('lat', Math.round((53 - (y / rect.height) * 50) * 10000) / 10000)
}

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
