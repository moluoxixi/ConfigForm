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

const props = defineProps<{
  modelValue?: string
  disabled?: boolean
  preview?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const isDrawing = ref(false)
const lastRenderedValue = ref<string | undefined>(undefined)

function getContext(): CanvasRenderingContext2D | null {
  return canvasRef.value?.getContext('2d') ?? null
}

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

function handleMouseUp(): void {
  if (!isDrawing.value)
    return
  isDrawing.value = false
  const canvas = canvasRef.value
  if (!canvas)
    return
  emit('update:modelValue', canvas.toDataURL('image/png'))
}

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

const canvasStyle = {
  border: '1px solid #d9d9d9',
  borderRadius: '6px',
  cursor: props.disabled || props.preview ? 'not-allowed' : 'crosshair',
  display: 'block',
  background: '#fff',
} as const

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
