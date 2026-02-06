/**
 * 动态 Schema - antd 版
 *
 * 覆盖场景：
 * - 场景切换（个人/企业/学生三种注册模式）
 * - mergeSchema 合并继承
 * - Schema 热更新
 */
import React, { useState, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { ConfigForm } from '@moluoxixi/react';
import { mergeSchema } from '@moluoxixi/schema';
import { setupAntd } from '@moluoxixi/ui-antd';
import { Button, Space, Typography, Alert, Segmented, Tag, Collapse } from 'antd';
import type { FormSchema } from '@moluoxixi/schema';

const { Title, Paragraph, Text } = Typography;

setupAntd();

/* ======================== 基础 Schema ======================== */

/** 所有场景共享的基础字段 */
const BASE_SCHEMA: FormSchema = {
  form: {
    labelPosition: 'right',
    labelWidth: '120px',
  },
  fields: {
    name: {
      type: 'string',
      label: '姓名',
      required: true,
      component: 'Input',
      wrapper: 'FormItem',
      placeholder: '请输入姓名',
      rules: [{ minLength: 2, maxLength: 20, message: '姓名 2-20 个字符' }],
      order: 1,
    },
    phone: {
      type: 'string',
      label: '手机号',
      required: true,
      component: 'Input',
      wrapper: 'FormItem',
      placeholder: '请输入手机号',
      rules: [{ format: 'phone', message: '请输入有效手机号' }],
      order: 2,
    },
    email: {
      type: 'string',
      label: '邮箱',
      component: 'Input',
      wrapper: 'FormItem',
      placeholder: '请输入邮箱',
      rules: [{ format: 'email', message: '请输入有效邮箱' }],
      order: 3,
    },
    remark: {
      type: 'string',
      label: '备注',
      component: 'Textarea',
      wrapper: 'FormItem',
      placeholder: '请输入备注',
      order: 99,
    },
  },
};

/* ======================== 场景覆盖 Schema ======================== */

type ScenarioKey = 'individual' | 'enterprise' | 'student';

interface ScenarioConfig {
  label: string;
  description: string;
  overrideSchema: Partial<FormSchema>;
}

/** 个人用户 */
const INDIVIDUAL_OVERRIDE: Partial<FormSchema> = {
  fields: {
    idCard: {
      type: 'string',
      label: '身份证号',
      required: true,
      component: 'Input',
      wrapper: 'FormItem',
      placeholder: '请输入 18 位身份证号',
      rules: [{ pattern: /^\d{17}[\dXx]$/, message: '请输入有效身份证号' }],
      order: 4,
    },
    city: {
      type: 'string',
      label: '居住城市',
      component: 'Select',
      wrapper: 'FormItem',
      enum: [
        { label: '北京', value: 'beijing' },
        { label: '上海', value: 'shanghai' },
        { label: '广州', value: 'guangzhou' },
        { label: '深圳', value: 'shenzhen' },
        { label: '杭州', value: 'hangzhou' },
      ],
      order: 5,
    },
    remark: {
      type: 'string',
      label: '个人简介',
      component: 'Textarea',
      wrapper: 'FormItem',
      placeholder: '简单介绍一下自己',
      order: 99,
    },
  },
};

/** 企业用户 */
const ENTERPRISE_OVERRIDE: Partial<FormSchema> = {
  fields: {
    name: {
      type: 'string',
      label: '联系人',
      required: true,
      component: 'Input',
      wrapper: 'FormItem',
      placeholder: '请输入联系人姓名',
      rules: [{ minLength: 2, maxLength: 20, message: '姓名 2-20 个字符' }],
      order: 1,
    },
    companyName: {
      type: 'string',
      label: '公司名称',
      required: true,
      component: 'Input',
      wrapper: 'FormItem',
      placeholder: '请输入公司全称',
      rules: [{ minLength: 4, message: '公司名称至少 4 个字符' }],
      order: 4,
    },
    creditCode: {
      type: 'string',
      label: '信用代码',
      required: true,
      component: 'Input',
      wrapper: 'FormItem',
      placeholder: '18 位统一社会信用代码',
      rules: [{ pattern: /^[0-9A-Z]{18}$/, message: '请输入有效的 18 位信用代码' }],
      order: 5,
    },
    companySize: {
      type: 'string',
      label: '公司规模',
      component: 'Select',
      wrapper: 'FormItem',
      enum: [
        { label: '1-50 人', value: 'small' },
        { label: '50-200 人', value: 'medium' },
        { label: '200-1000 人', value: 'large' },
        { label: '1000 人以上', value: 'xlarge' },
      ],
      order: 6,
    },
    industry: {
      type: 'string',
      label: '所属行业',
      component: 'Select',
      wrapper: 'FormItem',
      enum: [
        { label: '互联网/IT', value: 'it' },
        { label: '金融', value: 'finance' },
        { label: '制造业', value: 'manufacturing' },
        { label: '教育', value: 'education' },
        { label: '医疗', value: 'medical' },
      ],
      order: 7,
    },
    remark: {
      type: 'string',
      label: '合作需求',
      component: 'Textarea',
      wrapper: 'FormItem',
      placeholder: '描述合作需求或期望',
      order: 99,
    },
  },
};

/** 学生用户 */
const STUDENT_OVERRIDE: Partial<FormSchema> = {
  fields: {
    phone: {
      type: 'string',
      label: '手机号',
      required: false,
      component: 'Input',
      wrapper: 'FormItem',
      placeholder: '手机号（选填）',
      rules: [{ format: 'phone', message: '请输入有效手机号' }],
      order: 2,
    },
    school: {
      type: 'string',
      label: '学校名称',
      required: true,
      component: 'Input',
      wrapper: 'FormItem',
      placeholder: '请输入学校全称',
      order: 4,
    },
    studentId: {
      type: 'string',
      label: '学号',
      required: true,
      component: 'Input',
      wrapper: 'FormItem',
      placeholder: '请输入学号',
      rules: [{ pattern: /^\d{8,14}$/, message: '学号 8-14 位数字' }],
      order: 5,
    },
    major: {
      type: 'string',
      label: '专业',
      required: true,
      component: 'Input',
      wrapper: 'FormItem',
      placeholder: '请输入专业',
      order: 6,
    },
    enrollYear: {
      type: 'string',
      label: '入学年份',
      component: 'Select',
      wrapper: 'FormItem',
      enum: [
        { label: '2026', value: '2026' },
        { label: '2025', value: '2025' },
        { label: '2024', value: '2024' },
        { label: '2023', value: '2023' },
        { label: '2022', value: '2022' },
      ],
      order: 7,
    },
    remark: {
      type: 'string',
      label: '自我介绍',
      component: 'Textarea',
      wrapper: 'FormItem',
      placeholder: '兴趣、特长等',
      order: 99,
    },
  },
};

/** 场景配置 */
const SCENARIOS: Record<ScenarioKey, ScenarioConfig> = {
  individual: { label: '个人用户', description: '基础字段 + 身份证 + 城市', overrideSchema: INDIVIDUAL_OVERRIDE },
  enterprise: { label: '企业用户', description: '联系人 + 公司信息 + 行业', overrideSchema: ENTERPRISE_OVERRIDE },
  student: { label: '学生认证', description: '手机选填 + 学校 + 学号 + 专业', overrideSchema: STUDENT_OVERRIDE },
};

/**
 * 动态 Schema 示例
 */
export const DynamicSchemaForm = observer(() => {
  const [scenario, setScenario] = useState<ScenarioKey>('individual');
  const [result, setResult] = useState('');

  /** 合并后的 Schema */
  const mergedSchema = useMemo<FormSchema>(() => {
    return mergeSchema(BASE_SCHEMA, SCENARIOS[scenario].overrideSchema);
  }, [scenario]);

  const currentScenario = SCENARIOS[scenario];

  return (
    <div>
      <Title level={3}>动态 Schema - antd 组件</Title>
      <Paragraph type="secondary">
        基础 Schema + 场景覆盖 = mergeSchema 合并后的完整 Schema（切换即热更新）
      </Paragraph>

      {/* 场景切换 */}
      <Segmented
        value={scenario}
        onChange={(val) => {
          setScenario(val as ScenarioKey);
          setResult('');
        }}
        options={(Object.keys(SCENARIOS) as ScenarioKey[]).map((key) => ({
          label: (
            <div style={{ padding: '4px 8px' }}>
              <div style={{ fontWeight: 600 }}>{SCENARIOS[key].label}</div>
              <div style={{ fontSize: 12, color: '#888' }}>{SCENARIOS[key].description}</div>
            </div>
          ),
          value: key,
        }))}
        style={{ marginBottom: 20 }}
      />

      {/* 信息提示 */}
      <div style={{ marginBottom: 16 }}>
        <Tag color="green">
          当前：{currentScenario.label} | 字段数：{Object.keys(mergedSchema.fields).length} 个
          （基础 {Object.keys(BASE_SCHEMA.fields).length} + 场景扩展 {Object.keys(mergedSchema.fields).length - Object.keys(BASE_SCHEMA.fields).length}）
        </Tag>
      </div>

      {/* 表单 */}
      <ConfigForm
        key={scenario}
        schema={mergedSchema}
        onSubmit={(values) => setResult(JSON.stringify(values, null, 2))}
        onSubmitFailed={(errors) =>
          setResult('验证失败:\n' + errors.map((e) => `[${e.path}] ${e.message}`).join('\n'))
        }
      >
        <Space style={{ marginTop: 16 }}>
          <Button type="primary" htmlType="submit">提交</Button>
          <Button htmlType="reset">重置</Button>
        </Space>
      </ConfigForm>

      {/* Schema 预览 */}
      <Collapse
        style={{ marginTop: 16 }}
        items={[
          {
            key: '1',
            label: '查看合并后的 Schema',
            children: (
              <pre style={{ margin: 0, fontSize: 12, maxHeight: 300, overflow: 'auto', whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(mergedSchema, null, 2)}
              </pre>
            ),
          },
        ]}
      />

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
