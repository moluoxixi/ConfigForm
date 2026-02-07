<template>
  <div>
    <h2>依赖数据源</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">品牌→型号→配置（三级依赖链） / 年级→班级</p>
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
const savedValues = ref<Record<string, unknown>>({ brand: undefined, model: undefined, config: undefined, grade: undefined, classNo: undefined })

const MODELS: Record<string, Array<{ label: string; value: string }>> = {
  apple: [{ label: 'iPhone 15', value: 'iphone15' }, { label: 'MacBook Pro', value: 'macbook-pro' }],
  huawei: [{ label: 'Mate 60', value: 'mate60' }, { label: 'P60', value: 'p60' }],
  xiaomi: [{ label: '小米 14', value: 'mi14' }],
}
const CONFIGS: Record<string, Array<{ label: string; value: string }>> = {
  iphone15: [{ label: '128GB', value: '128' }, { label: '256GB', value: '256' }, { label: '512GB', value: '512' }],
  mate60: [{ label: '256GB', value: '256' }, { label: '512GB', value: '512' }],
  mi14: [{ label: '256GB', value: '256' }, { label: '1TB', value: '1024' }],
}
const CLASSES: Record<string, Array<{ label: string; value: string }>> = {
  grade1: [{ label: '1班', value: 'c1' }, { label: '2班', value: 'c2' }, { label: '3班', value: 'c3' }],
  grade2: [{ label: '1班', value: 'c1' }, { label: '2班', value: 'c2' }],
}

const schema = computed<FormSchema>(() => ({
  form: { labelPosition: 'right', labelWidth: '140px', pattern: mode.value },
  fields: {
    brand: { type: 'string', label: '品牌', required: true, component: 'Select', wrapper: 'FormItem', enum: [{ label: 'Apple', value: 'apple' }, { label: '华为', value: 'huawei' }, { label: '小米', value: 'xiaomi' }] },
    model: { type: 'string', label: '型号', required: true, component: 'Select', wrapper: 'FormItem', placeholder: '请先选择品牌', reactions: [{ watch: 'brand', fulfill: { run: async (f: any, ctx: any) => { const b = ctx.values.brand as string; f.setValue(undefined); if (!b) { f.setDataSource([]); return }; f.loading = true; await new Promise(r => setTimeout(r, 400)); f.setDataSource(MODELS[b] ?? []); f.loading = false; f.setComponentProps({ placeholder: '请选择型号' }) } } }] },
    config: { type: 'string', label: '配置', component: 'Select', wrapper: 'FormItem', placeholder: '请先选择型号', reactions: [{ watch: 'model', fulfill: { run: async (f: any, ctx: any) => { const m = ctx.values.model as string; f.setValue(undefined); if (!m) { f.setDataSource([]); return }; f.loading = true; await new Promise(r => setTimeout(r, 300)); f.setDataSource(CONFIGS[m] ?? []); f.loading = false } } }] },
    grade: { type: 'string', label: '年级', required: true, component: 'Select', wrapper: 'FormItem', enum: [{ label: '一年级', value: 'grade1' }, { label: '二年级', value: 'grade2' }] },
    classNo: { type: 'string', label: '班级', required: true, component: 'Select', wrapper: 'FormItem', placeholder: '请先选择年级', reactions: [{ watch: 'grade', fulfill: { run: async (f: any, ctx: any) => { const g = ctx.values.grade as string; f.setValue(undefined); if (!g) { f.setDataSource([]); return }; f.loading = true; await new Promise(r => setTimeout(r, 300)); f.setDataSource(CLASSES[g] ?? []); f.loading = false } } }] },
  },
}))
</script>
