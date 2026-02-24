<template>
  <div>
    <canvas
      ref="canvasRef"
      width="400"
      height="150"
      :style="canvasStyle"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
    />
    <button
      type="button"
      :disabled="disabled || preview"
      :style="buttonStyle"
      @click="handleClear"
    >
      清除
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)

/**
 * renderCanvas?????????????????
 * ???`playground/vue/src/components/custom/SignaturePad.vue:6`?
 * ?????????????????????????????????
 * ??????????????????????????
 * @param value ?? value ????????????
 */
function renderCanvas(value?: string): void {
  const canvas = canvasRef.value
  if (!canvas)
    return
  const ctx = canvas.getContext('2d')
  if (!ctx)
    return
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  if (value) {
    const img = new Image()
    img.onload = () => ctx.drawImage(img, 0, 0)
    img.src = value
  }
  lastRenderedValue.value = value
}

onMounted(() => {
  renderCanvas(props.modelValue)
})

watch(
  () => props.modelValue,
  (value) => {
    if (isDrawing.value)
      return
    if (value === lastRenderedValue.value)
      return
    renderCanvas(value)
  },
)

/**
 * handle Mouse Down：当前功能模块的核心执行单元。
 * 所属模块：`playground/vue/src/components/custom/SignaturePad.vue`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param {MouseEvent} event 参数 `event`用于传递事件上下文，使逻辑能基于交互状态进行处理。
 */
function handleMouseDown(event: MouseEvent): void {
  if (props.disabled || props.preview)
    return
  const ctx = getContext()
  const canvas = canvasRef.value
  if (!ctx || !canvas)
    return
  isDrawing.value = true
  const rect = canvas.getBoundingClientRect()
  ctx.beginPath()
  ctx.moveTo(event.clientX - rect.left, event.clientY - rect.top)
}

/**
 * handle Mouse Move：当前功能模块的核心执行单元。
 * 所属模块：`playground/vue/src/components/custom/SignaturePad.vue`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param {MouseEvent} event 参数 `event`用于传递事件上下文，使逻辑能基于交互状态进行处理。
 */
function handleMouseMove(event: MouseEvent): void {
  if (!isDrawing.value || props.disabled || props.preview)
    return
  const ctx = getContext()
  const canvas = canvasRef.value
  if (!ctx || !canvas)
    return
  const rect = canvas.getBoundingClientRect()
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  ctx.strokeStyle = '#333'
  ctx.lineTo(event.clientX - rect.left, event.clientY - rect.top)
  ctx.stroke()
}

/**
 * handle Mouse Up：当前功能模块的核心执行单元。
 * 所属模块：`playground/vue/src/components/custom/SignaturePad.vue`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 */
function handleMouseUp(): void {
  if (!isDrawing.value)
    return
  isDrawing.value = false
  const canvas = canvasRef.value
  if (!canvas)
    return
  emit('update:modelValue', canvas.toDataURL('image/png'))
}

/**
 * handle Clear：当前功能模块的核心执行单元。
 * 所属模块：`playground/vue/src/components/custom/SignaturePad.vue`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 */
function handleClear(): void {
  const canvas = canvasRef.value
  if (!canvas)
    return
  const ctx = canvas.getContext('2d')
  if (!ctx)
    return
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  emit('update:modelValue', '')
}

/**
 * canvas Style：变量或常量声明。
 * 所属模块：`playground/vue/src/components/custom/SignaturePad.vue`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const canvasStyle = {
  border: '1px solid #d9d9d9',
  borderRadius: '6px',
  cursor: props.disabled || props.preview ? 'not-allowed' : 'crosshair',
  display: 'block',
  background: '#fff',
} as const

/**
 * button Style：变量或常量声明。
 * 所属模块：`playground/vue/src/components/custom/SignaturePad.vue`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const buttonStyle = {
  marginTop: '4px',
  padding: '2px 12px',
  fontSize: '12px',
  border: '1px solid #d9d9d9',
  borderRadius: '4px',
  background: '#fff',
  cursor: props.disabled || props.preview ? 'not-allowed' : 'pointer',
} as const
</script>
