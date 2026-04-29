<script setup lang="tsx">
import type { FormValues } from '@moluoxixi/config-form'
import { ref } from 'vue'
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
  TimePicker,
  TreeSelect,
} from 'ant-design-vue'

// ===== 字段配置 =====

const formRef = ref()

// Ant Design Vue 通用 value/trigger 配置
const v = { valueProp: 'value', trigger: 'update:value' } as const

const fields = [
  defineField({
    field: 'keyword',
    label: '关键词',
    schema: z.string().min(1, '请输入关键词'),
    component: Input,
    ...v,
    props: { placeholder: '搜索...', allowClear: true },
  }),
  defineField({
    field: 'password',
    label: '密码',
    component: Input.Password,
    ...v,
    props: { placeholder: '密码' },
  }),
  defineField({
    field: 'status',
    label: '状态',
    component: Select,
    ...v,
    props: {
      placeholder: '状态筛选',
      allowClear: true,
      options: [
        { label: '启用', value: 'active' },
        { label: '禁用', value: 'inactive' },
      ],
    },
  }),
  defineField({
    field: 'role',
    label: '角色',
    component: Select,
    ...v,
    props: {
      placeholder: '角色筛选',
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
    component: Select,
    ...v,
    props: {
      mode: 'multiple',
      placeholder: '多选标签',
      allowClear: true,
      options: [
        { label: 'Vue', value: 'vue' },
        { label: 'React', value: 'react' },
        { label: 'Angular', value: 'angular' },
      ],
    },
    defaultValue: [],
  }),
  defineField({
    field: 'age',
    label: '年龄',
    component: InputNumber,
    ...v,
    props: { min: 1, max: 150, placeholder: '年龄' },
  }),
  defineField({
    field: 'department',
    label: '部门',
    component: Cascader,
    ...v,
    props: {
      placeholder: '部门',
      allowClear: true,
      options: [
        { value: 'tech', label: '技术部', children: [{ value: 'frontend', label: '前端组' }, { value: 'backend', label: '后端组' }] },
        { value: 'product', label: '产品部', children: [{ value: 'design', label: '设计组' }, { value: 'pm', label: '产品组' }] },
      ],
    },
  }),
  defineField({
    field: 'manager',
    label: '上级',
    component: TreeSelect,
    ...v,
    props: {
      placeholder: '上级',
      allowClear: true,
      treeData: [
        { value: 'ceo', title: 'CEO', children: [{ value: 'cto', title: 'CTO' }, { value: 'cpo', title: 'CPO' }] },
      ],
    },
  }),
  defineField({
    field: 'gender',
    label: '性别',
    component: RadioGroup,
    ...v,
    slots: {
      default: () => [
        <Radio value="male">男</Radio>,
        <Radio value="female">女</Radio>,
        <Radio value="other">其他</Radio>,
      ],
    },
  }),
  defineField({
    field: 'hobbies',
    label: '爱好',
    component: CheckboxGroup,
    ...v,
    defaultValue: [],
    slots: {
      default: () => [
        <Checkbox value="reading">阅读</Checkbox>,
        <Checkbox value="sports">运动</Checkbox>,
        <Checkbox value="music">音乐</Checkbox>,
      ],
    },
  }),
  defineField({
    field: 'date',
    label: '日期',
    component: DatePicker,
    ...v,
    props: { placeholder: '选择日期', allowClear: true },
    transform: (val: any) => val?.format?.('YYYY-MM-DD') ?? val,
  }),
  defineField({
    field: 'dateRange',
    label: '有效期',
    component: DatePicker.RangePicker,
    ...v,
    props: { placeholder: ['开始', '结束'], allowClear: true },
    transform: (val: any) => Array.isArray(val) ? val.map((v: any) => v?.format?.('YYYY-MM-DD')) : val,
  }),
  defineField({
    field: 'time',
    label: '时间',
    component: TimePicker,
    ...v,
    props: { placeholder: '选择时间', allowClear: true, format: 'HH:mm' },
    transform: (val: any) => val?.format?.('HH:mm') ?? val,
  }),
  defineField({
    field: 'priority',
    label: '优先级',
    component: Rate,
    ...v,
    props: { allowHalf: true },
    defaultValue: 0,
  }),
  defineField({
    field: 'active',
    label: '启用',
    component: Switch,
    valueProp: 'checked',
    trigger: 'update:checked',
    defaultValue: true,
  }),
  defineField({
    field: 'progress',
    label: '进度',
    component: Slider,
    ...v,
    defaultValue: 0,
  }),
  defineField({
    field: 'city',
    label: '城市',
    component: AutoComplete,
    ...v,
    props: {
      placeholder: '城市',
      allowClear: true,
      options: ['北京', '上海', '广州', '深圳', '杭州', '成都'].map(c => ({ value: c })),
      filterOption: (input: string, option: any) => option.value.includes(input),
    },
  }),
  // 条件显隐
  defineField({
    field: 'genderOther',
    label: '说明',
    component: Input,
    ...v,
    props: { placeholder: '请说明', allowClear: true },
    visible: (values: FormValues) => values.gender === 'other',
  }),
  // 条件禁用
  defineField({
    field: 'remark',
    label: '备注',
    component: Input,
    ...v,
    props: { placeholder: '访客不可编辑', allowClear: true },
    disabled: (values: FormValues) => values.role === 'guest',
  }),
]

function onSubmit(values: Record<string, any>) {
  alert(`搜索提交！\n${JSON.stringify(values, null, 2)}`)
}

function onError(errors: Record<string, string[]>) {
  console.error('校验失败：', errors)
}
</script>

<template>
  <div>
    <ConfigForm
      ref="formRef"
      namespace="moluoxixi"
      :fields="fields"
      :inline="true"
      @submit="onSubmit"
      @error="onError"
    />
    <div class="demo-actions">
      <a-button type="primary" @click="formRef?.submit()">
        搜索
      </a-button>
      <a-button @click="formRef?.reset()">
        重置
      </a-button>
    </div>
  </div>
</template>

<style lang="scss">
.demo-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}
</style>
