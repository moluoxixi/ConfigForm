<template>
  <div>
    <h2>?????</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      {{ fieldCount }} ??????????????????????????????    </p>

    <div style="display: flex; gap: 8px; margin-bottom: 16px;">
      <button
        v-for="n in [50, 100, 200]"
        :key="n"
        @click="fieldCount = n"
        :style="{
          padding: '4px 16px',
          border: fieldCount === n ? '1px solid #1677ff' : '1px solid #d9d9d9',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          background: fieldCount === n ? '#1677ff' : '#fff',
          color: fieldCount === n ? '#fff' : 'inherit',
        }"
      >{{ n }} ??</button>
      <span style="line-height: 32px; margin-left: 8px; color: #666; font-size: 13px;">
        ????: <b>{{ renderTime }}ms</b>
      </span>
    </div>

    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <ConfigForm
        :key="fieldCount"
        :schema="withMode(schema, mode)"
        @submit="showResult"
        @submit-failed="(e: any) => st?.showErrors(e)"
      />
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
/**
 * ?? 51???????Ant Design Vue?? *
 * ?????N ???? schema????????? * ????????????????????? */
import { computed, nextTick, ref, watch } from 'vue'
import { setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { ConfigForm } from '@moluoxixi/vue'
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'

setupAntdVue()

const st = ref<InstanceType<typeof StatusTabs>>()

const fieldCount = ref(50)
const renderTime = ref(0)

const schema = computed<ISchema>(() => {
  const properties: Record<string, ISchema> = {}
  for (let i = 0; i < fieldCount.value; i++) {
    const type = i % 4 === 0 ? 'number' : i % 4 === 1 ? 'boolean' : i % 4 === 2 ? 'date' : 'string'
    properties[`field_${i}`] = {
      type,
      title: `?? ${i + 1}`,
      default: type === 'number' ? 0 : type === 'boolean' ? false : '',
      ...(i % 10 === 0 ? { required: true } : {}),
    }
  }
  return {
    type: 'object',
    decoratorProps: { labelPosition: 'left', labelWidth: '100px', actions: { submit: '??', reset: '??' } },
    properties,
  }
})

watch(fieldCount, async () => {
  const start = performance.now()
  await nextTick()
  await nextTick()
  renderTime.value = Math.round(performance.now() - start)
}, { immediate: true })

/** ? mode ?? schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}
</script>
