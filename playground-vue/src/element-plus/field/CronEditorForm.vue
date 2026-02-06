<template>
  <div>
    <h2>Cron 表达式编辑器</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">Cron 输入 / 快捷预设 / 实时解析</p>
    <el-radio-group v-model="mode" size="small" style="margin-bottom: 16px">
      <el-radio-button v-for="opt in MODE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</el-radio-button>
    </el-radio-group>
    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit" novalidate>
        <FormField v-slot="{ field }" name="taskName"><el-form-item :label="field.label"><el-input :model-value="(field.value as string) ?? ''" @update:model-value="field.setValue($event)" :disabled="mode === 'disabled'" style="width: 300px" /></el-form-item></FormField>
        <FormField v-slot="{ field }" name="cronExpr"><el-form-item :label="field.label">
          <el-input :model-value="(field.value as string) ?? ''" @update:model-value="field.setValue($event)" :disabled="mode === 'disabled'" placeholder="如：0 8 * * 1-5" style="width: 400px"><template #prepend>Cron</template></el-input>
          <div style="margin-top: 8px"><span style="color: #999">解析：</span><el-tag :type="describeCron((field.value as string) ?? '').includes('错误') ? 'danger' : 'primary'">{{ describeCron((field.value as string) ?? '') }}</el-tag></div>
          <div v-if="mode === 'editable'" style="margin-top: 8px"><span style="color: #999; font-size: 12px">快捷预设：</span><el-space wrap><el-tag v-for="p in PRESETS" :key="p.value" :type="field.value === p.value ? 'primary' : 'info'" style="cursor: pointer" @click="field.setValue(p.value)">{{ p.label }}</el-tag></el-space></div>
          <div style="background: #f6f8fa; padding: 8px; border-radius: 4px; font-size: 12px; margin-top: 8px; color: #999">格式：分 时 日 月 周 | 示例：<code>0 8 * * 1-5</code> = 工作日 8:00</div>
        </el-form-item></FormField>
        <el-space v-if="mode === 'editable'"><el-button type="primary" native-type="submit">提交</el-button><el-button @click="form.reset()">重置</el-button></el-space>
      </form>
    </FormProvider>
    <el-alert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" :description="result" show-icon style="margin-top: 16px" />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/vue'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import { ElButton, ElSpace, ElAlert, ElRadioGroup, ElRadioButton, ElInput, ElFormItem, ElTag } from 'element-plus'
import type { FieldPattern } from '@moluoxixi/shared'
setupElementPlus()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const PRESETS = [{ label: '每分钟', value: '* * * * *' }, { label: '每小时', value: '0 * * * *' }, { label: '每天 0:00', value: '0 0 * * *' }, { label: '每天 8:00', value: '0 8 * * *' }, { label: '工作日 9:00', value: '0 9 * * 1-5' }, { label: '每 5 分钟', value: '*/5 * * * *' }]
const form = useCreateForm({ initialValues: { taskName: '数据同步', cronExpr: '0 8 * * 1-5' } })
onMounted(() => { form.createField({ name: 'taskName', label: '任务名称', required: true }); form.createField({ name: 'cronExpr', label: 'Cron 表达式', required: true }) })
function describeCron(expr: string): string { const p = expr.trim().split(/\s+/); if (p.length !== 5) return '格式错误'; const [min, hour, , , week] = p; const d: string[] = []; if (min === '*' && hour === '*') d.push('每分钟'); else if (min === '0' && hour === '*') d.push('每小时整点'); else if (min.startsWith('*/')) d.push(`每 ${min.slice(2)} 分钟`); else if (hour !== '*') d.push(`${hour}:${min.padStart(2, '0')}`); if (week !== '*') { const wm: Record<string, string> = { '0': '日', '1': '一', '1-5': '一至五（工作日）' }; d.push(`周${wm[week] ?? week}`) }; return d.join('，') || expr }
async function handleSubmit(): Promise<void> { const res = await form.submit(); result.value = res.errors.length > 0 ? '验证失败: ' + res.errors.map(e => e.message).join(', ') : JSON.stringify(res.values, null, 2) }
</script>
