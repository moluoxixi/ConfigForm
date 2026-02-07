<template>
  <div>
    <h2>表单快照</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">暂存草稿（localStorage） / 恢复草稿 / 多版本管理</p>
    <ASegmented v-model:value="mode" :options="MODE_OPTIONS" style="margin-bottom: 16px" />
    <div style="display: flex; gap: 16px">
      <div style="flex: 1"><FormProvider :form="form"><form @submit.prevent="handleSubmit" novalidate>
        <FormField v-for="n in FIELDS" :key="n" v-slot="{ field }" :name="n"><AFormItem :label="field.label"><template v-if="mode === 'readOnly'"><span v-if="n === 'description'" style="white-space:pre-wrap">{{ (field.value as string) || '—' }}</span><span v-else>{{ (field.value as string) || '—' }}</span></template><ATextarea v-else-if="n === 'description'" :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" :disabled="mode === 'disabled'" :rows="3" /><AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" :disabled="mode === 'disabled'" /></AFormItem></FormField>
        <ASpace v-if="mode === 'editable'"><AButton type="primary" html-type="submit">提交</AButton><AButton @click="saveDraft">暂存草稿</AButton></ASpace>
      </form></FormProvider></div>
      <ACard :title="`草稿列表 (${drafts.length})`" size="small" style="width: 280px">
        <span v-if="!drafts.length" style="color: #999">暂无草稿</span>
        <div v-for="d in drafts" :key="d.id" style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0; border-bottom: 1px solid #f0f0f0">
          <div><div style="font-size: 13px">{{ d.label }}</div><div style="font-size: 11px; color: #999">{{ new Date(d.ts).toLocaleString() }}</div></div>
          <ASpace :size="4"><AButton size="small" @click="restoreDraft(d)">恢复</AButton><AButton size="small" danger @click="deleteDraft(d.id)">删</AButton></ASpace>
        </div>
      </ACard>
    </div>
    <AAlert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" message="提交结果" style="margin-top: 16px"><template #description><pre style="margin: 0; white-space: pre-wrap">{{ result }}</pre></template></AAlert>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { Button as AButton, Space as ASpace, Alert as AAlert, Segmented as ASegmented, Input as AInput, FormItem as AFormItem, Card as ACard, Textarea as ATextarea, message } from 'ant-design-vue'
import type { FieldPattern } from '@moluoxixi/shared'
setupAntdVue()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const FIELDS = ['title', 'description', 'category', 'priority']
const KEY = 'vue-configform-drafts'
interface Draft { id: string; ts: number; label: string; values: Record<string, unknown> }
const drafts = ref<Draft[]>(loadDrafts())
function loadDrafts(): Draft[] { try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] } }
function saveDraftsToStorage(): void { localStorage.setItem(KEY, JSON.stringify(drafts.value)) }
const form = useCreateForm({ initialValues: { title: '', description: '', category: '', priority: '' } })
watch(mode, (v) => { form.pattern = v })
onMounted(() => { FIELDS.forEach(n => form.createField({ name: n, label: n === 'title' ? '标题' : n === 'description' ? '描述' : n === 'category' ? '分类' : '优先级', required: n === 'title' })) })
function saveDraft(): void { const v = { ...form.values } as Record<string, unknown>; drafts.value = [{ id: String(Date.now()), ts: Date.now(), label: (v.title as string) || '未命名', values: v }, ...drafts.value].slice(0, 10); saveDraftsToStorage(); message.success('草稿已暂存') }
function restoreDraft(d: Draft): void { form.setValues(d.values); message.success(`已恢复：${d.label}`) }
function deleteDraft(id: string): void { drafts.value = drafts.value.filter(d => d.id !== id); saveDraftsToStorage() }
async function handleSubmit(): Promise<void> { const res = await form.submit(); result.value = res.errors.length > 0 ? '验证失败: ' + res.errors.map(e => e.message).join(', ') : JSON.stringify(res.values, null, 2) }
</script>
