/**
 * 场景 7：属性联动
 *
 * 覆盖：
 * - 动态 disabled：开关控制字段禁用
 * - 动态 required：选择类型后某些字段变必填
 * - 动态 placeholder：根据选择切换占位符
 * - 动态 componentProps：切换组件属性（如 InputNumber 的 min/max/step）
 * - 三种模式切换
 */
import React, { useState, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { ConfigForm } from '@moluoxixi/react';
import { setupAntd } from '@moluoxixi/ui-antd';
import { Button, Space, Typography, Alert, Segmented } from 'antd';
import type { FormSchema } from '@moluoxixi/schema';
import type { FieldPattern } from '@moluoxixi/shared';

const { Title, Paragraph } = Typography;

setupAntd();

/** 模式选项 */
const MODE_OPTIONS = [
  { label: '编辑态', value: 'editable' },
  { label: '阅读态', value: 'readOnly' },
  { label: '禁用态', value: 'disabled' },
];

/**
 * 构建 Schema
 *
 * @param mode - 表单模式
 */
function buildSchema(mode: FieldPattern): FormSchema {
  return {
    form: { labelPosition: 'right', labelWidth: '150px', pattern: mode },
    fields: {
      /* ---- 场景 A：开关控制 disabled ---- */
      enableRemark: {
        type: 'boolean',
        label: '启用备注',
        component: 'Switch',
        wrapper: 'FormItem',
        defaultValue: false,
      },
      remark: {
        type: 'string',
        label: '备注内容',
        component: 'Textarea',
        wrapper: 'FormItem',
        placeholder: '请先开启「启用备注」',
        disabled: true,
        reactions: [
          {
            watch: 'enableRemark',
            when: (v) => v[0] === true,
            fulfill: { state: { disabled: false } },
            otherwise: { state: { disabled: true } },
          },
        ],
      },

      /* ---- 场景 B：选择类型 → 动态 required + placeholder ---- */
      contactType: {
        type: 'string',
        label: '联系方式类型',
        component: 'Select',
        wrapper: 'FormItem',
        defaultValue: 'phone',
        enum: [
          { label: '手机', value: 'phone' },
          { label: '邮箱', value: 'email' },
          { label: '微信', value: 'wechat' },
          { label: 'QQ', value: 'qq' },
        ],
      },
      contactValue: {
        type: 'string',
        label: '联系方式',
        component: 'Input',
        wrapper: 'FormItem',
        required: true,
        placeholder: '请输入手机号',
        reactions: [
          {
            watch: 'contactType',
            fulfill: {
              run: (field, ctx) => {
                const type = ctx.values.contactType as string;
                const config: Record<string, { placeholder: string; required: boolean }> = {
                  phone: { placeholder: '请输入 11 位手机号', required: true },
                  email: { placeholder: '请输入邮箱地址', required: true },
                  wechat: { placeholder: '请输入微信号（选填）', required: false },
                  qq: { placeholder: '请输入 QQ 号（选填）', required: false },
                };
                const cfg = config[type] ?? { placeholder: '请输入', required: false };
                field.setComponentProps({ placeholder: cfg.placeholder });
                field.required = cfg.required;
              },
            },
          },
        ],
      },

      /* ---- 场景 C：产品类型 → 动态 componentProps ---- */
      productType: {
        type: 'string',
        label: '产品类型',
        component: 'RadioGroup',
        wrapper: 'FormItem',
        defaultValue: 'standard',
        enum: [
          { label: '标准品', value: 'standard' },
          { label: '计重品', value: 'weight' },
          { label: '散装品', value: 'bulk' },
        ],
      },
      quantity: {
        type: 'number',
        label: '数量',
        component: 'InputNumber',
        wrapper: 'FormItem',
        defaultValue: 1,
        description: '根据产品类型动态调整 min / max / step',
        componentProps: { min: 1, max: 9999, step: 1 },
        reactions: [
          {
            watch: 'productType',
            fulfill: {
              run: (field, ctx) => {
                const type = ctx.values.productType as string;
                if (type === 'standard') {
                  field.setComponentProps({ min: 1, max: 9999, step: 1, addonAfter: '件' });
                } else if (type === 'weight') {
                  field.setComponentProps({ min: 0.01, max: 9999, step: 0.01, addonAfter: 'kg' });
                } else {
                  field.setComponentProps({ min: 0.1, max: 99999, step: 0.1, addonAfter: 'L' });
                }
              },
            },
          },
        ],
      },

      /* ---- 场景 D：VIP 勾选 → 多字段 required 变化 ---- */
      isVip: {
        type: 'boolean',
        label: 'VIP 用户',
        component: 'Switch',
        wrapper: 'FormItem',
        defaultValue: false,
        description: '开启后「公司名称」和「工号」变为必填',
      },
      vipCompany: {
        type: 'string',
        label: '公司名称',
        component: 'Input',
        wrapper: 'FormItem',
        placeholder: '开启 VIP 后必填',
        reactions: [
          {
            watch: 'isVip',
            when: (v) => v[0] === true,
            fulfill: { state: { required: true } },
            otherwise: { state: { required: false } },
          },
        ],
      },
      vipId: {
        type: 'string',
        label: '工号',
        component: 'Input',
        wrapper: 'FormItem',
        placeholder: '开启 VIP 后必填',
        reactions: [
          {
            watch: 'isVip',
            when: (v) => v[0] === true,
            fulfill: { state: { required: true } },
            otherwise: { state: { required: false } },
          },
        ],
      },
    },
  };
}

/** 默认初始值 */
const INITIAL_VALUES: Record<string, unknown> = {
  enableRemark: false,
  remark: '',
  contactType: 'phone',
  contactValue: '',
  productType: 'standard',
  quantity: 1,
  isVip: false,
  vipCompany: '',
  vipId: '',
};

/**
 * 属性联动示例
 */
export const PropertyLinkageForm = observer((): React.ReactElement => {
  const [mode, setMode] = useState<FieldPattern>('editable');
  const [result, setResult] = useState('');
  const [savedValues, setSavedValues] = useState<Record<string, unknown>>({ ...INITIAL_VALUES });

  const schema = useMemo(() => buildSchema(mode), [mode]);

  return (
    <div>
      <Title level={3}>属性联动</Title>
      <Paragraph type="secondary">
        动态 disabled / 动态 required + placeholder / 动态 componentProps（min/max/step） / 多字段必填切换
      </Paragraph>

      <Segmented
        value={mode}
        onChange={(val) => setMode(val as FieldPattern)}
        options={MODE_OPTIONS}
        style={{ marginBottom: 16 }}
      />

      <ConfigForm
        key={mode}
        schema={schema}
        initialValues={savedValues}
        onValuesChange={(values) => setSavedValues(values as Record<string, unknown>)}
        onSubmit={(values) => setResult(JSON.stringify(values, null, 2))}
        onSubmitFailed={(errors) =>
          setResult('验证失败:\n' + errors.map((e) => `[${e.path}] ${e.message}`).join('\n'))
        }
      >
        {mode === 'editable' && (
          <Space style={{ marginTop: 16 }}>
            <Button type="primary" htmlType="submit">提交</Button>
            <Button htmlType="reset">重置</Button>
          </Space>
        )}
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
