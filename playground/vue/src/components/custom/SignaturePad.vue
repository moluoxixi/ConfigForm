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

/**
 * get Context：负责“获取get Context”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 get Context 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function getContext(): CanvasRenderingContext2D | null {
  return canvasRef.value?.getContext('2d') ?? null
}

/**
 * render Canvas：负责“渲染render Canvas”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 render Canvas 的主要职责边界，便于维护者快速理解函数在链路中的定位。
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
 * handle Mouse Down：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 handle Mouse Down 的单一职责，调用方可通过函数名快速理解输入输出语义。
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
 * handle Mouse Move：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 handle Mouse Move 的单一职责，调用方可通过函数名快速理解输入输出语义。
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
 * handle Mouse Up：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 handle Mouse Up 的单一职责，调用方可通过函数名快速理解输入输出语义。
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
 * handle Clear：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 handle Clear 的单一职责，调用方可通过函数名快速理解输入输出语义。
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
