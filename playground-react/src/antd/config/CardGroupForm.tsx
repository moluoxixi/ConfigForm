/**
 * 场景 24：卡片分组
 *
 * 覆盖：
 * - Card 组件包裹字段组
 * - 多卡片布局
 * - 卡片内独立验证提示
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

const MODE_OPTIONS = [
  { label: '编辑态', value: 'editable' },
  { label: '阅读态', value: 'readOnly' },
  { label: '禁用态', value: 'disabled' },
];

function buildSchema(mode: FieldPattern): FormSchema {
  return {
    form: { labelPosition: 'right', labelWidth: '120px', pattern: mode },
    layout: {
      type: 'groups',
      groups: [
        { title: '账户信息', component: 'Card', fields: ['username', 'password', 'confirmPwd'] },
        { title: '个人信息', component: 'Card', fields: ['realName', 'gender', 'birthday'] },
        { title: '联系方式', component: 'Card', fields: ['email', 'phone', 'address'] },
      ],
    },
    fields: {
      username: { type: 'string', label: '用户名', required: true, component: 'Input', wrapper: 'FormItem', placeholder: '请输入用户名', rules: [{ minLength: 3, message: '至少 3 字符' }] },
      password: { type: 'string', label: '密码', required: true, component: 'Password', wrapper: 'FormItem', placeholder: '请输入密码', rules: [{ minLength: 8, message: '至少 8 字符' }] },
      confirmPwd: {
        type: 'string', label: '确认密码', required: true, component: 'Password', wrapper: 'FormItem', placeholder: '再次输入',
        rules: [{ validator: (v, _r, ctx) => { if (v !== ctx.getFieldValue('password')) return '密码不一致'; return undefined; }, trigger: 'blur' }],
      },
      realName: { type: 'string', label: '真实姓名', required: true, component: 'Input', wrapper: 'FormItem', placeholder: '请输入姓名' },
      gender: {
        type: 'string', label: '性别', component: 'RadioGroup', wrapper: 'FormItem',
        enum: [{ label: '男', value: 'male' }, { label: '女', value: 'female' }],
      },
      birthday: { type: 'string', label: '生日', component: 'DatePicker', wrapper: 'FormItem' },
      email: { type: 'string', label: '邮箱', required: true, component: 'Input', wrapper: 'FormItem', placeholder: '请输入邮箱', rules: [{ format: 'email', message: '无效邮箱' }] },
      phone: { type: 'string', label: '手机号', component: 'Input', wrapper: 'FormItem', placeholder: '请输入手机号', rules: [{ format: 'phone', message: '无效手机号' }] },
      address: { type: 'string', label: '地址', component: 'Textarea', wrapper: 'FormItem', placeholder: '请输入地址' },
    },
  };
}

const INITIAL_VALUES: Record<string, unknown> = {
  username: '', password: '', confirmPwd: '', realName: '', gender: undefined, birthday: '',
  email: '', phone: '', address: '',
};

export const CardGroupForm = observer((): React.ReactElement => {
  const [mode, setMode] = useState<FieldPattern>('editable');
  const [result, setResult] = useState('');
  const [savedValues, setSavedValues] = useState<Record<string, unknown>>({ ...INITIAL_VALUES });
  const schema = useMemo(() => buildSchema(mode), [mode]);

  return (
    <div>
      <Title level={3}>卡片分组</Title>
      <Paragraph type="secondary">Card 多卡片分组布局 / 卡片内独立验证</Paragraph>
      <Segmented value={mode} onChange={(v) => setMode(v as FieldPattern)} options={MODE_OPTIONS} style={{ marginBottom: 16 }} />
      <ConfigForm
        key={mode} schema={schema} initialValues={savedValues}
        onValuesChange={(v) => setSavedValues(v as Record<string, unknown>)}
        onSubmit={(v) => setResult(JSON.stringify(v, null, 2))}
        onSubmitFailed={(e) => setResult('验证失败:\n' + e.map((x) => `[${x.path}] ${x.message}`).join('\n'))}
      >
        {mode === 'editable' && (<Space style={{ marginTop: 16 }}><Button type="primary" htmlType="submit">提交</Button><Button htmlType="reset">重置</Button></Space>)}
      </ConfigForm>
      {result && (<Alert style={{ marginTop: 16 }} type={result.startsWith('验证失败') ? 'error' : 'success'} message="提交结果" description={<pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{result}</pre>} />)}
    </div>
  );
});
