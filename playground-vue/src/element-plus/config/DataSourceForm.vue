<script setup lang="ts">
/**
 * Element Plus 纯配置模式 - 数据源
 *
 * 覆盖场景：
 * - 静态 enum 数据源
 * - URL 远程数据源（模拟 mock）
 * - 数据源依赖参数（级联加载）
 * - 字段映射（labelField / valueField）
 * - 数据源缓存
 * - Loading 状态
 */
import { ref } from 'vue';
import { ConfigForm } from '@moluoxixi/vue';
import { registerRequestAdapter } from '@moluoxixi/core';
import { setupElementPlus } from '@moluoxixi/ui-element-plus';
import type { FormSchema } from '@moluoxixi/schema';
import 'element-plus/dist/index.css';

setupElementPlus();

/** 模拟后端数据 */
const MOCK_DATA: Record<string, unknown[]> = {
  '/api/categories': [
    { id: 1, name: '电子产品' },
    { id: 2, name: '服装鞋帽' },
    { id: 3, name: '食品饮料' },
  ],
  '/api/products?categoryId=1': [
    { id: 101, title: '手机', price: 3999 },
    { id: 102, title: '笔记本电脑', price: 6999 },
    { id: 103, title: '耳机', price: 299 },
  ],
  '/api/products?categoryId=2': [
    { id: 201, title: 'T恤', price: 99 },
    { id: 202, title: '运动鞋', price: 499 },
  ],
  '/api/products?categoryId=3': [
    { id: 301, title: '咖啡', price: 39 },
    { id: 302, title: '巧克力', price: 25 },
  ],
};

/** 注册模拟请求适配器 */
registerRequestAdapter('mock', {
  async request(config) {
    /* 模拟网络延迟 600ms */
    await new Promise((resolve) => setTimeout(resolve, 600));
    const key = config.params
      ? `${config.url}?${Object.entries(config.params).map(([k, v]) => `${k}=${v}`).join('&')}`
      : config.url;
    const data = MOCK_DATA[key];
    if (!data) throw new Error(`Mock 数据不存在: ${key}`);
    return data;
  },
});

const schema: FormSchema = {
  fields: {
    /* 静态枚举 */
    priority: {
      type: 'string',
      label: '优先级（静态枚举）',
      component: 'RadioGroup',
      wrapper: 'FormItem',
      enum: [
        { label: '紧急', value: 'urgent' },
        { label: '一般', value: 'normal' },
        { label: '低', value: 'low' },
      ],
      defaultValue: 'normal',
    },

    /* 远程数据源 + 字段映射 */
    category: {
      type: 'string',
      label: '分类（远程加载）',
      component: 'Select',
      wrapper: 'FormItem',
      required: true,
      description: '从 /api/categories 加载，labelField=name, valueField=id',
      placeholder: '请选择分类',
      dataSource: {
        url: '/api/categories',
        requestAdapter: 'mock',
        labelField: 'name',
        valueField: 'id',
        cache: { ttl: 30000 },
      },
    },

    /* 数据源依赖参数（级联） */
    product: {
      type: 'string',
      label: '产品（依赖分类）',
      component: 'Select',
      wrapper: 'FormItem',
      description: '选择分类后自动加载对应产品列表',
      placeholder: '请先选择分类',
      reactions: [
        {
          watch: 'category',
          fulfill: {
            run: async (field, ctx) => {
              const categoryId = ctx.values.category;
              if (!categoryId) {
                field.setDataSource([]);
                field.setValue('');
                return;
              }
              field.loading = true;
              try {
                const { fetchDataSource } = await import('@moluoxixi/core');
                const items = await fetchDataSource(
                  {
                    url: '/api/products',
                    requestAdapter: 'mock',
                    params: { categoryId: String(categoryId) },
                    labelField: 'title',
                    valueField: 'id',
                  },
                  ctx.values,
                );
                field.setDataSource(items);
              } catch {
                field.setDataSource([]);
              } finally {
                field.loading = false;
              }
              field.setValue('');
            },
          },
        },
      ],
    },

    /* 静态多选枚举 */
    tags: {
      type: 'array',
      label: '标签（多选）',
      component: 'CheckboxGroup',
      wrapper: 'FormItem',
      enum: [
        { label: '前端', value: 'frontend' },
        { label: '后端', value: 'backend' },
        { label: '设计', value: 'design' },
        { label: '产品', value: 'product' },
        { label: '测试', value: 'testing' },
      ],
      defaultValue: [],
    },

    /* 开关联动数据源 */
    isVip: {
      type: 'boolean',
      label: 'VIP 用户',
      component: 'Switch',
      wrapper: 'FormItem',
      defaultValue: false,
    },
    vipLevel: {
      type: 'string',
      label: 'VIP 等级',
      component: 'Select',
      wrapper: 'FormItem',
      visible: false,
      enum: [
        { label: '银卡', value: 'silver' },
        { label: '金卡', value: 'gold' },
        { label: '铂金', value: 'platinum' },
        { label: '钻石', value: 'diamond' },
      ],
      reactions: [
        {
          watch: 'isVip',
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
    <h2 style="margin-bottom: 8px;">Element Plus 纯配置 - 数据源</h2>
    <p style="color: #909399; margin-bottom: 20px; font-size: 14px;">
      静态枚举 / 远程加载（Mock 延迟 600ms）/ 级联依赖参数 / 字段映射 / 缓存 / VIP 联动
    </p>

    <ConfigForm :schema="schema" @submit="handleSubmit">
      <template #default>
        <div style="margin-top: 20px;">
          <el-button type="primary" native-type="submit">提交</el-button>
        </div>
      </template>
    </ConfigForm>

    <el-card v-if="submitResult" style="margin-top: 20px;" shadow="never">
      <pre style="margin: 0; white-space: pre-wrap; font-size: 13px;">{{ submitResult }}</pre>
    </el-card>
  </div>
</template>
