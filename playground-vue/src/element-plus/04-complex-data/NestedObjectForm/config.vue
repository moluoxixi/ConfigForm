<template>
  <div>
    <h2>嵌套对象</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">
      一级嵌套 / 多层嵌套 / 嵌套内联动 — ConfigForm + ISchema 实现
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <ConfigForm
        :schema="withMode(schema, mode)"
        :initial-values="initialValues"
        @submit="showResult"
        @submit-failed="(e: any) => st?.showErrors(e)"
      />
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
/**
 * 嵌套对象 — Config 模式（Element Plus）
 *
 * 使用 ConfigForm + ISchema 实现嵌套对象：
 * - 一级嵌套（profile.name）
 * - 多层嵌套（profile.contact.phone）
 * - 嵌套内联动（theme=custom → 显示自定义颜色）
 */
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/core'
import { setupElementPlus, StatusTabs } from '@moluoxixi/ui-element-plus'
import { ConfigForm } from '@moluoxixi/vue'
import { ref } from 'vue'

setupElementPlus()

const st = ref<InstanceType<typeof StatusTabs>>()

function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

const initialValues = {
  title: '',
  profile: { name: '', age: undefined, gender: undefined, contact: { phone: '', email: '' }, address: { province: undefined, city: '', detail: '' } },
  company: { name: '', department: '', position: '' },
  settings: { theme: 'light', customColor: '' },
}

const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '160px', actions: { submit: '提交', reset: '重置' } },
  properties: {
    title: { type: 'string', title: '标题', required: true, componentProps: { placeholder: '请输入标题' } },
    profile: {
      type: 'object', title: '个人信息',
      properties: {
        name: { type: 'string', title: '姓名', required: true, componentProps: { placeholder: '请输入' } },
        age: { type: 'number', title: '年龄', component: 'InputNumber', componentProps: { min: 0, max: 150, style: 'width: 100%' } },
        gender: { type: 'string', title: '性别', component: 'Select', enum: [{ label: '男', value: 'male' }, { label: '女', value: 'female' }] },
        contact: {
          type: 'object', title: '联系方式',
          properties: {
            phone: { type: 'string', title: '手机号', rules: [{ format: 'phone', message: '无效手机号' }] },
            email: { type: 'string', title: '邮箱', rules: [{ format: 'email', message: '无效邮箱' }] },
          },
        },
        address: {
          type: 'object', title: '地址',
          properties: {
            province: { type: 'string', title: '省份', component: 'Select', enum: [{ label: '北京', value: 'beijing' }, { label: '上海', value: 'shanghai' }] },
            city: { type: 'string', title: '城市' },
            detail: { type: 'string', title: '详细地址', component: 'Textarea' },
          },
        },
      },
    },
    company: {
      type: 'object', title: '公司信息',
      properties: {
        name: { type: 'string', title: '公司名称' },
        department: { type: 'string', title: '部门' },
        position: { type: 'string', title: '职位' },
      },
    },
    settings: {
      type: 'object', title: '设置',
      properties: {
        theme: {
          type: 'string', title: '主题', default: 'light', component: 'RadioGroup',
          enum: [{ label: '亮色', value: 'light' }, { label: '暗色', value: 'dark' }, { label: '自定义', value: 'custom' }],
        },
        customColor: {
          type: 'string', title: '自定义颜色', visible: false,
          componentProps: { placeholder: '#1677ff' },
          reactions: [{ watch: 'settings.theme', when: (v: unknown[]) => v[0] === 'custom', fulfill: { state: { visible: true, required: true } }, otherwise: { state: { visible: false, required: false } } }],
        },
      },
    },
  },
}
</script>
