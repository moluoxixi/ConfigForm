<template>
  <div>
    <h2>依赖数据源（Field 版）</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      品牌→型号→配置（三级远程数据源链） / 年级→班级 / 完整走 fetchDataSource 管线 - FormField + fieldProps 实现
    </p>
    <div style="padding: 8px 16px; margin-bottom: 12px; background: #e6f4ff; border: 1px solid #91caff; border-radius: 6px; font-size: 13px">
      使用核心库的 <b>registerRequestAdapter('mock')</b> + <b>DataSourceConfig</b> 驱动，
      所有 Select 选项通过 <code>field.loadDataSource({ url, params })</code> 远程加载（模拟 600ms 延迟）
    </div>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <form @submit.prevent="handleSubmit(showResult)" novalidate>
          <FormField name="brand" :field-props="{ label: '品牌', required: true, component: 'Select', dataSource: BRAND_OPTIONS, componentProps: { placeholder: '请选择品牌' } }" />
          <FormField name="model" :field-props="{ label: '型号', required: true, component: 'Select', componentProps: { placeholder: '请先选择品牌' } }" />
          <FormField name="config" :field-props="{ label: '配置', component: 'Select', componentProps: { placeholder: '请先选择型号' } }" />
          <FormField name="grade" :field-props="{ label: '年级', required: true, component: 'Select', dataSource: GRADE_OPTIONS, componentProps: { placeholder: '请选择年级' } }" />
          <FormField name="classNo" :field-props="{ label: '班级', required: true, component: 'Select', componentProps: { placeholder: '请先选择年级' } }" />
          <LayoutFormActions @reset="form.reset()" />
        </form>
      </FormProvider>
    </StatusTabs>

    <!-- API 调用日志 -->
    <div style="border: 1px solid #f0f0f0; border-radius: 8px; padding: 16px; margin-top: 16px; background: #f9f9f9">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px">
        <span style="font-size: 13px; color: #666">📡 Mock API 调用日志（{{ apiLogs.length }} 条）</span>
        <button v-if="apiLogs.length > 0" style="border: 1px solid #d9d9d9; background: #fff; padding: 2px 8px; border-radius: 4px; cursor: pointer; font-size: 12px" @click="onClearLogs">
          清空
        </button>
      </div>
      <div v-if="apiLogs.length === 0" style="color: #aaa; font-size: 12px">
        暂无请求，选择下拉触发远程加载
      </div>
      <div v-else style="font-family: monospace; font-size: 11px; line-height: 1.8; max-height: 200px; overflow: auto">
        <div v-for="(log, i) in apiLogs" :key="i" :style="{ color: log.includes('404') ? '#f5222d' : '#52c41a' }">
          {{ log }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { LayoutFormActions, setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
import { onBeforeUnmount, ref, watch } from 'vue'

import { clearApiLogs, getApiLogs, setupMockAdapter } from '../../mock/dataSourceAdapter'

setupAntdVue()
setupMockAdapter()

// ========== 数据 ==========

/** 品牌选项 */
const BRAND_OPTIONS = [
  { label: 'Apple', value: 'apple' },
  { label: '华为', value: 'huawei' },
  { label: '小米', value: 'xiaomi' },
]

/** 年级选项 */
const GRADE_OPTIONS = [
  { label: '一年级', value: 'grade1' },
  { label: '二年级', value: 'grade2' },
  { label: '三年级', value: 'grade3' },
]

// ========== 表单 ==========

const st = ref<InstanceType<typeof StatusTabs>>()

const form = useCreateForm({
  initialValues: { brand: undefined, model: undefined, config: undefined, grade: undefined, classNo: undefined },
})

// ========== 远程数据源级联 ==========

/** 品牌变化 → 远程加载型号列表 */
form.onFieldValueChange('brand', (value: unknown) => {
  const field = form.getField('model')
  if (!field) return
  field.setValue(undefined)
  if (!value) {
    field.setDataSource([])
    field.setComponentProps({ placeholder: '请先选择品牌' })
    return
  }
  field.setComponentProps({ placeholder: '加载中...' })
  field.loadDataSource({
    url: '/api/models',
    params: { brand: '$values.brand' },
    requestAdapter: 'mock',
    labelField: 'name',
    valueField: 'id',
  }).then(() => {
    const count = field.dataSource.length
    field.setComponentProps({ placeholder: `请选择型号（${count}项）` })
  })
})

/** 型号变化 → 远程加载配置列表 */
form.onFieldValueChange('model', (value: unknown) => {
  const field = form.getField('config')
  if (!field) return
  field.setValue(undefined)
  if (!value) {
    field.setDataSource([])
    field.setComponentProps({ placeholder: '请先选择型号' })
    return
  }
  field.setComponentProps({ placeholder: '加载中...' })
  field.loadDataSource({
    url: '/api/configs',
    params: { model: '$values.model' },
    requestAdapter: 'mock',
    labelField: 'name',
    valueField: 'id',
  }).then(() => {
    const count = field.dataSource.length
    field.setComponentProps({ placeholder: `请选择配置（${count}项）` })
  })
})

/** 年级变化 → 远程加载班级列表 */
form.onFieldValueChange('grade', (value: unknown) => {
  const field = form.getField('classNo')
  if (!field) return
  field.setValue(undefined)
  if (!value) {
    field.setDataSource([])
    field.setComponentProps({ placeholder: '请先选择年级' })
    return
  }
  field.setComponentProps({ placeholder: '加载中...' })
  field.loadDataSource({
    url: '/api/classes',
    params: { grade: '$values.grade' },
    requestAdapter: 'mock',
    labelField: 'name',
    valueField: 'id',
  }).then(() => {
    const count = field.dataSource.length
    field.setComponentProps({ placeholder: `请选择班级（${count}项）` })
  })
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

// ========== API 日志轮询 ==========

const apiLogs = ref<string[]>([])
const logTimer = setInterval(() => {
  apiLogs.value = [...getApiLogs()]
}, 500)

/** 清空日志 */
function onClearLogs(): void {
  clearApiLogs()
  apiLogs.value = []
}

onBeforeUnmount(() => {
  clearInterval(logTimer)
})
</script>
