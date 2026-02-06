/**
 * 场景 23：折叠面板分组
 *
 * 覆盖：
 * - Collapse 面板分组
 * - 默认展开 / 折叠
 * - 展开收起切换
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
        { title: '基本信息', component: 'Collapse', fields: ['name', 'email', 'phone'], collapsed: false },
        { title: '工作信息', component: 'Collapse', fields: ['company', 'position', 'salary'] },
        { title: '教育经历', component: 'Collapse', fields: ['school', 'major', 'degree'], collapsed: true },
        { title: '其他信息', component: 'Collapse', fields: ['bio', 'hobby'], collapsed: true },
      ],
    },
    fields: {
      name: { type: 'string', label: '姓名', required: true, component: 'Input', wrapper: 'FormItem', placeholder: '请输入姓名' },
      email: { type: 'string', label: '邮箱', required: true, component: 'Input', wrapper: 'FormItem', placeholder: '请输入邮箱', rules: [{ format: 'email', message: '无效邮箱' }] },
      phone: { type: 'string', label: '手机号', component: 'Input', wrapper: 'FormItem', placeholder: '请输入手机号' },
      company: { type: 'string', label: '公司', component: 'Input', wrapper: 'FormItem', placeholder: '请输入公司' },
      position: { type: 'string', label: '职位', component: 'Input', wrapper: 'FormItem', placeholder: '请输入职位' },
      salary: { type: 'number', label: '薪资', component: 'InputNumber', wrapper: 'FormItem', componentProps: { min: 0, style: { width: '100%' } } },
      school: { type: 'string', label: '学校', component: 'Input', wrapper: 'FormItem', placeholder: '请输入学校' },
      major: { type: 'string', label: '专业', component: 'Input', wrapper: 'FormItem', placeholder: '请输入专业' },
      degree: {
        type: 'string', label: '学历', component: 'Select', wrapper: 'FormItem',
        enum: [{ label: '本科', value: 'bachelor' }, { label: '硕士', value: 'master' }, { label: '博士', value: 'phd' }],
      },
      bio: { type: 'string', label: '简介', component: 'Textarea', wrapper: 'FormItem', placeholder: '请输入简介' },
      hobby: { type: 'string', label: '爱好', component: 'Input', wrapper: 'FormItem', placeholder: '请输入爱好' },
    },
  };
}

const INITIAL_VALUES: Record<string, unknown> = {
  name: '', email: '', phone: '', company: '', position: '', salary: undefined,
  school: '', major: '', degree: undefined, bio: '', hobby: '',
};

export const CollapseGroupForm = observer((): React.ReactElement => {
  const [mode, setMode] = useState<FieldPattern>('editable');
  const [result, setResult] = useState('');
  const [savedValues, setSavedValues] = useState<Record<string, unknown>>({ ...INITIAL_VALUES });
  const schema = useMemo(() => buildSchema(mode), [mode]);

  return (
    <div>
      <Title level={3}>折叠面板分组</Title>
      <Paragraph type="secondary">Collapse 分组 / 默认展开 / 折叠切换</Paragraph>
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
