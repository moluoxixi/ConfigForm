<template>
  <div>
    <h2>动态增删字段</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      预设字段组合 / Schema 切换 — ConfigForm + ISchema 实现
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <ConfigForm
        :key="schemaKey"
        :schema="withMode(computedSchema, mode)"
        :initial-values="initialValues"
        @submit="showResult"
        @submit-failed="(e: any) => st?.showErrors(e)"
        @values-change="handleValuesChange"
      />
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
/**
 * 动态增删字段 — Config 模式（Element Plus）
 *
 * 使用 ConfigForm + ISchema 实现动态字段切换。
 * 通过 schema 中的 CheckboxGroup 控制哪些字段显示，
 * 通过 @values-change 监听选择变化并动态重建 schema。
 * 不使用 v-for 渲染按钮，完全由 schema 驱动。
 */
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/core'
import { setupElementPlus, StatusTabs } from '@moluoxixi/ui-element-plus'
import { ConfigForm } from '@moluoxixi/vue'
import { computed, ref } from 'vue'

setupElementPlus()

const st = ref<InstanceType<typeof StatusTabs>>()

/** 工具：将 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

/** 可选字段配置 */
const fieldOptions = [
  { label: '姓名', value: 'name' },
  { label: '邮箱', value: 'email' },
  { label: '电话', value: 'phone' },
  { label: '公司', value: 'company' },
  { label: '职位', value: 'position' },
  { label: '备注', value: 'remark' },
]

/** 字段定义 */
const FIELD_DEFINITIONS: Record<string, ISchema> = {
  name: { type: 'string', title: '姓名', required: true, rules: [{ minLength: 2, message: '至少 2 字' }] },
  email: { type: 'string', title: '邮箱', rules: [{ format: 'email', message: '无效邮箱' }] },
  phone: { type: 'string', title: '电话', rules: [{ format: 'phone', message: '无效手机号' }] },
  company: { type: 'string', title: '公司' },
  position: { type: 'string', title: '职位' },
  remark: { type: 'string', title: '备注', component: 'Textarea', componentProps: { rows: 3 } },
}

/** 当前激活的字段 */
const activeFields = ref<string[]>(['name', 'email'])
const schemaKey = ref(0)

/** 监听表单值变化，检测 _selectedFields 的改变 */
function handleValuesChange(values: Record<string, unknown>): void {
  const selected = values._selectedFields
  if (Array.isArray(selected)) {
    activeFields.value = selected as string[]
    schemaKey.value++
  }
}

/** 计算当前 schema：使用 CheckboxGroup 控制字段选择 */
const computedSchema = computed<ISchema>(() => {
  const properties: Record<string, ISchema> = {
    /* 字段选择器 — 使用 CheckboxGroup 组件，由 schema 驱动 */
    _selectedFields: {
      type: 'string',
      title: '显示字段',
      component: 'CheckboxGroup',
      default: activeFields.value,
      dataSource: fieldOptions,
      order: -1,
    },
  }
  /* 根据选择动态添加字段 */
  for (const field of activeFields.value) {
    if (FIELD_DEFINITIONS[field]) {
      properties[field] = { ...FIELD_DEFINITIONS[field], order: fieldOptions.findIndex(f => f.value === field) }
    }
  }
  return {
    type: 'object',
    decoratorProps: { labelPosition: 'right', labelWidth: '100px', actions: { submit: '提交', reset: '重置' } },
    properties,
  }
})

const initialValues = {
  _selectedFields: ['name', 'email'],
  name: '',
  email: '',
  phone: '',
  company: '',
  position: '',
  remark: '',
}
</script>
