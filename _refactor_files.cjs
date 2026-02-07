// Helper script to write all refactored Vue files
const fs = require('fs');
const path = require('path');

const BASE = 'd:/project/companyProject/transen/ConfigForm/playground-vue/src/antd-vue';

const files = {};

// PermissionForm/field.vue
files['PermissionForm/field.vue'] = `<template>
  <div>
    <h2>字段级权限控制</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      基于角色的字段可见性 + 读写权限矩阵
    </p>
    <PlaygroundForm :form="form">
      <template #default>
        <!-- 角色选择 -->
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px">
          <span style="font-weight: 600">当前角色：</span>
          <ASegmented v-model:value="role" :options="ROLE_OPTIONS" />
        </div>
        <!-- 权限矩阵展示 -->
        <div style="border: 1px solid #f0f0f0; border-radius: 8px; padding: 16px; margin-bottom: 16px">
          <span style="font-weight: 600">权限矩阵（当前角色：{{ role }}）</span>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px">
            <span
              v-for="d in FIELD_DEFS" :key="d.name"
              :style="getPermTagStyle(PERM_MATRIX[d.name]?.[role] ?? 'hidden')"
            >
              {{ d.label }}: {{ PERM_MATRIX[d.name]?.[role] ?? 'hidden' }}
            </span>
          </div>
        </div>
        <!-- 表单字段：组件类型通过 fieldProps 声明，权限由 watcher 动态控制 -->
        <FormField
          v-for="d in FIELD_DEFS" :key="d.name" :name="d.name"
          :field-props="{ label: d.label, component: d.component, componentProps: d.componentProps }"
        />
      </template>
    </PlaygroundForm>
  </div>
</template>

<script setup lang="ts">
/**
 * 字段级权限控制 - Field 模式
 *
 * 基于角色的字段可见性 + 读写权限矩阵。
 * 通过 FormField fieldProps 声明组件类型，watcher 动态控制字段的 visible 和 pattern。
 */
import { ref, watch, onMounted } from 'vue'
import { FormField, useCreateForm } from '@moluoxixi/vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { Segmented as ASegmented } from 'ant-design-vue'
import type { FieldPattern } from '@moluoxixi/shared'
import PlaygroundForm from '../../components/PlaygroundForm.vue'

setupAntdVue()

type Role = 'admin' | 'manager' | 'staff' | 'guest'
const role = ref<Role>('admin')

/** 角色选项 */
const ROLE_OPTIONS = [
  { label: '管理员', value: 'admin' },
  { label: '经理', value: 'manager' },
  { label: '员工', value: 'staff' },
  { label: '访客', value: 'guest' },
]

/** 字段定义（含组件类型映射） */
interface FieldDef {
  name: string
  label: string
  component: string
  componentProps?: Record<string, unknown>
}

const FIELD_DEFS: FieldDef[] = [
  { name: 'name', label: '姓名', component: 'Input' },
  { name: 'email', label: '邮箱', component: 'Input' },
  { name: 'salary', label: '薪资', component: 'InputNumber', componentProps: { style: 'width: 100%' } },
  { name: 'department', label: '部门', component: 'Input' },
  { name: 'level', label: '职级', component: 'Input' },
  { name: 'remark', label: '备注', component: 'Textarea' },
]

/** 角色-字段权限矩阵 */
const PERM_MATRIX: Record<string, Record<Role, string>> = {
  name: { admin: 'editable', manager: 'editable', staff: 'editable', guest: 'readOnly' },
  email: { admin: 'editable', manager: 'editable', staff: 'readOnly', guest: 'hidden' },
  salary: { admin: 'editable', manager: 'readOnly', staff: 'hidden', guest: 'hidden' },
  department: { admin: 'editable', manager: 'editable', staff: 'readOnly', guest: 'readOnly' },
  level: { admin: 'editable', manager: 'readOnly', staff: 'hidden', guest: 'hidden' },
  remark: { admin: 'editable', manager: 'editable', staff: 'editable', guest: 'hidden' },
}

const form = useCreateForm({
  initialValues: {
    name: '张三', email: 'zhangsan@company.com', salary: 25000,
    department: '技术部', level: 'P7', remark: '',
  },
})

/** 应用角色权限到各字段（可见性 + 读写模式） */
function applyPermissions(): void {
  FIELD_DEFS.forEach(d => {
    const f = form.getField(d.name)
    if (!f) return
    const perm = PERM_MATRIX[d.name]?.[role.value] ?? 'hidden'
    f.visible = perm !== 'hidden'
    if (form.pattern === 'editable') {
      f.pattern = (perm === 'readOnly' ? 'readOnly' : 'editable') as FieldPattern
    } else {
      f.pattern = form.pattern
    }
  })
}

/** 初始挂载后应用权限（确保 FormField 已创建字段） */
onMounted(() => { applyPermissions() })

/** 角色或表单模式变化时重新应用权限 */
watch([role, () => form.pattern], () => { applyPermissions() })

/** 获取权限标签的内联样式 */
function getPermTagStyle(perm: string): Record<string, string> {
  const colorMap: Record<string, { bg: string; fg: string; border: string }> = {
    editable: { bg: '#f6ffed', fg: '#52c41a', border: '#b7eb8f' },
    readOnly: { bg: '#fff7e6', fg: '#fa8c16', border: '#ffd591' },
    hidden: { bg: '#fff1f0', fg: '#f5222d', border: '#ffa39e' },
  }
  const c = colorMap[perm] ?? colorMap.hidden
  return {
    padding: '0 8px',
    borderRadius: '4px',
    fontSize: '12px',
    lineHeight: '22px',
    display: 'inline-block',
    background: c.bg,
    color: c.fg,
    border: \`1px solid \${c.border}\`,
  }
}
</script>
`;

// I18nForm/field.vue
files['I18nForm/field.vue'] = `<template>
  <div>
    <h2>国际化（i18n）</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      多语言标签 / 验证消息国际化 / placeholder 国际化
    </p>
    <PlaygroundForm :form="form">
      <template #default>
        <ASegmented v-model:value="locale" :options="LOCALE_OPTIONS" style="margin-bottom: 16px" />
        <FormField
          v-for="key in FIELD_NAMES" :key="key"
          :name="key" :field-props="fieldSchemas[key]"
        />
      </template>
    </PlaygroundForm>
  </div>
</template>

<script setup lang="ts">
/**
 * 国际化（i18n） - Field 模式
 *
 * 多语言标签 / 验证消息 / placeholder 随语言切换自动更新。
 * 使用 computed fieldSchemas 响应 locale 变化，FormField 自动应用最新配置。
 */
import { ref, computed } from 'vue'
import type { FieldProps } from '@moluoxixi/core'
import { FormField, useCreateForm } from '@moluoxixi/vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { Segmented as ASegmented } from 'ant-design-vue'
import PlaygroundForm from '../../components/PlaygroundForm.vue'

setupAntdVue()

type Locale = 'zh-CN' | 'en-US' | 'ja-JP'
const locale = ref<Locale>('zh-CN')

/** 语言选项 */
const LOCALE_OPTIONS = [
  { label: '🇨🇳 中文', value: 'zh-CN' },
  { label: '🇺🇸 English', value: 'en-US' },
  { label: '🇯🇵 日本語', value: 'ja-JP' },
]

/** 字段名列表 */
const FIELD_NAMES = ['name', 'email', 'phone', 'bio'] as const

/** 多语言翻译映射 */
const I18N: Record<Locale, Record<string, string>> = {
  'zh-CN': {
    'field.name': '姓名', 'field.name.placeholder': '请输入姓名', 'field.name.required': '姓名为必填项',
    'field.email': '邮箱', 'field.email.placeholder': '请输入邮箱', 'field.email.invalid': '无效邮箱',
    'field.phone': '手机号', 'field.phone.placeholder': '请输入手机号',
    'field.bio': '简介', 'field.bio.placeholder': '请输入简介',
  },
  'en-US': {
    'field.name': 'Name', 'field.name.placeholder': 'Enter name', 'field.name.required': 'Name is required',
    'field.email': 'Email', 'field.email.placeholder': 'Enter email', 'field.email.invalid': 'Invalid email',
    'field.phone': 'Phone', 'field.phone.placeholder': 'Enter phone',
    'field.bio': 'Bio', 'field.bio.placeholder': 'Tell us about yourself',
  },
  'ja-JP': {
    'field.name': '名前', 'field.name.placeholder': '名前を入力', 'field.name.required': '名前は必須',
    'field.email': 'メール', 'field.email.placeholder': 'メールを入力', 'field.email.invalid': '無効なメール',
    'field.phone': '電話', 'field.phone.placeholder': '電話番号を入力',
    'field.bio': '自己紹介', 'field.bio.placeholder': '自己紹介を入力',
  },
}

/** 翻译函数 */
function t(key: string): string { return I18N[locale.value]?.[key] ?? key }

/** 响应式字段 schema，随语言切换自动更新标签、placeholder、校验消息 */
const fieldSchemas = computed<Record<string, Partial<FieldProps>>>(() => ({
  name: {
    label: t('field.name'), component: 'Input', required: true,
    rules: [{ required: true, message: t('field.name.required') }],
    componentProps: { placeholder: t('field.name.placeholder') },
  },
  email: {
    label: t('field.email'), component: 'Input',
    rules: [{ format: 'email', message: t('field.email.invalid') }],
    componentProps: { placeholder: t('field.email.placeholder') },
  },
  phone: {
    label: t('field.phone'), component: 'Input',
    componentProps: { placeholder: t('field.phone.placeholder') },
  },
  bio: {
    label: t('field.bio'), component: 'Textarea',
    componentProps: { placeholder: t('field.bio.placeholder'), rows: 3 },
  },
}))

const form = useCreateForm({
  initialValues: { name: '', email: '', phone: '', bio: '' },
})
</script>
`;

// PrintExportForm/field.vue
files['PrintExportForm/field.vue'] = `<template>
  <div>
    <h2>打印、导出</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      打印预览 / 导出 JSON / 导出 CSV
    </p>
    <PlaygroundForm :form="form">
      <template #default>
        <div style="display: flex; gap: 8px; margin-bottom: 16px">
          <AButton @click="handlePrint">打印</AButton>
          <AButton @click="exportJson">导出 JSON</AButton>
          <AButton @click="exportCsv">导出 CSV</AButton>
        </div>
        <FormField
          v-for="d in FIELDS" :key="d.name" :name="d.name"
          :field-props="{ label: d.label, component: d.component, componentProps: d.componentProps }"
        />
      </template>
    </PlaygroundForm>
  </div>
</template>

<script setup lang="ts">
/**
 * 打印、导出 - Field 模式
 *
 * 打印预览 / 导出 JSON / 导出 CSV。
 * 字段通过 FormField fieldProps 声明式渲染，打印和导出直接读取表单值。
 */
import { FormField, useCreateForm } from '@moluoxixi/vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { Button as AButton } from 'ant-design-vue'
import PlaygroundForm from '../../components/PlaygroundForm.vue'

setupAntdVue()

/** 字段定义 */
interface FieldDef {
  name: string
  label: string
  component: string
  componentProps?: Record<string, unknown>
}

const FIELDS: FieldDef[] = [
  { name: 'orderNo', label: '订单号', component: 'Input' },
  { name: 'customer', label: '客户', component: 'Input' },
  { name: 'amount', label: '金额', component: 'InputNumber', componentProps: { style: 'width: 100%' } },
  { name: 'date', label: '日期', component: 'Input' },
  { name: 'address', label: '地址', component: 'Input' },
  { name: 'remark', label: '备注', component: 'Textarea', componentProps: { rows: 2 } },
]

const form = useCreateForm({
  initialValues: {
    orderNo: 'ORD-20260207-001', customer: '张三', amount: 9999,
    date: '2026-02-07', address: '北京市朝阳区', remark: '加急处理',
  },
})

/** 下载文件的工具函数 */
function downloadFile(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/** 打印预览：新开窗口生成表格并调用浏览器打印 */
function handlePrint(): void {
  const w = window.open('', '_blank')
  if (!w) return
  const rows = FIELDS.map(d =>
    \`<tr><th>\${d.label}</th><td>\${String(form.getFieldValue(d.name) ?? '')}</td></tr>\`,
  ).join('')
  w.document.write(
    \`<html><head><title>打印</title><style>body{font-family:system-ui;padding:20px}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body><h2>表单数据</h2><table>\${rows}</table></body></html>\`,
  )
  w.document.close()
  w.print()
}

/** 导出 JSON 文件 */
function exportJson(): void {
  const data: Record<string, unknown> = {}
  FIELDS.forEach(d => { data[d.name] = form.getFieldValue(d.name) })
  downloadFile(JSON.stringify(data, null, 2), 'form-data.json', 'application/json')
}

/** 导出 CSV 文件（含 BOM 头以兼容 Excel） */
function exportCsv(): void {
  const header = FIELDS.map(d => d.label).join(',')
  const values = FIELDS.map(d =>
    \`"\${String(form.getFieldValue(d.name) ?? '').replace(/"/g, '""')}"\`,
  ).join(',')
  downloadFile(\`\\uFEFF\${header}\\n\${values}\`, 'form-data.csv', 'text/csv;charset=utf-8')
}
</script>
`;

// MarkdownEditorForm/field.vue
files['MarkdownEditorForm/field.vue'] = `<template>
  <div>
    <h2>Markdown 编辑器</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      Markdown 编写 + 实时预览（可接入 md-editor-v3）
    </p>
    <PlaygroundForm :form="form">
      <template #default>
        <FormField name="docTitle" :field-props="{ label: '文档标题', component: 'Input', required: true }" />
        <FormField
          name="content" :field-props="{ label: 'Markdown', required: true }"
          v-slot="{ field, isReadOnly, isDisabled }"
        >
          <!-- 编辑模式：左右分栏（编辑区 + 预览区） -->
          <div v-if="!isReadOnly && !isDisabled" style="display: flex; gap: 16px">
            <div style="flex: 1">
              <div style="font-size: 12px; color: #999; margin-bottom: 4px">编辑区</div>
              <textarea
                :value="(field.value as string) ?? ''"
                @input="field.setValue(($event.target as HTMLTextAreaElement).value)"
                rows="16"
                style="width: 100%; font-family: Consolas, Monaco, monospace; font-size: 13px; padding: 8px; border: 1px solid #d9d9d9; border-radius: 6px; resize: vertical; box-sizing: border-box"
              />
            </div>
            <div style="flex: 1">
              <div style="font-size: 12px; color: #999; margin-bottom: 4px">预览区</div>
              <div
                style="border: 1px solid #d9d9d9; border-radius: 6px; padding: 12px; min-height: 380px; overflow: auto; background: #fafafa"
                v-html="simpleRender((field.value as string) ?? '')"
              />
            </div>
          </div>
          <!-- 只读/禁用模式：仅显示预览 -->
          <div
            v-else
            style="border: 1px solid #d9d9d9; border-radius: 6px; padding: 16px; background: #fafafa"
            :style="{ opacity: isDisabled ? 0.6 : 1 }"
            v-html="simpleRender((field.value as string) ?? '')"
          />
        </FormField>
      </template>
    </PlaygroundForm>
  </div>
</template>

<script setup lang="ts">
/**
 * Markdown 编辑器 - Field 模式
 *
 * 文档标题通过 fieldProps 声明式渲染，
 * Markdown 内容使用 v-slot 自定义分栏编辑 + 实时预览布局。
 */
import { FormField, useCreateForm } from '@moluoxixi/vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import PlaygroundForm from '../../components/PlaygroundForm.vue'

setupAntdVue()

const DEFAULT_MD = '# 标题\\n\\n## 二级标题\\n\\n这是**加粗**文字，支持*斜体*和\\\`行内代码\\\`。\\n\\n- 列表项 1\\n- 列表项 2\\n\\n> 引用文字'

const form = useCreateForm({
  initialValues: { docTitle: '使用指南', content: DEFAULT_MD },
})

/** 简易 Markdown → HTML 渲染 */
function simpleRender(md: string): string {
  return md
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')
    .replace(/\\*(.*?)\\*/g, '<em>$1</em>')
    .replace(/\\\`([^\\\`]+)\\\`/g, '<code style="background:#f0f0f0;padding:2px 4px;border-radius:3px">$1</code>')
    .replace(/^> (.*$)/gm, '<blockquote style="border-left:3px solid #ddd;padding-left:12px;color:#666">$1</blockquote>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/\\n/g, '<br/>')
}
</script>
`;

// TransferForm/field.vue
files['TransferForm/field.vue'] = `<template>
  <div>
    <h2>穿梭框</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      antd Transfer / 权限分配 / 搜索过滤
    </p>
    <PlaygroundForm :form="form">
      <template #default>
        <FormField
          name="roleName"
          :field-props="{ label: '角色名称', component: 'Input', required: true, componentProps: { style: 'width: 300px' } }"
        />
        <FormField
          name="permissions" :field-props="{ label: '权限分配', required: true }"
          v-slot="{ field, isReadOnly, isDisabled }"
        >
          <!-- 只读模式：显示已选权限标签 -->
          <div v-if="isReadOnly" style="display: flex; flex-wrap: wrap; gap: 4px">
            <span
              v-for="k in ((field.value as string[]) ?? [])" :key="k"
              style="padding: 0 8px; border-radius: 4px; font-size: 12px; line-height: 22px; display: inline-block; background: #e6f4ff; color: #1677ff; border: 1px solid #91caff"
            >
              {{ PERMISSIONS.find(p => p.key === k)?.title ?? k }}
            </span>
          </div>
          <!-- 编辑模式：穿梭框 -->
          <ATransfer
            v-else
            :data-source="PERMISSIONS"
            :target-keys="(field.value as string[]) ?? []"
            :render="(item: any) => item.title"
            show-search
            :list-style="{ width: '320px', height: '340px' }"
            :titles="['可选权限', '已选权限']"
            :disabled="isDisabled"
            :filter-option="(input: string, item: any) => item.title.includes(input)"
            @change="(keys: string[]) => field.setValue(keys)"
          />
        </FormField>
      </template>
    </PlaygroundForm>
  </div>
</template>

<script setup lang="ts">
/**
 * 穿梭框 - Field 模式
 *
 * 角色名称通过 fieldProps 声明式渲染，
 * 权限分配通过 v-slot 自定义渲染 antd Transfer 组件。
 */
import { FormField, useCreateForm } from '@moluoxixi/vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { Transfer as ATransfer } from 'ant-design-vue'
import PlaygroundForm from '../../components/PlaygroundForm.vue'

setupAntdVue()

/** 权限数据源（20 条模拟权限） */
const PERMISSIONS = Array.from({ length: 20 }, (_, i) => ({
  key: \`perm-\${i + 1}\`,
  title: \`权限\${String(i + 1).padStart(2, '0')} - \${['查看', '编辑', '删除', '审核', '导出'][i % 5]}\${['用户', '订单', '商品', '报表'][Math.floor(i / 5)]}\`,
}))

const form = useCreateForm({
  initialValues: {
    roleName: '管理员',
    permissions: ['perm-1', 'perm-3', 'perm-5'],
  },
})
</script>
`;

// TreeSelectForm/field.vue
files['TreeSelectForm/field.vue'] = `<template>
  <div>
    <h2>树形选择</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      antd TreeSelect / 单选+多选 / 组织树结构
    </p>
    <PlaygroundForm :form="form">
      <template #default>
        <FormField
          name="memberName"
          :field-props="{ label: '成员姓名', component: 'Input', required: true }"
        />
        <!-- 单选树：所属部门 -->
        <FormField
          name="department" :field-props="{ label: '所属部门', required: true }"
          v-slot="{ field, isReadOnly, isDisabled }"
        >
          <span
            v-if="isReadOnly"
            style="padding: 0 8px; border-radius: 4px; font-size: 12px; line-height: 22px; display: inline-block; background: #e6f4ff; color: #1677ff; border: 1px solid #91caff"
          >
            {{ field.value ?? '—' }}
          </span>
          <ATreeSelect
            v-else
            :value="(field.value as string)"
            @change="(v: string) => field.setValue(v)"
            :tree-data="TREE"
            placeholder="请选择部门"
            style="width: 300px"
            tree-default-expand-all
            :disabled="isDisabled"
          />
        </FormField>
        <!-- 多选树：可访问部门 -->
        <FormField
          name="accessDepts" :field-props="{ label: '可访问部门' }"
          v-slot="{ field, isReadOnly, isDisabled }"
        >
          <div v-if="isReadOnly" style="display: flex; flex-wrap: wrap; gap: 4px">
            <span
              v-for="v in ((field.value as string[]) ?? [])" :key="v"
              style="padding: 0 8px; border-radius: 4px; font-size: 12px; line-height: 22px; display: inline-block; background: #f6ffed; color: #52c41a; border: 1px solid #b7eb8f"
            >
              {{ v }}
            </span>
          </div>
          <ATreeSelect
            v-else
            :value="(field.value as string[]) ?? []"
            @change="(v: string[]) => field.setValue(v)"
            :tree-data="TREE"
            placeholder="多选可访问部门"
            style="width: 100%"
            tree-default-expand-all
            tree-checkable
            :disabled="isDisabled"
          />
        </FormField>
      </template>
    </PlaygroundForm>
  </div>
</template>

<script setup lang="ts">
/**
 * 树形选择 - Field 模式
 *
 * 成员姓名通过 fieldProps 声明式渲染，
 * 部门选择通过 v-slot 自定义渲染 antd TreeSelect（单选 + 多选）。
 */
import { FormField, useCreateForm } from '@moluoxixi/vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { TreeSelect as ATreeSelect } from 'ant-design-vue'
import PlaygroundForm from '../../components/PlaygroundForm.vue'

setupAntdVue()

/** 组织树结构 */
const TREE = [
  {
    title: '总公司', value: 'root',
    children: [
      {
        title: '技术中心', value: 'tech',
        children: [
          { title: '前端组', value: 'frontend' },
          { title: '后端组', value: 'backend' },
        ],
      },
      {
        title: '产品中心', value: 'product',
        children: [
          { title: '产品设计', value: 'pd' },
          { title: '用户研究', value: 'ux' },
        ],
      },
    ],
  },
]

const form = useCreateForm({
  initialValues: { memberName: '', department: undefined, accessDepts: [] },
})
</script>
`;

// FileUploadForm/field.vue
files['FileUploadForm/field.vue'] = `<template>
  <div>
    <h2>文件、图片上传</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      antd Upload / 文件+图片上传 / 三种模式
    </p>
    <PlaygroundForm :form="form">
      <template #default="{ mode }">
        <FormField name="title" :field-props="{ label: '标题', component: 'Input', required: true }" />
        <!-- 附件上传 -->
        <div style="margin-bottom: 24px">
          <div style="margin-bottom: 8px; color: rgba(0,0,0,0.88); font-size: 14px">附件上传</div>
          <AUpload
            :file-list="fileList"
            :before-upload="() => false"
            @change="(info: { fileList: unknown[] }) => fileList = info.fileList"
            :disabled="mode !== 'editable'"
          >
            <AButton v-if="mode === 'editable'">选择文件</AButton>
          </AUpload>
        </div>
        <!-- 图片上传 -->
        <div style="margin-bottom: 24px">
          <div style="margin-bottom: 8px; color: rgba(0,0,0,0.88); font-size: 14px">图片上传</div>
          <AUpload
            list-type="picture-card"
            :file-list="imageList"
            :before-upload="() => false"
            @change="(info: { fileList: unknown[] }) => imageList = info.fileList"
            :disabled="mode !== 'editable'"
          >
            <div v-if="mode === 'editable' && imageList.length < MAX_IMAGE_COUNT">
              <span>+</span>
              <div style="margin-top: 4px">上传</div>
            </div>
          </AUpload>
        </div>
      </template>
    </PlaygroundForm>
  </div>
</template>

<script setup lang="ts">
/**
 * 文件、图片上传 - Field 模式
 *
 * 标题通过 fieldProps 声明式渲染，
 * 文件和图片上传保留 antd Upload 组件（未注册到 FormField 体系）。
 */
import { ref } from 'vue'
import { FormField, useCreateForm } from '@moluoxixi/vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { Button as AButton, Upload as AUpload } from 'ant-design-vue'
import PlaygroundForm from '../../components/PlaygroundForm.vue'

setupAntdVue()

/** 最大图片上传数量 */
const MAX_IMAGE_COUNT = 6

const fileList = ref<unknown[]>([])
const imageList = ref<unknown[]>([])

const form = useCreateForm({ initialValues: { title: '' } })
</script>
`;

// Write all files
let count = 0;
for (const [rel, content] of Object.entries(files)) {
  const fullPath = path.join(BASE, rel);
  fs.writeFileSync(fullPath, content, 'utf8');
  count++;
  console.log('Wrote: ' + rel);
}
console.log('Total files written: ' + count);
