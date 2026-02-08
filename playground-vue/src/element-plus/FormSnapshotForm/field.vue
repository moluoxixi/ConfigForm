<template>
  <div>
    <h2>表单快照</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      暂存草稿（localStorage） / 恢复草稿 / 多版本管理
    </p>
    <StatusTabs ref="st" v-slot="{ showResult }">
      <div style="display: flex; gap: 16px">
        <!-- 左侧：表单区域 -->
        <div style="flex: 1">
          <FormProvider :form="form">
              <FormField name="title" :field-props="{ label: '标题', required: true, component: 'Input' }" />
              <FormField name="description" :field-props="{ label: '描述', component: 'Textarea', componentProps: { rows: 3 } }" />
              <FormField name="category" :field-props="{ label: '分类', component: 'Input' }" />
              <FormField name="priority" :field-props="{ label: '优先级', component: 'Input' }" />
              <!-- 暂存草稿按钮（仅编辑态） -->
              <button style="border: 1px solid #d9d9d9; background: #fff; padding: 4px 15px; border-radius: 6px; cursor: pointer; margin-bottom: 8px" @click="saveDraft">
                暂存草稿
              </button>
              <LayoutFormActions @submit="showResult" @submit-failed="(e: any) => st?.showErrors(e)" />
          </FormProvider>
        </div>
        <!-- 右侧：草稿列表（附加内容） -->
        <div style="border: 1px solid #f0f0f0; border-radius: 8px; padding: 16px; width: 280px">
          <div style="font-weight: 600; margin-bottom: 8px">草稿列表 ({{ drafts.length }})</div>
          <span v-if="!drafts.length" style="color: #999">暂无草稿</span>
          <div v-for="d in drafts" :key="d.id" style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0; border-bottom: 1px solid #f0f0f0">
            <div>
              <div style="font-size: 13px">
                {{ d.label }}
              </div>
              <div style="font-size: 11px; color: #999">
                {{ new Date(d.ts).toLocaleString() }}
              </div>
            </div>
            <div style="display: flex; gap: 4px; align-items: center">
              <button style="border: 1px solid #d9d9d9; background: #fff; padding: 2px 8px; border-radius: 4px; cursor: pointer; font-size: 12px" @click="restoreDraft(d)">
                恢复
              </button>
              <button style="color: #ff4d4f; border: 1px solid #ff4d4f; background: #fff; padding: 2px 8px; border-radius: 4px; cursor: pointer; font-size: 12px" @click="deleteDraft(d.id)">
                删
              </button>
            </div>
          </div>
        </div>
      </div>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { LayoutFormActions, setupElementPlus, StatusTabs } from '@moluoxixi/ui-element-plus'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
/**
 * 表单快照 — Field 模式
 *
 * 所有字段使用 FormField + fieldProps。草稿列表和暂存/恢复逻辑作为附加内容。
 * 草稿数据存储在 localStorage，支持多版本管理。
 */
import { ref, watch } from 'vue'

setupElementPlus()

const st = ref<InstanceType<typeof StatusTabs>>()

/** localStorage 存储键 */
const STORAGE_KEY = 'vue-configform-drafts'

/** 最大草稿数量 */
const MAX_DRAFTS = 10

/** 草稿数据结构 */
interface Draft {
  id: string
  ts: number
  label: string
  values: Record<string, unknown>
}

/** 从 localStorage 加载草稿 */
function loadDrafts(): Draft[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  }
  catch { return [] }
}

/** 保存草稿到 localStorage */
function saveDraftsToStorage(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts.value))
}

const drafts = ref<Draft[]>(loadDrafts())

const form = useCreateForm({
  initialValues: { title: '', description: '', category: '', priority: '' },
})

/** 同步 StatusTabs 的 mode 到 form.pattern */
watch(() => st.value?.mode, (v) => {
  if (v)
    form.pattern = v as FieldPattern
}, { immediate: true })

/** 暂存当前表单值为草稿 */
function saveDraft(): void {
  const v = { ...form.values } as Record<string, unknown>
  drafts.value = [
    { id: String(Date.now()), ts: Date.now(), label: (v.title as string) || '未命名', values: v },
    ...drafts.value,
  ].slice(0, MAX_DRAFTS)
  saveDraftsToStorage()
  notify('草稿已暂存')
}

/** 简单消息提示 */
function notify(msg: string): void {
  const el = document.createElement('div')
  el.textContent = msg
  el.style.cssText = 'position:fixed;top:24px;left:50%;transform:translateX(-50%);padding:8px 16px;background:#52c41a;color:#fff;border-radius:6px;z-index:9999;font-size:14px'
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 2000)
}

/** 恢复草稿到表单 */
function restoreDraft(d: Draft): void {
  form.setValues(d.values)
  notify(`已恢复：${d.label}`)
}

/** 删除草稿 */
function deleteDraft(id: string): void {
  drafts.value = drafts.value.filter(d => d.id !== id)
  saveDraftsToStorage()
}

</script>
