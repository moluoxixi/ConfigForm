<template>
  <div>
    <h2>异步选项加载</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">远程 dataSource / reactions 异步加载 / loading 状态</p>
    <el-alert type="info" show-icon style="margin-bottom: 16px" title="切换「类型」下拉可看到异步加载过程（模拟 600ms 延迟）" />
    <el-radio-group v-model="mode" size="small" style="margin-bottom: 16px">
      <el-radio-button v-for="opt in MODE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</el-radio-button>
    </el-radio-group>
    <ConfigForm :key="mode" :schema="schema" :initial-values="savedValues" @values-change="(v: Record<string, unknown>) => savedValues = v" @submit="(v: Record<string, unknown>) => result = JSON.stringify(v, null, 2)" @submit-failed="(e: any[]) => result = '验证失败:\n' + e.map((x: any) => `[${x.path}] ${x.message}`).join('\n')">
      <template #default="{ form }"><el-space v-if="mode === 'editable'" style="margin-top: 16px"><el-button type="primary" native-type="submit">提交</el-button><el-button @click="form.reset()">重置</el-button></el-space></template>
    </ConfigForm>
    <el-alert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" :description="result" show-icon style="margin-top: 16px" />
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { ConfigForm } from '@moluoxixi/vue'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import type { FormSchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'
setupElementPlus()
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
