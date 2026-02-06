/**
 * 场景 5：显隐联动
 *
 * 覆盖：
 * - 单字段控制：用户类型切换显示不同字段组
 * - 多字段控制：开关控制多个字段显隐
 * - 嵌套显隐：A 控制 B 显示，B 控制 C 显示
 * - excludeWhenHidden 隐藏时排除提交数据
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
    form: { labelPosition: 'right', labelWidth: '140px', pattern: mode },
    fields: {
      /* ---- 场景 A：类型切换显隐 ---- */
      userType: {
        type: 'string',
        label: '用户类型',
        required: true,
        component: 'RadioGroup',
        wrapper: 'FormItem',
        defaultValue: 'personal',
        enum: [
          { label: '个人', value: 'personal' },
          { label: '企业', value: 'business' },
        ],
      },

      /* 个人字段 */
      realName: {
        type: 'string',
        label: '真实姓名',
        required: true,
        component: 'Input',
        wrapper: 'FormItem',
        placeholder: '请输入真实姓名',
        excludeWhenHidden: true,
        reactions: [
          {
            watch: 'userType',
            when: (v) => v[0] === 'personal',
            fulfill: { state: { visible: true } },
            otherwise: { state: { visible: false } },
          },
        ],
      },
      idCard: {
        type: 'string',
        label: '身份证号',
        component: 'Input',
        wrapper: 'FormItem',
        placeholder: '18 位身份证号',
        excludeWhenHidden: true,
        rules: [{ pattern: /^\d{17}[\dXx]$/, message: '请输入有效身份证号' }],
        reactions: [
          {
            watch: 'userType',
            when: (v) => v[0] === 'personal',
            fulfill: { state: { visible: true } },
            otherwise: { state: { visible: false } },
          },
        ],
      },

      /* 企业字段 */
      companyName: {
        type: 'string',
        label: '公司名称',
        required: true,
        component: 'Input',
        wrapper: 'FormItem',
        placeholder: '请输入公司全称',
        visible: false,
        excludeWhenHidden: true,
        reactions: [
          {
            watch: 'userType',
            when: (v) => v[0] === 'business',
            fulfill: { state: { visible: true } },
            otherwise: { state: { visible: false } },
          },
        ],
      },
      taxNumber: {
        type: 'string',
        label: '税号',
        component: 'Input',
        wrapper: 'FormItem',
        placeholder: '纳税人识别号',
        visible: false,
        excludeWhenHidden: true,
        reactions: [
          {
            watch: 'userType',
            when: (v) => v[0] === 'business',
            fulfill: { state: { visible: true } },
            otherwise: { state: { visible: false } },
          },
        ],
      },

      /* ---- 场景 B：开关控制多字段 ---- */
      enableNotify: {
        type: 'boolean',
        label: '开启通知',
        component: 'Switch',
        wrapper: 'FormItem',
        defaultValue: false,
      },
      notifyEmail: {
        type: 'string',
        label: '通知邮箱',
        component: 'Input',
        wrapper: 'FormItem',
        placeholder: '通知邮箱',
        visible: false,
        excludeWhenHidden: true,
        rules: [{ format: 'email', message: '请输入有效邮箱' }],
        reactions: [
          {
            watch: 'enableNotify',
            when: (v) => v[0] === true,
            fulfill: { state: { visible: true } },
            otherwise: { state: { visible: false } },
          },
        ],
      },
      notifyFrequency: {
        type: 'string',
        label: '通知频率',
        component: 'Select',
        wrapper: 'FormItem',
        visible: false,
        excludeWhenHidden: true,
        enum: [
          { label: '实时', value: 'realtime' },
          { label: '每日', value: 'daily' },
          { label: '每周', value: 'weekly' },
        ],
        reactions: [
          {
            watch: 'enableNotify',
            when: (v) => v[0] === true,
            fulfill: { state: { visible: true } },
            otherwise: { state: { visible: false } },
          },
        ],
      },

      /* ---- 场景 C：嵌套显隐（A→B→C） ---- */
      hasAddress: {
        type: 'boolean',
        label: '填写地址',
        component: 'Switch',
        wrapper: 'FormItem',
        defaultValue: false,
      },
      city: {
        type: 'string',
        label: '城市',
        component: 'Input',
        wrapper: 'FormItem',
        placeholder: '请输入城市',
        visible: false,
        excludeWhenHidden: true,
        reactions: [
          {
            watch: 'hasAddress',
            when: (v) => v[0] === true,
            fulfill: { state: { visible: true } },
            otherwise: { state: { visible: false } },
          },
        ],
      },
      hasDetailAddress: {
        type: 'boolean',
        label: '填写详细地址',
        component: 'Switch',
        wrapper: 'FormItem',
        visible: false,
        defaultValue: false,
        reactions: [
          {
            watch: 'hasAddress',
            when: (v) => v[0] === true,
            fulfill: { state: { visible: true } },
            otherwise: { state: { visible: false } },
          },
        ],
      },
      detailAddress: {
        type: 'string',
        label: '详细地址',
        component: 'Textarea',
        wrapper: 'FormItem',
        placeholder: '街道门牌号',
        visible: false,
        excludeWhenHidden: true,
        reactions: [
          {
            watch: ['hasAddress', 'hasDetailAddress'],
            when: (v) => v[0] === true && v[1] === true,
            fulfill: { state: { visible: true } },
            otherwise: { state: { visible: false } },
          },
        ],
      },
    },
  };
}

/** 默认初始值 */
const INITIAL_VALUES: Record<string, unknown> = {
  userType: 'personal',
  realName: '',
  idCard: '',
  companyName: '',
  taxNumber: '',
  enableNotify: false,
  notifyEmail: '',
  notifyFrequency: undefined,
  hasAddress: false,
  city: '',
  hasDetailAddress: false,
  detailAddress: '',
};

/**
 * 显隐联动示例
 */
export const VisibilityLinkageForm = observer((): React.ReactElement => {
  const [mode, setMode] = useState<FieldPattern>('editable');
  const [result, setResult] = useState('');
  const [savedValues, setSavedValues] = useState<Record<string, unknown>>({ ...INITIAL_VALUES });

  const schema = useMemo(() => buildSchema(mode), [mode]);

  return (
    <div>
      <Title level={3}>显隐联动</Title>
      <Paragraph type="secondary">
        用户类型切换 / 开关控制多字段 / 嵌套显隐（A→B→C） / 隐藏字段排除提交
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
            <Button type="primary" htmlType="submit">提交（隐藏字段已排除）</Button>
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
