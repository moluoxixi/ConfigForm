<template>
  <div>
    <h2>Cron 表达式编辑器</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      Cron 输入 / 快捷预设 / 实时解析
    </p>
    <div style="display:inline-flex;margin-bottom:16px">
      <button v-for="(opt, idx) in MODE_OPTIONS" :key="opt.value" type="button" :style="{ padding: '5px 15px', fontSize: '14px', border: '1px solid #dcdfe6', background: mode === opt.value ? '#409eff' : '#fff', color: mode === opt.value ? '#fff' : '#606266', cursor: 'pointer', marginLeft: idx > 0 ? '-1px' : '0', borderRadius: idx === 0 ? '4px 0 0 4px' : idx === MODE_OPTIONS.length - 1 ? '0 4px 4px 0' : '0' }" @click="mode = opt.value as FieldPattern">
        {{ opt.label }}
      </button>
    </div>
    <FormProvider :form="form">
      <form novalidate @submit.prevent="handleSubmit">
        <FormField v-slot="{ field }" name="taskName">
          <div style="margin-bottom:18px">
            <label style="display:block;font-size:14px;color:#606266;margin-bottom:4px">{{ field.label }}</label>
            <input :value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" style="width:300px;padding:0 11px;height:32px;border:1px solid #dcdfe6;border-radius:4px;font-size:14px;outline:none;box-sizing:border-box" @input="field.setValue(($event.target as HTMLInputElement).value)">
          </div>
        </FormField>
        <FormField v-slot="{ field }" name="cronExpr">
          <div style="margin-bottom:18px">
            <label style="display:block;font-size:14px;color:#606266;margin-bottom:4px">{{ field.label }}</label>
            <div style="display:inline-flex;width:400px">
              <span style="padding:0 11px;height:32px;line-height:32px;background:#f5f7fa;border:1px solid #dcdfe6;border-radius:4px 0 0 4px;font-size:14px;color:#909399;white-space:nowrap;box-sizing:border-box">Cron</span>
              <input :value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" placeholder="如：0 8 * * 1-5" style="flex:1;padding:0 11px;height:32px;border:1px solid #dcdfe6;border-left:none;border-radius:0 4px 4px 0;font-size:14px;outline:none;box-sizing:border-box" @input="field.setValue(($event.target as HTMLInputElement).value)">
            </div>
            <div style="margin-top: 8px">
              <span style="color: #999">解析：</span>
              <span :style="{ display: 'inline-block', padding: '0 7px', fontSize: '12px', lineHeight: '20px', borderRadius: '4px', background: describeCron((field.value as string) ?? '').includes('错误') ? '#fef0f0' : '#ecf5ff', border: describeCron((field.value as string) ?? '').includes('错误') ? '1px solid #fde2e2' : '1px solid #d9ecff', color: describeCron((field.value as string) ?? '').includes('错误') ? '#f56c6c' : '#409eff' }">
                {{ describeCron((field.value as string) ?? '') }}
              </span>
            </div>
            <div style="margin-top: 8px">
              <span style="color: #999; font-size: 12px">快捷预设：</span>
              <div style="display:inline-flex;gap:8px;align-items:center;flex-wrap:wrap">
                <span v-for="p in PRESETS" :key="p.value" :style="{ display: 'inline-block', padding: '0 7px', fontSize: '12px', lineHeight: '20px', borderRadius: '4px', cursor: 'pointer', background: field.value === p.value ? '#ecf5ff' : '#f4f4f5', border: field.value === p.value ? '1px solid #d9ecff' : '1px solid #e9e9eb', color: field.value === p.value ? '#409eff' : '#909399' }" @click="field.setValue(p.value)">
                  {{ p.label }}
                </span>
              </div>
            </div>
            <div style="background: #f6f8fa; padding: 8px; border-radius: 4px; font-size: 12px; margin-top: 8px; color: #999">
              格式：分 时 日 月 周 | 示例：<code>0 8 * * 1-5</code> = 工作日 8:00
            </div>
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

const mode = ref<FieldPattern>('editable')
const result = ref('')

/** Cron 预设 */
const PRESETS = [{ label: '每分钟', value: '* * * * *' }, { label: '每小时', value: '0 * * * *' }, { label: '每天 0:00', value: '0 0 * * *' }, { label: '每天 8:00', value: '0 8 * * *' }, { label: '工作日 9:00', value: '0 9 * * 1-5' }, { label: '每 5 分钟', value: '*/5 * * * *' }]

const form = useCreateForm({ initialValues: { taskName: '数据同步', cronExpr: '0 8 * * 1-5' } })
onMounted(() => {
  form.createField({ name: 'taskName', label: '任务名称', required: true })
  form.createField({ name: 'cronExpr', label: 'Cron 表达式', required: true })
})

/** 解析 Cron 表达式为人可读描述 */
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

/** 提交处理 */
async function handleSubmit(): Promise<void> {
  const res = await form.submit()
  result.value = res.errors.length > 0 ? `验证失败: ${res.errors.map(e => e.message).join(', ')}` : JSON.stringify(res.values, null, 2)
}
</script>
