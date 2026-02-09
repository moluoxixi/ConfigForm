import type { SceneConfig } from '../types';

/**
 * 场景：表达式引擎
 *
 * 演示 {{expression}} 字符串表达式语法，让联动规则可以纯 JSON 序列化。
 * 与 SchemaExpressionForm 的区别：
 * - SchemaExpressionForm 使用函数写法（需要 JavaScript 环境）
 * - 本示例使用字符串表达式（可存数据库、可远程下发、可可视化设计器编辑）
 *
 * 演示能力：
 * 1. when 条件表达式：`'{{$values.type === "urgent"}}'`
 * 2. value 计算表达式：`'{{$values.price * $values.quantity}}'`
 * 3. 数组上下文变量：`$record`、`$index`
 * 4. 混合使用（函数 + 表达式共存）
 */

/** 订单类型选项 */
const ORDER_TYPE_OPTIONS = [
  { label: '普通订单', value: 'normal' },
  { label: '加急订单', value: 'urgent' },
  { label: 'VIP 订单', value: 'vip' },
];

const config: SceneConfig = {
  title: '表达式引擎',
  description: '使用 {{expression}} 字符串表达式实现联动，Schema 可纯 JSON 序列化',

  initialValues: {
    orderType: 'normal',
    price: 100,
    quantity: 1,
    discount: 0,
    urgentFee: 0,
    totalAmount: 0,
    remark: '',
  },

  schema: {
    type: 'object',
    decoratorProps: {
      labelPosition: 'right',
      labelWidth: '140px',
      actions: { submit: '提交', reset: '重置' },
    },
    properties: {
      /* 基础字段 */
      orderType: {
        type: 'string',
        title: '订单类型',
        enum: ORDER_TYPE_OPTIONS,
        required: true,
      },
      price: {
        type: 'number',
        title: '单价',
        required: true,
        componentProps: { min: 0 },
      },
      quantity: {
        type: 'number',
        title: '数量',
        required: true,
        componentProps: { min: 1 },
      },

      /* --------- 表达式联动示例 --------- */

      /* 示例 1：when 条件表达式 — 加急订单时显示加急费 */
      urgentFee: {
        type: 'number',
        title: '加急费用',
        componentProps: { disabled: true },
        reactions: [{
          watch: ['orderType', 'price', 'quantity'],
          /* ✅ 使用字符串表达式替代函数 */
          when: '{{$values.orderType === "urgent"}}',
          fulfill: {
            state: { visible: true },
            /* ✅ value 表达式：加急费 = 总价 × 20% */
            value: '{{Math.round($values.price * $values.quantity * 0.2)}}',
          },
          otherwise: {
            state: { visible: false },
            value: 0,
          },
        }],
      },

      /* 示例 2：VIP 折扣联动 */
      discount: {
        type: 'number',
        title: '折扣（%）',
        componentProps: { disabled: true },
        reactions: [{
          watch: 'orderType',
          when: '{{$values.orderType === "vip"}}',
          fulfill: {
            state: { visible: true },
            /* VIP 固定 85 折 */
            value: 15,
          },
          otherwise: {
            state: { visible: false },
            value: 0,
          },
        }],
      },

      /* 示例 3：多字段计算表达式 — 自动计算总额 */
      totalAmount: {
        type: 'number',
        title: '订单总额（自动计算）',
        componentProps: { disabled: true },
        reactions: [{
          watch: ['price', 'quantity', 'urgentFee', 'discount'],
          fulfill: {
            /* ✅ 复杂计算表达式 */
            value: '{{Math.round(($values.price || 0) * ($values.quantity || 0) * (1 - ($values.discount || 0) / 100) + ($values.urgentFee || 0))}}',
          },
        }],
      },

      /* 示例 4：条件必填 — VIP 订单必须填备注 */
      remark: {
        type: 'string',
        title: '订单备注',
        component: 'Textarea',
        componentProps: { placeholder: '请输入备注' },
        reactions: [{
          watch: 'orderType',
          when: '{{$values.orderType === "vip"}}',
          fulfill: {
            state: { required: true },
            componentProps: { placeholder: 'VIP 订单请备注特殊需求' },
          },
          otherwise: {
            state: { required: false },
            componentProps: { placeholder: '请输入备注（可选）' },
          },
        }],
      },
    },
  },
};

export default config;
