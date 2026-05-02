<script setup lang="ts">
import { reactive, ref } from 'vue'
import { z } from 'zod'
import { ConfigForm, defineField } from '@moluoxixi/config-form'
import {
  AutoComplete,
  Cascader,
  Checkbox,
  CheckboxGroup,
  DatePicker,
  Input,
  InputNumber,
  Radio,
  RadioGroup,
  Rate,
  Select,
  Slider,
  Switch,
  Textarea,
  TimePicker,
  TreeSelect,
} from 'ant-design-vue'

// ===== 字段配置 =====

const formRef = ref()
const formValues = reactive<Record<string, unknown>>({})

// Ant Design Vue 通用 value/trigger 配置
const v = { valueProp: 'value', trigger: 'update:value' } as const

interface DayjsLike {
  format: (template: string) => string
}

function isDayjsLike(value: unknown): value is DayjsLike {
  return Boolean(value && typeof value === 'object' && typeof (value as Partial<DayjsLike>).format === 'function')
}

function formatDateValue(value: unknown, template: string): unknown {
  return isDayjsLike(value) ? value.format(template) : value
}

function formatDateRange(value: unknown, template: string): unknown {
  return Array.isArray(value) ? value.map(item => formatDateValue(item, template)) : value
}

function optionIncludes(input: string, option: unknown): boolean {
  const value = option && typeof option === 'object' ? (option as { value?: unknown }).value : undefined
  return typeof value === 'string' && value.includes(input)
}

const fields = [
  // ── 文本输入 ─────────────────────────────
  defineField({
    field: 'username',
    label: '用户名',
    validateOn: ['blur', 'change'],
    schema: z.string().min(2, '用户名至少 2 个字符').max(20, '用户名最多 20 个字符'),
    span: 12,
    component: Input,
    ...v,
    props: { placeholder: '请输入用户名', allowClear: true },
    validator: (value, values) => {
      if (values.role === 'guest' && value.length < 4)
        return '访客用户名至少 4 个字符'

      return value.includes(' ') ? '用户名不能包含空格' : undefined
    },
    transform: value => value.trim(),
    visible: values => values.active !== false,
    disabled: values => values.role === 'guest',
  }),
  defineField({
    field: 'password',
    label: '密码',
    validateOn: 'blur',
    schema: z.string().min(6, '密码至少 6 个字符'),
    span: 12,
    component: Input.Password,
    ...v,
    props: { placeholder: '请输入密码' },
    validator: (value, values) => {
      const username = typeof values.username === 'string' ? values.username.trim() : ''

      return username && value.includes(username) ? '密码不能包含用户名' : undefined
    },
    transform: value => value.trim(),
    visible: values => values.active !== false,
    disabled: values => values.role === 'guest',
  }),
  defineField({
    field: 'search',
    label: '搜索',
    schema: z.string().optional(),
    span: 12,
    component: Input.Search,
    ...v,
    props: { placeholder: '输入关键词搜索', allowClear: true },
    validator: (value) => {
      return value && value.length > 30 ? '搜索关键词最多 30 个字符' : undefined
    },
    transform: value => value?.trim(),
    visible: values => values.active !== false,
    disabled: values => values.role === 'guest',
  }),
  defineField({
    field: 'email',
    label: '邮箱',
    validateOn: 'blur',
    schema: z.string().email('请输入有效的邮箱地址').optional(),
    span: 12,
    component: Input,
    ...v,
    props: { placeholder: '请输入邮箱', allowClear: true },
    validator: (value, values) => {
      return values.role === 'admin' && !value ? '管理员需要填写邮箱' : undefined
    },
    transform: value => value?.trim(),
    visible: values => values.active !== false,
    disabled: values => values.role === 'guest',
  }),
  defineField({
    field: 'phone',
    label: '手机号',
    schema: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号').optional(),
    span: 12,
    component: Input,
    ...v,
    props: { placeholder: '请输入手机号', allowClear: true },
    validator: (value, values) => {
      return values.role === 'user' && !value ? '用户需要填写手机号' : undefined
    },
    transform: value => value?.trim(),
    visible: values => values.active !== false,
    disabled: values => values.role === 'guest',
  }),

  // ── 数字输入 ─────────────────────────────
  defineField({
    field: 'age',
    label: '年龄',
    schema: z.number().min(1).max(150).optional(),
    span: 8,
    component: InputNumber,
    ...v,
    props: { min: 1, max: 150, placeholder: '年龄', style: { width: '100%' } },
  }),
  defineField({
    field: 'salary',
    label: '薪资',
    schema: z.number().min(0).optional(),
    span: 8,
    component: InputNumber,
    ...v,
    props: { min: 0, step: 1000, placeholder: '薪资', style: { width: '100%' } },
  }),
  defineField({
    field: 'quantity',
    label: '数量',
    schema: z.number().int().min(0).optional(),
    span: 8,
    component: InputNumber,
    ...v,
    props: { min: 0, step: 1, precision: 0, placeholder: '数量', style: { width: '100%' } },
  }),

  // ── 选择器 ─────────────────────────────
  defineField({
    field: 'role',
    label: '角色',
    schema: z.string().min(1, '请选择角色').optional(),
    span: 12,
    component: Select,
    ...v,
    props: {
      placeholder: '请选择角色',
      allowClear: true,
      options: [
        { label: '管理员', value: 'admin' },
        { label: '用户', value: 'user' },
        { label: '访客', value: 'guest' },
      ],
    },
  }),
  defineField({
    field: 'tags',
    label: '标签',
    schema: z.array(z.string()).min(1, '请至少选择一个标签').optional(),
    span: 12,
    component: Select,
    ...v,
    props: {
      mode: 'multiple',
      placeholder: '请选择标签',
      allowClear: true,
      options: [
        { label: 'Vue', value: 'vue' },
        { label: 'React', value: 'react' },
        { label: 'Angular', value: 'angular' },
        { label: 'Svelte', value: 'svelte' },
      ],
    },
    defaultValue: [],
  }),
  defineField({
    field: 'department',
    label: '部门',
    schema: z.array(z.string()).min(1, '请选择部门').optional(),
    span: 12,
    component: Cascader,
    ...v,
    props: {
      placeholder: '请选择部门',
      allowClear: true,
      options: [
        {
          value: 'tech', label: '技术部', children: [
            { value: 'frontend', label: '前端组' },
            { value: 'backend', label: '后端组' },
            { value: 'devops', label: '运维组' },
          ],
        },
        {
          value: 'product', label: '产品部', children: [
            { value: 'design', label: '设计组' },
            { value: 'pm', label: '产品组' },
          ],
        },
      ],
    },
  }),
  defineField({
    field: 'manager',
    label: '上级',
    schema: z.string().optional(),
    span: 12,
    component: TreeSelect,
    ...v,
    props: {
      placeholder: '请选择上级',
      allowClear: true,
      treeDefaultExpandAll: true,
      treeData: [
        {
          value: 'ceo', title: 'CEO', children: [
            {
              value: 'cto', title: 'CTO', children: [
                { value: 'lead-fe', title: '前端负责人' },
                { value: 'lead-be', title: '后端负责人' },
              ],
            },
            {
              value: 'cpo', title: 'CPO', children: [
                { value: 'lead-design', title: '设计负责人' },
              ],
            },
          ],
        },
      ],
    },
  }),

  // ── 单选 / 多选（通过 slots 传递子组件）─────────────────────────
  defineField({
    field: 'gender',
    label: '性别',
    schema: z.string().optional(),
    span: 12,
    component: RadioGroup,
    ...v,
    slots: {
      default: [
        {
          component: Radio,
          props: { value: 'male' },
          slots: { default: '男' },
        },
        {
          component: Radio,
          props: { value: 'female' },
          slots: { default: '女' },
        },
        {
          component: Radio,
          props: { value: 'other' },
          slots: { default: '其他' },
        },
      ],
    },
  }),
  defineField({
    field: 'hobbies',
    label: '爱好',
    schema: z.array(z.string()).min(1, '请至少选择一项').optional(),
    span: 12,
    component: CheckboxGroup,
    ...v,
    defaultValue: [],
    slots: {
      default: [
        {
          component: Checkbox,
          props: { value: 'reading' },
          slots: { default: '阅读' },
        },
        {
          component: Checkbox,
          props: { value: 'sports' },
          slots: { default: '运动' },
        },
        {
          component: Checkbox,
          props: { value: 'music' },
          slots: { default: '音乐' },
        },
        {
          component: Checkbox,
          props: { value: 'travel' },
          slots: { default: '旅行' },
        },
      ],
    },
  }),

  // ── 日期时间 ─────────────────────────────
  defineField({
    field: 'birthday',
    label: '出生日期',
    schema: z.unknown().optional(),
    span: 8,
    component: DatePicker,
    ...v,
    props: { placeholder: '选择日期', allowClear: true, style: { width: '100%' } },
    transform: val => formatDateValue(val, 'YYYY-MM-DD'),
  }),
  defineField({
    field: 'entryTime',
    label: '入职时间',
    schema: z.unknown().optional(),
    span: 8,
    component: TimePicker,
    ...v,
    props: { placeholder: '选择时间', allowClear: true, format: 'HH:mm', style: { width: '100%' } },
    transform: val => formatDateValue(val, 'HH:mm'),
  }),
  defineField({
    field: 'dateRange',
    label: '有效期',
    schema: z.unknown().optional(),
    span: 8,
    component: DatePicker.RangePicker,
    ...v,
    props: { placeholder: ['开始日期', '结束日期'], allowClear: true, style: { width: '100%' } },
    transform: val => formatDateRange(val, 'YYYY-MM-DD'),
  }),

  // ── 开关 ─────────────────────────────
  defineField({
    field: 'active',
    label: '启用状态',
    schema: z.boolean().optional(),
    span: 8,
    component: Switch,
    valueProp: 'checked',
    trigger: 'update:checked',
    defaultValue: true,
  }),

  // ── 评分 / 滑块 ─────────────────────────────
  defineField({
    field: 'rating',
    label: '评分',
    schema: z.number().min(1, '请评分').max(5).optional(),
    span: 8,
    component: Rate,
    ...v,
    props: { allowHalf: true },
    defaultValue: 0,
  }),
  defineField({
    field: 'progress',
    label: '完成度',
    schema: z.number().min(0).max(100).optional(),
    span: 8,
    component: Slider,
    ...v,
    defaultValue: 0,
  }),

  // ── 自动补全 ─────────────────────────────
  defineField({
    field: 'city',
    label: '城市',
    schema: z.string().optional(),
    span: 12,
    component: AutoComplete,
    ...v,
    props: {
      placeholder: '输入城市名',
      allowClear: true,
      options: ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京', '西安', '重庆'].map(c => ({ value: c })),
      filterOption: optionIncludes,
    },
  }),

  // ── 条件显隐：性别选"其他"时显示 ─────────────────────────────
  defineField({
    field: 'genderOther',
    label: '请说明',
    schema: z.string().min(1, '请说明您的性别').optional(),
    span: 12,
    component: Input,
    ...v,
    props: { placeholder: '请说明您的性别', allowClear: true },
    visible: (values) => values.gender === 'other',
  }),

  // ── 条件显隐：启用状态下显示生效日期 ─────────────────────────────
  defineField({
    field: 'effectiveDate',
    label: '生效日期',
    schema: z.unknown().optional(),
    span: 12,
    component: DatePicker,
    ...v,
    props: { placeholder: '选择生效日期', allowClear: true, style: { width: '100%' } },
    transform: val => formatDateValue(val, 'YYYY-MM-DD'),
    visible: (values) => values.active === true,
  }),

  // ── 条件禁用：角色为"访客"时禁用 ─────────────────────────────
  defineField({
    field: 'remark',
    label: '备注',
    schema: z.string().max(100, '备注最多 100 个字符').optional(),
    span: 24,
    component: Input,
    ...v,
    props: { placeholder: '访客不可编辑备注', allowClear: true },
    disabled: (values) => values.role === 'guest',
  }),

  // ── 条件禁用：评分低于3时禁用提交建议 ─────────────────────────────
  defineField({
    field: 'suggestion',
    label: '建议',
    schema: z.string().max(200, '建议最多 200 个字符').optional(),
    span: 24,
    component: Textarea,
    ...v,
    props: { placeholder: '评分达到 3 分后可填写建议', rows: 2, allowClear: true },
    disabled: (values) => !values.rating || values.rating < 3,
  }),

  // ── 文本域 ─────────────────────────────
  defineField({
    field: 'bio',
    label: '个人简介',
    schema: z.string().max(200, '简介最多 200 个字符').optional(),
    span: 24,
    component: Textarea,
    ...v,
    props: { placeholder: '请输入个人简介', rows: 3, showCount: true, maxlength: 200 },
  }),
]

function onSubmit(values: Record<string, unknown>) {
  alert(`提交成功！\n${JSON.stringify(values, null, 2)}`)
}

function onError(errors: Record<string, string[]>) {
  console.error('校验失败：', errors)
}
</script>

<template>
  <div>
    <ConfigForm
      ref="formRef"
      :model-value="formValues"
      namespace="moluoxixi"
      :fields="fields"
      label-width="80px"
      @submit="onSubmit"
      @error="onError"
      @update:model-value="(vals: Record<string, unknown>) => Object.assign(formValues, vals)"
    />

    <div class="demo-actions">
      <a-button type="primary" @click="formRef?.submit()">
        提交
      </a-button>
      <a-button @click="formRef?.validate()">
        校验
      </a-button>
      <a-button @click="formRef?.reset()">
        重置
      </a-button>
    </div>

    <a-divider>实时值（v-model）</a-divider>
    <pre class="value-preview">{{ JSON.stringify(formValues, null, 2) }}</pre>
  </div>
</template>

<style lang="scss">
.demo-actions {
  margin-top: 16px;
  display: flex;
  gap: 8px;
}

.value-preview {
  background: #fafafa;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 12px 16px;
  font-size: 12px;
  line-height: 1.6;
  max-height: 300px;
  overflow: auto;
}
</style>
