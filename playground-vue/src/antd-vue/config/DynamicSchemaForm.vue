<template>
  <div>
    <h2 style="margin-bottom: 8px;">
      Ant Design Vue 纯配置 - 动态 Schema
    </h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 20px; font-size: 14px;">
      模拟后端下发不同 Schema / 运行时切换热更新 / 基础 Schema 继承合并 / 条件字段
    </p>

    <!-- 场景切换 -->
    <div style="margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
      <span style="font-weight: 600; color: rgba(0,0,0,0.85);">业务场景：</span>
      <ARadioGroup :value="currentScenario" button-style="solid" @update:value="switchScenario($event as ScenarioKey)">
        <ARadioButton v-for="s in scenarioButtons" :key="s.key" :value="s.key">
          {{ s.label }}
        </ARadioButton>
      </ARadioGroup>
    </div>

    <AAlert
      :message="`当前场景「${currentScenario}」：基础 Schema（姓名+邮箱+手机）+ 场景扩展字段，通过 mergeSchema 合并`"
      type="info" show-icon style="margin-bottom: 20px;"
    />

    <!-- 使用 key 强制重建表单实例 -->
    <ConfigForm :key="currentScenario" :schema="finalSchema" @submit="handleSubmit">
      <template #default>
        <div style="margin-top: 20px;">
          <AButton type="primary" html-type="submit">
            提交
          </AButton>
        </div>
      </template>
    </ConfigForm>

    <!-- 展示合并后 Schema -->
    <details style="margin-top: 20px;">
      <summary style="cursor: pointer; color: #1677ff; font-size: 14px;">
        查看当前合并后的 Schema
      </summary>
      <ACard style="margin-top: 8px;">
        <pre style="margin: 0; font-size: 12px; overflow-x: auto;">{{ JSON.stringify(finalSchema, null, 2) }}</pre>
      </ACard>
    </details>

    <ACard v-if="submitResult" style="margin-top: 20px;">
      <pre style="margin: 0; white-space: pre-wrap; font-size: 13px;">{{ submitResult }}</pre>
    </ACard>
  </div>
</template>

<script setup lang="ts">
import type { FormSchema } from '@moluoxixi/schema'
import { mergeSchema } from '@moluoxixi/schema'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { ConfigForm } from '@moluoxixi/vue'
import { Alert as AAlert, Button as AButton, Card as ACard, RadioButton as ARadioButton, RadioGroup as ARadioGroup } from 'ant-design-vue'
/**
 * Ant Design Vue 纯配置模式 - 动态 Schema
 *
 * 覆盖场景：
 * - 3 场景切换（员工 / 客户 / 供应商）
 * - mergeSchema 继承（基础 Schema + 场景扩展）
 * - 热更新（运行时切换 Schema，key 强制重建）
 */
import { computed, ref } from 'vue'

setupAntdVue()

/** 基础 Schema（所有场景共享） */
const baseSchema: FormSchema = {
  fields: {
    name: { type: 'string', label: '姓名', component: 'Input', wrapper: 'FormItem', required: true, placeholder: '请输入姓名' },
    email: { type: 'string', label: '邮箱', component: 'Input', wrapper: 'FormItem', rules: [{ format: 'email' }], placeholder: '请输入邮箱' },
    phone: { type: 'string', label: '手机号', component: 'Input', wrapper: 'FormItem', placeholder: '请输入手机号' },
  },
}

/** 模拟不同后端场景下发的 Schema */
const scenarioSchemas: Record<string, Partial<FormSchema>> = {
  employee: {
    fields: {
      department: { type: 'string', label: '部门', component: 'Select', wrapper: 'FormItem', required: true, enum: ['技术部', '产品部', '设计部', '市场部', '人力资源'] },
      level: { type: 'string', label: '职级', component: 'Select', wrapper: 'FormItem', enum: ['P5', 'P6', 'P7', 'P8', 'P9'] },
      hireDate: { type: 'string', label: '入职日期', component: 'DatePicker', wrapper: 'FormItem', placeholder: '请选择入职日期' },
      isRemote: { type: 'boolean', label: '远程办公', component: 'Switch', wrapper: 'FormItem' },
    },
  },
  customer: {
    fields: {
      company: { type: 'string', label: '公司名称', component: 'Input', wrapper: 'FormItem', required: true, placeholder: '请输入公司名称' },
      industry: { type: 'string', label: '行业', component: 'Select', wrapper: 'FormItem', enum: ['互联网', '金融', '制造业', '教育', '医疗', '零售'] },
      budget: { type: 'number', label: '预算（万元）', component: 'InputNumber', wrapper: 'FormItem', rules: [{ min: 0 }] },
      source: {
        type: 'string',
        label: '来源渠道',
        component: 'RadioGroup',
        wrapper: 'FormItem',
        enum: [{ label: '官网', value: 'website' }, { label: '转介绍', value: 'referral' }, { label: '广告', value: 'ad' }],
      },
    },
  },
  supplier: {
    fields: {
      company: { type: 'string', label: '供应商名称', component: 'Input', wrapper: 'FormItem', required: true, placeholder: '请输入供应商全称' },
      category: { type: 'string', label: '供应类别', component: 'Select', wrapper: 'FormItem', enum: ['原材料', '设备', '服务', '软件'] },
      licenseNumber: {
        type: 'string',
        label: '许可证号',
        component: 'Input',
        wrapper: 'FormItem',
        required: true,
        placeholder: '请输入营业执照号',
        reactions: [{ watch: 'category', when: values => values[0] === '软件', fulfill: { state: { visible: false } }, otherwise: { state: { visible: true } } }],
      },
      cooperationDate: { type: 'string', label: '合作开始日期', component: 'DatePicker', wrapper: 'FormItem', placeholder: '请选择日期' },
    },
  },
}

type ScenarioKey = 'employee' | 'customer' | 'supplier'
const currentScenario = ref<ScenarioKey>('employee')
const submitResult = ref('')

/** 动态合并生成最终 Schema */
const finalSchema = computed<FormSchema>(() => {
  const override = scenarioSchemas[currentScenario.value] ?? {}
  return mergeSchema(baseSchema, override)
})

const scenarioButtons: { key: ScenarioKey, label: string }[] = [
  { key: 'employee', label: '员工' },
  { key: 'customer', label: '客户' },
  { key: 'supplier', label: '供应商' },
]

function switchScenario(key: ScenarioKey): void {
  currentScenario.value = key
  submitResult.value = ''
}

function handleSubmit(values: Record<string, unknown>): void {
  submitResult.value = `场景: ${currentScenario.value}\n${JSON.stringify(values, null, 2)}`
}
</script>
