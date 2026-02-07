<template>
  <div>
    <h2>生命周期钩子</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      onMount / onChange / onSubmit / onReset / 自动保存
    </p>
    <div style="display: flex; gap: 16px">
      <!-- 左侧：表单区域 -->
      <div style="flex: 1">
        <StatusTabs ref="st" v-slot="{ mode, showResult }">
          <FormProvider :form="form">
            <form @submit.prevent="handleSubmit(showResult)" novalidate>
              <!-- 自动保存开关（附加内容） -->
              <ASpace style="margin-bottom: 12px">
                <span>自动保存：</span>
                <ASwitch v-model:checked="autoSave" />
              </ASpace>
              <FormField name="title" :field-props="{ label: '标题', required: true, component: 'Input' }" />
              <FormField name="price" :field-props="{ label: '价格', component: 'InputNumber', componentProps: { style: 'width: 100%' } }" />
              <FormField name="description" :field-props="{ label: '描述', component: 'Textarea', componentProps: { rows: 3 } }" />
              <LayoutFormActions v-if="mode === 'editable'" @reset="form.reset()" />
            </form>
          </FormProvider>
        </StatusTabs>
      </div>
      <!-- 右侧：事件日志（附加内容） -->
      <ACard :title="`事件日志 (${logs.length})`" size="small" style="width: 360px">
        <template #extra>
          <AButton size="small" @click="logs = []">
            清空
          </AButton>
        </template>
        <div style="max-height: 400px; overflow: auto; font-size: 12px">
          <div v-for="log in logs" :key="log.id" style="padding: 2px 0; border-bottom: 1px solid #f0f0f0">
            <ATag :color="TYPE_COLORS[log.type]" style="font-size: 10px">
              {{ log.type }}
            </ATag>
            <span style="color: #999">{{ log.time }}</span>
            <div style="color: #555; margin-top: 2px">
              {{ log.message }}
            </div>
          </div>
        </div>
      </ACard>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { LayoutFormActions, setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
/**
 * 生命周期钩子表单 — Field 模式
 *
 * 所有字段使用 FormField + fieldProps。事件日志和自动保存作为附加内容。
 * 通过 form.onValuesChange 监听值变化，支持自动保存到 localStorage。
 */
import { Button as AButton, Card as ACard, Space as ASpace, Switch as ASwitch, Tag as ATag } from 'ant-design-vue'
import { onMounted, onUnmounted, ref, watch } from 'vue'

setupAntdVue()

const st = ref<InstanceType<typeof StatusTabs>>()

/** 自动保存开关 */
const autoSave = ref(true)

/** 自动保存延迟（毫秒） */
const AUTO_SAVE_DELAY = 1500

/** 最大日志条数 */
const MAX_LOGS = 50

/** 日志类型颜色映射 */
const TYPE_COLORS: Record<string, string> = {
  'mount': 'purple',
  'change': 'blue',
  'submit': 'green',
  'reset': 'orange',
  'auto-save': 'cyan',
}

/** 事件日志 */
interface Log {
  id: number
  time: string
  type: string
  message: string
}

const logs = ref<Log[]>([])
let logId = 0
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null

/** 添加一条日志 */
function addLog(type: string, msg: string): void {
  logId++
  logs.value = [
    { id: logId, time: new Date().toLocaleTimeString(), type, message: msg },
    ...logs.value,
  ].slice(0, MAX_LOGS)
}

const form = useCreateForm({
  initialValues: { title: '生命周期测试', price: 99, description: '' },
})

/** 监听表单值变化：记录日志 + 自动保存 */
form.onValuesChange((v: Record<string, unknown>) => {
  addLog('change', `值变化：${JSON.stringify(v).slice(0, 80)}...`)
  if (autoSaveTimer) clearTimeout(autoSaveTimer)
  if (autoSave.value) {
    autoSaveTimer = setTimeout(() => {
      addLog('auto-save', '自动保存到 localStorage')
      try {
        localStorage.setItem('vue-lifecycle-auto', JSON.stringify(v))
      }
      catch { /* 存储失败忽略 */ }
    }, AUTO_SAVE_DELAY)
  }
})

onMounted(() => {
  addLog('mount', '表单已挂载')
})

onUnmounted(() => {
  if (autoSaveTimer) clearTimeout(autoSaveTimer)
})

/** 同步 StatusTabs 的 mode 到 form.pattern */
watch(() => st.value?.mode, (v) => {
  if (v)
    form.pattern = v as FieldPattern
}, { immediate: true })

/** 提交处理 */
async function handleSubmit(showResult: (data: Record<string, unknown>) => void): Promise<void> {
  const res = await form.submit()
  if (res.errors.length > 0) {
    st.value?.showErrors(res.errors)
  }
  else {
    showResult(res.values)
  }
}
</script>
