<template>
  <div>
    <h2>表单快照</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      暂存草稿（localStorage） / 恢复草稿 / 多版本管理
    </p>
    <div style="display:inline-flex;margin-bottom:16px">
      <button v-for="(opt, idx) in MODE_OPTIONS" :key="opt.value" type="button" :style="{ padding: '5px 15px', fontSize: '14px', border: '1px solid #dcdfe6', background: mode === opt.value ? '#409eff' : '#fff', color: mode === opt.value ? '#fff' : '#606266', cursor: 'pointer', marginLeft: idx > 0 ? '-1px' : '0', borderRadius: idx === 0 ? '4px 0 0 4px' : idx === MODE_OPTIONS.length - 1 ? '0 4px 4px 0' : '0' }" @click="mode = opt.value as FieldPattern">
        {{ opt.label }}
      </button>
    </div>
    <!-- 操作提示 -->
    <div v-if="notification" style="padding:8px 16px;margin-bottom:12px;background:#f0f9eb;border:1px solid #e1f3d8;border-radius:4px;font-size:13px;color:#67c23a">
      {{ notification }}
    </div>
    <div style="display: flex; gap: 16px">
      <div style="flex: 1">
        <FormProvider :form="form">
          <form novalidate @submit.prevent="handleSubmit">
            <FormField v-for="n in FIELDS" :key="n" v-slot="{ field }" :name="n">
              <div style="margin-bottom:18px">
                <label style="display:block;font-size:14px;color:#606266;margin-bottom:4px">{{ field.label }}</label>
                <textarea v-if="n === 'description'" :value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" rows="3" style="width:100%;padding:5px 11px;border:1px solid #dcdfe6;border-radius:4px;font-size:14px;outline:none;box-sizing:border-box;resize:vertical" @input="field.setValue(($event.target as HTMLTextAreaElement).value)" />
                <input v-else :value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" style="width:100%;padding:0 11px;height:32px;border:1px solid #dcdfe6;border-radius:4px;font-size:14px;outline:none;box-sizing:border-box" @input="field.setValue(($event.target as HTMLInputElement).value)">
              </div>
            </FormField>
            <div style="display:flex;gap:8px;align-items:center">
              <button type="submit" style="padding:8px 15px;background:#409eff;color:#fff;border:1px solid #409eff;border-radius:4px;cursor:pointer;font-size:14px">提交</button>
              <button type="button" style="padding:8px 15px;background:#fff;color:#606266;border:1px solid #dcdfe6;border-radius:4px;cursor:pointer;font-size:14px" @click="saveDraft">暂存草稿</button>
            </div>
          </form>
        </FormProvider>
      </div>
      <div style="border:1px solid #ebeef5;border-radius:4px;padding:16px;width:280px">
        <div style="font-weight:600;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid #ebeef5">草稿列表 ({{ drafts.length }})</div>
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
          <div style="display:flex;gap:4px;align-items:center">
            <button type="button" style="padding:4px 10px;background:#fff;color:#606266;border:1px solid #dcdfe6;border-radius:4px;cursor:pointer;font-size:12px" @click="restoreDraft(d)">恢复</button>
            <button type="button" style="padding:4px 10px;background:#fff;color:#f56c6c;border:1px solid #fbc4c4;border-radius:4px;cursor:pointer;font-size:12px" @click="deleteDraft(d.id)">删</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="result" :style="{ padding: '8px 16px', borderRadius: '4px', fontSize: '13px', marginTop: '16px', background: result.startsWith('验证失败') ? '#fef0f0' : '#f0f9eb', border: result.startsWith('验证失败') ? '1px solid #fde2e2' : '1px solid #e1f3d8', color: result.startsWith('验证失败') ? '#f56c6c' : '#67c23a' }">
      <strong>提交结果</strong>
      <div>{{ result }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { onMounted, ref } from 'vue'

setupElementPlus()

/** 模式选项 */
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]

const mode = ref<FieldPattern>('editable')
const result = ref('')

/** 字段列表 */
const FIELDS = ['title', 'description', 'category', 'priority']

/** localStorage 存储键 */
const KEY = 'vue-configform-drafts'

/** 草稿数据结构 */
interface Draft {
  id: string
  ts: number
  label: string
  values: Record<string, unknown>
}

const drafts = ref<Draft[]>(loadDrafts())

/** 操作通知 */
const notification = ref('')

/** 显示通知并在 2 秒后自动清除 */
function showNotification(msg: string): void {
  notification.value = msg
  setTimeout(() => {
    notification.value = ''
  }, 2000)
}

/** 从 localStorage 加载草稿 */
function loadDrafts(): Draft[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  }
  catch { return [] }
}

/** 保存草稿到 localStorage */
function saveDraftsToStorage(): void {
  localStorage.setItem(KEY, JSON.stringify(drafts.value))
}

const form = useCreateForm({ initialValues: { title: '', description: '', category: '', priority: '' } })
onMounted(() => {
  FIELDS.forEach(n => form.createField({ name: n, label: n === 'title' ? '标题' : n === 'description' ? '描述' : n === 'category' ? '分类' : '优先级', required: n === 'title' }))
})

/** 暂存草稿 */
function saveDraft(): void {
  const v = { ...form.values } as Record<string, unknown>
  drafts.value = [{ id: String(Date.now()), ts: Date.now(), label: (v.title as string) || '未命名', values: v }, ...drafts.value].slice(0, 10)
  saveDraftsToStorage()
  showNotification('草稿已暂存')
}

/** 恢复草稿 */
function restoreDraft(d: Draft): void {
  form.setValues(d.values)
  showNotification(`已恢复：${d.label}`)
}

/** 删除草稿 */
function deleteDraft(id: string): void {
  drafts.value = drafts.value.filter(d => d.id !== id)
  saveDraftsToStorage()
}

/** 提交处理 */
async function handleSubmit(): Promise<void> {
  const res = await form.submit()
  result.value = res.errors.length > 0 ? `验证失败: ${res.errors.map(e => e.message).join(', ')}` : JSON.stringify(res.values, null, 2)
}
</script>
