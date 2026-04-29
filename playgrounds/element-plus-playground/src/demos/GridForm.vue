<script setup lang="tsx">
import { reactive, ref } from 'vue'
import { z } from 'zod'
import { ConfigForm, defineField } from '@moluoxixi/config-form'
import {
  ElAutocomplete,
  ElCascader,
  ElCheckbox,
  ElCheckboxGroup,
  ElColorPicker,
  ElDatePicker,
  ElInput,
  ElInputNumber,
  ElRadio,
  ElRadioGroup,
  ElRate,
  ElSelectV2,
  ElSlider,
  ElSwitch,
  ElTimePicker,
  ElTimeSelect,
  ElTreeSelect,
} from 'element-plus'

// ===== 字段配置 =====

const formRef = ref()
const formValues = reactive<Record<string, any>>({})

const fields = [
  // ── 文本输入 ─────────────────────────────
  defineField({
    field: 'username',
    label: '用户名',
    validateOn: ['blur', 'change'],
    schema: z.string().min(2, '用户名至少 2 个字符').max(20, '用户名最多 20 个字符'),
    span: 12,
    component: ElInput,
    props: { placeholder: '请输入用户名', clearable: true },
  }),
  defineField({
    field: 'password',
    label: '密码',
    validateOn: 'blur',
    schema: z.string().min(6, '密码至少 6 个字符'),
    span: 12,
    component: ElInput,
    props: { type: 'password', placeholder: '请输入密码', showPassword: true },
  }),
  defineField({
    field: 'email',
    label: '邮箱',
    validateOn: 'blur',
    schema: z.string().email('请输入有效的邮箱地址').optional(),
    span: 12,
    component: ElInput,
    props: { placeholder: '请输入邮箱', clearable: true },
  }),
  defineField({
    field: 'phone',
    label: '手机号',
    schema: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号').optional(),
    span: 12,
    component: ElInput,
    props: { placeholder: '请输入手机号', clearable: true },
  }),

  // ── 数字输入 ─────────────────────────────
  defineField({
    field: 'age',
    label: '年龄',
    schema: z.number().min(1).max(150).optional(),
    span: 8,
    component: ElInputNumber,
    props: { min: 1, max: 150, placeholder: '年龄', controlsPosition: 'right' },
  }),
  defineField({
    field: 'salary',
    label: '薪资',
    schema: z.number().min(0).optional(),
    span: 8,
    component: ElInputNumber,
    props: { min: 0, step: 1000, placeholder: '薪资', controlsPosition: 'right' },
  }),
  defineField({
    field: 'quantity',
    label: '数量',
    schema: z.number().int().min(0).optional(),
    span: 8,
    component: ElInputNumber,
    props: { min: 0, step: 1, precision: 0, placeholder: '数量', controlsPosition: 'right' },
  }),

  // ── 选择器 ─────────────────────────────
  defineField({
    field: 'role',
    label: '角色',
    schema: z.string().min(1, '请选择角色').optional(),
    span: 12,
    component: ElSelectV2,
    props: {
      placeholder: '请选择角色',
      clearable: true,
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
    component: ElSelectV2,
    props: {
      multiple: true,
      placeholder: '请选择标签',
      clearable: true,
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
    field: 'city',
    label: '城市',
    schema: z.string().optional(),
    span: 12,
    component: ElSelectV2,
    props: {
      filterable: true,
      placeholder: '可搜索选择城市',
      clearable: true,
      options: [
        { label: '北京', value: 'beijing' },
        { label: '上海', value: 'shanghai' },
        { label: '广州', value: 'guangzhou' },
        { label: '深圳', value: 'shenzhen' },
        { label: '杭州', value: 'hangzhou' },
        { label: '成都', value: 'chengdu' },
      ],
    },
  }),
  defineField({
    field: 'department',
    label: '部门',
    schema: z.array(z.string()).min(1, '请选择部门').optional(),
    span: 12,
    component: ElCascader,
    props: {
      placeholder: '请选择部门',
      clearable: true,
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
    component: ElTreeSelect,
    props: {
      placeholder: '请选择上级',
      clearable: true,
      checkStrictly: true,
      data: [
        {
          value: 'ceo', label: 'CEO', children: [
            {
              value: 'cto', label: 'CTO', children: [
                { value: 'lead-fe', label: '前端负责人' },
                { value: 'lead-be', label: '后端负责人' },
              ],
            },
            {
              value: 'cpo', label: 'CPO', children: [
                { value: 'lead-design', label: '设计负责人' },
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
    component: ElRadioGroup,
    slots: {
      default: () => [
        <ElRadio value="male">男</ElRadio>,
        <ElRadio value="female">女</ElRadio>,
        <ElRadio value="other">其他</ElRadio>,
      ],
    },
  }),
  defineField({
    field: 'hobbies',
    label: '爱好',
    schema: z.array(z.string()).min(1, '请至少选择一项').optional(),
    span: 12,
    component: ElCheckboxGroup,
    defaultValue: [],
    slots: {
      default: () => [
        <ElCheckbox value="reading" label="阅读" />,
        <ElCheckbox value="sports" label="运动" />,
        <ElCheckbox value="music" label="音乐" />,
        <ElCheckbox value="travel" label="旅行" />,
      ],
    },
  }),

  // ── 日期时间 ─────────────────────────────
  defineField({
    field: 'birthday',
    label: '出生日期',
    schema: z.string().optional(),
    span: 8,
    component: ElDatePicker,
    props: { type: 'date', placeholder: '选择日期', valueFormat: 'YYYY-MM-DD', clearable: true },
  }),
  defineField({
    field: 'entryDate',
    label: '入职时间',
    schema: z.string().optional(),
    span: 8,
    component: ElDatePicker,
    props: { type: 'datetime', placeholder: '选择日期时间', valueFormat: 'YYYY-MM-DD HH:mm:ss', clearable: true },
  }),
  defineField({
    field: 'dateRange',
    label: '有效期',
    schema: z.array(z.string()).optional(),
    span: 8,
    component: ElDatePicker,
    props: { type: 'daterange', startPlaceholder: '开始日期', endPlaceholder: '结束日期', valueFormat: 'YYYY-MM-DD', clearable: true },
    defaultValue: [],
  }),
  defineField({
    field: 'workTime',
    label: '上班时间',
    schema: z.string().optional(),
    span: 8,
    component: ElTimeSelect,
    props: { placeholder: '选择时间', start: '06:00', step: '00:15', end: '22:00', clearable: true },
  }),
  defineField({
    field: 'meetingTime',
    label: '会议时间',
    schema: z.string().optional(),
    span: 8,
    component: ElTimePicker,
    props: { placeholder: '选择时间', valueFormat: 'HH:mm:ss', clearable: true },
  }),
  defineField({
    field: 'month',
    label: '月份',
    schema: z.string().optional(),
    span: 8,
    component: ElDatePicker,
    props: { type: 'month', placeholder: '选择月份', valueFormat: 'YYYY-MM', clearable: true },
  }),

  // ── 开关 / 评分 / 颜色 ─────────────────────────────
  defineField({
    field: 'active',
    label: '启用状态',
    schema: z.boolean().optional(),
    span: 8,
    component: ElSwitch,
    defaultValue: true,
  }),
  defineField({
    field: 'rating',
    label: '评分',
    schema: z.number().min(1, '请评分').max(5).optional(),
    span: 8,
    component: ElRate,
    props: { allowHalf: true, showScore: true },
    defaultValue: 0,
  }),
  defineField({
    field: 'themeColor',
    label: '主题色',
    schema: z.string().optional(),
    span: 8,
    component: ElColorPicker,
    defaultValue: '#409EFF',
  }),

  // ── 滑块（需要较大宽度）─────────────────────────────
  defineField({
    field: 'progress',
    label: '完成度',
    schema: z.number().min(0).max(100).optional(),
    span: 24,
    component: ElSlider,
    props: { showInput: true },
    defaultValue: 0,
  }),

  // ── 自动补全 ─────────────────────────────
  defineField({
    field: 'cityName',
    label: '城市名',
    schema: z.string().optional(),
    span: 12,
    component: ElAutocomplete,
    props: {
      placeholder: '输入城市名',
      clearable: true,
      fetchSuggestions: (queryString: string, cb: any) => {
        const cities = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京', '西安', '重庆']
        const results = queryString
          ? cities.filter(c => c.includes(queryString)).map(c => ({ value: c }))
          : cities.map(c => ({ value: c }))
        cb(results)
      },
    },
  }),

  // ── 条件显隐：性别选"其他"时显示 ─────────────────────────────
  defineField({
    field: 'genderOther',
    label: '请说明',
    schema: z.string().min(1, '请说明您的性别').optional(),
    span: 12,
    component: ElInput,
    props: { placeholder: '请说明您的性别', clearable: true },
    visible: (values) => values.gender === 'other',
  }),

  // ── 条件显隐：启用状态下显示生效日期 ─────────────────────────────
  defineField({
    field: 'effectiveDate',
    label: '生效日期',
    schema: z.string().optional(),
    span: 12,
    component: ElDatePicker,
    props: { type: 'date', placeholder: '选择生效日期', valueFormat: 'YYYY-MM-DD', clearable: true },
    visible: (values) => values.active === true,
  }),

  // ── 条件禁用：角色为"访客"时禁用 ─────────────────────────────
  defineField({
    field: 'remark',
    label: '备注',
    schema: z.string().max(100, '备注最多 100 个字符').optional(),
    span: 24,
    component: ElInput,
    props: { placeholder: '访客不可编辑备注', clearable: true },
    disabled: (values) => values.role === 'guest',
  }),

  // ── 条件禁用：评分低于3时禁用提交建议 ─────────────────────────────
  defineField({
    field: 'suggestion',
    label: '建议',
    schema: z.string().max(200, '建议最多 200 个字符').optional(),
    span: 24,
    component: ElInput,
    props: { type: 'textarea', placeholder: '评分达到 3 分后可填写建议', rows: 2, clearable: true },
    disabled: (values) => !values.rating || values.rating < 3,
  }),

  // ── 文本域 ─────────────────────────────
  defineField({
    field: 'bio',
    label: '个人简介',
    schema: z.string().max(200, '简介最多 200 个字符').optional(),
    span: 24,
    component: ElInput,
    props: { type: 'textarea', placeholder: '请输入个人简介', rows: 3, maxlength: 200, showWordLimit: true },
  }),
]

function onSubmit(values: Record<string, any>) {
  alert(`提交成功！\n${JSON.stringify(values, null, 2)}`)
}

function onError(errors: Record<string, string[]>) {
  console.error('校验失败：', errors)
}

function onModelUpdate(vals: Record<string, any>) {
  Object.assign(formValues, vals)
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
      @update:model-value="onModelUpdate"
    />

    <div class="demo-actions">
      <el-button type="primary" @click="formRef?.submit()">
        提交
      </el-button>
      <el-button @click="formRef?.validate()">
        校验
      </el-button>
      <el-button @click="formRef?.reset()">
        重置
      </el-button>
    </div>

    <el-divider>实时值（v-model）</el-divider>
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
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px 16px;
  font-size: 12px;
  line-height: 1.6;
  max-height: 300px;
  overflow: auto;
}
</style>
