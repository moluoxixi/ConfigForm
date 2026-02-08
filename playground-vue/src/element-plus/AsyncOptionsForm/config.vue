<template>
  <div>
    <h2>异步选项加载</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      远程 dataSource / reactions 异步加载 / loading 状态 — ConfigForm + ISchema 实现
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
 * 异步选项加载 — Config 模式（Element Plus）
 *
 * 使用 ConfigForm + ISchema + reactions 实现异步选项加载：
 * - 切换「类型」下拉时异步加载「品种」选项（模拟 600ms 延迟）
 * - 自动管理 loading 状态
 */
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'
import { setupElementPlus, StatusTabs } from '@moluoxixi/ui-element-plus'
import { ConfigForm } from '@moluoxixi/vue'
import { ref } from 'vue'

setupElementPlus()

const st = ref<InstanceType<typeof StatusTabs>>()

function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

const mockData: Record<string, Array<{ label: string, value: string }>> = {
  fruit: [{ label: '苹果', value: 'apple' }, { label: '香蕉', value: 'banana' }, { label: '橙子', value: 'orange' }],
  vegetable: [{ label: '白菜', value: 'cabbage' }, { label: '胡萝卜', value: 'carrot' }],
  meat: [{ label: '猪肉', value: 'pork' }, { label: '牛肉', value: 'beef' }],
}

const initialValues = { dynamicType: 'fruit', dynamicItem: undefined, country: 'china', remark: '' }

const schema: ISchema = {
  type: 'object',
  decoratorProps: {
    labelPosition: 'right',
    labelWidth: '140px',
    actions: { submit: '提交', reset: '重置' },
    description: '切换「类型」下拉可看到异步加载过程（模拟 600ms 延迟）',
  },
  properties: {
    dynamicType: {
      type: 'string', title: '类型', default: 'fruit', component: 'Select',
      enum: [{ label: '水果', value: 'fruit' }, { label: '蔬菜', value: 'vegetable' }, { label: '肉类', value: 'meat' }],
    },
    dynamicItem: {
      type: 'string', title: '品种（异步）', component: 'Select',
      componentProps: { placeholder: '根据类型异步加载' },
      reactions: [{ watch: 'dynamicType', fulfill: { run: async (f: any, ctx: any) => {
        const t = ctx.values.dynamicType as string
        if (!t) { f.setDataSource([]); return }
        f.loading = true
        f.setValue(undefined)
        await new Promise(r => setTimeout(r, 600))
        f.setDataSource(mockData[t] ?? [])
        f.loading = false
      } } }],
    },
    country: {
      type: 'string', title: '国家', default: 'china', component: 'Select',
      enum: [{ label: '中国', value: 'china' }, { label: '美国', value: 'usa' }, { label: '日本', value: 'japan' }],
    },
    remark: {
      type: 'string', title: '备注', component: 'Textarea',
      componentProps: { placeholder: '请输入' },
    },
  },
}
</script>
