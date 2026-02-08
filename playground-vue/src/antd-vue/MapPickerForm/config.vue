<template>
  <div>
    <h2>地图选点</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">模拟地图选点 — ConfigForm + Schema 实现</p>
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
import { ConfigForm } from '@moluoxixi/vue'
/**
 * 地图选点 — Config 模式
 *
 * 使用 ConfigForm + Schema 实现地图选点表单。
 * 地图交互需借助 field 模式的 setFieldValue；此处展示 schema 驱动的经纬度输入。
 */
import { ref } from 'vue'

setupAntdVue()

const st = ref<InstanceType<typeof StatusTabs>>()

const initialValues = { locationName: '天安门广场', lng: 116.3912, lat: 39.9075 }

const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
  properties: {
    locationName: { type: 'string', title: '地点名称', required: true, componentProps: { placeholder: '请输入地点名称' } },
    lng: { type: 'number', title: '经度', componentProps: { step: 0.0001, style: 'width: 200px' } },
    lat: { type: 'number', title: '纬度', componentProps: { step: 0.0001, style: 'width: 200px' } },
  },
}

/** 将 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}
</script>
