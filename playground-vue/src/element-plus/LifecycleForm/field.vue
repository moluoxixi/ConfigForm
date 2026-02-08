<template>
  <div>
    <h2>生命周期钩子</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      onMount / onChange / onSubmit / onReset / 自动保存
    </p>
    <div style="display: flex; gap: 8px; margin-bottom: 16px">
      <button v-for="opt in MODE_OPTIONS" :key="opt.value" type="button" :style="{ padding: '4px 12px', borderRadius: '4px', border: '1px solid #dcdfe6', background: mode === opt.value ? '#409eff' : '#fff', color: mode === opt.value ? '#fff' : '#606266', cursor: 'pointer', fontSize: '12px' }" @click="mode = opt.value as FieldPattern">
        {{ opt.label }}
      </button>
    </div>
    <div style="display: flex; gap: 16px">
      <div style="flex: 1">
        <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 12px">
          <span>自动保存：</span>
          <label style="position: relative; display: inline-block; width: 40px; height: 20px; cursor: pointer">
            <input v-model="autoSave" type="checkbox" style="opacity: 0; width: 0; height: 0" />
            <span :style="{ position: 'absolute', inset: 0, borderRadius: '10px', background: autoSave ? '#409eff' : '#dcdfe6', transition: 'background 0.2s' }">
              <span :style="{ position: 'absolute', top: '2px', left: autoSave ? '22px' : '2px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }" />
            </span>
          </label>
        </div>
        <FormProvider :form="form">
          <form novalidate @submit.prevent="handleSubmit">
            <FormField v-for="n in FIELDS" :key="n" v-slot="{ field }" :name="n">
              <div style="margin-bottom: 18px">
                <label style="display: block; margin-bottom: 4px; font-size: 14px; color: #606266">{{ field.label }}</label>
                <input v-if="n === 'price'" type="number" :value="(field.value as number)" :disabled="mode === 'disabled'" style="width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 14px; box-sizing: border-box" @input="field.setValue(Number(($event.target as HTMLInputElement).value) || 0)" />
                <textarea v-else-if="n === 'description'" :value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" rows="3" style="width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 14px; resize: vertical; box-sizing: border-box" @input="field.setValue(($event.target as HTMLTextAreaElement).value)" />
                <input v-else :value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" style="width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 14px; box-sizing: border-box" @input="field.setValue(($event.target as HTMLInputElement).value)" />
              </div>
            </FormField>
            <div style="display: flex; gap: 8px">
              <button type="submit" style="padding: 8px 16px; background: #409eff; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 14px">
                提交
              </button>
              <button type="button" style="padding: 8px 16px; background: #fff; color: #606266; border: 1px solid #dcdfe6; border-radius: 4px; cursor: pointer; font-size: 14px" @click="handleReset">
                重置
              </button>
            </div>
          </form>
        </FormProvider>
      </div>
      <div style="width: 360px; border: 1px solid #e4e7ed; border-radius: 4px; padding: 16px">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px">
          <strong>事件日志</strong>
          <button type="button" style="padding: 2px 8px; background: transparent; color: #409eff; border: none; cursor: pointer; font-size: 12px" @click="logs = []">
            清空
          </button>
        </div>
        <div style="max-height: 400px; overflow: auto; font-size: 12px">
          <div v-for="log in logs" :key="log.id" style="padding: 2px 0; border-bottom: 1px solid #f0f0f0">
            <span :style="getTagStyle(typeColors[log.type] ?? 'info')">{{ log.type }}</span>
            <span style="color: #999">{{ log.time }}</span>
            <div style="color: #555; margin-top: 2px">
              {{ log.message }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="result" :style="{ marginTop: '16px', padding: '12px 16px', borderRadius: '4px', background: result.startsWith('验证失败') ? '#fef0f0' : '#f0f9eb', color: result.startsWith('验证失败') ? '#f56c6c' : '#67c23a', border: result.startsWith('验证失败') ? '1px solid #fde2e2' : '1px solid #e1f3d8' }">
      <strong>提交结果</strong>
      <div style="margin-top: 4px; white-space: pre-wrap">{{ result }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { onMounted, onUnmounted, ref } from 'vue'

setupElementPlus()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const autoSave = ref(true)
const FIELDS = ['title', 'price', 'description']
interface Log { id: number; time: string; type: string; message: string }
const logs = ref<Log[]>([])
let logId = 0
const typeColors: Record<string, string> = { 'mount': 'purple', 'change': 'primary', 'submit': 'success', 'reset': 'warning', 'auto-save': 'info' }
/** 标签样式颜色映射 */
const TAG_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  primary: { bg: '#ecf5ff', color: '#409eff', border: '#d9ecff' },
  success: { bg: '#f0f9eb', color: '#67c23a', border: '#e1f3d8' },
  warning: { bg: '#fdf6ec', color: '#e6a23c', border: '#faecd8' },
  info: { bg: '#f4f4f5', color: '#909399', border: '#e9e9eb' },
  purple: { bg: '#f3e8ff', color: '#8b5cf6', border: '#d9b8ff' },
}
function getTagStyle(type: string): Record<string, string> {
  const s = TAG_STYLES[type] ?? TAG_STYLES.info
  return { display: 'inline-block', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', background: s.bg, color: s.color, border: `1px solid ${s.border}`, marginRight: '4px' }
}
function addLog(type: string, msg: string): void {
  logId++
  logs.value = [{ id: logId, time: new Date().toLocaleTimeString(), type, message: msg }, ...logs.value].slice(0, 50)
}
const form = useCreateForm({ initialValues: { title: '生命周期测试', price: 99, description: '' } })
let timer: ReturnType<typeof setTimeout> | null = null
onMounted(() => {
  form.createField({ name: 'title', label: '标题', required: true })
  form.createField({ name: 'price', label: '价格' })
  form.createField({ name: 'description', label: '描述' })
  addLog('mount', '表单已挂载')
  form.onValuesChange((v: Record<string, unknown>) => {
    addLog('change', `值变化：${JSON.stringify(v).slice(0, 80)}...`)
    if (timer)
      clearTimeout(timer)
    if (autoSave.value) {
      timer = setTimeout(() => {
        addLog('auto-save', '自动保存到 localStorage')
        try {
          localStorage.setItem('vue-lifecycle-auto', JSON.stringify(v))
        }
        catch { /* */ }
      }, 1500)
    }
  })
})
onUnmounted(() => {
  if (timer)
    clearTimeout(timer)
})
function handleReset(): void {
  addLog('reset', '表单已重置')
  form.reset()
}
async function handleSubmit(): Promise<void> {
  addLog('submit', '提交开始')
  const res = await form.submit()
  if (res.errors.length > 0) {
    addLog('submit', '提交失败')
    result.value = `验证失败: ${res.errors.map(e => e.message).join(', ')}`
  }
  else {
    addLog('submit', '提交成功')
    result.value = JSON.stringify(res.values, null, 2)
  }
}
</script>
