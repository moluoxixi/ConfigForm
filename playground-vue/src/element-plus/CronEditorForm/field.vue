<template>
  <div>
    <h2>Cron 表达式编辑器</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      Cron 输入 / 快捷预设 / 实时解析
    </p>
    <ElRadioGroup v-model="mode" size="small" style="margin-bottom: 16px">
      <ElRadioButton v-for="opt in MODE_OPTIONS" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </ElRadioButton>
    </ElRadioGroup>
    <FormProvider :form="form">
      <form novalidate @submit.prevent="handleSubmit">
        <FormField v-slot="{ field }" name="taskName">
          <ElFormItem :label="field.label">
            <ElInput :model-value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" style="width: 300px" @update:model-value="field.setValue($event)" />
          </ElFormItem>
        </FormField>
        <FormField v-slot="{ field }" name="cronExpr">
          <ElFormItem :label="field.label">
            <ElInput :model-value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" placeholder="如：0 8 * * 1-5" style="width: 400px" @update:model-value="field.setValue($event)">
              <template #prepend>
                Cron
              </template>
            </ElInput>
            <div style="margin-top: 8px">
              <span style="color: #999">解析：</span><ElTag :type="describeCron((field.value as string) ?? '').includes('错误') ? 'danger' : 'primary'">
                {{ describeCron((field.value as string) ?? '') }}
              </ElTag>
            </div>
            <div v-if="mode === 'editable'" style="margin-top: 8px">
              <span style="color: #999; font-size: 12px">快捷预设：</span><ElSpace wrap>
                <ElTag v-for="p in PRESETS" :key="p.value" :type="field.value === p.value ? 'primary' : 'info'" style="cursor: pointer" @click="field.setValue(p.value)">
                  {{ p.label }}
                </ElTag>
              </ElSpace>
            </div>
            <div style="background: #f6f8fa; padding: 8px; border-radius: 4px; font-size: 12px; margin-top: 8px; color: #999">
              格式：分 时 日 月 周 | 示例：<code>0 8 * * 1-5</code> = 工作日 8:00
            </div>
          </ElFormItem>
        </FormField>
        <ElSpace v-if="mode === 'editable'">
          <ElButton type="primary" native-type="submit">
            提交
          </ElButton><ElButton @click="form.reset()">
            重置
          </ElButton>
        </ElSpace>
      </form>
    </FormProvider>
    <ElAlert v-if="result" :type="result.startsWith('验证失败') ? 'error' : 'success'" :description="result" show-icon style="margin-top: 16px" />
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { setupElementPlus } from '@moluoxixi/ui-element-plus'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { ElAlert, ElButton, ElFormItem, ElInput, ElRadioButton, ElRadioGroup, ElSpace, ElTag } from 'element-plus'
import { onMounted, ref } from 'vue'

setupElementPlus()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const PRESETS = [{ label: '每分钟', value: '* * * * *' }, { label: '每小时', value: '0 * * * *' }, { label: '每天 0:00', value: '0 0 * * *' }, { label: '每天 8:00', value: '0 8 * * *' }, { label: '工作日 9:00', value: '0 9 * * 1-5' }, { label: '每 5 分钟', value: '*/5 * * * *' }]
const form = useCreateForm({ initialValues: { taskName: '数据同步', cronExpr: '0 8 * * 1-5' } })
onMounted(() => {
  form.createField({ name: 'taskName', label: '任务名称', required: true })
  form.createField({ name: 'cronExpr', label: 'Cron 表达式', required: true })
})
function describeCron(expr: string): string {
  const p = expr.trim().split(/\s+/)
  if (p.length !== 5)
    return '格式错误'
  const [min, hour, , , week] = p
  const d: string[] = []
  if (min === '*' && hour === '*')
    d.push('每分钟')
  else if (min === '0' && hour === '*')
    d.push('每小时整点')
  else if (min.startsWith('*/'))
    d.push(`每 ${min.slice(2)} 分钟`)
  else if (hour !== '*')
    d.push(`${hour}:${min.padStart(2, '0')}`)
  if (week !== '*') {
    const wm: Record<string, string> = { '0': '日', '1': '一', '1-5': '一至五（工作日）' }
    d.push(`周${wm[week] ?? week}`)
  }
  return d.join('，') || expr
}
async function handleSubmit(): Promise<void> {
  const res = await form.submit()
  result.value = res.errors.length > 0 ? `验证失败: ${res.errors.map(e => e.message).join(', ')}` : JSON.stringify(res.values, null, 2)
}
</script>
