<template>
  <div>
    <h2>颜色选择器</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      原生 color input + 预设色板 / HEX 输入
    </p>
    <div style="display:inline-flex;margin-bottom:16px">
      <button v-for="(opt, idx) in MODE_OPTIONS" :key="opt.value" type="button" :style="{ padding: '5px 15px', fontSize: '14px', border: '1px solid #dcdfe6', background: mode === opt.value ? '#409eff' : '#fff', color: mode === opt.value ? '#fff' : '#606266', cursor: 'pointer', marginLeft: idx > 0 ? '-1px' : '0', borderRadius: idx === 0 ? '4px 0 0 4px' : idx === MODE_OPTIONS.length - 1 ? '0 4px 4px 0' : '0' }" @click="mode = opt.value as FieldPattern">
        {{ opt.label }}
      </button>
    </div>
    <FormProvider :form="form">
      <form novalidate @submit.prevent="handleSubmit">
        <FormField v-slot="{ field }" name="themeName">
          <div style="margin-bottom:18px">
            <label style="display:block;font-size:14px;color:#606266;margin-bottom:4px">{{ field.label }}</label>
            <input :value="(field.value as string) ?? ''" :disabled="mode === 'disabled'" style="width:100%;padding:0 11px;height:32px;border:1px solid #dcdfe6;border-radius:4px;font-size:14px;outline:none;box-sizing:border-box" @input="field.setValue(($event.target as HTMLInputElement).value)">
          </div>
        </FormField>
        <FormField v-for="cn in colorNames" :key="cn" v-slot="{ field }" :name="cn">
          <div style="margin-bottom:18px">
            <label style="display:block;font-size:14px;color:#606266;margin-bottom:4px">{{ field.label }}</label>
            <div v-if="mode !== 'editable'" style="display:flex;gap:8px;align-items:center">
              <div :style="{ width: '32px', height: '32px', background: (field.value as string) || '#fff', border: '1px solid #dcdfe6', borderRadius: '4px' }" />
              <code>{{ field.value }}</code>
            </div>
            <div v-else>
              <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
                <input type="color" :value="(field.value as string) ?? '#000'" style="width: 48px; height: 48px; border: none; cursor: pointer; padding: 0" @input="field.setValue(($event.target as HTMLInputElement).value)">
                <input :value="(field.value as string) ?? ''" style="width:120px;padding:0 11px;height:32px;border:1px solid #dcdfe6;border-radius:4px;font-size:14px;outline:none;box-sizing:border-box" @input="field.setValue(($event.target as HTMLInputElement).value)">
                <div :style="{ width: '32px', height: '32px', background: (field.value as string) || '#fff', border: '1px solid #dcdfe6', borderRadius: '4px' }" />
              </div>
              <div style="display: flex; gap: 4px">
                <div v-for="c in PRESETS" :key="c" :style="{ width: '24px', height: '24px', background: c, borderRadius: '4px', cursor: 'pointer', border: field.value === c ? '2px solid #333' : '1px solid #dcdfe6' }" @click="field.setValue(c)" />
              </div>
            </div>
          </div>
        </FormField>
        <div :style="{ padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #eee', background: (form.getFieldValue('bgColor') as string) || '#fff', color: (form.getFieldValue('textColor') as string) || '#333' }">
          <h4 :style="{ color: (form.getFieldValue('primaryColor') as string) || '#409eff' }">
            主题预览
          </h4>
          <p>文字颜色预览</p>
          <button type="button" :style="{ background: (form.getFieldValue('primaryColor') as string) || '#409eff', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: '4px' }">
            主色调按钮
          </button>
        </div>
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

/** 预设颜色 */
const PRESETS = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#606266', '#303133', '#000000']

/** 颜色字段名 */
const colorNames = ['primaryColor', 'bgColor', 'textColor']

const form = useCreateForm({ initialValues: { themeName: '自定义主题', primaryColor: '#409eff', bgColor: '#ffffff', textColor: '#333333' } })
onMounted(() => {
  form.createField({ name: 'themeName', label: '主题名称', required: true })
  form.createField({ name: 'primaryColor', label: '主色调', required: true })
  form.createField({ name: 'bgColor', label: '背景色' })
  form.createField({ name: 'textColor', label: '文字颜色' })
})

/** 提交处理 */
async function handleSubmit(): Promise<void> {
  const res = await form.submit()
  result.value = res.errors.length > 0 ? `验证失败: ${res.errors.map(e => e.message).join(', ')}` : JSON.stringify(res.values, null, 2)
}
</script>
