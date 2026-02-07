<template>
  <div>
    <h2>分页搜索数据源</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      远程搜索 / 分页加载 / 防抖 300ms / 走 field.loadDataSource() 管线
    </p>
    <AAlert type="info" show-icon style="margin-bottom: 12px">
      <template #message>
        使用 <b>field.loadDataSource({ url: '/api/users', params })</b> 加载，
        共 1000 条模拟数据，每页 20 条，搜索防抖 300ms
      </template>
    </AAlert>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <FormField v-slot="{ field }" name="userId" :field-props="{ label: '选择用户', required: true }">
          <AFormItem label="选择用户" :required="field.required">
            <span v-if="mode === 'readOnly'">{{ getSelectedLabel(field) || '—' }}</span>
            <ASelect
              v-else
              :value="(field.value as string)"
              show-search
              :filter-option="false"
              @search="(kw: string) => handleSearch(field, kw)"
              @change="(v: string) => field.setValue(v)"
              :options="field.dataSource.map((d: any) => ({ label: d.label, value: d.value }))"
              :loading="field.loading"
              :disabled="mode === 'disabled'"
              style="width: 400px"
              :placeholder="field.loading ? '加载中...' : `输入关键词搜索（已加载 ${field.dataSource.length} / ${total} 条）`"
              @dropdownVisibleChange="(open: boolean) => { if (open && field.dataSource.length === 0) doLoad(field, '', 1) }"
            />
          </AFormItem>
        </FormField>

        <!-- 分页控制 -->
        <div v-if="mode === 'editable' && total > 0" style="margin-top: 8px; color: #999; font-size: 12px">
          <span>共 {{ total }} 条 · 第 {{ currentPage }}/{{ Math.ceil(total / 20) }} 页</span>
          <AButton v-if="hasMore" size="small" type="link" :loading="loadingMore" @click="loadMore">加载更多</AButton>
        </div>
        <div v-if="mode === 'editable'" style="margin-top: 16px; display: flex; gap: 8px">
          <button type="button" @click="handleSubmit(showResult)" style="padding: 4px 15px; background: #1677ff; color: #fff; border: none; border-radius: 6px; cursor: pointer">提交</button>
          <button type="button" @click="form.reset()" style="padding: 4px 15px; background: #fff; border: 1px solid #d9d9d9; border-radius: 6px; cursor: pointer">重置</button>
        </div>
      </FormProvider>
    </StatusTabs>

    <!-- API 调用日志 -->
    <ACard size="small" style="margin-top: 16px; background: #f9f9f9">
      <template #title>
        <span style="font-size: 13px; color: #666">📡 Mock API 调用日志（{{ apiLogs.length }} 条）</span>
        <AButton v-if="apiLogs.length > 0" size="small" style="float:right" @click="onClearLogs">清空</AButton>
      </template>
      <div v-if="apiLogs.length === 0" style="color: #aaa; font-size: 12px">暂无请求</div>
      <div v-else style="font-family: monospace; font-size: 11px; line-height: 1.8; max-height: 200px; overflow: auto">
        <div v-for="(log, i) in apiLogs" :key="i" style="color: #52c41a">{{ log }}</div>
      </div>
    </ACard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import type { FieldInstance } from '@moluoxixi/core'
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/vue'
import { setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { Alert as AAlert, Button as AButton, Card as ACard, FormItem as AFormItem, Select as ASelect } from 'ant-design-vue'
import type { FieldPattern } from '@moluoxixi/shared'
import { setupMockAdapter, getApiLogs, clearApiLogs } from '../../mock/dataSourceAdapter'

setupAntdVue()
setupMockAdapter()

const st = ref<InstanceType<typeof StatusTabs>>()
const form = useCreateForm({ initialValues: { userId: undefined } })

const total = ref(0)
const currentPage = ref(1)
const currentKeyword = ref('')
const loadingMore = ref(false)
const hasMore = computed(() => currentPage.value * 20 < total.value)

/** 获取已选用户的 label */
function getSelectedLabel(field: FieldInstance): string {
  const v = field.value as string
  if (!v) return ''
  const item = field.dataSource.find((d: any) => d.value === v)
  return item?.label ?? v
}

/** 通过核心库 loadDataSource 加载用户 */
async function doLoad(field: FieldInstance, keyword: string, page: number): Promise<void> {
  /* 暂存当前已有数据（追加模式用） */
  const existingItems = page > 1 ? [...field.dataSource] : []

  await field.loadDataSource({
    url: '/api/users',
    params: { keyword, page: String(page), pageSize: '20' },
    requestAdapter: 'mock',
    transform: (resp: any) => {
      total.value = resp.total ?? 0
      currentPage.value = resp.page ?? 1
      const items = (resp.items ?? []).map((u: any) => ({
        label: `${u.name}（${u.dept}）`,
        value: u.id,
      }))
      /* 追加模式 */
      return [...existingItems, ...items]
    },
  })
}

/** 搜索防抖 */
let timer: ReturnType<typeof setTimeout> | null = null
function handleSearch(field: FieldInstance, kw: string): void {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    currentKeyword.value = kw
    currentPage.value = 1
    doLoad(field, kw, 1)
  }, 300)
}

/** 加载更多（需要从 form 获取最新 field 引用） */
async function loadMore(): Promise<void> {
  const field = form.getField('userId')
  if (!field) return
  loadingMore.value = true
  await doLoad(field, currentKeyword.value, currentPage.value + 1)
  loadingMore.value = false
}

/** 初始加载：通过 form 获取字段引用 */
onMounted(() => {
  /* 等 FormField 创建字段后再加载 */
  setTimeout(() => {
    const field = form.getField('userId')
    if (field) doLoad(field, '', 1)
  }, 50)
})

/* API 日志轮询 */
const apiLogs = ref<string[]>([])
const logTimer = setInterval(() => { apiLogs.value = [...getApiLogs()] }, 500)
function onClearLogs(): void { clearApiLogs(); apiLogs.value = [] }
onBeforeUnmount(() => { clearInterval(logTimer); if (timer) clearTimeout(timer) })
watch(() => st.value?.mode, (v) => { if (v) form.pattern = v as FieldPattern }, { immediate: true })
async function handleSubmit(showResult: (data: Record<string, unknown>) => void): Promise<void> {
  const res = await form.submit()
  if (res.errors.length > 0) { st.value?.showErrors(res.errors) }
  else { showResult(res.values) }
}
</script>
