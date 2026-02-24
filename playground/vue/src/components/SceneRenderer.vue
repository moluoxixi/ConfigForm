<template>
  <div style="height: 100%; min-height: 0; display: flex; flex-direction: column;">
    <h2>{{ props.title ?? props.config.title }}</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      {{ props.description ?? props.config.description }}
    </p>

    <slot name="header-extra" />

    <!-- Schema 变体切换器（如布局切换） -->
    <div v-if="props.config.schemaVariants" style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
      <span style="font-size: 13px; font-weight: 600; color: #555;">{{ props.config.schemaVariants.label }}：</span>
      <div style="display: flex; gap: 4px;">
        <button
          v-for="opt in props.config.schemaVariants.options" :key="opt.value"
          :style="{
            padding: '4px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
            border: variantValue === opt.value ? '2px solid #1677ff' : '1px solid #d9d9d9',
            background: variantValue === opt.value ? '#e6f4ff' : '#fff',
            color: variantValue === opt.value ? '#1677ff' : '#333',
          }"
          @click="variantValue = opt.value"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <div style="flex: 1; min-height: 0; display: flex; flex-direction: column;">
      <component :is="props.statusTabs" ref="st" v-slot="{ mode, showResult }">
        <div data-configform-print-root="true" style="flex: 1; min-height: 0; display: flex; flex-direction: column;">
          <ConfigForm
            :schema="currentSchema"
            :pattern="mode"
            :initial-values="props.config.initialValues"
            :effects="props.config.effects"
            :plugins="resolvedPlugins"
            @submit="showResult"
            @submit-failed="(e: any) => st?.showErrors(e)"
            @reset="() => clearStatus()"
          />
        </div>
      </component>
    </div>
  </div>
</template>

<script setup lang="ts">
const st = ref<{
  mode?: FieldPattern | { value?: FieldPattern }
  showErrors?: (error: unknown) => void
} | null>(null)

const resolvedPlugins = computed(() => [
  ...(props.config.plugins ?? []),
  ...(props.extraPlugins ?? []),
  devTools,
])

/** 当前使用的 schema（有变体时动态生成，否则使用静态 schema） */
const currentSchema = computed<ISchema>(() => {
  return resolveSceneSchema(props.config, variantValue.value)
})

/**
 * read Mode Value：封装该模块的核心渲染与交互逻辑。
 * 所属模块：`playground/vue/src/components/SceneRenderer.vue`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @returns {FieldPattern | undefined} 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
function readModeValue(): FieldPattern | undefined {
  const mode = st.value?.mode
  if (mode && typeof mode === 'object' && 'value' in mode)
    return mode.value
  return typeof mode === 'string' ? mode : undefined
}

watch(readModeValue, () => {
  clearStatus()
})
</script>
