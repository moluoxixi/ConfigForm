/**
 * 场景 14：嵌套对象
 *
 * 覆盖：
 * - 对象嵌套（properties 定义子字段）
 * - 多层路径取值（a.b.c 深层嵌套）
 * - 嵌套对象内联动
 * - 三种模式切换
 */
import React, { useState, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { ConfigForm } from '@moluoxixi/react';
import { setupAntd } from '@moluoxixi/ui-antd';
import { Button, Space, Typography, Alert, Segmented, Divider } from 'antd';
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
    form: { labelPosition: 'right', labelWidth: '160px', pattern: mode },
    fields: {
      /* 顶层字段 */
      title: {
        type: 'string',
        label: '标题',
        required: true,
        component: 'Input',
        wrapper: 'FormItem',
        placeholder: '请输入标题',
      },

      /* ---- 一级嵌套：个人信息 ---- */
      'profile.name': {
        type: 'string',
        label: '姓名',
        required: true,
        component: 'Input',
        wrapper: 'FormItem',
        placeholder: '请输入姓名',
      },
      'profile.age': {
        type: 'number',
        label: '年龄',
        component: 'InputNumber',
        wrapper: 'FormItem',
        componentProps: { min: 0, max: 150, style: { width: '100%' } },
      },
      'profile.gender': {
        type: 'string',
        label: '性别',
        component: 'Select',
        wrapper: 'FormItem',
        enum: [
          { label: '男', value: 'male' },
          { label: '女', value: 'female' },
        ],
      },

      /* ---- 二级嵌套：联系方式 ---- */
      'profile.contact.phone': {
        type: 'string',
        label: '手机号',
        component: 'Input',
        wrapper: 'FormItem',
        placeholder: '请输入手机号',
        rules: [{ format: 'phone', message: '请输入有效手机号' }],
      },
      'profile.contact.email': {
        type: 'string',
        label: '邮箱',
        component: 'Input',
        wrapper: 'FormItem',
        placeholder: '请输入邮箱',
        rules: [{ format: 'email', message: '请输入有效邮箱' }],
      },

      /* ---- 三级嵌套：地址信息 ---- */
      'profile.address.province': {
        type: 'string',
        label: '省份',
        component: 'Select',
        wrapper: 'FormItem',
        placeholder: '请选择省份',
        enum: [
          { label: '北京', value: 'beijing' },
          { label: '上海', value: 'shanghai' },
          { label: '广东', value: 'guangdong' },
        ],
      },
      'profile.address.city': {
        type: 'string',
        label: '城市',
        component: 'Input',
        wrapper: 'FormItem',
        placeholder: '请输入城市',
      },
      'profile.address.detail': {
        type: 'string',
        label: '详细地址',
        component: 'Textarea',
        wrapper: 'FormItem',
        placeholder: '请输入详细地址',
      },

      /* ---- 独立嵌套对象：公司信息 ---- */
      'company.name': {
        type: 'string',
        label: '公司名称',
        component: 'Input',
        wrapper: 'FormItem',
        placeholder: '请输入公司名称',
      },
      'company.department': {
        type: 'string',
        label: '部门',
        component: 'Input',
        wrapper: 'FormItem',
        placeholder: '请输入部门',
      },
      'company.position': {
        type: 'string',
        label: '职位',
        component: 'Input',
        wrapper: 'FormItem',
        placeholder: '请输入职位',
      },

      /* ---- 嵌套内联动 ---- */
      'settings.theme': {
        type: 'string',
        label: '主题',
        component: 'RadioGroup',
        wrapper: 'FormItem',
        defaultValue: 'light',
        enum: [
          { label: '亮色', value: 'light' },
          { label: '暗色', value: 'dark' },
          { label: '自定义', value: 'custom' },
        ],
      },
      'settings.customColor': {
        type: 'string',
        label: '自定义颜色',
        component: 'Input',
        wrapper: 'FormItem',
        placeholder: '如 #1677ff',
        visible: false,
        reactions: [
          {
            watch: 'settings.theme',
            when: (v) => v[0] === 'custom',
            fulfill: { state: { visible: true, required: true } },
            otherwise: { state: { visible: false, required: false } },
          },
        ],
      },
    },
  };
}

/** 默认初始值 */
const INITIAL_VALUES: Record<string, unknown> = {
  title: '',
  profile: {
    name: '',
    age: undefined,
    gender: undefined,
    contact: { phone: '', email: '' },
    address: { province: undefined, city: '', detail: '' },
  },
  company: { name: '', department: '', position: '' },
  settings: { theme: 'light', customColor: '' },
};

/**
 * 嵌套对象示例
 */
export const NestedObjectForm = observer((): React.ReactElement => {
  const [mode, setMode] = useState<FieldPattern>('editable');
  const [result, setResult] = useState('');
  const [savedValues, setSavedValues] = useState<Record<string, unknown>>({ ...INITIAL_VALUES });

  const schema = useMemo(() => buildSchema(mode), [mode]);

  return (
    <div>
      <Title level={3}>嵌套对象</Title>
      <Paragraph type="secondary">
        一级嵌套（profile.name） / 多层嵌套（profile.contact.phone） / 嵌套内联动（settings.theme → customColor）
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
          <>
            <Divider />
            <Space>
              <Button type="primary" htmlType="submit">提交</Button>
              <Button htmlType="reset">重置</Button>
            </Space>
          </>
        )}
      </ConfigForm>

      {result && (
        <Alert
          style={{ marginTop: 16 }}
          type={result.startsWith('验证失败') ? 'error' : 'success'}
          message="提交结果（嵌套结构）"
          description={<pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{result}</pre>}
        />
      )}
    </div>
  );
});
