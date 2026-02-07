/**
 * 场景 6：值联动
 *
 * 覆盖：
 * - 单向同步：字段 A 变化，字段 B 自动跟随
 * - 格式转换：输入值自动转换（大写、去空格）
 * - 映射转换：根据 A 的值查表设置 B 的值
 * - 多对一：多个字段聚合到一个显示字段
 * - 三种模式切换
 */
import React from 'react';
import { observer } from 'mobx-react-lite';
import { setupAntd } from '@moluoxixi/ui-antd';
import { Typography } from 'antd';
import type { ISchema } from '@moluoxixi/schema';
import { PlaygroundForm } from '../../components/PlaygroundForm';

const { Title, Paragraph } = Typography;

setupAntd();

/** 国家→区号映射 */
const COUNTRY_CODE_MAP: Record<string, string> = {
  china: '+86',
  usa: '+1',
  japan: '+81',
  korea: '+82',
  uk: '+44',
};

/** 国家→货币映射 */
const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  china: 'CNY',
  usa: 'USD',
  japan: 'JPY',
  korea: 'KRW',
  uk: 'GBP',
};

/** 默认初始值 */
const INITIAL_VALUES: Record<string, unknown> = {
  firstName: '',
  lastName: '',
  fullName: '',
  rawInput: '',
  upperCase: '',
  trimmed: '',
  country: 'china',
  areaCode: '+86',
  currency: 'CNY',
  province: '',
  city: '',
  district: '',
  fullAddress: '',
};

/** 表单 Schema */
const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '150px' },
  properties: {
    /* ---- 场景 A：单向同步 ---- */
    firstName: {
      type: 'string',
      title: '姓',
      placeholder: '请输入姓',
    },
    lastName: {
      type: 'string',
      title: '名',
      placeholder: '请输入名',
    },
    fullName: {
      type: 'string',
      title: '全名（自动拼接）',
      componentProps: { disabled: true },
      description: '自动由「姓」+「名」拼接',
      reactions: [
        {
          watch: ['firstName', 'lastName'],
          fulfill: {
            run: (field, ctx) => {
              const first = (ctx.values.firstName as string) ?? '';
              const last = (ctx.values.lastName as string) ?? '';
              field.setValue(`${first}${last}`.trim());
            },
          },
        },
      ],
    },

    /* ---- 场景 B：格式转换 ---- */
    rawInput: {
      type: 'string',
      title: '输入文本',
      placeholder: '输入任意文本',
    },
    upperCase: {
      type: 'string',
      title: '大写转换',
      componentProps: { disabled: true },
      description: '自动将输入转为大写',
      reactions: [
        {
          watch: 'rawInput',
          fulfill: {
            run: (field, ctx) => {
              const raw = (ctx.values.rawInput as string) ?? '';
              field.setValue(raw.toUpperCase());
            },
          },
        },
      ],
    },
    trimmed: {
      type: 'string',
      title: '去空格结果',
      componentProps: { disabled: true },
      description: '自动去除首尾空格',
      reactions: [
        {
          watch: 'rawInput',
          fulfill: {
            run: (field, ctx) => {
              const raw = (ctx.values.rawInput as string) ?? '';
              field.setValue(raw.trim());
            },
          },
        },
      ],
    },

    /* ---- 场景 C：映射转换 ---- */
    country: {
      type: 'string',
      title: '国家',
      default: 'china',
      enum: [
        { label: '中国', value: 'china' },
        { label: '美国', value: 'usa' },
        { label: '日本', value: 'japan' },
        { label: '韩国', value: 'korea' },
        { label: '英国', value: 'uk' },
      ],
    },
    areaCode: {
      type: 'string',
      title: '区号（自动映射）',
      componentProps: { disabled: true },
      description: '根据国家自动映射区号',
      reactions: [
        {
          watch: 'country',
          fulfill: {
            run: (field, ctx) => {
              const c = (ctx.values.country as string) ?? '';
              field.setValue(COUNTRY_CODE_MAP[c] ?? '');
            },
          },
        },
      ],
    },
    currency: {
      type: 'string',
      title: '货币（自动映射）',
      componentProps: { disabled: true },
      description: '根据国家自动映射货币',
      reactions: [
        {
          watch: 'country',
          fulfill: {
            run: (field, ctx) => {
              const c = (ctx.values.country as string) ?? '';
              field.setValue(COUNTRY_CURRENCY_MAP[c] ?? '');
            },
          },
        },
      ],
    },

    /* ---- 场景 D：多对一聚合 ---- */
    province: {
      type: 'string',
      title: '省',
      placeholder: '省',
    },
    city: {
      type: 'string',
      title: '市',
      placeholder: '市',
    },
    district: {
      type: 'string',
      title: '区',
      placeholder: '区',
    },
    fullAddress: {
      type: 'string',
      title: '完整地址（聚合）',
      componentProps: { disabled: true },
      description: '自动由 省 + 市 + 区 聚合',
      reactions: [
        {
          watch: ['province', 'city', 'district'],
          fulfill: {
            run: (field, ctx) => {
              const parts = [
                ctx.values.province as string,
                ctx.values.city as string,
                ctx.values.district as string,
              ].filter(Boolean);
              field.setValue(parts.join(' '));
            },
          },
        },
      ],
    },
  },
};

/**
 * 值联动示例
 */
export const ValueLinkageForm = observer((): React.ReactElement => {
  return (
    <div>
      <Title level={3}>值联动</Title>
      <Paragraph type="secondary">
        单向同步（姓+名→全名） / 格式转换（大写、去空格） / 映射转换（国家→区号/货币） / 多对一聚合
      </Paragraph>
      <PlaygroundForm schema={schema} initialValues={INITIAL_VALUES} />
    </div>
  );
});
