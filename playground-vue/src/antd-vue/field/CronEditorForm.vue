<template>
  <div>
    <h2>Cron 表达式编辑器</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">Cron 输入 / 快捷预设 / 实时解析</p>
    <ASegmented v-model:value="mode" :options="MODE_OPTIONS" style="margin-bottom: 16px" />
    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit" novalidate>
        <FormField v-slot="{ field }" name="taskName"><AFormItem :label="field.label"><AInput :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" :disabled="mode === 'disabled'" style="width: 300px" /></AFormItem></FormField>
        <FormField v-slot="{ field }" name="cronExpr"><AFormItem :label="field.label">
          <AInput :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" :disabled="mode === 'disabled'" placeholder="如：0 8 * * 1-5" addon-before="Cron" style="width: 400px" />
          <div style="margin-top: 8px"><span style="color: #999">解析：</span><ATag :color="describeCron((field.value as string) ?? '').includes('错误') ? 'error' : 'blue'">{{ describeCron((field.value as string) ?? '') }}</ATag></div>
          <div v-if="mode === 'editable'" style="margin-top: 8px"><span style="color: #999; font-size: 12px">快捷预设：</span><ASpace wrap><ATag v-for="p in PRESETS" :key="p.value" :color="field.value === p.value ? 'blue' : 'default'" style="cursor: pointer" @click="field.setValue(p.value)">{{ p.label }}</ATag></ASpace></div>
          <div style="background: #f6f8fa; padding: 8px; border-radius: 4px; font-size: 12px; margin-top: 8px; color: #999">格式：分 时 日 月 周 | 示例：<code>0 8 * * 1-5</code> = 工作日 8:00</div>
        </AFormItem></FormField>
        <ASpace v-if="mode === 'editable'"><AButton type="primary" html-type="submit">提交</AButton><AButton @click="form.reset()">重置</AButton></ASpace>
      </form>
    </FormProvider>
    <AAlert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" message="提交结果" style="margin-top: 16px"><template #description><pre style="margin: 0; white-space: pre-wrap">{{ result }}</pre></template></AAlert>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { Button as AButton, Space as ASpace, Alert as AAlert, Segmented as ASegmented, Input as AInput, FormItem as AFormItem, Tag as ATag } from 'ant-design-vue'
import type { FieldPattern } from '@moluoxixi/shared'
setupAntdVue()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const PRESETS = [{ label: '每分钟', value: '* * * * *' }, { label: '每小时', value: '0 * * * *' }, { label: '每天 0:00', value: '0 0 * * *' }, { label: '每天 8:00', value: '0 8 * * *' }, { label: '工作日 9:00', value: '0 9 * * 1-5' }, { label: '每 5 分钟', value: '*/5 * * * *' }]
const form = useCreateForm({ initialValues: { taskName: '数据同步', cronExpr: '0 8 * * 1-5' } })
onMounted(() => { form.createField({ name: 'taskName', label: '任务名称', required: true }); form.createField({ name: 'cronExpr', label: 'Cron 表达式', required: true }) })
function describeCron(expr: string): string { const p = expr.trim().split(/\s+/); if (p.length !== 5) return '格式错误'; const [min, hour, , , week] = p; const d: string[] = []; if (min === '*' && hour === '*') d.push('每分钟'); else if (min === '0' && hour === '*') d.push('每小时整点'); else if (min.startsWith('*/')) d.push(`每 ${min.slice(2)} 分钟`); else if (hour !== '*') d.push(`${hour}:${min.padStart(2, '0')}`); if (week !== '*') { const wm: Record<string, string> = { '0': '日', '1': '一', '1-5': '一至五（工作日）' }; d.push(`周${wm[week] ?? week}`) }; return d.join('，') || expr }
async function handleSubmit(): Promise<void> { const res = await form.submit(); result.value = res.errors.length > 0 ? '验证失败: ' + res.errors.map(e => e.message).join(', ') : JSON.stringify(res.values, null, 2) }
</script>
