/**
 * 分步表单 - antd 版
 *
 * 覆盖场景：
 * - antd Steps 组件驱动分步
 * - 步骤验证（下一步前验证当前步骤字段）
 * - 栅格布局（一行两列）
 * - Card 分组
 * - 预览模式切换
 * - 提交前拦截（Modal.confirm）
 */
import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/react';
import { setupAntd } from '@moluoxixi/ui-antd';
import {
  Button, Space, Typography, Alert, Steps, Card, Row, Col, Input, Select, InputNumber,
  DatePicker, Modal, Descriptions, Tag,
} from 'antd';
import type { FieldInstance } from '@moluoxixi/core';
import type { FieldPattern } from '@moluoxixi/shared';

const { Title, Paragraph, Text } = Typography;

setupAntd();

/* ======================== 步骤配置 ======================== */

/** 步骤定义 */
interface StepConfig {
  title: string;
  description: string;
  fields: string[];
}

/** 总步骤数 */
const TOTAL_STEPS = 3;

/** 步骤配置列表 */
const STEPS: StepConfig[] = [
  { title: '基本信息', description: '个人基本信息', fields: ['realName', 'gender', 'birthDate', 'phone', 'email'] },
  { title: '详细信息', description: '工作和教育', fields: ['company', 'position', 'workYears', 'education', 'university', 'skills'] },
  { title: '确认提交', description: '检查并提交', fields: [] },
];

/** 性别选项 */
const GENDER_OPTIONS = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
  { label: '其他', value: 'other' },
];

/** 学历选项 */
const EDUCATION_OPTIONS = [
  { label: '高中及以下', value: 'highschool' },
  { label: '大专', value: 'college' },
  { label: '本科', value: 'bachelor' },
  { label: '硕士', value: 'master' },
  { label: '博士', value: 'phd' },
];

/* ======================== 字段渲染辅助 ======================== */

/** 文本字段 */
const TextField = observer(({
  field,
  placeholder,
  preview,
}: {
  field: FieldInstance;
  placeholder?: string;
  preview: boolean;
}): React.ReactElement => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: 13 }}>
      {field.label}
      {field.required && <span style={{ color: 'red', marginLeft: 2 }}>*</span>}
    </label>
    {preview ? (
      <Text>{(field.value as string) || <Text type="secondary">未填写</Text>}</Text>
    ) : (
      <Input
        value={(field.value as string) ?? ''}
        onChange={(e) => field.setValue(e.target.value)}
        onBlur={() => { field.blur(); field.validate('blur').catch(() => {}); }}
        placeholder={placeholder}
        status={field.errors.length > 0 ? 'error' : undefined}
      />
    )}
    {field.errors.length > 0 && (
      <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}>{field.errors[0].message}</div>
    )}
  </div>
));

/** 选择字段 */
const SelectField = observer(({
  field,
  options,
  preview,
}: {
  field: FieldInstance;
  options: Array<{ label: string; value: string }>;
  preview: boolean;
}): React.ReactElement => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: 13 }}>
      {field.label}
      {field.required && <span style={{ color: 'red', marginLeft: 2 }}>*</span>}
    </label>
    {preview ? (
      <Text>{options.find((o) => o.value === field.value)?.label || <Text type="secondary">未选择</Text>}</Text>
    ) : (
      <Select
        value={(field.value as string) || undefined}
        onChange={(val) => field.setValue(val)}
        options={options}
        placeholder="请选择"
        style={{ width: '100%' }}
        status={field.errors.length > 0 ? 'error' : undefined}
      />
    )}
    {field.errors.length > 0 && (
      <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}>{field.errors[0].message}</div>
    )}
  </div>
));

/** 数字字段 */
const NumberField = observer(({
  field,
  placeholder,
  preview,
}: {
  field: FieldInstance;
  placeholder?: string;
  preview: boolean;
}): React.ReactElement => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: 13 }}>
      {field.label}
      {field.required && <span style={{ color: 'red', marginLeft: 2 }}>*</span>}
    </label>
    {preview ? (
      <Text>{field.value != null ? String(field.value) : <Text type="secondary">未填写</Text>}</Text>
    ) : (
      <InputNumber
        value={field.value as number}
        onChange={(val) => field.setValue(val)}
        onBlur={() => { field.blur(); field.validate('blur').catch(() => {}); }}
        placeholder={placeholder}
        style={{ width: '100%' }}
        status={field.errors.length > 0 ? 'error' : undefined}
      />
    )}
    {field.errors.length > 0 && (
      <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}>{field.errors[0].message}</div>
    )}
  </div>
));

/* ======================== 主组件 ======================== */

/**
 * 分步表单示例
 *
 * 3 步流程：基本信息→详细信息→确认提交。
 */
export const StepForm = observer(() => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formPattern, setFormPattern] = useState<FieldPattern>('editable');
  const [result, setResult] = useState('');

  const form = useCreateForm({
    initialValues: {
      realName: '',
      gender: '',
      birthDate: '',
      phone: '',
      email: '',
      company: '',
      position: '',
      workYears: undefined as number | undefined,
      education: '',
      university: '',
      skills: '',
    },
  });

  /* 创建所有字段 */
  React.useEffect(() => {
    form.createField({ name: 'realName', label: '真实姓名', required: true, rules: [{ minLength: 2, maxLength: 20, message: '姓名 2-20 字符' }] });
    form.createField({ name: 'gender', label: '性别', required: true, dataSource: GENDER_OPTIONS });
    form.createField({ name: 'birthDate', label: '出生日期', required: true });
    form.createField({ name: 'phone', label: '手机号', required: true, rules: [{ format: 'phone', message: '请输入有效手机号' }] });
    form.createField({ name: 'email', label: '邮箱', required: true, rules: [{ format: 'email', message: '请输入有效邮箱' }] });
    form.createField({ name: 'company', label: '公司名称', required: true });
    form.createField({ name: 'position', label: '职位', required: true });
    form.createField({ name: 'workYears', label: '工作年限', rules: [{ min: 0, max: 50, message: '0-50 年' }] });
    form.createField({ name: 'education', label: '学历', required: true, dataSource: EDUCATION_OPTIONS });
    form.createField({ name: 'university', label: '毕业院校' });
    form.createField({ name: 'skills', label: '技能特长' });
  }, []);

  /** 验证当前步骤 */
  const validateCurrentStep = async (): Promise<boolean> => {
    const step = STEPS[currentStep];
    if (step.fields.length === 0) return true;
    const results = await Promise.all(
      step.fields.map(async (name) => {
        const field = form.getField(name);
        if (!field) return [];
        return field.validate('submit');
      }),
    );
    return results.flat().length === 0;
  };

  /** 下一步 */
  const handleNext = async (): Promise<void> => {
    if (!(await validateCurrentStep())) return;
    if (currentStep < TOTAL_STEPS - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      if (nextStep === TOTAL_STEPS - 1) setFormPattern('preview');
    }
  };

  /** 上一步 */
  const handlePrev = (): void => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setFormPattern('editable');
    }
  };

  /** 提交 */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    Modal.confirm({
      title: '确认提交',
      content: '确定要提交表单吗？提交后将无法修改。',
      onOk: async () => {
        const res = await form.submit();
        if (res.errors.length > 0) {
          setResult('验证失败: ' + res.errors.map((err) => err.message).join(', '));
        } else {
          setResult(JSON.stringify(res.values, null, 2));
        }
      },
    });
  };

  const isPreview = formPattern === 'preview';
  const isLastStep = currentStep === TOTAL_STEPS - 1;

  return (
    <div>
      <Title level={3}>分步表单 - antd 组件</Title>
      <Paragraph type="secondary">
        Steps 组件 / 步骤验证 / 栅格布局 / Card 分组 / 预览模式 / Modal.confirm 拦截
      </Paragraph>

      {/* antd Steps */}
      <Steps
        current={currentStep}
        items={STEPS.map((s) => ({ title: s.title, description: s.description }))}
        style={{ marginBottom: 24 }}
      />

      <FormProvider form={form}>
        <form onSubmit={handleSubmit} noValidate>
          {/* 步骤 1 */}
          {currentStep === 0 && (
            <Card title="基本信息" style={{ marginBottom: 16 }}>
              <Row gutter={24}>
                <Col span={12}>
                  <FormField name="realName">
                    {(field: FieldInstance) => <TextField field={field} placeholder="请输入姓名" preview={isPreview} />}
                  </FormField>
                </Col>
                <Col span={12}>
                  <FormField name="gender">
                    {(field: FieldInstance) => <SelectField field={field} options={GENDER_OPTIONS} preview={isPreview} />}
                  </FormField>
                </Col>
                <Col span={12}>
                  <FormField name="birthDate">
                    {(field: FieldInstance) => (
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: 13 }}>
                          {field.label} <span style={{ color: 'red' }}>*</span>
                        </label>
                        {isPreview ? (
                          <Text>{(field.value as string) || <Text type="secondary">未填写</Text>}</Text>
                        ) : (
                          <DatePicker
                            value={field.value ? field.value : undefined}
                            onChange={(_d, ds) => field.setValue(ds as string)}
                            style={{ width: '100%' }}
                          />
                        )}
                      </div>
                    )}
                  </FormField>
                </Col>
                <Col span={12}>
                  <FormField name="phone">
                    {(field: FieldInstance) => <TextField field={field} placeholder="请输入手机号" preview={isPreview} />}
                  </FormField>
                </Col>
                <Col span={12}>
                  <FormField name="email">
                    {(field: FieldInstance) => <TextField field={field} placeholder="请输入邮箱" preview={isPreview} />}
                  </FormField>
                </Col>
              </Row>
            </Card>
          )}

          {/* 步骤 2 */}
          {currentStep === 1 && (
            <>
              <Card title="工作信息" style={{ marginBottom: 16 }}>
                <Row gutter={24}>
                  <Col span={12}>
                    <FormField name="company">
                      {(field: FieldInstance) => <TextField field={field} placeholder="请输入公司名称" preview={isPreview} />}
                    </FormField>
                  </Col>
                  <Col span={12}>
                    <FormField name="position">
                      {(field: FieldInstance) => <TextField field={field} placeholder="请输入职位" preview={isPreview} />}
                    </FormField>
                  </Col>
                  <Col span={12}>
                    <FormField name="workYears">
                      {(field: FieldInstance) => <NumberField field={field} placeholder="请输入年限" preview={isPreview} />}
                    </FormField>
                  </Col>
                </Row>
              </Card>
              <Card title="教育信息" style={{ marginBottom: 16 }}>
                <Row gutter={24}>
                  <Col span={12}>
                    <FormField name="education">
                      {(field: FieldInstance) => <SelectField field={field} options={EDUCATION_OPTIONS} preview={isPreview} />}
                    </FormField>
                  </Col>
                  <Col span={12}>
                    <FormField name="university">
                      {(field: FieldInstance) => <TextField field={field} placeholder="请输入院校" preview={isPreview} />}
                    </FormField>
                  </Col>
                  <Col span={12}>
                    <FormField name="skills">
                      {(field: FieldInstance) => <TextField field={field} placeholder="请输入技能" preview={isPreview} />}
                    </FormField>
                  </Col>
                </Row>
              </Card>
            </>
          )}

          {/* 步骤 3：确认预览 */}
          {currentStep === 2 && (
            <>
              <Card
                title="基本信息"
                extra={
                  <Button size="small" type="link" onClick={() => setFormPattern(isPreview ? 'editable' : 'preview')}>
                    {isPreview ? '编辑' : '预览'}
                  </Button>
                }
                style={{ marginBottom: 16 }}
              >
                <Row gutter={24}>
                  <Col span={12}>
                    <FormField name="realName">
                      {(field: FieldInstance) => <TextField field={field} placeholder="姓名" preview={isPreview} />}
                    </FormField>
                  </Col>
                  <Col span={12}>
                    <FormField name="gender">
                      {(field: FieldInstance) => <SelectField field={field} options={GENDER_OPTIONS} preview={isPreview} />}
                    </FormField>
                  </Col>
                  <Col span={12}>
                    <FormField name="phone">
                      {(field: FieldInstance) => <TextField field={field} placeholder="手机号" preview={isPreview} />}
                    </FormField>
                  </Col>
                  <Col span={12}>
                    <FormField name="email">
                      {(field: FieldInstance) => <TextField field={field} placeholder="邮箱" preview={isPreview} />}
                    </FormField>
                  </Col>
                </Row>
              </Card>
              <Card title="工作 & 教育信息" style={{ marginBottom: 16 }}>
                <Row gutter={24}>
                  <Col span={12}>
                    <FormField name="company">
                      {(field: FieldInstance) => <TextField field={field} placeholder="公司" preview={isPreview} />}
                    </FormField>
                  </Col>
                  <Col span={12}>
                    <FormField name="position">
                      {(field: FieldInstance) => <TextField field={field} placeholder="职位" preview={isPreview} />}
                    </FormField>
                  </Col>
                  <Col span={12}>
                    <FormField name="education">
                      {(field: FieldInstance) => <SelectField field={field} options={EDUCATION_OPTIONS} preview={isPreview} />}
                    </FormField>
                  </Col>
                  <Col span={12}>
                    <FormField name="university">
                      {(field: FieldInstance) => <TextField field={field} placeholder="院校" preview={isPreview} />}
                    </FormField>
                  </Col>
                </Row>
              </Card>
            </>
          )}

          {/* 操作按钮 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
            <div>
              {currentStep > 0 && <Button onClick={handlePrev}>上一步</Button>}
            </div>
            <Space>
              {isLastStep && (
                <Button onClick={() => setFormPattern(isPreview ? 'editable' : 'preview')}>
                  {isPreview ? '切换编辑' : '切换预览'}
                </Button>
              )}
              {isLastStep ? (
                <Button type="primary" htmlType="submit">确认提交</Button>
              ) : (
                <Button type="primary" onClick={handleNext}>下一步</Button>
              )}
            </Space>
          </div>
        </form>
      </FormProvider>

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
