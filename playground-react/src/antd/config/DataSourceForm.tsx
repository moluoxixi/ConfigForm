/**
 * 数据源场景 - antd 版
 *
 * 覆盖场景：
 * - 静态枚举数据源
 * - 远程 URL 数据源（mock 适配器）
 * - 数据源依赖参数（级联选择：国家→省份→城市）
 * - 字段映射（labelField / valueField）
 * - 缓存策略（cache: true / cache: { ttl }）
 */
import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { ConfigForm } from '@moluoxixi/react';
import { registerRequestAdapter } from '@moluoxixi/core';
import { setupAntd } from '@moluoxixi/ui-antd';
import { Button, Space, Typography, Alert, Tag } from 'antd';
import type { FormSchema } from '@moluoxixi/schema';

const { Title, Paragraph } = Typography;

setupAntd();

/* ======================== Mock 数据 ======================== */

/** 国家列表 */
const MOCK_COUNTRIES = [
  { id: 'CN', name: '中国' },
  { id: 'US', name: '美国' },
  { id: 'JP', name: '日本' },
];

/** 省份/州 数据 */
const MOCK_PROVINCES: Record<string, Array<{ code: string; title: string }>> = {
  CN: [
    { code: 'BJ', title: '北京市' },
    { code: 'SH', title: '上海市' },
    { code: 'GD', title: '广东省' },
    { code: 'ZJ', title: '浙江省' },
  ],
  US: [
    { code: 'CA', title: '加利福尼亚州' },
    { code: 'NY', title: '纽约州' },
    { code: 'TX', title: '德克萨斯州' },
  ],
  JP: [
    { code: 'TK', title: '东京都' },
    { code: 'OS', title: '大阪府' },
    { code: 'KT', title: '京都府' },
  ],
};

/** 城市数据 */
const MOCK_CITIES: Record<string, Array<{ cid: string; cname: string }>> = {
  BJ: [{ cid: 'BJ01', cname: '东城区' }, { cid: 'BJ02', cname: '西城区' }, { cid: 'BJ03', cname: '朝阳区' }, { cid: 'BJ04', cname: '海淀区' }],
  SH: [{ cid: 'SH01', cname: '浦东新区' }, { cid: 'SH02', cname: '黄浦区' }, { cid: 'SH03', cname: '徐汇区' }],
  GD: [{ cid: 'GD01', cname: '广州市' }, { cid: 'GD02', cname: '深圳市' }, { cid: 'GD03', cname: '东莞市' }],
  ZJ: [{ cid: 'ZJ01', cname: '杭州市' }, { cid: 'ZJ02', cname: '宁波市' }, { cid: 'ZJ03', cname: '温州市' }],
  CA: [{ cid: 'CA01', cname: '洛杉矶' }, { cid: 'CA02', cname: '旧金山' }],
  NY: [{ cid: 'NY01', cname: '纽约市' }, { cid: 'NY02', cname: '布法罗' }],
  TX: [{ cid: 'TX01', cname: '休斯顿' }, { cid: 'TX02', cname: '达拉斯' }],
  TK: [{ cid: 'TK01', cname: '新宿区' }, { cid: 'TK02', cname: '涩谷区' }],
  OS: [{ cid: 'OS01', cname: '北区' }, { cid: 'OS02', cname: '中央区' }],
  KT: [{ cid: 'KT01', cname: '左京区' }, { cid: 'KT02', cname: '右京区' }],
};

/** 编程语言 */
const MOCK_LANGUAGES = [
  { id: 1, text: 'TypeScript' },
  { id: 2, text: 'JavaScript' },
  { id: 3, text: 'Python' },
  { id: 4, text: 'Rust' },
  { id: 5, text: 'Go' },
];

/** 模拟延迟 */
const MOCK_DELAY = 500;

/** 请求计数器 */
let requestCount = 0;

/* 注册 Mock 请求适配器 */
registerRequestAdapter('antd-mock', {
  async request<T>(config: { url: string; method: string; params?: Record<string, unknown> }): Promise<T> {
    requestCount++;
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
    const { url, params } = config;

    if (url === '/api/countries') return MOCK_COUNTRIES as unknown as T;
    if (url === '/api/provinces') {
      const countryId = params?.countryId as string;
      return (MOCK_PROVINCES[countryId] ?? []) as unknown as T;
    }
    if (url === '/api/cities') {
      const provinceCode = params?.provinceCode as string;
      return (MOCK_CITIES[provinceCode] ?? []) as unknown as T;
    }
    if (url === '/api/languages') return MOCK_LANGUAGES as unknown as T;
    return [] as unknown as T;
  },
});

/** Schema 定义 */
const schema: FormSchema = {
  form: {
    labelPosition: 'right',
    labelWidth: '120px',
  },
  fields: {
    /* 静态枚举 */
    priority: {
      type: 'string',
      label: '优先级',
      component: 'Select',
      wrapper: 'FormItem',
      required: true,
      enum: [
        { label: '紧急', value: 'urgent' },
        { label: '高', value: 'high' },
        { label: '中', value: 'medium' },
        { label: '低', value: 'low' },
      ],
      description: '静态枚举数据源',
    },

    /* 远程数据源 + 字段映射 + 缓存 */
    country: {
      type: 'string',
      label: '国家',
      component: 'Select',
      wrapper: 'FormItem',
      required: true,
      dataSource: {
        url: '/api/countries',
        requestAdapter: 'antd-mock',
        labelField: 'name',
        valueField: 'id',
        cache: true,
      },
      description: '远程数据源 + 字段映射 + 默认缓存',
    },

    /* 级联：国家→省份 */
    province: {
      type: 'string',
      label: '省份/州',
      component: 'Select',
      wrapper: 'FormItem',
      required: true,
      dataSource: {
        url: '/api/provinces',
        requestAdapter: 'antd-mock',
        labelField: 'title',
        valueField: 'code',
        params: { countryId: '$values.country' },
        cache: { ttl: 30000 },
      },
      description: '依赖 country 参数 + TTL 30s',
      reactions: [
        {
          watch: 'country',
          fulfill: {
            run: (field) => {
              field.setValue('');
              field.setDataSource([]);
            },
          },
        },
      ],
    },

    /* 级联：省份→城市 */
    city: {
      type: 'string',
      label: '城市',
      component: 'Select',
      wrapper: 'FormItem',
      required: true,
      dataSource: {
        url: '/api/cities',
        requestAdapter: 'antd-mock',
        labelField: 'cname',
        valueField: 'cid',
        params: { provinceCode: '$values.province' },
      },
      description: '三级级联',
      reactions: [
        {
          watch: 'province',
          fulfill: {
            run: (field) => {
              field.setValue('');
              field.setDataSource([]);
            },
          },
        },
      ],
    },

    /* 缓存演示 */
    language: {
      type: 'string',
      label: '编程语言',
      component: 'Select',
      wrapper: 'FormItem',
      dataSource: {
        url: '/api/languages',
        requestAdapter: 'antd-mock',
        labelField: 'text',
        valueField: 'id',
        cache: true,
      },
      description: '带缓存（重复不请求）',
    },
  },
};

/**
 * 数据源场景示例
 */
export const DataSourceForm = observer(() => {
  const [result, setResult] = useState('');

  return (
    <div>
      <Title level={3}>数据源场景 - antd 组件</Title>
      <Paragraph type="secondary">
        静态枚举 / 远程 Mock / 三级级联（国家→省份→城市）/ 字段映射 / 缓存
      </Paragraph>

      <div style={{ marginBottom: 16 }}>
        <Tag color="gold">
          Mock 适配器累计请求次数：{requestCount}（带缓存的接口不重复请求）
        </Tag>
      </div>

      <ConfigForm
        schema={schema}
        initialValues={{
          priority: '',
          country: '',
          province: '',
          city: '',
          language: '',
        }}
        onSubmit={(values) => setResult(JSON.stringify(values, null, 2))}
        onSubmitFailed={(errors) =>
          setResult('验证失败:\n' + errors.map((e) => `[${e.path}] ${e.message}`).join('\n'))
        }
      >
        <Space style={{ marginTop: 16 }}>
          <Button type="primary" htmlType="submit">
            提交
          </Button>
        </Space>
      </ConfigForm>

      {result && (
        <Alert
          style={{ marginTop: 16 }}
          type={result.startsWith('验证失败') ? 'error' : 'success'}
          message="提交结果"
          description={<pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{result}</pre>}
        />
      )}
    </div>
  );
});
