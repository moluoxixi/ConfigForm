<template>
  <div>
    <h2>手写签名板</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      Canvas 手写签名 / Base64 数据同步
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <form @submit.prevent="handleSubmit(showResult)" novalidate>
          <FormField name="signerName" :field-props="{ label: '签名人', required: true, component: 'Input', componentProps: { style: 'width: 300px' } }" />
          <FormField name="signatureData" :field-props="{ label: '手写签名', component: 'SignaturePad' }" />
          <LayoutFormActions @reset="form.reset()" />
        </form>
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { LayoutFormActions, setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider, registerComponent, useCreateForm } from '@moluoxixi/vue'
/**
 * 手写签名板表单 — Field 模式
 *
 * 自定义 SignaturePad 组件注册后，在 fieldProps 中通过 component: 'SignaturePad' 引用。
 * 编辑态提供 Canvas 手写签名 + 清空按钮；只读态展示 Base64 图片；禁用态禁止绘制。
 */
import { defineComponent, h, ref, watch } from 'vue'

setupAntdVue()

/** Canvas 签名板常量 */
const CANVAS_WIDTH = 500
const CANVAS_HEIGHT = 200

/**
 * Canvas 手写签名自定义组件
 *
 * - 编辑态：Canvas 画布 + 清空按钮
 * - 禁用态：禁用的 Canvas（不可绘制）
 * - 只读态：Base64 图片展示
 */
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

    /** 获取 Canvas 2D 上下文 */
    function getCtx(): CanvasRenderingContext2D | null {
      return canvasRef.value?.getContext('2d') ?? null
    }

    /** 获取鼠标相对 Canvas 的坐标 */
    function getPos(e: MouseEvent): { x: number; y: number } {
      const r = canvasRef.value!.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }

    /** 开始绘制 */
    function startDraw(e: MouseEvent): void {
      if (props.disabled) return
      isDrawing = true
      const ctx = getCtx()
      if (!ctx) return
      const p = getPos(e)
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
    }

    /** 绘制中 */
    function drawing(e: MouseEvent): void {
      if (!isDrawing || props.disabled) return
      const ctx = getCtx()
      if (!ctx) return
      const p = getPos(e)
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.strokeStyle = '#333'
      ctx.lineTo(p.x, p.y)
      ctx.stroke()
    }

    /** 结束绘制，输出 Base64 */
    function endDraw(): void {
      if (!isDrawing) return
      isDrawing = false
      const c = canvasRef.value
      if (c) {
        emit('update:modelValue', c.toDataURL('image/png'))
      }
    }

    /** 清空画布 */
    function clearCanvas(): void {
      const ctx = getCtx()
      const c = canvasRef.value
      if (ctx && c) {
        ctx.clearRect(0, 0, c.width, c.height)
        emit('update:modelValue', '')
      }
    }

    return () => {
      /* 只读态：显示签名图片或占位文字 */
      if (props.readonly) {
        if (props.modelValue) {
          return h('img', {
            src: props.modelValue,
            alt: '签名',
            style: { border: '1px solid #d9d9d9', borderRadius: '8px', maxWidth: '500px' },
          })
        }
        return h('span', { style: { color: '#999' } }, '暂无签名')
      }

      /* 编辑/禁用态：Canvas + 清空按钮 */
      const children = [
        h('canvas', {
          ref: canvasRef,
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          style: {
            border: '1px solid #d9d9d9',
            borderRadius: '8px',
            cursor: props.disabled ? 'not-allowed' : 'crosshair',
            background: props.disabled ? '#f5f5f5' : '#fff',
            display: 'block',
          },
          onMousedown: startDraw,
          onMousemove: drawing,
          onMouseup: endDraw,
          onMouseleave: endDraw,
        }),
      ]

      /* 编辑态显示清空按钮 */
      if (!props.disabled) {
        children.push(
          h('button', {
            type: 'button',
            style: { marginTop: '8px', padding: '2px 8px', border: '1px solid #d9d9d9', borderRadius: '4px', background: '#fff', cursor: 'pointer', fontSize: '12px' },
            onClick: clearCanvas,
          }, '清空签名'),
        )
      }

      return h('div', children)
    }
  },
})

registerComponent('SignaturePad', SignaturePad, { defaultWrapper: 'FormItem' })

const st = ref<InstanceType<typeof StatusTabs>>()

const form = useCreateForm({
  initialValues: { signerName: '', signatureData: '' },
})

/** 同步 StatusTabs 的 mode 到 form.pattern */
watch(() => st.value?.mode, (v) => {
  if (v)
    form.pattern = v as FieldPattern
}, { immediate: true })

/** 提交处理 */
async function handleSubmit(showResult: (data: Record<string, unknown>) => void): Promise<void> {
  const res = await form.submit()
  if (res.errors.length > 0) {
    st.value?.showErrors(res.errors)
  }
  else {
    showResult(res.values)
  }
}
</script>
