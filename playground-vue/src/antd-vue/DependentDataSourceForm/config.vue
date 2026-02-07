<template>
  <div>
    <h2>依赖数据源</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      品牌→型号→配置（三级远程数据源链） / 年级→班级 / 完整走 fetchDataSource 管线
    </p>
    <AAlert type="info" show-icon style="margin-bottom: 12px">
      <template #message>
        使用核心库的 <b>registerRequestAdapter('mock')</b> + <b>DataSourceConfig</b> 驱动，
        所有 Select 选项通过 <code>field.loadDataSource({ url, params })</code> 远程加载（模拟 600ms 延迟）
      </template>
    </AAlert>
    <PlaygroundForm :schema="schema" :initial-values="initialValues" />

    <!-- API 调用日志 -->
    <ACard size="small" style="margin-top: 16px; background: #f9f9f9">
      <template #title>
        <span style="font-size: 13px; color: #666">📡 Mock API 调用日志（{{ apiLogs.length }} 条）</span>
        <AButton v-if="apiLogs.length > 0" size="small" style="float:right" @click="onClearLogs">清空</AButton>
      </template>
      <div v-if="apiLogs.length === 0" style="color: #aaa; font-size: 12px">暂无请求，选择下拉触发远程加载</div>
      <div v-else style="font-family: monospace; font-size: 11px; line-height: 1.8; max-height: 200px; overflow: auto">
        <div v-for="(log, i) in apiLogs" :key="i" :style="{ color: log.includes('404') ? '#f5222d' : '#52c41a' }">{{ log }}</div>
      </div>
    </ACard>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { Alert as AAlert, Button as AButton, Card as ACard } from 'ant-design-vue'
import type { ISchema } from '@moluoxixi/schema'
import PlaygroundForm from '../../components/PlaygroundForm.vue'
import { setupMockAdapter, getApiLogs, clearApiLogs } from '../../mock/dataSourceAdapter'

setupAntdVue()
setupMockAdapter()

const initialValues = {
  brand: undefined,
  model: undefined,
  config: undefined,
  grade: undefined,
  classNo: undefined,
}

/**
 * Schema 定义：
 * - 型号的 reaction 使用 dataSource: { url, params, requestAdapter } 配置
 * - 核心库自动调用 field.loadDataSource() → fetchDataSource() → mock adapter
 * - params 中的 $values.brand 在运行时解析为当前品牌值
 */
const schema: ISchema = {
  type: 'object',
  decoratorProps: { actions: { submit: true, reset: true }, labelPosition: 'right', labelWidth: '140px' },
  properties: {
    brand: {
      type: 'string',
      title: '品牌',
      required: true,
      enum: [
        { label: 'Apple', value: 'apple' },
        { label: '华为', value: 'huawei' },
        { label: '小米', value: 'xiaomi' },
      ],
    },
    model: {
      type: 'string',
      title: '型号',
      required: true,
      component: 'Select',
      placeholder: '请先选择品牌',
      reactions: [{
        watch: 'brand',
        fulfill: {
          run: (f: any, ctx: any) => {
            const brand = ctx.values.brand
            f.setValue(undefined)
            if (!brand) {
              f.setDataSource([])
              f.setComponentProps({ placeholder: '请先选择品牌' })
              return
            }
            f.setComponentProps({ placeholder: '加载中...' })
            f.loadDataSource({
              url: '/api/models',
              params: { brand: '$values.brand' },
              requestAdapter: 'mock',
              labelField: 'name',
              valueField: 'id',
            }).then(() => {
              const count = f.dataSource.length
              f.setComponentProps({ placeholder: `请选择型号（${count}项）` })
            })
          },
        },
      }],
    },
    config: {
      type: 'string',
      title: '配置',
      component: 'Select',
      placeholder: '请先选择型号',
      reactions: [{
        watch: 'model',
        fulfill: {
          run: (f: any, ctx: any) => {
            const model = ctx.values.model
            f.setValue(undefined)
            if (!model) {
              f.setDataSource([])
              f.setComponentProps({ placeholder: '请先选择型号' })
              return
            }
            f.setComponentProps({ placeholder: '加载中...' })
            f.loadDataSource({
              url: '/api/configs',
              params: { model: '$values.model' },
              requestAdapter: 'mock',
              labelField: 'name',
              valueField: 'id',
            }).then(() => {
              const count = f.dataSource.length
              f.setComponentProps({ placeholder: `请选择配置（${count}项）` })
            })
          },
        },
      }],
    },
    grade: {
      type: 'string',
      title: '年级',
      required: true,
      enum: [
        { label: '一年级', value: 'grade1' },
        { label: '二年级', value: 'grade2' },
        { label: '三年级', value: 'grade3' },
      ],
    },
    classNo: {
      type: 'string',
      title: '班级',
      required: true,
      component: 'Select',
      placeholder: '请先选择年级',
      reactions: [{
        watch: 'grade',
        fulfill: {
          run: (f: any, ctx: any) => {
            const grade = ctx.values.grade
            f.setValue(undefined)
            if (!grade) {
              f.setDataSource([])
              f.setComponentProps({ placeholder: '请先选择年级' })
              return
            }
            f.setComponentProps({ placeholder: '加载中...' })
            f.loadDataSource({
              url: '/api/classes',
              params: { grade: '$values.grade' },
              requestAdapter: 'mock',
              labelField: 'name',
              valueField: 'id',
            }).then(() => {
              const count = f.dataSource.length
              f.setComponentProps({ placeholder: `请选择班级（${count}项）` })
            })
          },
        },
      }],
    },
  },
}

/* API 日志响应式轮询（每 500ms 刷新） */
const apiLogs = ref<string[]>([])
let logTimer: ReturnType<typeof setInterval> | null = null
logTimer = setInterval(() => { apiLogs.value = [...getApiLogs()] }, 500)
function onClearLogs(): void { clearApiLogs(); apiLogs.value = [] }

/* 组件卸载时清理 */
import { onBeforeUnmount } from 'vue'
onBeforeUnmount(() => { if (logTimer) clearInterval(logTimer) })
</script>
