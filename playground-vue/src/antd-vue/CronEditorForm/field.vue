<template>
  <div>
    <h2>Cron 表达式编辑器</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">Cron 输入 / 快捷预设 / 实时解析</p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <FormField v-slot="{ field }" name="taskName"><AFormItem :label="field.label"><span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span><AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" :disabled="mode === 'disabled'" style="width: 300px" /></AFormItem></FormField>
        <FormField v-slot="{ field }" name="cronExpr"><AFormItem :label="field.label">
          <span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span><AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" :disabled="mode === 'disabled'" placeholder="如：0 8 * * 1-5" addon-before="Cron" style="width: 400px" />
          <div style="margin-top: 8px"><span style="color: #999">解析：</span><ATag :color="describeCron((field.value as string) ?? '').includes('错误') ? 'error' : 'blue'">{{ describeCron((field.value as string) ?? '') }}</ATag></div>
          <div v-if="mode === 'editable'" style="margin-top: 8px"><span style="color: #999; font-size: 12px">快捷预设：</span><ASpace wrap><ATag v-for="p in PRESETS" :key="p.value" :color="field.value === p.value ? 'blue' : 'default'" style="cursor: pointer" @click="field.setValue(p.value)">{{ p.label }}</ATag></ASpace></div>
          <div style="background: #f6f8fa; padding: 8px; border-radius: 4px; font-size: 12px; margin-top: 8px; color: #999">格式：分 时 日 月 周 | 示例：<code>0 8 * * 1-5</code> = 工作日 8:00</div>
        </AFormItem></FormField>
        <div v-if="mode === 'editable'" style="margin-top: 16px; display: flex; gap: 8px">
          <button type="button" @click="handleSubmit(showResult)" style="padding: 4px 15px; background: #1677ff; color: #fff; border: none; border-radius: 6px; cursor: pointer">提交</button>
          <button type="button" @click="form.reset()" style="padding: 4px 15px; background: #fff; border: 1px solid #d9d9d9; border-radius: 6px; cursor: pointer">重置</button>
        </div>
      </FormProvider>
    </StatusTabs>
  </div>
</template>
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/vue'
import { setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { Space as ASpace, Input as AInput, FormItem as AFormItem, Tag as ATag } from 'ant-design-vue'
import type { FieldPattern } from '@moluoxixi/shared'

setupAntdVue()

const st = ref<InstanceType<typeof StatusTabs>>()

const PRESETS = [{ label: '每分钟', value: '* * * * *' }, { label: '每小时', value: '0 * * * *' }, { label: '每天 0:00', value: '0 0 * * *' }, { label: '每天 8:00', value: '0 8 * * *' }, { label: '工作日 9:00', value: '0 9 * * 1-5' }, { label: '每 5 分钟', value: '*/5 * * * *' }]
const form = useCreateForm({ initialValues: { taskName: '数据同步', cronExpr: '0 8 * * 1-5' } })

/** 同步 StatusTabs 的 mode 到 form.pattern */
watch(() => st.value?.mode, (v) => { if (v) form.pattern = v as FieldPattern }, { immediate: true })

/** 提交处理 */
async function handleSubmit(showResult: (data: Record<string, unknown>) => void): Promise<void> {
  const res = await form.submit()
  if (res.errors.length > 0) { st.value?.showErrors(res.errors) }
  else { showResult(res.values) }
}

onMounted(() => { form.createField({ name: 'taskName', label: '任务名称', required: true }); form.createField({ name: 'cronExpr', label: 'Cron 表达式', required: true }) })
function describeCron(expr: string): string { const p = expr.trim().split(/\s+/); if (p.length !== 5) return '格式错误'; const [min, hour, , , week] = p; const d: string[] = []; if (min === '*' && hour === '*') d.push('每分钟'); else if (min === '0' && hour === '*') d.push('每小时整点'); else if (min.startsWith('*/')) d.push(`每 ${min.slice(2)} 分钟`); else if (hour !== '*') d.push(`${hour}:${min.padStart(2, '0')}`); if (week !== '*') { const wm: Record<string, string> = { '0': '日', '1': '一', '1-5': '一至五（工作日）' }; d.push(`周${wm[week] ?? week}`) }; return d.join('，') || expr }
</script>
