import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'
import { ConfigForm } from '@moluoxixi/react'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
import { Typography } from 'antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 8：级联选择
 *
 * 覆盖：
 * - 省市区三级联动
 * - 多级分类联动（一级分类 → 二级分类 → 三级分类）
 * - 选择后自动清空下级
 * - 三种模式切换
 */
import React from 'react'

const { Title, Paragraph } = Typography

setupAntd()

/** 工具：将 StatusTabs 的 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

/* ======================== 省市区数据 ======================== */

/** 省份数据 */
const PROVINCES = [
  { label: '北京', value: 'beijing' },
  { label: '上海', value: 'shanghai' },
  { label: '广东', value: 'guangdong' },
  { label: '浙江', value: 'zhejiang' },
]

/** 城市数据 */
const CITIES: Record<string, Array<{ label: string, value: string }>> = {
  beijing: [{ label: '东城区', value: 'dongcheng' }, { label: '西城区', value: 'xicheng' }, { label: '朝阳区', value: 'chaoyang' }],
  shanghai: [{ label: '黄浦区', value: 'huangpu' }, { label: '浦东新区', value: 'pudong' }, { label: '徐汇区', value: 'xuhui' }],
  guangdong: [{ label: '广州', value: 'guangzhou' }, { label: '深圳', value: 'shenzhen' }, { label: '珠海', value: 'zhuhai' }],
  zhejiang: [{ label: '杭州', value: 'hangzhou' }, { label: '宁波', value: 'ningbo' }, { label: '温州', value: 'wenzhou' }],
}

/** 区县数据 */
const DISTRICTS: Record<string, Array<{ label: string, value: string }>> = {
  chaoyang: [{ label: '三里屯', value: 'sanlitun' }, { label: '望京', value: 'wangjing' }],
  pudong: [{ label: '陆家嘴', value: 'lujiazui' }, { label: '张江', value: 'zhangjiang' }],
  guangzhou: [{ label: '天河区', value: 'tianhe' }, { label: '越秀区', value: 'yuexiu' }],
  shenzhen: [{ label: '南山区', value: 'nanshan' }, { label: '福田区', value: 'futian' }],
  hangzhou: [{ label: '西湖区', value: 'xihu' }, { label: '余杭区', value: 'yuhang' }],
}

/* ======================== 分类数据 ======================== */

/** 一级分类 */
const CATEGORIES_L1 = [
  { label: '电子产品', value: 'electronics' },
  { label: '服装', value: 'clothing' },
  { label: '食品', value: 'food' },
]

/** 二级分类 */
const CATEGORIES_L2: Record<string, Array<{ label: string, value: string }>> = {
  electronics: [{ label: '手机', value: 'phone' }, { label: '电脑', value: 'computer' }, { label: '平板', value: 'tablet' }],
  clothing: [{ label: '男装', value: 'men' }, { label: '女装', value: 'women' }, { label: '童装', value: 'kids' }],
  food: [{ label: '零食', value: 'snack' }, { label: '饮料', value: 'drink' }, { label: '生鲜', value: 'fresh' }],
}

/** 三级分类 */
const CATEGORIES_L3: Record<string, Array<{ label: string, value: string }>> = {
  phone: [{ label: 'iPhone', value: 'iphone' }, { label: '华为', value: 'huawei' }, { label: '小米', value: 'xiaomi' }],
  computer: [{ label: '笔记本', value: 'laptop' }, { label: '台式机', value: 'desktop' }],
  men: [{ label: '上衣', value: 'top' }, { label: '裤子', value: 'pants' }],
  women: [{ label: '裙子', value: 'skirt' }, { label: '外套', value: 'coat' }],
  snack: [{ label: '膨化食品', value: 'puffed' }, { label: '坚果', value: 'nut' }],
  drink: [{ label: '碳酸饮料', value: 'soda' }, { label: '果汁', value: 'juice' }],
}

/** 默认初始值 */
const INITIAL_VALUES: Record<string, unknown> = {
  province: undefined,
  city: undefined,
  district: undefined,
  categoryL1: undefined,
  categoryL2: undefined,
  categoryL3: undefined,
}

/** 表单 Schema */
const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '120px' },
  properties: {
    /* ---- 省市区三级联动 ---- */
    province: {
      type: 'string',
      title: '省份',
      required: true,
      component: 'Select',
      placeholder: '请选择省份',
      enum: PROVINCES,
    },
    city: {
      type: 'string',
      title: '城市',
      required: true,
      component: 'Select',
      placeholder: '请先选择省份',
      enum: [],
      reactions: [
        {
          watch: 'province',
          fulfill: {
            run: (field, ctx) => {
              const prov = ctx.values.province as string
              field.setValue(undefined)
              field.setDataSource(prov ? (CITIES[prov] ?? []) : [])
              field.setComponentProps({
                placeholder: prov ? '请选择城市' : '请先选择省份',
              })
            },
          },
        },
      ],
    },
    district: {
      type: 'string',
      title: '区县',
      component: 'Select',
      placeholder: '请先选择城市',
      enum: [],
      reactions: [
        {
          watch: 'city',
          fulfill: {
            run: (field, ctx) => {
              const c = ctx.values.city as string
              field.setValue(undefined)
              field.setDataSource(c ? (DISTRICTS[c] ?? []) : [])
              field.setComponentProps({
                placeholder: c ? '请选择区县' : '请先选择城市',
              })
            },
          },
        },
      ],
    },

    /* ---- 多级分类联动 ---- */
    categoryL1: {
      type: 'string',
      title: '一级分类',
      required: true,
      component: 'Select',
      placeholder: '请选择一级分类',
      enum: CATEGORIES_L1,
    },
    categoryL2: {
      type: 'string',
      title: '二级分类',
      required: true,
      component: 'Select',
      placeholder: '请先选择一级分类',
      enum: [],
      reactions: [
        {
          watch: 'categoryL1',
          fulfill: {
            run: (field, ctx) => {
              const l1 = ctx.values.categoryL1 as string
              field.setValue(undefined)
              field.setDataSource(l1 ? (CATEGORIES_L2[l1] ?? []) : [])
              field.setComponentProps({
                placeholder: l1 ? '请选择二级分类' : '请先选择一级分类',
              })
            },
          },
        },
      ],
    },
    categoryL3: {
      type: 'string',
      title: '三级分类',
      component: 'Select',
      placeholder: '请先选择二级分类',
      enum: [],
      reactions: [
        {
          watch: 'categoryL2',
          fulfill: {
            run: (field, ctx) => {
              const l2 = ctx.values.categoryL2 as string
              field.setValue(undefined)
              field.setDataSource(l2 ? (CATEGORIES_L3[l2] ?? []) : [])
              field.setComponentProps({
                placeholder: l2 ? '请选择三级分类' : '请先选择二级分类',
              })
            },
          },
        },
      ],
    },
  },
}

/**
 * 级联选择示例
 */
export const CascadeSelectForm = observer((): React.ReactElement => {
  return (
    <div>
      <Title level={3}>级联选择</Title>
      <Paragraph type="secondary">
        省市区三级联动 / 多级分类联动 / 选择后自动清空下级
      </Paragraph>
      <StatusTabs>
        {({ mode, showResult, showErrors }) => (
          <ConfigForm
            schema={withMode(schema, mode)}
            initialValues={INITIAL_VALUES}
            onSubmit={showResult}
            onSubmitFailed={errors => showErrors(errors)}
          />
        )}
      </StatusTabs>
    </div>
  )
})
