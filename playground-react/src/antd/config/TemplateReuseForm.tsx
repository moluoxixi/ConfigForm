/**
 * 场景 27：模板复用
 *
 * 覆盖：
 * - Schema 片段复用（公共字段定义提取）
 * - 继承与覆盖（基于模板扩展）
 * - 组合多个片段
 * - 三种模式切换
 */
import React, { useState, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { ConfigForm } from '@moluoxixi/react';
import { setupAntd } from '@moluoxixi/ui-antd';
import { Button, Space, Typography, Alert, Segmented, Tag } from 'antd';
import type { FormSchema, FieldSchema } from '@moluoxixi/schema';
import type { FieldPattern } from '@moluoxixi/shared';

const { Title, Paragraph, Text } = Typography;

setupAntd();

const MODE_OPTIONS = [
  { label: '编辑态', value: 'editable' },
  { label: '阅读态', value: 'readOnly' },
  { label: '禁用态', value: 'disabled' },
];

/* ======================== Schema 片段（可复用模板） ======================== */

/** 通用个人信息片段 */
const PERSON_FRAGMENT: Record<string, FieldSchema> = {
  name: { type: 'string', label: '姓名', required: true, component: 'Input', wrapper: 'FormItem', placeholder: '请输入姓名', rules: [{ minLength: 2, message: '至少 2 字' }] },
  phone: { type: 'string', label: '手机号', required: true, component: 'Input', wrapper: 'FormItem', placeholder: '请输入手机号', rules: [{ format: 'phone', message: '无效手机号' }] },
  email: { type: 'string', label: '邮箱', component: 'Input', wrapper: 'FormItem', placeholder: '请输入邮箱', rules: [{ format: 'email', message: '无效邮箱' }] },
};

/** 通用地址片段 */
const ADDRESS_FRAGMENT: Record<string, FieldSchema> = {
  province: { type: 'string', label: '省份', component: 'Select', wrapper: 'FormItem', enum: [{ label: '北京', value: 'bj' }, { label: '上海', value: 'sh' }, { label: '广东', value: 'gd' }] },
  city: { type: 'string', label: '城市', component: 'Input', wrapper: 'FormItem', placeholder: '请输入城市' },
  address: { type: 'string', label: '详细地址', component: 'Textarea', wrapper: 'FormItem', placeholder: '请输入详细地址' },
};

/** 通用备注片段 */
const REMARK_FRAGMENT: Record<string, FieldSchema> = {
  remark: { type: 'string', label: '备注', component: 'Textarea', wrapper: 'FormItem', placeholder: '请输入备注', rules: [{ maxLength: 500, message: '不超过 500 字' }] },
};

/* ======================== 组合模板 ======================== */

type TemplateKey = 'employee' | 'customer' | 'supplier';

/**
 * 合并多个片段为完整 Schema
 *
 * @param fragments - 字段片段数组
 * @param overrides - 覆盖字段
 * @param mode - 表单模式
 */
function composeSchema(
  fragments: Array<Record<string, FieldSchema>>,
  overrides: Record<string, Partial<FieldSchema>>,
  mode: FieldPattern,
): FormSchema {
  const fields: Record<string, FieldSchema> = {};
  for (const fragment of fragments) {
    Object.assign(fields, fragment);
  }
  /* 应用覆盖 */
  for (const [key, override] of Object.entries(overrides)) {
    if (fields[key]) {
      fields[key] = { ...fields[key], ...override };
    } else {
      fields[key] = override as FieldSchema;
    }
  }
  return {
    form: { labelPosition: 'right', labelWidth: '120px', pattern: mode },
    fields,
  };
}

/** 模板配置 */
const TEMPLATES: Record<TemplateKey, { label: string; fragments: Array<Record<string, FieldSchema>>; overrides: Record<string, Partial<FieldSchema>> }> = {
  employee: {
    label: '员工入职',
    fragments: [PERSON_FRAGMENT, ADDRESS_FRAGMENT, REMARK_FRAGMENT],
    overrides: {
      department: { type: 'string', label: '部门', required: true, component: 'Select', wrapper: 'FormItem', enum: [{ label: '技术', value: 'tech' }, { label: '产品', value: 'product' }, { label: '设计', value: 'design' }] },
      position: { type: 'string', label: '职位', required: true, component: 'Input', wrapper: 'FormItem', placeholder: '请输入职位' },
      name: { type: 'string', label: '员工姓名', required: true, component: 'Input', wrapper: 'FormItem', placeholder: '请输入员工姓名', rules: [{ minLength: 2, message: '至少 2 字' }] },
    },
  },
  customer: {
    label: '客户登记',
    fragments: [PERSON_FRAGMENT, ADDRESS_FRAGMENT, REMARK_FRAGMENT],
    overrides: {
      company: { type: 'string', label: '所属公司', component: 'Input', wrapper: 'FormItem', placeholder: '请输入公司名称' },
      level: { type: 'string', label: '客户等级', component: 'Select', wrapper: 'FormItem', enum: [{ label: '普通', value: 'normal' }, { label: 'VIP', value: 'vip' }, { label: '战略', value: 'strategic' }] },
      name: { type: 'string', label: '客户姓名', required: true, component: 'Input', wrapper: 'FormItem', placeholder: '请输入客户姓名', rules: [{ minLength: 2, message: '至少 2 字' }] },
    },
  },
  supplier: {
    label: '供应商注册',
    fragments: [PERSON_FRAGMENT, ADDRESS_FRAGMENT, REMARK_FRAGMENT],
    overrides: {
      companyName: { type: 'string', label: '公司名称', required: true, component: 'Input', wrapper: 'FormItem', placeholder: '公司全称' },
      creditCode: { type: 'string', label: '信用代码', required: true, component: 'Input', wrapper: 'FormItem', placeholder: '18 位', rules: [{ pattern: /^[0-9A-Z]{18}$/, message: '无效信用代码' }] },
      supplyCategory: { type: 'string', label: '供应品类', required: true, component: 'Select', wrapper: 'FormItem', enum: [{ label: '原材料', value: 'raw' }, { label: '零部件', value: 'parts' }, { label: '服务', value: 'service' }] },
      name: { type: 'string', label: '联系人', required: true, component: 'Input', wrapper: 'FormItem', placeholder: '联系人姓名', rules: [{ minLength: 2, message: '至少 2 字' }] },
    },
  },
};

export const TemplateReuseForm = observer((): React.ReactElement => {
  const [mode, setMode] = useState<FieldPattern>('editable');
  const [template, setTemplate] = useState<TemplateKey>('employee');
  const [result, setResult] = useState('');

  const currentTemplate = TEMPLATES[template];
  const schema = useMemo(
    () => composeSchema(currentTemplate.fragments, currentTemplate.overrides, mode),
    [template, mode],
  );

  return (
    <div>
      <Title level={3}>模板复用</Title>
      <Paragraph type="secondary">
        Schema 片段（个人信息 / 地址 / 备注）+ 继承覆盖 = 不同业务表单
      </Paragraph>

      <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
        <Segmented value={mode} onChange={(v) => setMode(v as FieldPattern)} options={MODE_OPTIONS} />
        <Segmented
          value={template}
          onChange={(v) => { setTemplate(v as TemplateKey); setResult(''); }}
          options={Object.entries(TEMPLATES).map(([k, v]) => ({ label: v.label, value: k }))}
        />
      </Space>

      <Space style={{ marginBottom: 12 }}>
        <Tag color="blue">复用片段：个人信息 + 地址 + 备注</Tag>
        <Tag color="green">扩展字段：{Object.keys(currentTemplate.overrides).filter((k) => !['name', 'phone', 'email'].includes(k)).length} 个</Tag>
      </Space>

      <ConfigForm
        key={`${template}-${mode}`}
        schema={schema}
        onSubmit={(v) => setResult(JSON.stringify(v, null, 2))}
        onSubmitFailed={(e) => setResult('验证失败:\n' + e.map((x) => `[${x.path}] ${x.message}`).join('\n'))}
      >
        {mode === 'editable' && (<Space style={{ marginTop: 16 }}><Button type="primary" htmlType="submit">提交</Button><Button htmlType="reset">重置</Button></Space>)}
      </ConfigForm>

      {result && (<Alert style={{ marginTop: 16 }} type={result.startsWith('验证失败') ? 'error' : 'success'} message="提交结果" description={<pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{result}</pre>} />)}
    </div>
  );
});
