<template>
  <div>
    <h2>数据转换</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      format / parse / transform / submitPath
    </p>
    <div style="display:inline-flex;margin-bottom:16px">
      <button v-for="(opt, idx) in MODE_OPTIONS" :key="opt.value" type="button" :style="{ padding: '5px 15px', fontSize: '14px', border: '1px solid #dcdfe6', background: mode === opt.value ? '#409eff' : '#fff', color: mode === opt.value ? '#fff' : '#606266', cursor: 'pointer', marginLeft: idx > 0 ? '-1px' : '0', borderRadius: idx === 0 ? '4px 0 0 4px' : idx === MODE_OPTIONS.length - 1 ? '0 4px 4px 0' : '0' }" @click="mode = opt.value as FieldPattern">
        {{ opt.label }}
      </button>
    </div>
    <FormProvider :form="form">
      <form novalidate @submit.prevent="handleSubmit">
        <FormField v-for="name in FIELDS" :key="name" v-slot="{ field }" :name="name">
          <div style="margin-bottom:18px">
            <label style="display:block;font-size:14px;color:#606266;margin-bottom:4px">{{ field.label }}</label>
            <div style="display:flex;gap:8px;align-items:center">
              <input :value="String(field.value ?? '')" :disabled="mode === 'disabled'" style="width:300px;padding:0 11px;height:32px;border:1px solid #dcdfe6;border-radius:4px;font-size:14px;outline:none;box-sizing:border-box" @input="field.setValue(($event.target as HTMLInputElement).value)">
              <span style="display:inline-block;padding:0 7px;font-size:12px;line-height:20px;background:#ecf5ff;border:1px solid #d9ecff;border-radius:4px;color:#409eff">
                原始: {{ JSON.stringify(field.value) }}
              </span>
            </div>
            <div v-if="field.description" style="font-size:12px;color:#909399;margin-top:4px">{{ field.description }}</div>
          </div>
        </FormField>
        <div style="display:flex;gap:8px;align-items:center;margin-top:8px">
          <button type="submit" style="padding:8px 15px;background:#409eff;color:#fff;border:1px solid #409eff;border-radius:4px;cursor:pointer;font-size:14px">提交（查看转换结果）</button>
          <button type="button" style="padding:8px 15px;background:#fff;color:#606266;border:1px solid #dcdfe6;border-radius:4px;cursor:pointer;font-size:14px" @click="form.reset()">重置</button>
        </div>
      </form>
    </FormProvider>
    <div v-if="rawValues" style="padding:8px 16px;margin-top:16px;background:#f4f4f5;border:1px solid #e9e9eb;border-radius:4px;font-size:13px;color:#909399">
      <strong>表单原始值</strong>
      <div>{{ rawValues }}</div>
    </div>
    <div v-if="result" :style="{ padding: '8px 16px', borderRadius: '4px', fontSize: '13px', marginTop: '8px', background: result.startsWith('验证失败') ? '#fef0f0' : '#f0f9eb', border: result.startsWith('验证失败') ? '1px solid #fde2e2' : '1px solid #e1f3d8', color: result.startsWith('验证失败') ? '#f56c6c' : '#67c23a' }">
      <strong>提交转换后</strong>
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
const rawValues = ref('')

/** 字段名列表 */
const FIELDS = ['priceCent', 'phoneRaw', 'fullName', 'tags']

const form = useCreateForm({ initialValues: { priceCent: 9990, phoneRaw: '13800138000', fullName: '张三', tags: 'react,vue,typescript' } })
onMounted(() => {
  form.createField({ name: 'priceCent', label: '价格（分→元）', description: 'format: 分转元, parse: 元转分', format: (v: unknown) => v ? (Number(v) / 100).toFixed(2) : '', parse: (v: unknown) => Math.round(Number(v) * 100) })
  form.createField({ name: 'phoneRaw', label: '手机号（脱敏）', format: (v: unknown) => {
    const s = String(v ?? '')
    return s.length === 11 ? `${s.slice(0, 3)}****${s.slice(7)}` : s
  } })
  form.createField({ name: 'fullName', label: '姓名' })
  form.createField({ name: 'tags', label: '标签（逗号分隔）', description: '提交时转为数组', transform: (v: unknown) => String(v ?? '').split(',').map(s => s.trim()).filter(Boolean) })
})

/** 提交处理 */
async function handleSubmit(): Promise<void> {
  rawValues.value = JSON.stringify(form.values, null, 2)
  const res = await form.submit()
  result.value = res.errors.length > 0 ? `验证失败: ${res.errors.map(e => e.message).join(', ')}` : JSON.stringify(res.values, null, 2)
}
</script>
