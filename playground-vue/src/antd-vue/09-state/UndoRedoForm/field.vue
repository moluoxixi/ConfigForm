<template>
  <div>
    <h2>撤销重做</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      undo/redo 操作栈 / Ctrl+Z 撤销 / Ctrl+Shift+Z 重做
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
          <!-- 撤销/重做工具栏（附加内容） -->
          <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 16px">
            <button type="button" :disabled="!canUndo || mode !== 'editable'" :style="{ padding: '4px 15px', border: '1px solid #d9d9d9', borderRadius: '6px', background: '#fff', cursor: (!canUndo || mode !== 'editable') ? 'not-allowed' : 'pointer', fontSize: '14px', opacity: (!canUndo || mode !== 'editable') ? 0.5 : 1 }" @click="undo">
              撤销 (Ctrl+Z)
            </button>
            <button type="button" :disabled="!canRedo || mode !== 'editable'" :style="{ padding: '4px 15px', border: '1px solid #d9d9d9', borderRadius: '6px', background: '#fff', cursor: (!canRedo || mode !== 'editable') ? 'not-allowed' : 'pointer', fontSize: '14px', opacity: (!canRedo || mode !== 'editable') ? 0.5 : 1 }" @click="redo">
              重做 (Ctrl+Shift+Z)
            </button>
            <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; border: 1px solid #d9d9d9; background: #fafafa">历史：{{ historyIdx + 1 }} / {{ historyLen }}</span>
          </div>
          <!-- 表单字段 -->
          <FormField name="title" :field-props="{ label: '标题', required: true, component: 'Input' }" />
          <FormField name="category" :field-props="{ label: '分类', component: 'Input' }" />
          <FormField name="amount" :field-props="{ label: '金额', component: 'InputNumber', componentProps: { style: 'width: 100%' } }" />
          <FormField name="note" :field-props="{ label: '备注', component: 'Textarea', componentProps: { rows: 3 } }" />
          <LayoutFormActions @submit="showResult" @submit-failed="(e: any) => st?.showErrors(e)" />
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/core'
import { LayoutFormActions, setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
/**
 * 撤销重做表单 — Field 模式
 *
 * 所有字段使用 FormField + fieldProps。撤销/重做工具栏作为附加内容。
 * 通过 form.onValuesChange 监听值变化，维护操作栈支持 undo/redo。
 * 支持 Ctrl+Z 撤销、Ctrl+Shift+Z 重做快捷键。
 */
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

setupAntdVue()

const st = ref<InstanceType<typeof StatusTabs>>()

/** 历史栈最大容量 */
const MAX_HISTORY = 50

/** 初始表单值 */
const INITIAL_VALUES = { title: '', category: '', amount: 0, note: '' }

const form = useCreateForm({ initialValues: { ...INITIAL_VALUES } })

/** 操作历史栈 */
const history = ref<Array<Record<string, unknown>>>([{ ...INITIAL_VALUES }])

/** 当前历史索引 */
const historyIdx = ref(0)

/** 是否正在恢复历史（防止触发 onValuesChange） */
let isRestoring = false

/** 历史栈长度 */
const historyLen = computed(() => history.value.length)

/** 是否可撤销 */
const canUndo = computed(() => historyIdx.value > 0)

/** 是否可重做 */
const canRedo = computed(() => historyIdx.value < history.value.length - 1)

/** 监听表单值变化：记录到历史栈 */
form.onValuesChange((v: Record<string, unknown>) => {
  if (isRestoring) return
  /* 丢弃当前位置之后的历史 */
  history.value = history.value.slice(0, historyIdx.value + 1)
  history.value.push({ ...v })
  /* 超出最大容量时移除最早的记录 */
  if (history.value.length > MAX_HISTORY) {
    history.value.shift()
  }
  historyIdx.value = history.value.length - 1
})

/** 撤销：回退到上一个历史快照 */
function undo(): void {
  if (historyIdx.value <= 0) return
  historyIdx.value--
  isRestoring = true
  form.setValues(history.value[historyIdx.value])
  isRestoring = false
}

/** 重做：前进到下一个历史快照 */
function redo(): void {
  if (historyIdx.value >= history.value.length - 1) return
  historyIdx.value++
  isRestoring = true
  form.setValues(history.value[historyIdx.value])
  isRestoring = false
}

/** 全局键盘快捷键处理 */
function onKeyDown(e: KeyboardEvent): void {
  if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
    e.preventDefault()
    undo()
  }
  if (e.ctrlKey && e.shiftKey && e.key === 'Z') {
    e.preventDefault()
    redo()
  }
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))

/** 同步 StatusTabs 的 mode 到 form.pattern */
watch(() => st.value?.mode, (v) => {
  if (v)
    form.pattern = v as FieldPattern
}, { immediate: true })

</script>
