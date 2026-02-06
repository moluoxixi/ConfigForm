<template>
  <div>
    <h2>手写签名板</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">Canvas 手写签名 / Base64 数据同步</p>
    <el-radio-group v-model="mode" size="small" style="margin-bottom: 16px">
      <el-radio-button v-for="opt in MODE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</el-radio-button>
    </el-radio-group>
    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit" novalidate>
        <FormField v-slot="{ field }" name="signerName"><el-form-item :label="field.label" :required="field.required"><el-input :model-value="(field.value as string) ?? ''" @update:model-value="field.setValue($event)" :disabled="mode === 'disabled'" style="width: 300px" /></el-form-item></FormField>
        <el-form-item label="手写签名">
          <div v-if="mode === 'readOnly'">
            <img v-if="signatureData" :src="signatureData" alt="签名" style="border: 1px solid #dcdfe6; border-radius: 8px; max-width: 500px" />
            <span v-else style="color: #999">暂无签名</span>
          </div>
          <div v-else>
            <canvas ref="canvasRef" width="500" height="200" @mousedown="startDraw" @mousemove="drawing" @mouseup="endDraw" @mouseleave="endDraw" :style="{ border: '1px solid #dcdfe6', borderRadius: '8px', cursor: mode === 'disabled' ? 'not-allowed' : 'crosshair', background: mode === 'disabled' ? '#f5f7fa' : '#fff', display: 'block' }" />
            <el-button v-if="mode === 'editable'" size="small" style="margin-top: 8px" @click="clearCanvas">清空签名</el-button>
          </div>
        </el-form-item>
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
import { ElButton, ElSpace, ElAlert, ElRadioGroup, ElRadioButton, ElInput, ElFormItem } from 'element-plus'
import type { FieldPattern } from '@moluoxixi/shared'
setupElementPlus()
const MODE_OPTIONS = [{ label: '编辑态', value: 'editable' }, { label: '阅读态', value: 'readOnly' }, { label: '禁用态', value: 'disabled' }]
const mode = ref<FieldPattern>('editable')
const result = ref('')
const signatureData = ref('')
const canvasRef = ref<HTMLCanvasElement | null>(null)
let isDrawing = false
const form = useCreateForm({ initialValues: { signerName: '', signatureData: '' } })
onMounted(() => { form.createField({ name: 'signerName', label: '签名人', required: true }); form.createField({ name: 'signatureData', label: '签名' }) })
function getCtx(): CanvasRenderingContext2D | null { return canvasRef.value?.getContext('2d') ?? null }
function getPos(e: MouseEvent): { x: number; y: number } { const r = canvasRef.value!.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top } }
function startDraw(e: MouseEvent): void { if (mode.value === 'disabled') return; isDrawing = true; const ctx = getCtx(); if (!ctx) return; const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y) }
function drawing(e: MouseEvent): void { if (!isDrawing || mode.value === 'disabled') return; const ctx = getCtx(); if (!ctx) return; const p = getPos(e); ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = '#333'; ctx.lineTo(p.x, p.y); ctx.stroke() }
function endDraw(): void { if (!isDrawing) return; isDrawing = false; const c = canvasRef.value; if (c) { signatureData.value = c.toDataURL('image/png'); form.setFieldValue('signatureData', signatureData.value) } }
function clearCanvas(): void { const ctx = getCtx(); const c = canvasRef.value; if (ctx && c) { ctx.clearRect(0, 0, c.width, c.height); signatureData.value = ''; form.setFieldValue('signatureData', '') } }
async function handleSubmit(): Promise<void> { const res = await form.submit(); result.value = res.errors.length > 0 ? '验证失败: ' + res.errors.map(e => e.message).join(', ') : JSON.stringify({ ...res.values, signatureData: signatureData.value ? '[Base64]' : '' }, null, 2) }
</script>
