<template>
  <div>
    <h2>依赖数据源</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      品牌→型号→配置（三级依赖链） / 年级→班级 — ConfigForm + ISchema 实现
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
/**
 * 依赖数据源 — Config 模式（Element Plus）
 *
 * 使用 ConfigForm + ISchema + reactions 实现依赖数据源：
 * - 品牌→型号→配置 三级依赖链（异步加载）
 * - 年级→班级 两级依赖
 */
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/core'
import { setupElementPlus, StatusTabs } from '@moluoxixi/ui-element-plus'
import { ConfigForm } from '@moluoxixi/vue'
import { ref } from 'vue'

setupElementPlus()

const st = ref<InstanceType<typeof StatusTabs>>()

function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

const MODELS: Record<string, Array<{ label: string, value: string }>> = {
  apple: [{ label: 'iPhone 15', value: 'iphone15' }, { label: 'MacBook Pro', value: 'macbook-pro' }],
  huawei: [{ label: 'Mate 60', value: 'mate60' }, { label: 'P60', value: 'p60' }],
  xiaomi: [{ label: '小米 14', value: 'mi14' }],
}
const CONFIGS: Record<string, Array<{ label: string, value: string }>> = {
  iphone15: [{ label: '128GB', value: '128' }, { label: '256GB', value: '256' }, { label: '512GB', value: '512' }],
  mate60: [{ label: '256GB', value: '256' }, { label: '512GB', value: '512' }],
  mi14: [{ label: '256GB', value: '256' }, { label: '1TB', value: '1024' }],
}
const CLASSES: Record<string, Array<{ label: string, value: string }>> = {
  grade1: [{ label: '1班', value: 'c1' }, { label: '2班', value: 'c2' }, { label: '3班', value: 'c3' }],
  grade2: [{ label: '1班', value: 'c1' }, { label: '2班', value: 'c2' }],
}

const initialValues = {
  brand: undefined, model: undefined, config: undefined,
  grade: undefined, classNo: undefined,
}

const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '140px', actions: { submit: '提交', reset: '重置' } },
  properties: {
    brand: {
      type: 'string', title: '品牌', required: true, component: 'Select',
      enum: [{ label: 'Apple', value: 'apple' }, { label: '华为', value: 'huawei' }, { label: '小米', value: 'xiaomi' }],
    },
    model: {
      type: 'string', title: '型号', required: true, component: 'Select',
      componentProps: { placeholder: '请先选择品牌' },
      reactions: [{ watch: 'brand', fulfill: { run: async (f: any, ctx: any) => {
        const b = ctx.values.brand as string
        f.setValue(undefined)
        if (!b) { f.setDataSource([]); return }
        f.loading = true
        await new Promise(r => setTimeout(r, 400))
        f.setDataSource(MODELS[b] ?? [])
        f.loading = false
        f.setComponentProps({ placeholder: '请选择型号' })
      } } }],
    },
    config: {
      type: 'string', title: '配置', component: 'Select',
      componentProps: { placeholder: '请先选择型号' },
      reactions: [{ watch: 'model', fulfill: { run: async (f: any, ctx: any) => {
        const m = ctx.values.model as string
        f.setValue(undefined)
        if (!m) { f.setDataSource([]); return }
        f.loading = true
        await new Promise(r => setTimeout(r, 300))
        f.setDataSource(CONFIGS[m] ?? [])
        f.loading = false
      } } }],
    },
    grade: {
      type: 'string', title: '年级', required: true, component: 'Select',
      enum: [{ label: '一年级', value: 'grade1' }, { label: '二年级', value: 'grade2' }],
    },
    classNo: {
      type: 'string', title: '班级', required: true, component: 'Select',
      componentProps: { placeholder: '请先选择年级' },
      reactions: [{ watch: 'grade', fulfill: { run: async (f: any, ctx: any) => {
        const g = ctx.values.grade as string
        f.setValue(undefined)
        if (!g) { f.setDataSource([]); return }
        f.loading = true
        await new Promise(r => setTimeout(r, 300))
        f.setDataSource(CLASSES[g] ?? [])
        f.loading = false
      } } }],
    },
  },
}
</script>
