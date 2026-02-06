/**
 * 场景 26：动态 Schema
 *
 * 覆盖：
 * - 运行时 Schema 合并（mergeSchema）
 * - 场景切换（个人 / 企业 / 学生）
 * - Schema 热更新
 * - 三种模式切换
 */
import React, { useState, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { ConfigForm } from '@moluoxixi/react';
import { mergeSchema } from '@moluoxixi/schema';
import { setupAntd } from '@moluoxixi/ui-antd';
import { Button, Space, Typography, Alert, Segmented, Tag, Collapse } from 'antd';
import type { FormSchema } from '@moluoxixi/schema';
import type { FieldPattern } from '@moluoxixi/shared';

const { Title, Paragraph } = Typography;

setupAntd();

const MODE_OPTIONS = [
  { label: '编辑态', value: 'editable' },
  { label: '阅读态', value: 'readOnly' },
  { label: '禁用态', value: 'disabled' },
];

type ScenarioKey = 'individual' | 'enterprise' | 'student';

/** 基础 Schema（所有场景共享） */
const BASE_SCHEMA: FormSchema = {
  form: { labelPosition: 'right', labelWidth: '120px' },
  fields: {
    name: { type: 'string', label: '姓名', required: true, component: 'Input', wrapper: 'FormItem', placeholder: '请输入姓名', order: 1 },
    phone: { type: 'string', label: '手机号', required: true, component: 'Input', wrapper: 'FormItem', placeholder: '请输入手机号', rules: [{ format: 'phone', message: '无效手机号' }], order: 2 },
    email: { type: 'string', label: '邮箱', component: 'Input', wrapper: 'FormItem', placeholder: '请输入邮箱', rules: [{ format: 'email', message: '无效邮箱' }], order: 3 },
    remark: { type: 'string', label: '备注', component: 'Textarea', wrapper: 'FormItem', placeholder: '请输入备注', order: 99 },
  },
};

/** 场景覆盖 Schema */
const SCENARIO_SCHEMAS: Record<ScenarioKey, { label: string; override: Partial<FormSchema> }> = {
  individual: {
    label: '个人用户',
    override: {
      fields: {
        idCard: { type: 'string', label: '身份证号', required: true, component: 'Input', wrapper: 'FormItem', placeholder: '18 位身份证号', rules: [{ pattern: /^\d{17}[\dXx]$/, message: '无效身份证号' }], order: 4 },
        city: { type: 'string', label: '居住城市', component: 'Select', wrapper: 'FormItem', enum: [{ label: '北京', value: 'beijing' }, { label: '上海', value: 'shanghai' }, { label: '广州', value: 'guangzhou' }], order: 5 },
      },
    },
  },
  enterprise: {
    label: '企业用户',
    override: {
      fields: {
        name: { type: 'string', label: '联系人', required: true, component: 'Input', wrapper: 'FormItem', placeholder: '联系人姓名', order: 1 },
        companyName: { type: 'string', label: '公司名称', required: true, component: 'Input', wrapper: 'FormItem', placeholder: '公司全称', order: 4 },
        creditCode: { type: 'string', label: '信用代码', required: true, component: 'Input', wrapper: 'FormItem', placeholder: '18 位信用代码', rules: [{ pattern: /^[0-9A-Z]{18}$/, message: '无效信用代码' }], order: 5 },
        industry: { type: 'string', label: '行业', component: 'Select', wrapper: 'FormItem', enum: [{ label: 'IT', value: 'it' }, { label: '金融', value: 'finance' }, { label: '制造', value: 'mfg' }], order: 6 },
      },
    },
  },
  student: {
    label: '学生认证',
    override: {
      fields: {
        school: { type: 'string', label: '学校', required: true, component: 'Input', wrapper: 'FormItem', placeholder: '学校全称', order: 4 },
        studentId: { type: 'string', label: '学号', required: true, component: 'Input', wrapper: 'FormItem', placeholder: '学号', rules: [{ pattern: /^\d{8,14}$/, message: '学号 8-14 位数字' }], order: 5 },
        major: { type: 'string', label: '专业', required: true, component: 'Input', wrapper: 'FormItem', placeholder: '专业名称', order: 6 },
      },
    },
  },
};

export const DynamicSchemaForm = observer((): React.ReactElement => {
  const [mode, setMode] = useState<FieldPattern>('editable');
  const [scenario, setScenario] = useState<ScenarioKey>('individual');
  const [result, setResult] = useState('');

  const mergedSchema = useMemo<FormSchema>(() => {
    const merged = mergeSchema(BASE_SCHEMA, SCENARIO_SCHEMAS[scenario].override);
    return { ...merged, form: { ...merged.form, pattern: mode } };
  }, [scenario, mode]);

  return (
    <div>
      <Title level={3}>动态 Schema</Title>
      <Paragraph type="secondary">mergeSchema 合并 / 场景切换 / 热更新</Paragraph>

      <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
        <Segmented value={mode} onChange={(v) => setMode(v as FieldPattern)} options={MODE_OPTIONS} />
        <Segmented
          value={scenario}
          onChange={(v) => { setScenario(v as ScenarioKey); setResult(''); }}
          options={Object.entries(SCENARIO_SCHEMAS).map(([k, v]) => ({ label: v.label, value: k }))}
        />
      </Space>

      <Tag color="green" style={{ marginBottom: 12 }}>
        当前：{SCENARIO_SCHEMAS[scenario].label} | 字段数：{Object.keys(mergedSchema.fields).length}
      </Tag>

      <ConfigForm
        key={`${scenario}-${mode}`}
        schema={mergedSchema}
        onSubmit={(v) => setResult(JSON.stringify(v, null, 2))}
        onSubmitFailed={(e) => setResult('验证失败:\n' + e.map((x) => `[${x.path}] ${x.message}`).join('\n'))}
      >
        {mode === 'editable' && (<Space style={{ marginTop: 16 }}><Button type="primary" htmlType="submit">提交</Button><Button htmlType="reset">重置</Button></Space>)}
      </ConfigForm>

      <Collapse style={{ marginTop: 16 }} items={[{ key: '1', label: '查看合并后 Schema', children: <pre style={{ margin: 0, fontSize: 12, maxHeight: 300, overflow: 'auto' }}>{JSON.stringify(mergedSchema, null, 2)}</pre> }]} />

      {result && (<Alert style={{ marginTop: 16 }} type={result.startsWith('验证失败') ? 'error' : 'success'} message="提交结果" description={<pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{result}</pre>} />)}
    </div>
  );
});
