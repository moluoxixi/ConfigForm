const fs = require('fs');
const path = require('path');

const BASE = path.join('playground-vue', 'src', 'antd-vue');

// ============================================================
// File 2: UndoRedoForm/field.vue
// ============================================================
fs.writeFileSync(path.join(BASE, 'UndoRedoForm', 'field.vue'), `<template>
  <div>
    <h2>撤销重做</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">undo/redo 操作栈 / Ctrl+Z 撤销 / Ctrl+Shift+Z 重做</p>
    <PlaygroundForm :form="form">
      <template #default="{ mode }">
        <!-- 撤销 / 重做控制栏 -->
        <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 16px">
          <button
            type="button"
            :disabled="!canUndo || mode !== 'editable'"
            @click="undo"
            style="padding: 4px 15px; border: 1px solid #d9d9d9; border-radius: 6px; background: #fff; cursor: pointer; font-size: 14px"
          >撤销 (Ctrl+Z)</button>
          <button
            type="button"
            :disabled="!canRedo || mode !== 'editable'"
            @click="redo"
            style="padding: 4px 15px; border: 1px solid #d9d9d9; border-radius: 6px; background: #fff; cursor: pointer; font-size: 14px"
          >重做 (Ctrl+Shift+Z)</button>
          <span style="display: inline-block; padding: 0 7px; font-size: 12px; line-height: 20px; border-radius: 4px; border: 1px solid #d9d9d9; background: #fafafa">
            历史：{{ historyIdx + 1 }} / {{ historyLen }}
          </span>
        </div>

        <!-- 表单字段：自动渲染模式 -->
        <FormField v-for="n in FIELDS" :key="n" :name="n" :field-props="fieldSchemas[n]" />
      </template>
    </PlaygroundForm>
  </div>
</template>

<script setup lang="ts">
/**
 * 场景：撤销重做 - Field 模式（Ant Design Vue）
 *
 * 演示表单级别的 undo / redo 操作栈：
 * - 每次值变化自动入栈（最多 50 条）
 * - 支持按钮撤销 / 重做
 * - 支持 Ctrl+Z / Ctrl+Shift+Z 快捷键
 */
import type { FieldProps } from '@moluoxixi/core'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { FormField, useCreateForm } from '@moluoxixi/vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import PlaygroundForm from '../../components/PlaygroundForm.vue'

setupAntdVue()

const FIELDS = ['title', 'category', 'amount', 'note'] as const

/** 最大历史记录条数 */
const MAX_HISTORY = 50

/**
 * 各字段的 schema 配置。
 * wrapper 默认为 'FormItem'，无需显式声明。
 */
const fieldSchemas: Record<string, Partial<FieldProps>> = {
  title: { label: '标题', required: true, component: 'Input' },
  category: { label: '分类', component: 'Input' },
  amount: { label: '金额', component: 'InputNumber', componentProps: { style: 'width: 100%' } },
  note: { label: '备注', component: 'Textarea', componentProps: { rows: 3 } },
}

const form = useCreateForm({ initialValues: { title: '', category: '', amount: 0, note: '' } })

/* ========== 撤销 / 重做状态 ========== */
const history = ref<Array<Record<string, unknown>>>([{ title: '', category: '', amount: 0, note: '' }])
const historyIdx = ref(0)
let isRestoring = false

const historyLen = computed((): number => history.value.length)
const canUndo = computed((): boolean => historyIdx.value > 0)
const canRedo = computed((): boolean => historyIdx.value < history.value.length - 1)

/* ========== 订阅值变化，自动入栈 ========== */
onMounted(() => {
  form.onValuesChange((v: Record<string, unknown>) => {
    if (isRestoring) return
    history.value = history.value.slice(0, historyIdx.value + 1)
    history.value.push({ ...v })
    if (history.value.length > MAX_HISTORY) history.value.shift()
    historyIdx.value = history.value.length - 1
  })
})

/** 撤销：回退到上一条历史记录 */
function undo(): void {
  if (historyIdx.value <= 0) return
  historyIdx.value--
  isRestoring = true
  form.setValues(history.value[historyIdx.value])
  isRestoring = false
}

/** 重做：前进到下一条历史记录 */
function redo(): void {
  if (historyIdx.value >= history.value.length - 1) return
  historyIdx.value++
  isRestoring = true
  form.setValues(history.value[historyIdx.value])
  isRestoring = false
}

/** 键盘快捷键监听 */
function onKeyDown(e: KeyboardEvent): void {
  if (e.ctrlKey && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
  if (e.ctrlKey && e.shiftKey && e.key === 'Z') { e.preventDefault(); redo() }
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
<\/script>
`, 'utf8');
console.log('UndoRedoForm written');

// ============================================================
// File 3: FormSnapshotForm/field.vue
// ============================================================
fs.writeFileSync(path.join(BASE, 'FormSnapshotForm', 'field.vue'), `<template>
  <div>
    <h2>表单快照</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">暂存草稿（localStorage） / 恢复草稿 / 多版本管理</p>
    <div style="display: flex; gap: 16px">
      <div style="flex: 1">
        <PlaygroundForm :form="form">
          <template #default="{ mode }">
            <FormField v-for="n in FIELDS" :key="n" :name="n" :field-props="fieldSchemas[n]" />
            <button
              v-if="mode === 'editable'"
              type="button"
              @click="saveDraft"
              style="margin-bottom: 8px; padding: 4px 15px; border: 1px solid #d9d9d9; border-radius: 6px; background: #fff; cursor: pointer; font-size: 14px"
            >暂存草稿</button>
          </template>
        </PlaygroundForm>
      </div>

      <!-- 草稿列表 -->
      <div style="width: 280px; border: 1px solid #f0f0f0; border-radius: 8px; overflow: hidden">
        <div style="padding: 8px 12px; background: #fafafa; border-bottom: 1px solid #f0f0f0; font-size: 14px; font-weight: 500">
          草稿列表 ({{ drafts.length }})
        </div>
        <div style="padding: 12px">
          <span v-if="!drafts.length" style="color: #999">暂无草稿</span>
          <div
            v-for="d in drafts"
            :key="d.id"
            style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0; border-bottom: 1px solid #f0f0f0"
          >
            <div>
              <div style="font-size: 13px">{{ d.label }}</div>
              <div style="font-size: 11px; color: #999">{{ new Date(d.ts).toLocaleString() }}</div>
            </div>
            <div style="display: flex; gap: 4px">
              <button
                type="button"
                @click="restoreDraft(d)"
                style="padding: 0 7px; font-size: 12px; border: 1px solid #d9d9d9; border-radius: 4px; background: #fff; cursor: pointer"
              >恢复</button>
              <button
                type="button"
                @click="deleteDraft(d.id)"
                style="padding: 0 7px; font-size: 12px; border: 1px solid #ff4d4f; border-radius: 4px; background: #fff; color: #ff4d4f; cursor: pointer"
              >删</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 场景：表单快照 - Field 模式（Ant Design Vue）
 *
 * 演示表单草稿的暂存与恢复：
 * - 暂存到 localStorage（最多 10 条）
 * - 支持恢复任意草稿
 * - 支持删除草稿
 */
import type { FieldProps } from '@moluoxixi/core'
import { ref } from 'vue'
import { FormField, useCreateForm } from '@moluoxixi/vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import PlaygroundForm from '../../components/PlaygroundForm.vue'

setupAntdVue()

const FIELDS = ['title', 'description', 'category', 'priority'] as const

/** localStorage 存储键 */
const STORAGE_KEY = 'vue-configform-drafts'

/** 最大草稿数量 */
const MAX_DRAFTS = 10

/**
 * 各字段的 schema 配置。
 * wrapper 默认为 'FormItem'，无需显式声明。
 */
const fieldSchemas: Record<string, Partial<FieldProps>> = {
  title: { label: '标题', required: true, component: 'Input' },
  description: { label: '描述', component: 'Textarea', componentProps: { rows: 3 } },
  category: { label: '分类', component: 'Input' },
  priority: { label: '优先级', component: 'Input' },
}

/** 草稿数据结构 */
interface Draft {
  id: string
  ts: number
  label: string
  values: Record<string, unknown>
}

/** 从 localStorage 加载草稿列表 */
function loadDrafts(): Draft[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') }
  catch { return [] }
}

/** 将草稿列表保存到 localStorage */
function saveDraftsToStorage(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts.value))
}

const drafts = ref<Draft[]>(loadDrafts())
const form = useCreateForm({ initialValues: { title: '', description: '', category: '', priority: '' } })

/** 暂存当前表单为草稿 */
function saveDraft(): void {
  const v = { ...form.values } as Record<string, unknown>
  drafts.value = [
    { id: String(Date.now()), ts: Date.now(), label: (v.title as string) || '未命名', values: v },
    ...drafts.value,
  ].slice(0, MAX_DRAFTS)
  saveDraftsToStorage()
}

/** 恢复指定草稿到表单 */
function restoreDraft(d: Draft): void {
  form.setValues(d.values)
}

/** 删除指定草稿 */
function deleteDraft(id: string): void {
  drafts.value = drafts.value.filter(d => d.id !== id)
  saveDraftsToStorage()
}
<\/script>
`, 'utf8');
console.log('FormSnapshotForm written');

// ============================================================
// File 4: LifecycleForm/field.vue
// ============================================================
fs.writeFileSync(path.join(BASE, 'LifecycleForm', 'field.vue'), `<template>
  <div>
    <h2>生命周期钩子</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">onMount / onChange / onSubmit / onReset / 自动保存</p>
    <div style="display: flex; gap: 16px">
      <div style="flex: 1">
        <PlaygroundForm :form="form">
          <template #default>
            <!-- 自动保存开关 -->
            <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 12px">
              <span>自动保存：</span>
              <label style="position: relative; display: inline-block; width: 44px; height: 22px; cursor: pointer">
                <input type="checkbox" v-model="autoSave" style="opacity: 0; width: 0; height: 0" />
                <span
                  :style="{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: autoSave ? '#1677ff' : '#ccc',
                    borderRadius: '11px', transition: 'background 0.3s',
                  }"
                >
                  <span
                    :style="{
                      position: 'absolute', top: '2px',
                      left: autoSave ? '24px' : '2px',
                      width: '18px', height: '18px',
                      background: '#fff', borderRadius: '50%',
                      transition: 'left 0.3s',
                    }"
                  />
                </span>
              </label>
            </div>

            <!-- 表单字段：自动渲染模式 -->
            <FormField v-for="n in FIELDS" :key="n" :name="n" :field-props="fieldSchemas[n]" />
          </template>
        </PlaygroundForm>
      </div>

      <!-- 事件日志面板 -->
      <div style="width: 360px; border: 1px solid #f0f0f0; border-radius: 8px; overflow: hidden">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #fafafa; border-bottom: 1px solid #f0f0f0">
          <span style="font-size: 14px; font-weight: 500">事件日志 ({{ logs.length }})</span>
          <button
            type="button"
            @click="logs = []"
            style="padding: 0 7px; font-size: 12px; border: 1px solid #d9d9d9; border-radius: 4px; background: #fff; cursor: pointer"
          >清空</button>
        </div>
        <div style="max-height: 400px; overflow: auto; padding: 8px 12px; font-size: 12px">
          <div v-for="log in logs" :key="log.id" style="padding: 2px 0; border-bottom: 1px solid #f0f0f0">
            <span
              :style="{
                display: 'inline-block', padding: '0 4px', fontSize: '10px', lineHeight: '18px',
                borderRadius: '3px', marginRight: '6px',
                background: typeColors[log.type]?.bg || '#f0f0f0',
                color: typeColors[log.type]?.fg || '#333',
              }"
            >{{ log.type }}</span>
            <span style="color: #999">{{ log.time }}</span>
            <div style="color: #555; margin-top: 2px">{{ log.message }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 场景：生命周期钩子 - Field 模式（Ant Design Vue）
 *
 * 演示表单的各种生命周期事件：
 * - onMount: 表单挂载
 * - onChange: 值变化
 * - auto-save: 自动保存到 localStorage（防抖 1.5s）
 */
import type { FieldProps } from '@moluoxixi/core'
import { ref, onMounted, onUnmounted } from 'vue'
import { FormField, useCreateForm } from '@moluoxixi/vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import PlaygroundForm from '../../components/PlaygroundForm.vue'

setupAntdVue()

const FIELDS = ['title', 'price', 'description'] as const

/** 自动保存防抖时间（毫秒） */
const AUTO_SAVE_DELAY = 1500

/**
 * 各字段的 schema 配置。
 * wrapper 默认为 'FormItem'，无需显式声明。
 */
const fieldSchemas: Record<string, Partial<FieldProps>> = {
  title: { label: '标题', required: true, component: 'Input' },
  price: { label: '价格', component: 'InputNumber', componentProps: { style: 'width: 100%' } },
  description: { label: '描述', component: 'Textarea', componentProps: { rows: 3 } },
}

/** 日志条目 */
interface Log {
  id: number
  time: string
  type: string
  message: string
}

/** 自动保存开关 */
const autoSave = ref(true)

/** 事件日志列表 */
const logs = ref<Log[]>([])
let logId = 0

/** 最大日志条数 */
const MAX_LOGS = 50

/** 各事件类型的显示颜色 */
const typeColors: Record<string, { bg: string; fg: string }> = {
  mount: { bg: '#f9f0ff', fg: '#722ed1' },
  change: { bg: '#e6f4ff', fg: '#1677ff' },
  submit: { bg: '#f6ffed', fg: '#52c41a' },
  reset: { bg: '#fff7e6', fg: '#fa8c16' },
  'auto-save': { bg: '#e6fffb', fg: '#13c2c2' },
}

/** 添加一条事件日志 */
function addLog(type: string, msg: string): void {
  logId++
  logs.value = [
    { id: logId, time: new Date().toLocaleTimeString(), type, message: msg },
    ...logs.value,
  ].slice(0, MAX_LOGS)
}

const form = useCreateForm({ initialValues: { title: '生命周期测试', price: 99, description: '' } })
let timer: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  addLog('mount', '表单已挂载')
  form.onValuesChange((v: Record<string, unknown>) => {
    addLog('change', \`值变化：\${JSON.stringify(v).slice(0, 80)}...\`)
    if (timer) clearTimeout(timer)
    if (autoSave.value) {
      timer = setTimeout(() => {
        addLog('auto-save', '自动保存到 localStorage')
        try { localStorage.setItem('vue-lifecycle-auto', JSON.stringify(v)) } catch { /* 忽略 */ }
      }, AUTO_SAVE_DELAY)
    }
  })
})

onUnmounted(() => { if (timer) clearTimeout(timer) })
<\/script>
`, 'utf8');
console.log('LifecycleForm written');

// ============================================================
// File 5: FormDiffForm/field.vue
// ============================================================
fs.writeFileSync(path.join(BASE, 'FormDiffForm', 'field.vue'), `<template>
  <div>
    <h2>表单比对</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">变更高亮 / 原始值 vs 当前值 / 变更摘要</p>
    <PlaygroundForm :form="form">
      <template #default>
        <!-- 变更摘要 -->
        <div style="margin-bottom: 16px; padding: 8px 12px; border: 1px solid #f0f0f0; border-radius: 8px">
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap">
            <span style="font-weight: 600">变更摘要：</span>
            <span
              v-if="changedFields.length === 0"
              style="display: inline-block; padding: 0 7px; font-size: 12px; line-height: 20px; border-radius: 4px; border: 1px solid #b7eb8f; background: #f6ffed; color: #52c41a"
            >无变更</span>
            <template v-else>
              <span style="display: inline-block; padding: 0 7px; font-size: 12px; line-height: 20px; border-radius: 4px; border: 1px solid #ffd591; background: #fff7e6; color: #fa8c16">
                {{ changedFields.length }} 个已修改
              </span>
              <span
                v-for="d in changedFields"
                :key="d.name"
                style="display: inline-block; padding: 0 7px; font-size: 12px; line-height: 20px; border-radius: 4px; border: 1px solid #ffa39e; background: #fff1f0; color: #ff4d4f"
              >{{ d.label }}</span>
            </template>
          </div>
        </div>

        <!-- 表单字段：自动渲染模式，变更行高亮包裹 -->
        <div
          v-for="d in FIELD_DEFS"
          :key="d.name"
          :style="isChanged(d.name) ? { background: '#fffbe6', padding: '4px 8px', borderRadius: '4px', marginBottom: '2px' } : { marginBottom: '2px' }"
        >
          <FormField :name="d.name" :field-props="getFieldProps(d)" />
        </div>
      </template>
    </PlaygroundForm>
  </div>
</template>

<script setup lang="ts">
/**
 * 场景：表单比对 - Field 模式（Ant Design Vue）
 *
 * 演示表单值的变更检测与高亮：
 * - 自动检测每个字段是否与原始值不同
 * - 变更字段行背景高亮
 * - 顶部变更摘要显示修改了哪些字段
 * - 变更字段的 description 显示原始值
 */
import type { FieldProps } from '@moluoxixi/core'
import { ref, computed, onMounted } from 'vue'
import { FormField, useCreateForm } from '@moluoxixi/vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import PlaygroundForm from '../../components/PlaygroundForm.vue'

setupAntdVue()

/** 字段类型到注册组件名的映射 */
const COMPONENT_MAP: Record<string, string> = {
  text: 'Input',
  number: 'InputNumber',
  textarea: 'Textarea',
}

/** 字段定义 */
interface FieldDef {
  name: string
  label: string
  type: string
}

const FIELD_DEFS: FieldDef[] = [
  { name: 'name', label: '姓名', type: 'text' },
  { name: 'email', label: '邮箱', type: 'text' },
  { name: 'phone', label: '电话', type: 'text' },
  { name: 'salary', label: '薪资', type: 'number' },
  { name: 'department', label: '部门', type: 'text' },
  { name: 'bio', label: '简介', type: 'textarea' },
]

/** 原始值（比对基准） */
const ORIGINAL: Record<string, unknown> = {
  name: '张三',
  email: 'zhangsan@company.com',
  phone: '13800138000',
  salary: 25000,
  department: '技术部',
  bio: '5 年前端经验',
}

const currentValues = ref<Record<string, unknown>>({ ...ORIGINAL })
const form = useCreateForm({ initialValues: { ...ORIGINAL } })

onMounted(() => {
  form.onValuesChange((v: Record<string, unknown>) => {
    currentValues.value = { ...v }
  })
})

/** 判断指定字段是否已修改 */
function isChanged(name: string): boolean {
  return String(ORIGINAL[name] ?? '') !== String(currentValues.value[name] ?? '')
}

/** 已修改的字段列表 */
const changedFields = computed(() => FIELD_DEFS.filter(d => isChanged(d.name)))

/**
 * 根据字段定义动态生成 fieldProps。
 * 变更的字段会在 description 中显示原始值。
 */
function getFieldProps(d: FieldDef): Partial<FieldProps> {
  const componentName = COMPONENT_MAP[d.type] || 'Input'
  const props: Partial<FieldProps> = {
    label: d.label,
    component: componentName,
  }
  /* InputNumber 需要宽度 100%，Textarea 需要行数 */
  if (d.type === 'number') {
    props.componentProps = { style: 'width: 100%' }
  } else if (d.type === 'textarea') {
    props.componentProps = { rows: 2 }
  }
  /* 变更字段显示原始值提示 */
  if (isChanged(d.name)) {
    props.description = \`原始值: \${String(ORIGINAL[d.name] ?? '—')}\`
  }
  return props
}
<\/script>
`, 'utf8');
console.log('FormDiffForm written');

console.log('All files written successfully!');
