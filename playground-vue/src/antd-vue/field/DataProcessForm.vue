<template>
  <div>
    <h2 style="margin-bottom: 8px;">
      Ant Design Vue Field 组件 - 数据处理
    </h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 20px; font-size: 14px;">
      千分位解析 / 货币格式化 / 提交路径映射 / 隐藏字段排除 / 空值处理 / 脏检测 / 值变化日志
    </p>

    <!-- 脏检测指示 -->
    <AAlert
      :message="isDirty ? '表单已修改（未保存）' : '表单未修改'"
      :type="isDirty ? 'warning' : 'success'"
      show-icon style="margin-bottom: 20px;"
    />

    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit">
        <ACard style="margin-bottom: 20px;">
          <template #title>
            值解析与转换
          </template>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <FormField v-slot="{ field }" name="amount">
              <AFormItem :label="field.label">
                <AInput :value="String(field.value)" placeholder="输入如 1,000" @update:value="field.setValue($event)" />
                <div style="font-size: 12px; color: rgba(0,0,0,0.45); margin-top: 4px;">
                  实际存储: {{ field.value }} | 提交值（分）: {{ (Number(field.value) || 0) * 100 }}
                </div>
              </AFormItem>
            </FormField>

            <FormField v-slot="{ field }" name="formattedPrice">
              <AFormItem :label="field.label">
                <AInput :value="String(field.value)" placeholder="输入数字" @update:value="field.setValue($event)" />
                <div style="font-size: 12px; color: rgba(0,0,0,0.45); margin-top: 4px;">
                  格式化显示: <ATag v-if="field.format" color="blue">
                    {{ field.format(field.value) || '—' }}
                  </ATag>
                </div>
              </AFormItem>
            </FormField>
          </div>
        </ACard>

        <ACard style="margin-bottom: 20px;">
          <template #title>
            路径映射 <ATag color="blue">
              firstName → user.firstName
            </ATag>
          </template>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <FormField v-slot="{ field }" name="firstName">
              <AFormItem :label="field.label">
                <AInput :value="(field.value as string)" placeholder="请输入名" @update:value="field.setValue($event)" />
              </AFormItem>
            </FormField>
            <FormField v-slot="{ field }" name="lastName">
              <AFormItem :label="field.label">
                <AInput :value="(field.value as string)" placeholder="请输入姓" @update:value="field.setValue($event)" />
              </AFormItem>
            </FormField>
          </div>
        </ACard>

        <ACard style="margin-bottom: 20px;">
          <template #title>
            空值与备注
          </template>
          <FormField v-slot="{ field }" name="remark">
            <AFormItem :label="field.label">
              <ATextarea :value="(field.value as string)" :rows="2" placeholder="空字符串提交时排除" @update:value="field.setValue($event)" />
            </AFormItem>
          </FormField>
        </ACard>

        <div style="display: flex; gap: 12px; margin-bottom: 20px;">
          <AButton type="primary" html-type="submit">
            提交
          </AButton>
          <AButton @click="form.reset()">
            重置
          </AButton>
        </div>
      </form>
    </FormProvider>

    <!-- 值变化日志 -->
    <ACard v-if="changeLog.length > 0" style="margin-bottom: 20px;">
      <template #title>
        <strong>值变化日志（最近 8 条）</strong>
      </template>
      <div style="font-family: monospace; font-size: 12px; max-height: 200px; overflow-y: auto;">
        <div v-for="(log, i) in changeLog" :key="i" style="padding: 2px 0; color: rgba(0,0,0,0.65); border-bottom: 1px solid #f5f5f5;">
          {{ log }}
        </div>
      </div>
    </ACard>

    <ACard v-if="submitResult">
      <template #title>
        <strong>提交数据（注意路径映射和值转换）</strong>
      </template>
      <pre style="margin: 0; white-space: pre-wrap; font-size: 13px;">{{ submitResult }}</pre>
    </ACard>
  </div>
</template>

<script setup lang="ts">
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { Alert as AAlert, Button as AButton, Card as ACard, FormItem as AFormItem, Input as AInput, Tag as ATag, Textarea as ATextarea } from 'ant-design-vue'
/**
 * Ant Design Vue Field 组件模式 - 数据处理
 *
 * 覆盖场景：
 * - 值格式化（format）：存数字 → 显示货币
 * - 值解析（parse）：用户输入 "1,000" → 存储 1000
 * - 提交前数据转换（transform）：金额元→分
 * - 路径映射（submitPath）：UI 路径 → 提交路径不同
 * - 表单脏检测
 * - 值变化日志
 */
import { computed, ref } from 'vue'

setupAntdVue()

const form = useCreateForm({
  initialValues: { amount: 0, formattedPrice: '', firstName: '', lastName: '', secretField: '隐藏内部值', remark: '' },
})

/* 解析：输入千分位 → 存储数字；提交转换：元→分 */
form.createField({
  name: 'amount',
  label: '金额（千分位输入）',
  parse: (input: unknown) => {
    const str = String(input).replace(/,/g, '')
    return Number(str) || 0
  },
  transform: (value: unknown) => Math.round(Number(value) * 100),
})

/* 格式化显示 */
form.createField({
  name: 'formattedPrice',
  label: '格式化价格',
  description: '输入数字，自动格式化为货币显示',
  format: (value: unknown) => {
    const num = Number(value)
    if (Number.isNaN(num) || num === 0)
      return ''
    return num.toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' })
  },
  parse: (input: unknown) => {
    const str = String(input).replace(/[¥,\s]/g, '')
    return Number(str) || 0
  },
})

/* 路径映射：提交时 firstName → user.firstName */
form.createField({ name: 'firstName', label: '名', submitPath: 'user.firstName' })
form.createField({ name: 'lastName', label: '姓', submitPath: 'user.lastName' })

/* 隐藏字段排除 */
form.createField({ name: 'secretField', label: '内部字段（隐藏）', visible: false, excludeWhenHidden: true })

/* 空值策略 */
form.createField({
  name: 'remark',
  label: '备注',
  description: '空字符串提交时排除',
  transform: (value: unknown) => {
    const str = String(value).trim()
    return str || undefined
  },
})

/* 值变化日志 */
const changeLog = ref<string[]>([])
form.onValuesChange((values) => {
  changeLog.value.push(`[${new Date().toLocaleTimeString()}] ${JSON.stringify(values)}`)
  if (changeLog.value.length > 8)
    changeLog.value.shift()
})

/* 脏检测 */
const isDirty = computed(() => form.modified)
const submitResult = ref('')

async function handleSubmit(): Promise<void> {
  const result = await form.submit()
  submitResult.value = JSON.stringify(result.values, null, 2)
}
</script>
