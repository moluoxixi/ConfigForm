<template>
  <div>
    <h2>表单快照</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      暂存草稿（localStorage） / 恢复草稿 / 多版本管理
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <div style="display: flex; gap: 16px">
        <div style="flex: 1">
          <FormProvider :form="form">
            <FormField v-for="n in FIELDS" :key="n" v-slot="{ field }" :name="n">
              <AFormItem :label="field.label">
                <template v-if="mode === 'readOnly'">
                  <span v-if="n === 'description'" style="white-space:pre-wrap">{{ (field.value as string) || '—' }}</span><span v-else>{{ (field.value as string) || '—' }}</span>
                </template><ATextarea v-else-if="n === 'description'" :value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" :rows="3" @update:value="field.setValue($event)" /><AInput v-else :value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" @update:value="field.setValue($event)" />
              </AFormItem>
            </FormField>
            <AButton v-if="mode === 'editable'" style="margin-bottom: 8px" @click="saveDraft">
              暂存草稿
            </AButton>
            <div v-if="mode === 'editable'" style="margin-top: 16px; display: flex; gap: 8px">
              <button type="button" style="padding: 4px 15px; background: #1677ff; color: #fff; border: none; border-radius: 6px; cursor: pointer" @click="handleSubmit(showResult)">
                提交
              </button>
              <button type="button" style="padding: 4px 15px; background: #fff; border: 1px solid #d9d9d9; border-radius: 6px; cursor: pointer" @click="form.reset()">
                重置
              </button>
            </div>
          </FormProvider>
        </div>
        <ACard :title="`草稿列表 (${drafts.length})`" size="small" style="width: 280px">
          <span v-if="!drafts.length" style="color: #999">暂无草稿</span>
          <div v-for="d in drafts" :key="d.id" style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0; border-bottom: 1px solid #f0f0f0">
            <div>
              <div style="font-size: 13px">
                {{ d.label }}
              </div><div style="font-size: 11px; color: #999">
                {{ new Date(d.ts).toLocaleString() }}
              </div>
            </div>
            <ASpace :size="4">
              <AButton size="small" @click="restoreDraft(d)">
                恢复
              </AButton><AButton size="small" danger @click="deleteDraft(d.id)">
                删
              </AButton>
            </ASpace>
          </div>
        </ACard>
      </div>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { Button as AButton, Card as ACard, FormItem as AFormItem, Input as AInput, Space as ASpace, Textarea as ATextarea, message } from 'ant-design-vue'
import { onMounted, ref, watch } from 'vue'

setupAntdVue()

const st = ref<InstanceType<typeof StatusTabs>>()

const FIELDS = ['title', 'description', 'category', 'priority']
const KEY = 'vue-configform-drafts'
interface Draft { id: string, ts: number, label: string, values: Record<string, unknown> }
const drafts = ref<Draft[]>(loadDrafts())
function loadDrafts(): Draft[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  }
  catch { return [] }
}
function saveDraftsToStorage(): void {
  localStorage.setItem(KEY, JSON.stringify(drafts.value))
}
const form = useCreateForm({ initialValues: { title: '', description: '', category: '', priority: '' } })

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

onMounted(() => {
  FIELDS.forEach(n => form.createField({ name: n, label: n === 'title' ? '标题' : n === 'description' ? '描述' : n === 'category' ? '分类' : '优先级', required: n === 'title' }))
})
function saveDraft(): void {
  const v = { ...form.values } as Record<string, unknown>
  drafts.value = [{ id: String(Date.now()), ts: Date.now(), label: (v.title as string) || '未命名', values: v }, ...drafts.value].slice(0, 10)
  saveDraftsToStorage()
  message.success('草稿已暂存')
}
function restoreDraft(d: Draft): void {
  form.setValues(d.values)
  message.success(`已恢复：${d.label}`)
}
function deleteDraft(id: string): void {
  drafts.value = drafts.value.filter(d => d.id !== id)
  saveDraftsToStorage()
}
</script>
