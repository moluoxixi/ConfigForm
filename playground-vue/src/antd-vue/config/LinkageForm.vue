<script setup lang="ts">
/**
 * Ant Design Vue 纯配置模式 - 字段联动
 *
 * 演示：通过 Schema reactions 配置实现联动
 * - 用户类型切换 → 显示/隐藏对应字段（个人/企业）
 * - 一对多联动（一个字段影响多个字段）
 * - 联动切换组件 props
 */
import { ref } from 'vue';
import { ConfigForm } from '@moluoxixi/vue';
import { setupAntdVue } from '@moluoxixi/ui-antd-vue';
import type { FormSchema } from '@moluoxixi/schema';

setupAntdVue();

const schema: FormSchema = {
  fields: {
    /* 类型切换 */
    userType: {
      type: 'string',
      label: '用户类型',
      component: 'RadioGroup',
      wrapper: 'FormItem',
      required: true,
      enum: [
        { label: '个人', value: 'personal' },
        { label: '企业', value: 'business' },
      ],
      defaultValue: 'personal',
    },

    /* 个人字段 */
    realName: {
      type: 'string',
      label: '真实姓名',
      component: 'Input',
      wrapper: 'FormItem',
      required: true,
      placeholder: '请输入真实姓名',
      reactions: [
        {
          watch: 'userType',
          when: (values) => values[0] === 'business',
          fulfill: { state: { visible: false } },
          otherwise: { state: { visible: true } },
        },
      ],
    },
    idCard: {
      type: 'string',
      label: '身份证号',
      component: 'Input',
      wrapper: 'FormItem',
      placeholder: '请输入 18 位身份证号',
      visible: true,
      reactions: [
        {
          watch: 'userType',
          when: (values) => values[0] === 'business',
          fulfill: { state: { visible: false } },
          otherwise: { state: { visible: true } },
        },
      ],
    },

    /* 企业字段 */
    companyName: {
      type: 'string',
      label: '企业名称',
      component: 'Input',
      wrapper: 'FormItem',
      required: true,
      placeholder: '请输入企业全称',
      visible: false,
      reactions: [
        {
          watch: 'userType',
          when: (values) => values[0] === 'business',
          fulfill: { state: { visible: true } },
          otherwise: { state: { visible: false } },
        },
      ],
    },
    taxNumber: {
      type: 'string',
      label: '统一社会信用代码',
      component: 'Input',
      wrapper: 'FormItem',
      required: true,
      placeholder: '18 位统一社会信用代码',
      visible: false,
      reactions: [
        {
          watch: 'userType',
          when: (values) => values[0] === 'business',
          fulfill: { state: { visible: true } },
          otherwise: { state: { visible: false } },
        },
      ],
    },
    businessScale: {
      type: 'string',
      label: '企业规模',
      component: 'Select',
      wrapper: 'FormItem',
      visible: false,
      enum: [
        { label: '1-50 人', value: 'small' },
        { label: '50-200 人', value: 'medium' },
        { label: '200-1000 人', value: 'large' },
        { label: '1000+ 人', value: 'enterprise' },
      ],
      reactions: [
        {
          watch: 'userType',
          when: (values) => values[0] === 'business',
          fulfill: { state: { visible: true } },
          otherwise: { state: { visible: false } },
        },
      ],
    },

    /* 通用字段 */
    email: {
      type: 'string',
      label: '联系邮箱',
      component: 'Input',
      wrapper: 'FormItem',
      required: true,
      placeholder: '请输入邮箱',
      rules: [{ format: 'email' }],
    },

    /* 一对多联动 - 通知偏好 */
    enableNotification: {
      type: 'boolean',
      label: '开启通知',
      component: 'Switch',
      wrapper: 'FormItem',
      defaultValue: false,
    },
    notifyChannel: {
      type: 'string',
      label: '通知渠道',
      component: 'Select',
      wrapper: 'FormItem',
      visible: false,
      enum: [
        { label: '邮件通知', value: 'email' },
        { label: '短信通知', value: 'sms' },
        { label: '站内信', value: 'internal' },
      ],
      reactions: [
        {
          watch: 'enableNotification',
          when: (values) => values[0] === true,
          fulfill: { state: { visible: true } },
          otherwise: { state: { visible: false } },
        },
      ],
    },
    notifyFrequency: {
      type: 'string',
      label: '通知频率',
      component: 'RadioGroup',
      wrapper: 'FormItem',
      visible: false,
      enum: [
        { label: '实时', value: 'realtime' },
        { label: '每日汇总', value: 'daily' },
        { label: '每周汇总', value: 'weekly' },
      ],
      defaultValue: 'daily',
      reactions: [
        {
          watch: 'enableNotification',
          when: (values) => values[0] === true,
          fulfill: { state: { visible: true } },
          otherwise: { state: { visible: false } },
        },
      ],
    },
  },
};

const submitResult = ref('');

function handleSubmit(values: Record<string, unknown>): void {
  submitResult.value = JSON.stringify(values, null, 2);
}
</script>

<template>
  <div>
    <h2 style="margin-bottom: 8px;">Ant Design Vue 纯配置 - 字段联动</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 20px; font-size: 14px;">
      切换「用户类型」查看个人/企业字段显隐；开关「通知」控制多个字段联动
    </p>

    <ConfigForm :schema="schema" @submit="handleSubmit">
      <template #default="{ form }">
        <div style="margin-top: 20px; display: flex; gap: 12px;">
          <a-button type="primary" html-type="submit">提交</a-button>
          <a-button @click="form.reset()">重置</a-button>
        </div>
      </template>
    </ConfigForm>

    <a-card v-if="submitResult" style="margin-top: 20px;">
      <template #title><strong>提交结果（隐藏字段已排除）</strong></template>
      <pre style="margin: 0; white-space: pre-wrap; font-size: 13px;">{{ submitResult }}</pre>
    </a-card>
  </div>
</template>
