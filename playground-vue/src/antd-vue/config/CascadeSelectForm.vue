<template>
  <div>
    <h2>级联选择</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">省市区三级联动 / 多级分类联动</p>
    <ASegmented v-model:value="mode" :options="MODE_OPTIONS" style="margin-bottom: 16px" />
    <ConfigForm :key="mode" :schema="schema" :initial-values="savedValues" @values-change="(v: Record<string, unknown>) => savedValues = v" @submit="(v: Record<string, unknown>) => result = JSON.stringify(v, null, 2)" @submit-failed="(e: any[]) => result = '验证失败:\n' + e.map((x: any) => `[${x.path}] ${x.message}`).join('\n')">
      <template #default="{ form }"><ADivider /><ASpace v-if="mode === 'editable'"><AButton type="primary" html-type="submit">提交</AButton><AButton @click="form.reset()">重置</AButton></ASpace></template>
    </ConfigForm>
    <AAlert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" message="提交结果" style="margin-top: 16px"><template #description><pre style="margin: 0; white-space: pre-wrap">{{ result }}</pre></template></AAlert>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ConfigForm } from '@moluoxixi/vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { Button as AButton, Space as ASpace, Alert as AAlert, Segmented as ASegmented, Divider as ADivider } from 'ant-design-vue'
import type { FormSchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'

setupAntdVue()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const savedValues = ref<Record<string, unknown>>({ province: undefined, city: undefined, district: undefined, categoryL1: undefined, categoryL2: undefined, categoryL3: undefined })

const PROVINCES = [{ label: '北京', value: 'beijing' }, { label: '上海', value: 'shanghai' }, { label: '广东', value: 'guangdong' }]
const CITIES: Record<string, Array<{ label: string; value: string }>> = {
  beijing: [{ label: '东城区', value: 'dongcheng' }, { label: '朝阳区', value: 'chaoyang' }],
  shanghai: [{ label: '黄浦区', value: 'huangpu' }, { label: '浦东新区', value: 'pudong' }],
  guangdong: [{ label: '广州', value: 'guangzhou' }, { label: '深圳', value: 'shenzhen' }],
}
const DISTRICTS: Record<string, Array<{ label: string; value: string }>> = {
  chaoyang: [{ label: '三里屯', value: 'sanlitun' }, { label: '望京', value: 'wangjing' }],
  guangzhou: [{ label: '天河区', value: 'tianhe' }, { label: '越秀区', value: 'yuexiu' }],
  shenzhen: [{ label: '南山区', value: 'nanshan' }, { label: '福田区', value: 'futian' }],
}
const CAT_L1 = [{ label: '电子产品', value: 'electronics' }, { label: '服装', value: 'clothing' }]
const CAT_L2: Record<string, Array<{ label: string; value: string }>> = {
  electronics: [{ label: '手机', value: 'phone' }, { label: '电脑', value: 'computer' }],
  clothing: [{ label: '男装', value: 'men' }, { label: '女装', value: 'women' }],
}
const CAT_L3: Record<string, Array<{ label: string; value: string }>> = {
  phone: [{ label: 'iPhone', value: 'iphone' }, { label: '华为', value: 'huawei' }],
  computer: [{ label: '笔记本', value: 'laptop' }, { label: '台式机', value: 'desktop' }],
}

const schema = computed<FormSchema>(() => ({
  form: { labelPosition: 'right', labelWidth: '120px', pattern: mode.value },
  fields: {
    province: { type: 'string', label: '省份', required: true, component: 'Select', wrapper: 'FormItem', placeholder: '请选择', enum: PROVINCES },
    city: { type: 'string', label: '城市', required: true, component: 'Select', wrapper: 'FormItem', placeholder: '请先选择省份', reactions: [{ watch: 'province', fulfill: { run: (f: any, ctx: any) => { const p = ctx.values.province as string; f.setValue(undefined); f.setDataSource(p ? (CITIES[p] ?? []) : []); f.setComponentProps({ placeholder: p ? '请选择城市' : '请先选择省份' }) } } }] },
    district: { type: 'string', label: '区县', component: 'Select', wrapper: 'FormItem', placeholder: '请先选择城市', reactions: [{ watch: 'city', fulfill: { run: (f: any, ctx: any) => { const c = ctx.values.city as string; f.setValue(undefined); f.setDataSource(c ? (DISTRICTS[c] ?? []) : []); f.setComponentProps({ placeholder: c ? '请选择区县' : '请先选择城市' }) } } }] },
    categoryL1: { type: 'string', label: '一级分类', required: true, component: 'Select', wrapper: 'FormItem', placeholder: '请选择', enum: CAT_L1 },
    categoryL2: { type: 'string', label: '二级分类', required: true, component: 'Select', wrapper: 'FormItem', placeholder: '请先选择一级', reactions: [{ watch: 'categoryL1', fulfill: { run: (f: any, ctx: any) => { const l1 = ctx.values.categoryL1 as string; f.setValue(undefined); f.setDataSource(l1 ? (CAT_L2[l1] ?? []) : []) } } }] },
    categoryL3: { type: 'string', label: '三级分类', component: 'Select', wrapper: 'FormItem', placeholder: '请先选择二级', reactions: [{ watch: 'categoryL2', fulfill: { run: (f: any, ctx: any) => { const l2 = ctx.values.categoryL2 as string; f.setValue(undefined); f.setDataSource(l2 ? (CAT_L3[l2] ?? []) : []) } } }] },
  },
}))
</script>
