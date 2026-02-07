<template>
  <div>
    <h2>级联选择</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      省市区三级联动 / 多级分类联动
    </p>
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
import type { FieldPattern } from '@moluoxixi/shared'
import { setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { ConfigForm } from '@moluoxixi/vue'
import { ref } from 'vue'

setupAntdVue()

const st = ref<InstanceType<typeof StatusTabs>>()

/** 工具：将 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

const initialValues = { province: undefined, city: undefined, district: undefined, categoryL1: undefined, categoryL2: undefined, categoryL3: undefined }

const PROVINCES = [{ label: '北京', value: 'beijing' }, { label: '上海', value: 'shanghai' }, { label: '广东', value: 'guangdong' }]
const CITIES: Record<string, Array<{ label: string, value: string }>> = {
  beijing: [{ label: '东城区', value: 'dongcheng' }, { label: '朝阳区', value: 'chaoyang' }],
  shanghai: [{ label: '黄浦区', value: 'huangpu' }, { label: '浦东新区', value: 'pudong' }],
  guangdong: [{ label: '广州', value: 'guangzhou' }, { label: '深圳', value: 'shenzhen' }],
}
const DISTRICTS: Record<string, Array<{ label: string, value: string }>> = {
  chaoyang: [{ label: '三里屯', value: 'sanlitun' }, { label: '望京', value: 'wangjing' }],
  guangzhou: [{ label: '天河区', value: 'tianhe' }, { label: '越秀区', value: 'yuexiu' }],
  shenzhen: [{ label: '南山区', value: 'nanshan' }, { label: '福田区', value: 'futian' }],
}
const CAT_L1 = [{ label: '电子产品', value: 'electronics' }, { label: '服装', value: 'clothing' }]
const CAT_L2: Record<string, Array<{ label: string, value: string }>> = {
  electronics: [{ label: '手机', value: 'phone' }, { label: '电脑', value: 'computer' }],
  clothing: [{ label: '男装', value: 'men' }, { label: '女装', value: 'women' }],
}
const CAT_L3: Record<string, Array<{ label: string, value: string }>> = {
  phone: [{ label: 'iPhone', value: 'iphone' }, { label: '华为', value: 'huawei' }],
  computer: [{ label: '笔记本', value: 'laptop' }, { label: '台式机', value: 'desktop' }],
}

const schema: ISchema = {
  type: 'object',
  decoratorProps: { actions: { submit: true, reset: true }, labelPosition: 'right', labelWidth: '120px' },
  properties: {
    province: { type: 'string', title: '省份', required: true, placeholder: '请选择', enum: PROVINCES },
    city: { type: 'string', title: '城市', required: true, placeholder: '请先选择省份', reactions: [{ watch: 'province', fulfill: { run: (f: any, ctx: any) => {
      const p = ctx.values.province as string
      f.setValue(undefined)
      f.setDataSource(p ? (CITIES[p] ?? []) : [])
      f.setComponentProps({ placeholder: p ? '请选择城市' : '请先选择省份' })
    } } }] },
    district: { type: 'string', title: '区县', placeholder: '请先选择城市', reactions: [{ watch: 'city', fulfill: { run: (f: any, ctx: any) => {
      const c = ctx.values.city as string
      f.setValue(undefined)
      f.setDataSource(c ? (DISTRICTS[c] ?? []) : [])
      f.setComponentProps({ placeholder: c ? '请选择区县' : '请先选择城市' })
    } } }] },
    categoryL1: { type: 'string', title: '一级分类', required: true, placeholder: '请选择', enum: CAT_L1 },
    categoryL2: { type: 'string', title: '二级分类', required: true, placeholder: '请先选择一级', reactions: [{ watch: 'categoryL1', fulfill: { run: (f: any, ctx: any) => {
      const l1 = ctx.values.categoryL1 as string
      f.setValue(undefined)
      f.setDataSource(l1 ? (CAT_L2[l1] ?? []) : [])
    } } }] },
    categoryL3: { type: 'string', title: '三级分类', placeholder: '请先选择二级', reactions: [{ watch: 'categoryL2', fulfill: { run: (f: any, ctx: any) => {
      const l2 = ctx.values.categoryL2 as string
      f.setValue(undefined)
      f.setDataSource(l2 ? (CAT_L3[l2] ?? []) : [])
    } } }] },
  },
}
</script>
