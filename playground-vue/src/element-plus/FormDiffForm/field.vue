<template>
  <div>
    <h2>表单比对</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      变更高亮 / 原始值 vs 当前值 / 变更摘要
    </p>
    <div style="display:inline-flex;margin-bottom:16px">
      <button v-for="(opt, idx) in MODE_OPTIONS" :key="opt.value" type="button" :style="{ padding: '5px 15px', fontSize: '14px', border: '1px solid #dcdfe6', background: mode === opt.value ? '#409eff' : '#fff', color: mode === opt.value ? '#fff' : '#606266', cursor: 'pointer', marginLeft: idx > 0 ? '-1px' : '0', borderRadius: idx === 0 ? '4px 0 0 4px' : idx === MODE_OPTIONS.length - 1 ? '0 4px 4px 0' : '0' }" @click="mode = opt.value as FieldPattern">
        {{ opt.label }}
      </button>
    </div>
    <div style="border:1px solid #ebeef5;border-radius:4px;padding:16px;margin-bottom:16px">
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <span style="font-weight: 600">变更摘要：</span>
        <span v-if="changedFields.length === 0" style="display:inline-block;padding:0 7px;font-size:12px;line-height:20px;background:#f0f9eb;border:1px solid #e1f3d8;border-radius:4px;color:#67c23a">无变更</span>
        <template v-else>
          <span style="display:inline-block;padding:0 7px;font-size:12px;line-height:20px;background:#fdf6ec;border:1px solid #faecd8;border-radius:4px;color:#e6a23c">{{ changedFields.length }} 个已修改</span>
          <span v-for="d in changedFields" :key="d.name" style="display:inline-block;padding:0 7px;font-size:12px;line-height:20px;background:#fef0f0;border:1px solid #fde2e2;border-radius:4px;color:#f56c6c">{{ d.label }}</span>
        </template>
      </div>
    </div>
    <FormProvider :form="form">
      <form novalidate @submit.prevent="handleSubmit">
        <FormField v-for="d in FIELD_DEFS" :key="d.name" v-slot="{ field }" :name="d.name">
          <div :style="{ marginBottom: '18px', background: isChanged(d.name) ? '#fffbe6' : undefined, padding: isChanged(d.name) ? '4px 8px' : undefined, borderRadius: '4px' }">
            <label style="display:block;font-size:14px;color:#606266;margin-bottom:4px">{{ d.label }}</label>
            <input v-if="d.type === 'number'" type="number" :value="(field.value as number)" :disabled="mode === 'disabled'" style="width:100%;padding:0 11px;height:32px;border:1px solid #dcdfe6;border-radius:4px;font-size:14px;outline:none;box-sizing:border-box" @input="field.setValue(Number(($event.target as HTMLInputElement).value))">
            <textarea v-else-if="d.type === 'textarea'" :value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" rows="2" style="width:100%;padding:5px 11px;border:1px solid #dcdfe6;border-radius:4px;font-size:14px;outline:none;box-sizing:border-box;resize:vertical" @input="field.setValue(($event.target as HTMLTextAreaElement).value)" />
            <input v-else :value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" style="width:100%;padding:0 11px;height:32px;border:1px solid #dcdfe6;border-radius:4px;font-size:14px;outline:none;box-sizing:border-box" @input="field.setValue(($event.target as HTMLInputElement).value)">
            <div v-if="isChanged(d.name)" style="font-size:12px;color:#909399;margin-top:4px">原始值: {{ String(ORIGINAL[d.name] ?? '—') }}</div>
          </div>
        </FormField>
        <div style="display:flex;gap:8px;align-items:center">
          <button type="submit" style="padding:8px 15px;background:#409eff;color:#fff;border:1px solid #409eff;border-radius:4px;cursor:pointer;font-size:14px">提交</button>
          <button type="button" style="padding:8px 15px;background:#fff;color:#606266;border:1px solid #dcdfe6;border-radius:4px;cursor:pointer;font-size:14px" @click="form.reset()">重置</button>
        </div>
      </form>
    </FormProvider>
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
import { computed, onMounted, ref } from 'vue'

setupElementPlus()

/** 模式选项 */
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]

const mode = ref<FieldPattern>('editable')
const result = ref('')

/** 字段定义 */
const FIELD_DEFS = [{ name: 'name', label: '姓名', type: 'text' }, { name: 'email', label: '邮箱', type: 'text' }, { name: 'phone', label: '电话', type: 'text' }, { name: 'salary', label: '薪资', type: 'number' }, { name: 'department', label: '部门', type: 'text' }, { name: 'bio', label: '简介', type: 'textarea' }]

/** 原始值 */
const ORIGINAL: Record<string, unknown> = { name: '张三', email: 'zhangsan@company.com', phone: '13800138000', salary: 25000, department: '技术部', bio: '5 年前端经验' }

const currentValues = ref<Record<string, unknown>>({ ...ORIGINAL })
const form = useCreateForm({ initialValues: { ...ORIGINAL } })
onMounted(() => {
  FIELD_DEFS.forEach(d => form.createField({ name: d.name, label: d.label }))
  form.onValuesChange((v: Record<string, unknown>) => {
    currentValues.value = { ...v }
  })
})

/** 判断字段是否已修改 */
function isChanged(name: string): boolean {
  return String(ORIGINAL[name] ?? '') !== String(currentValues.value[name] ?? '')
}

/** 已修改字段列表 */
const changedFields = computed(() => FIELD_DEFS.filter(d => isChanged(d.name)))

/** 提交处理 */
async function handleSubmit(): Promise<void> {
  const res = await form.submit()
  result.value = res.errors.length > 0 ? `验证失败: ${res.errors.map(e => e.message).join(', ')}` : JSON.stringify(res.values, null, 2)
}
</script>
