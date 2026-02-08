<template>
  <div>
    <h2>代码编辑器</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      Textarea 模拟（可接入 monaco-editor-vue3）
    </p>
    <div style="display:inline-flex;margin-bottom:16px">
      <button v-for="(opt, idx) in MODE_OPTIONS" :key="opt.value" type="button" :style="{ padding: '5px 15px', fontSize: '14px', border: '1px solid #dcdfe6', background: mode === opt.value ? '#409eff' : '#fff', color: mode === opt.value ? '#fff' : '#606266', cursor: 'pointer', marginLeft: idx > 0 ? '-1px' : '0', borderRadius: idx === 0 ? '4px 0 0 4px' : idx === MODE_OPTIONS.length - 1 ? '0 4px 4px 0' : '0' }" @click="mode = opt.value as FieldPattern">
        {{ opt.label }}
      </button>
    </div>
    <FormProvider :form="form">
      <form novalidate @submit.prevent="handleSubmit">
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:16px">
          <FormField v-slot="{ field }" name="title">
            <div style="display:flex;align-items:center;gap:8px">
              <label style="font-size:14px;color:#606266;white-space:nowrap">标题</label>
              <input :value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" style="width:250px;padding:0 11px;height:32px;border:1px solid #dcdfe6;border-radius:4px;font-size:14px;outline:none;box-sizing:border-box" @input="field.setValue(($event.target as HTMLInputElement).value)">
            </div>
          </FormField>
          <FormField v-slot="{ field }" name="language">
            <div style="display:flex;align-items:center;gap:8px">
              <label style="font-size:14px;color:#606266;white-space:nowrap">语言</label>
              <select :value="(field.value as string)" :disabled="mode === 'disabled'" style="width:160px;height:32px;padding:0 11px;border:1px solid #dcdfe6;border-radius:4px;font-size:14px;outline:none;box-sizing:border-box" @change="field.setValue(($event.target as HTMLSelectElement).value)">
                <option v-for="opt in LANG_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
            </div>
          </FormField>
        </div>
        <FormField v-slot="{ field }" name="code">
          <div style="margin-bottom:18px">
            <label style="display:block;font-size:14px;color:#606266;margin-bottom:4px">{{ field.label }}</label>
            <textarea v-if="mode === 'editable'" :value="(field.value as string) ?? ''" rows="12" :style="{ width: '100%', fontFamily: 'Consolas, Monaco, monospace', fontSize: '13px', background: '#1e1e1e', color: '#d4d4d4', padding: '8px', border: '1px solid #dcdfe6', borderRadius: '4px', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }" @input="field.setValue(($event.target as HTMLTextAreaElement).value)" />
            <pre v-else :style="{ padding: '16px', borderRadius: '8px', background: '#1e1e1e', color: '#d4d4d4', fontFamily: 'Consolas, Monaco, monospace', fontSize: '13px', overflow: 'auto', maxHeight: '400px', opacity: mode === 'disabled' ? 0.6 : 1 }">{{ (field.value as string) || '// 暂无代码' }}</pre>
          </div>
        </FormField>
        <div style="display:flex;gap:8px;align-items:center">
          <button type="submit" style="padding:8px 15px;background:#409eff;color:#fff;border:1px solid #409eff;border-radius:4px;cursor:pointer;font-size:14px">提交</button>
          <button type="button" style="padding:8px 15px;background:#fff;color:#606266;border:1px solid #dcdfe6;border-radius:4px;cursor:pointer;font-size:14px" @click="form.reset()">重置</button>
        </div>
      </form>
    </FormProvider>
    <div v-if="result" :style="{ padding: '8px 16px', borderRadius: '4px', fontSize: '13px', marginTop: '16px', background: result.startsWith('验证失败') ? '#fef0f0' : '#f0f9eb', border: result.startsWith('验证失败') ? '1px solid #fde2e2' : '1px solid #e1f3d8', color: result.startsWith('验证失败') ? '#f56c6c' : '#67c23a' }">
      {{ result }}
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

/** 语言选项 */
const LANG_OPTIONS = [{ label: 'JavaScript', value: 'javascript' }, { label: 'TypeScript', value: 'typescript' }, { label: 'Python', value: 'python' }, { label: 'JSON', value: 'json' }]

const mode = ref<FieldPattern>('editable')
const result = ref('')
const form = useCreateForm({ initialValues: { title: '代码片段', language: 'javascript', code: 'function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\nconsole.log(fibonacci(10));' } })
onMounted(() => {
  form.createField({ name: 'title', label: '标题', required: true })
  form.createField({ name: 'language', label: '语言' })
  form.createField({ name: 'code', label: '代码', required: true })
})

/** 提交处理 */
async function handleSubmit(): Promise<void> {
  const res = await form.submit()
  result.value = res.errors.length > 0 ? `验证失败: ${res.errors.map(e => e.message).join(', ')}` : JSON.stringify(res.values, null, 2)
}
</script>
