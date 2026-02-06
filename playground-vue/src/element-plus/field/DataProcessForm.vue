<template>
  <div>
    <h2 style="margin-bottom: 8px;">
      Element Plus Field 组件 - 数据处理
    </h2>
    <p style="color: #909399; margin-bottom: 20px; font-size: 14px;">
      千分位解析 / 货币格式化 / 提交路径映射 / 隐藏字段排除 / 空值处理 / 脏检测 / 值变化日志
    </p>

    <!-- 脏检测指示 -->
    <ElAlert
      :title="isDirty ? '表单已修改（未保存）' : '表单未修改'"
      :type="isDirty ? 'warning' : 'success'"
      :closable="false" show-icon style="margin-bottom: 20px;"
    />

    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit">
        <ElCard shadow="never" style="margin-bottom: 20px;">
          <template #header>
            <span style="font-weight: 600;">值解析与转换</span>
          </template>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <FormField v-slot="{ field }" name="amount">
              <ElFormItem :label="field.label">
                <ElInput
                  :model-value="String(field.value)"
                  placeholder="输入如 1,000"
                  @update:model-value="field.setValue($event)"
                />
                <div style="font-size: 12px; color: #909399; margin-top: 4px;">
                  实际存储: {{ field.value }} | 提交值（分）: {{ (Number(field.value) || 0) * 100 }}
                </div>
              </ElFormItem>
            </FormField>

            <FormField v-slot="{ field }" name="formattedPrice">
              <ElFormItem :label="field.label">
                <ElInput
                  :model-value="String(field.value)"
                  placeholder="输入数字"
                  @update:model-value="field.setValue($event)"
                />
                <div style="font-size: 12px; color: #909399; margin-top: 4px;">
                  格式化显示: <ElTag v-if="field.format" size="small">
                    {{ field.format(field.value) || '—' }}
                  </ElTag>
                </div>
              </ElFormItem>
            </FormField>
          </div>
        </ElCard>

        <ElCard shadow="never" style="margin-bottom: 20px;">
          <template #header>
            <span style="font-weight: 600;">路径映射 <ElTag size="small" type="info">firstName → user.firstName</ElTag></span>
          </template>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <FormField v-slot="{ field }" name="firstName">
              <ElFormItem :label="field.label">
                <ElInput
                  :model-value="(field.value as string)"
                  placeholder="请输入名"
                  @update:model-value="field.setValue($event)"
                />
              </ElFormItem>
            </FormField>
            <FormField v-slot="{ field }" name="lastName">
              <ElFormItem :label="field.label">
                <ElInput
                  :model-value="(field.value as string)"
                  placeholder="请输入姓"
                  @update:model-value="field.setValue($event)"
                />
              </ElFormItem>
            </FormField>
          </div>
        </ElCard>

        <ElCard shadow="never" style="margin-bottom: 20px;">
          <template #header>
            <span style="font-weight: 600;">空值与备注</span>
          </template>
          <FormField v-slot="{ field }" name="remark">
            <ElFormItem :label="field.label" :extra="field.description">
              <ElInput
                type="textarea" :rows="2"
                :model-value="(field.value as string)"
                placeholder="空字符串提交时排除"
                @update:model-value="field.setValue($event)"
              />
            </ElFormItem>
          </FormField>
        </ElCard>

        <div style="display: flex; gap: 12px; margin-bottom: 20px;">
          <ElButton type="primary" native-type="submit">
            提交
          </ElButton>
          <ElButton @click="form.reset()">
            重置
          </ElButton>
        </div>
      </form>
    </FormProvider>

    <!-- 值变化日志 -->
    <ElCard v-if="changeLog.length > 0" shadow="never" style="margin-bottom: 20px;">
      <template #header>
        <strong>值变化日志（最近 8 条）</strong>
      </template>
      <div style="font-family: monospace; font-size: 12px; max-height: 200px; overflow-y: auto;">
        <div v-for="(log, i) in changeLog" :key="i" style="padding: 2px 0; color: #606266; border-bottom: 1px solid #f0f0f0;">
          {{ log }}
        </div>
      </div>
    </ElCard>

    <ElCard v-if="submitResult" shadow="never">
      <template #header>
        <strong>提交数据（注意路径映射和值转换）</strong>
      </template>
      <pre style="margin: 0; white-space: pre-wrap; font-size: 13px;">{{ submitResult }}</pre>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import {
  ElAlert,
  ElButton,
  ElCard,
  ElFormItem,
  ElInput,
  ElTag,
} from 'element-plus'
/**
 * Element Plus Field 组件模式 - 数据处理
 *
 * 覆盖场景：
 * - 值格式化（format）：存数字 → 显示货币
 * - 值解析（parse）：用户输入 "1,000" → 存储 1000
 * - 提交前数据转换（transform）：金额元→分
 * - 路径映射（submitPath）：UI 路径 → 提交路径不同
 * - 隐藏字段排除（excludeWhenHidden）
 * - 空值策略（trim 空字符串）
 * - 值变化监听
 * - 表单脏检测
 */
import { computed, ref } from 'vue'
import 'element-plus/dist/index.css'

setupElementPlus()

const form = useCreateForm({
  initialValues: {
    amount: 0,
    formattedPrice: '',
    firstName: '',
    lastName: '',
    secretField: '隐藏内部值',
    remark: '',
  },
})

/* 解析：输入千分位 → 存储数字 */
form.createField({
  name: 'amount',
  label: '金额（千分位输入）',
  parse: (input: unknown) => {
    const str = String(input).replace(/,/g, '')
    return Number(str) || 0
  },
  /* 提交转换：元→分 */
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
form.createField({
  name: 'secretField',
  label: '内部字段（隐藏）',
  visible: false,
  excludeWhenHidden: true,
})

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
