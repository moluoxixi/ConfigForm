<template>
  <div>
    <h2>异步选项加载</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">远程 dataSource / reactions 异步加载 / loading 状态</p>
    <AAlert type="info" show-icon style="margin-bottom: 16px" message="切换「类型」下拉可看到异步加载过程（模拟 600ms 延迟）" />
    <ASegmented v-model:value="mode" :options="MODE_OPTIONS" style="margin-bottom: 16px" />
    <ConfigForm :key="mode" :schema="schema" :initial-values="savedValues" @values-change="(v: Record<string, unknown>) => savedValues = v" @submit="(v: Record<string, unknown>) => result = JSON.stringify(v, null, 2)" @submit-failed="(e: any[]) => result = '验证失败:\n' + e.map((x: any) => `[${x.path}] ${x.message}`).join('\n')">
      <template #default="{ form }"><ASpace v-if="mode === 'editable'" style="margin-top: 16px"><AButton type="primary" html-type="submit">提交</AButton><AButton @click="form.reset()">重置</AButton></ASpace></template>
    </ConfigForm>
    <AAlert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" message="提交结果" style="margin-top: 16px"><template #description><pre style="margin: 0; white-space: pre-wrap">{{ result }}</pre></template></AAlert>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ConfigForm } from '@moluoxixi/vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { Button as AButton, Space as ASpace, Alert as AAlert, Segmented as ASegmented } from 'ant-design-vue'
import type { FormSchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'

setupAntdVue()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const savedValues = ref<Record<string, unknown>>({ dynamicType: 'fruit', dynamicItem: undefined, country: 'china', remark: '' })

const mockData: Record<string, Array<{ label: string; value: string }>> = {
  fruit: [{ label: '苹果', value: 'apple' }, { label: '香蕉', value: 'banana' }, { label: '橙子', value: 'orange' }],
  vegetable: [{ label: '白菜', value: 'cabbage' }, { label: '胡萝卜', value: 'carrot' }],
  meat: [{ label: '猪肉', value: 'pork' }, { label: '牛肉', value: 'beef' }],
}

const schema = computed<FormSchema>(() => ({
  form: { labelPosition: 'right', labelWidth: '140px', pattern: mode.value },
  fields: {
    dynamicType: { type: 'string', label: '类型', component: 'Select', wrapper: 'FormItem', defaultValue: 'fruit', enum: [{ label: '水果', value: 'fruit' }, { label: '蔬菜', value: 'vegetable' }, { label: '肉类', value: 'meat' }] },
    dynamicItem: {
      type: 'string', label: '品种（异步）', component: 'Select', wrapper: 'FormItem', placeholder: '根据类型异步加载',
      reactions: [{ watch: 'dynamicType', fulfill: { run: async (f: any, ctx: any) => { const t = ctx.values.dynamicType as string; if (!t) { f.setDataSource([]); return }; f.loading = true; f.setValue(undefined); await new Promise(r => setTimeout(r, 600)); f.setDataSource(mockData[t] ?? []); f.loading = false } } }],
    },
    country: { type: 'string', label: '国家', component: 'Select', wrapper: 'FormItem', defaultValue: 'china', enum: [{ label: '中国', value: 'china' }, { label: '美国', value: 'usa' }, { label: '日本', value: 'japan' }] },
    remark: { type: 'string', label: '备注', component: 'Textarea', wrapper: 'FormItem', placeholder: '请输入' },
  },
}))
</script>
