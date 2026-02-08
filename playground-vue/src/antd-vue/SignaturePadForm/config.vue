<template>
  <div>
    <h2>手写签名板</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">Canvas 手写签名 / Base64 — ConfigForm + Schema 实现</p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <ConfigForm
        :schema="withMode(schema, mode)"
        :initial-values="initialValues"
        @submit="showResult"
        @submit-failed="(e: any) => st?.showErrors(e)"
      />
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'
import { setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { ConfigForm, registerComponent } from '@moluoxixi/vue'
/**
 * 手写签名板 — Config 模式
 *
 * 自定义 SignaturePad 组件注册后，在 schema 中通过 component: 'SignaturePad' 引用。
 */
import { defineComponent, h, ref } from 'vue'

setupAntdVue()

/** Canvas 签名板常量 */
const CANVAS_WIDTH = 500
const CANVAS_HEIGHT = 200

/** 签名板组件 */
const SignaturePad = defineComponent({
  name: 'SignaturePad',
  props: {
    modelValue: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const canvasRef = ref<HTMLCanvasElement | null>(null)
    let isDrawing = false
    function getCtx(): CanvasRenderingContext2D | null { return canvasRef.value?.getContext('2d') ?? null }
    function getPos(e: MouseEvent): { x: number; y: number } { const r = canvasRef.value!.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top } }
    function startDraw(e: MouseEvent): void { if (props.disabled) return; isDrawing = true; const ctx = getCtx(); if (!ctx) return; const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y) }
    function drawing(e: MouseEvent): void { if (!isDrawing || props.disabled) return; const ctx = getCtx(); if (!ctx) return; const p = getPos(e); ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = '#333'; ctx.lineTo(p.x, p.y); ctx.stroke() }
    function endDraw(): void { if (!isDrawing) return; isDrawing = false; const c = canvasRef.value; if (c) emit('update:modelValue', c.toDataURL('image/png')) }
    function clearCanvas(): void { const ctx = getCtx(); const c = canvasRef.value; if (ctx && c) { ctx.clearRect(0, 0, c.width, c.height); emit('update:modelValue', '') } }
    return () => {
      if (props.readonly) {
        if (props.modelValue) return h('img', { src: props.modelValue, alt: '签名', style: { border: '1px solid #d9d9d9', borderRadius: '8px', maxWidth: '500px' } })
        return h('span', { style: { color: '#999' } }, '暂无签名')
      }
      const children = [h('canvas', { ref: canvasRef, width: CANVAS_WIDTH, height: CANVAS_HEIGHT, style: { border: '1px solid #d9d9d9', borderRadius: '8px', cursor: props.disabled ? 'not-allowed' : 'crosshair', background: props.disabled ? '#f5f5f5' : '#fff', display: 'block' }, onMousedown: startDraw, onMousemove: drawing, onMouseup: endDraw, onMouseleave: endDraw })]
      if (!props.disabled) children.push(h('button', { style: { marginTop: '8px', padding: '2px 8px', fontSize: '13px', border: '1px solid #d9d9d9', borderRadius: '4px', background: '#fff', cursor: 'pointer' }, onClick: clearCanvas }, '清空签名'))
      return h('div', children)
    }
  },
})

registerComponent('SignaturePad', SignaturePad, { defaultWrapper: 'FormItem' })

const st = ref<InstanceType<typeof StatusTabs>>()

const initialValues = { signerName: '', signatureData: '' }

const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
  properties: {
    signerName: { type: 'string', title: '签名人', required: true, componentProps: { style: 'width: 300px' } },
    signatureData: { type: 'string', title: '手写签名', component: 'SignaturePad' },
  },
}

/** 将 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}
</script>
