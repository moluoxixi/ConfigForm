<template>
  <div>
    <h2>动态 Schema</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      mergeSchema 合并 / 场景切换 / 热更新
    </p>
    <ASegmented v-model:value="scenario" :options="scenarioOptions" style="margin-bottom: 12px" />
    <ATag color="green" style="margin-bottom: 12px">
      当前：{{ SCENARIOS[scenario].label }} | 字段数：{{ Object.keys(schema.properties || {}).length }}
    </ATag>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <ConfigForm
        :schema="withMode(schema, mode)"
        @submit="showResult"
        @submit-failed="(e: any) => st?.showErrors(e)"
      />
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'
import { mergeSchema } from '@moluoxixi/schema'
import { setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { ConfigForm } from '@moluoxixi/vue'
import { Segmented as ASegmented, Tag as ATag } from 'ant-design-vue'
import { computed, ref } from 'vue'

setupAntdVue()

const st = ref<InstanceType<typeof StatusTabs>>()

/** 工具：将 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

type ScenarioKey = 'individual' | 'enterprise' | 'student'
const scenario = ref<ScenarioKey>('individual')
const scenarioOptions = [{ label: '个人用户', value: 'individual' }, { label: '企业用户', value: 'enterprise' }, { label: '学生认证', value: 'student' }]

const BASE: ISchema = { type: 'object', decoratorProps: { labelPosition: 'right', labelWidth: '120px' }, properties: { name: { type: 'string', title: '姓名', required: true, order: 1 }, phone: { type: 'string', title: '手机号', required: true, rules: [{ format: 'phone', message: '无效手机号' }], order: 2 }, email: { type: 'string', title: '邮箱', rules: [{ format: 'email', message: '无效邮箱' }], order: 3 }, remark: { type: 'string', title: '备注', component: 'Textarea', order: 99 } } }

const SCENARIOS: Record<ScenarioKey, { label: string, override: Partial<ISchema> }> = {
  individual: { label: '个人用户', override: { properties: { idCard: { type: 'string', title: '身份证', required: true, rules: [{ pattern: /^\d{17}[\dX]$/i, message: '无效身份证' }], order: 4 }, city: { type: 'string', title: '城市', enum: [{ label: '北京', value: 'bj' }, { label: '上海', value: 'sh' }], order: 5 } } } },
  enterprise: { label: '企业用户', override: { properties: { name: { type: 'string', title: '联系人', required: true, order: 1 }, companyName: { type: 'string', title: '公司名称', required: true, order: 4 }, creditCode: { type: 'string', title: '信用代码', required: true, rules: [{ pattern: /^[0-9A-Z]{18}$/, message: '18 位信用代码' }], order: 5 } } } },
  student: { label: '学生认证', override: { properties: { school: { type: 'string', title: '学校', required: true, order: 4 }, studentId: { type: 'string', title: '学号', required: true, rules: [{ pattern: /^\d{8,14}$/, message: '8-14 位数字' }], order: 5 }, major: { type: 'string', title: '专业', required: true, order: 6 } } } },
}

const schema = computed<ISchema>(() => mergeSchema(BASE, SCENARIOS[scenario.value].override))
</script>
