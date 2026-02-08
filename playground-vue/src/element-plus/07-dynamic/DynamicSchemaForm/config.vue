<template>
  <div>
    <h2>动态 Schema</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      mergeSchema 合并 / 场景切换 / 热更新 — ConfigForm + ISchema 实现
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <ConfigForm
        :key="`${scenario}-${mode}`"
        :schema="withMode(mergedSchema, mode)"
        @submit="showResult"
        @submit-failed="(e: any) => st?.showErrors(e)"
        @values-change="handleValuesChange"
      />
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
/**
 * 动态 Schema — Config 模式（Element Plus）
 *
 * 使用 ConfigForm + mergeSchema 实现动态 Schema 切换：
 * - 基础 Schema + 场景覆盖 Schema 合并
 * - 通过 schema 中的 RadioGroup 切换场景
 * - mergeSchema 保留基础字段并追加场景特有字段
 */
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/core'
import { mergeSchema } from '@moluoxixi/schema'
import { setupElementPlus, StatusTabs } from '@moluoxixi/ui-element-plus'
import { ConfigForm } from '@moluoxixi/vue'
import { computed, ref } from 'vue'

setupElementPlus()

const st = ref<InstanceType<typeof StatusTabs>>()

function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

type ScenarioKey = 'individual' | 'enterprise' | 'student'
const scenario = ref<ScenarioKey>('individual')

const BASE: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
  properties: {
    _scenario: {
      type: 'string', title: '场景', default: 'individual', component: 'RadioGroup', order: -1,
      enum: [{ label: '个人用户', value: 'individual' }, { label: '企业用户', value: 'enterprise' }, { label: '学生认证', value: 'student' }],
    },
    name: { type: 'string', title: '姓名', required: true, order: 1 },
    phone: { type: 'string', title: '手机号', required: true, order: 2, rules: [{ format: 'phone', message: '无效手机号' }] },
    email: { type: 'string', title: '邮箱', order: 3, rules: [{ format: 'email', message: '无效邮箱' }] },
    remark: { type: 'string', title: '备注', component: 'Textarea', order: 99 },
  },
}

const SCENARIOS: Record<ScenarioKey, { override: Partial<ISchema> }> = {
  individual: {
    override: {
      properties: {
        idCard: { type: 'string', title: '身份证', required: true, order: 4, rules: [{ pattern: /^\d{17}[\dX]$/i, message: '无效身份证' }] },
        city: { type: 'string', title: '城市', component: 'Select', order: 5, enum: [{ label: '北京', value: 'bj' }, { label: '上海', value: 'sh' }] },
      },
    },
  },
  enterprise: {
    override: {
      properties: {
        name: { type: 'string', title: '联系人', required: true, order: 1 },
        companyName: { type: 'string', title: '公司名称', required: true, order: 4 },
        creditCode: { type: 'string', title: '信用代码', required: true, order: 5, rules: [{ pattern: /^[0-9A-Z]{18}$/, message: '18 位信用代码' }] },
      },
    },
  },
  student: {
    override: {
      properties: {
        school: { type: 'string', title: '学校', required: true, order: 4 },
        studentId: { type: 'string', title: '学号', required: true, order: 5, rules: [{ pattern: /^\d{8,14}$/, message: '8-14 位数字' }] },
        major: { type: 'string', title: '专业', required: true, order: 6 },
      },
    },
  },
}

/** 监听表单值变化，检测场景切换 */
function handleValuesChange(values: Record<string, unknown>): void {
  const s = values._scenario as ScenarioKey | undefined
  if (s && s !== scenario.value && SCENARIOS[s]) {
    scenario.value = s
  }
}

const mergedSchema = computed<ISchema>(() => {
  return mergeSchema(BASE, SCENARIOS[scenario.value].override)
})
</script>
