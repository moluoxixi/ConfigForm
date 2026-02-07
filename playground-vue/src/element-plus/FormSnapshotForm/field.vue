<template>
  <div>
    <h2>表单快照</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      暂存草稿（localStorage） / 恢复草稿 / 多版本管理
    </p>
    <ElRadioGroup v-model="mode" size="small" style="margin-bottom: 16px">
      <ElRadioButton v-for="opt in MODE_OPTIONS" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </ElRadioButton>
    </ElRadioGroup>
    <div style="display: flex; gap: 16px">
      <div style="flex: 1">
        <FormProvider :form="form">
          <form novalidate @submit.prevent="handleSubmit">
            <FormField v-for="n in FIELDS" :key="n" v-slot="{ field }" :name="n">
              <ElFormItem :label="field.label">
                <ElInput v-if="n === 'description'" type="textarea" :model-value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" :rows="3" @update:model-value="field.setValue($event)" /><ElInput v-else :model-value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" @update:model-value="field.setValue($event)" />
              </ElFormItem>
            </FormField>
            <ElSpace v-if="mode === 'editable'">
              <ElButton type="primary" native-type="submit">
                提交
              </ElButton><ElButton @click="saveDraft">
                暂存草稿
              </ElButton>
            </ElSpace>
          </form>
        </FormProvider>
      </div>
      <ElCard :title="`草稿列表 (${drafts.length})`" shadow="never" style="width: 280px">
        <span v-if="!drafts.length" style="color: #999">暂无草稿</span>
        <div v-for="d in drafts" :key="d.id" style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0; border-bottom: 1px solid #f0f0f0">
          <div>
            <div style="font-size: 13px">
              {{ d.label }}
            </div><div style="font-size: 11px; color: #999">
              {{ new Date(d.ts).toLocaleString() }}
            </div>
          </div>
          <ElSpace :size="4">
            <ElButton size="small" @click="restoreDraft(d)">
              恢复
            </ElButton><ElButton size="small" type="danger" @click="deleteDraft(d.id)">
              删
            </ElButton>
          </ElSpace>
        </div>
      </ElCard>
    </div>
    <ElAlert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" title="提交结果" style="margin-top: 16px" :description="result" show-icon />
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { ElAlert, ElButton, ElCard, ElFormItem, ElInput, ElMessage, ElRadioButton, ElRadioGroup, ElSpace } from 'element-plus'
import { onMounted, ref } from 'vue'

setupElementPlus()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
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
onMounted(() => {
  FIELDS.forEach(n => form.createField({ name: n, label: n === 'title' ? '标题' : n === 'description' ? '描述' : n === 'category' ? '分类' : '优先级', required: n === 'title' }))
})
function saveDraft(): void {
  const v = { ...form.values } as Record<string, unknown>
  drafts.value = [{ id: String(Date.now()), ts: Date.now(), label: (v.title as string) || '未命名', values: v }, ...drafts.value].slice(0, 10)
  saveDraftsToStorage()
  ElMessage.success('草稿已暂存')
}
function restoreDraft(d: Draft): void {
  form.setValues(d.values)
  ElMessage.success(`已恢复：${d.label}`)
}
function deleteDraft(id: string): void {
  drafts.value = drafts.value.filter(d => d.id !== id)
  saveDraftsToStorage()
}
async function handleSubmit(): Promise<void> {
  const res = await form.submit()
  result.value = res.errors.length > 0 ? `验证失败: ${res.errors.map(e => e.message).join(', ')}` : JSON.stringify(res.values, null, 2)
}
</script>
