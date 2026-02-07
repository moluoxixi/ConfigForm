<template>
  <div>
    <h2>手写签名板</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">Canvas 手写签名 / Base64 数据同步</p>
    <PlaygroundForm :form="form">
      <template #default="{ form: f, mode }">
        <FormField v-slot="{ field }" name="signerName"><AFormItem :label="field.label" :required="field.required"><AInput :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" :disabled="mode === 'disabled'" style="width: 300px" /></AFormItem></FormField>
        <AFormItem label="手写签名">
          <div v-if="mode === 'readOnly'">
            <img v-if="signatureData" :src="signatureData" alt="签名" style="border: 1px solid #d9d9d9; border-radius: 8px; max-width: 500px" />
            <span v-else style="color: #999">暂无签名</span>
          </div>
          <div v-else>
            <canvas ref="canvasRef" width="500" height="200" @mousedown="startDraw" @mousemove="drawing" @mouseup="endDraw" @mouseleave="endDraw" :style="{ border: '1px solid #d9d9d9', borderRadius: '8px', cursor: mode === 'disabled' ? 'not-allowed' : 'crosshair', background: mode === 'disabled' ? '#f5f5f5' : '#fff', display: 'block' }" />
            <AButton v-if="mode === 'editable'" size="small" style="margin-top: 8px" @click="clearCanvas">清空签名</AButton>
          </div>
        </AFormItem>
      </template>
    </PlaygroundForm>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FormField, useCreateForm } from '@moluoxixi/vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { Button as AButton, Input as AInput, FormItem as AFormItem } from 'ant-design-vue'
import PlaygroundForm from '../../components/PlaygroundForm.vue'
setupAntdVue()
const signatureData = ref('')
const canvasRef = ref<HTMLCanvasElement | null>(null)
let isDrawing = false
const form = useCreateForm({ initialValues: { signerName: '', signatureData: '' } })
onMounted(() => { form.createField({ name: 'signerName', label: '签名人', required: true }); form.createField({ name: 'signatureData', label: '签名' }) })
function getCtx(): CanvasRenderingContext2D | null { return canvasRef.value?.getContext('2d') ?? null }
function getPos(e: MouseEvent): { x: number; y: number } { const r = canvasRef.value!.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top } }
function startDraw(e: MouseEvent): void { if (form.pattern === 'disabled') return; isDrawing = true; const ctx = getCtx(); if (!ctx) return; const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y) }
function drawing(e: MouseEvent): void { if (!isDrawing || form.pattern === 'disabled') return; const ctx = getCtx(); if (!ctx) return; const p = getPos(e); ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = '#333'; ctx.lineTo(p.x, p.y); ctx.stroke() }
function endDraw(): void { if (!isDrawing) return; isDrawing = false; const c = canvasRef.value; if (c) { signatureData.value = c.toDataURL('image/png'); form.setFieldValue('signatureData', signatureData.value) } }
function clearCanvas(): void { const ctx = getCtx(); const c = canvasRef.value; if (ctx && c) { ctx.clearRect(0, 0, c.width, c.height); signatureData.value = ''; form.setFieldValue('signatureData', '') } }
</script>
