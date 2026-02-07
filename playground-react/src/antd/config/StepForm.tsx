/**
 * 场景 21：分步表单
 *
 * 覆盖：
 * - Steps 组件导航
 * - 步骤验证（下一步前验证当前步骤）
 * - 最后一步预览汇总
 * - 提交前拦截（Modal.confirm）
 * - 三种模式切换
 */
import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { FormField, useCreateForm } from '@moluoxixi/react';
import { setupAntd } from '@moluoxixi/ui-antd';
import {
  Button, Space, Typography, Steps, Card, Row, Col, Input,
  InputNumber, Modal, Descriptions,
} from 'antd';
import type { FieldInstance } from '@moluoxixi/core';
import { PlaygroundForm } from '../../components/PlaygroundForm';

const { Title, Paragraph, Text } = Typography;

setupAntd();

/** 步骤定义 */
const STEPS = [
  { title: '基本信息', fields: ['name', 'phone', 'email'] },
  { title: '工作信息', fields: ['company', 'position', 'salary'] },
  { title: '确认提交', fields: [] },
];

/**
 * 分步表单示例
 */
export const StepForm = observer((): React.ReactElement => {
  const [step, setStep] = useState(0);

  const form = useCreateForm({
    initialValues: { name: '', phone: '', email: '', company: '', position: '', salary: undefined as number | undefined },
  });

  useEffect(() => {
    form.createField({ name: 'name', label: '姓名', required: true, rules: [{ minLength: 2, message: '至少 2 字' }] });
    form.createField({ name: 'phone', label: '手机号', required: true, rules: [{ format: 'phone', message: '无效手机号' }] });
    form.createField({ name: 'email', label: '邮箱', required: true, rules: [{ format: 'email', message: '无效邮箱' }] });
    form.createField({ name: 'company', label: '公司', required: true });
    form.createField({ name: 'position', label: '职位', required: true });
    form.createField({ name: 'salary', label: '期望薪资', rules: [{ min: 0, message: '不能为负数' }] });
  }, []);

  /** 验证当前步骤 */
  const validateStep = async (): Promise<boolean> => {
    const fields = STEPS[step].fields;
    if (fields.length === 0) return true;
    const results = await Promise.all(
      fields.map(async (name) => {
        const field = form.getField(name);
        return field ? field.validate('submit') : [];
      }),
    );
    return results.flat().length === 0;
  };

  /** 下一步 */
  const handleNext = async (): Promise<void> => {
    if (!(await validateStep())) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const isLast = step === STEPS.length - 1;

  /** 渲染文本字段 */
  const renderInput = (field: FieldInstance, placeholder: string, mode: string): React.ReactElement => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: 13 }}>
        {field.label} {field.required && <span style={{ color: 'red' }}>*</span>}
      </label>
      {isLast ? (
        <Text>{(field.value as string) || '—'}</Text>
      ) : (
        <Input
          value={(field.value as string) ?? ''}
          onChange={(e) => field.setValue(e.target.value)}
          onBlur={() => { field.blur(); field.validate('blur').catch(() => {}); }}
          placeholder={placeholder}
          disabled={mode === 'disabled'}
          readOnly={mode === 'readOnly'}
          status={field.errors.length > 0 ? 'error' : undefined}
        />
      )}
      {field.errors.length > 0 && <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}>{field.errors[0].message}</div>}
    </div>
  );

  return (
    <div>
      <Title level={3}>分步表单</Title>
      <Paragraph type="secondary">Steps 导航 / 步骤验证 / 预览汇总 / Modal.confirm 拦截</Paragraph>

      <PlaygroundForm form={form}>
        {({ mode }) => (
          <>
            <Steps current={step} items={STEPS.map((s) => ({ title: s.title }))} style={{ marginBottom: 24 }} />

            {/* Step 1 */}
            {step === 0 && (
              <Card title="基本信息">
                <Row gutter={24}>
                  <Col span={12}><FormField name="name">{(f: FieldInstance) => renderInput(f, '姓名', mode)}</FormField></Col>
                  <Col span={12}><FormField name="phone">{(f: FieldInstance) => renderInput(f, '手机号', mode)}</FormField></Col>
                  <Col span={12}><FormField name="email">{(f: FieldInstance) => renderInput(f, '邮箱', mode)}</FormField></Col>
                </Row>
              </Card>
            )}

            {/* Step 2 */}
            {step === 1 && (
              <Card title="工作信息">
                <Row gutter={24}>
                  <Col span={12}><FormField name="company">{(f: FieldInstance) => renderInput(f, '公司名称', mode)}</FormField></Col>
                  <Col span={12}><FormField name="position">{(f: FieldInstance) => renderInput(f, '职位', mode)}</FormField></Col>
                  <Col span={12}>
                    <FormField name="salary">
                      {(f: FieldInstance) => (
                        <div style={{ marginBottom: 16 }}>
                          <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: 13 }}>{f.label}</label>
                          <InputNumber
                            value={f.value as number}
                            onChange={(v) => f.setValue(v)}
                            placeholder="期望薪资"
                            min={0}
                            style={{ width: '100%' }}
                            disabled={mode === 'disabled'}
                            readOnly={mode === 'readOnly'}
                          />
                        </div>
                      )}
                    </FormField>
                  </Col>
                </Row>
              </Card>
            )}

            {/* Step 3：预览 */}
            {step === 2 && (
              <Card title="确认信息">
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="姓名">{(form.getFieldValue('name') as string) || '—'}</Descriptions.Item>
                  <Descriptions.Item label="手机号">{(form.getFieldValue('phone') as string) || '—'}</Descriptions.Item>
                  <Descriptions.Item label="邮箱">{(form.getFieldValue('email') as string) || '—'}</Descriptions.Item>
                  <Descriptions.Item label="公司">{(form.getFieldValue('company') as string) || '—'}</Descriptions.Item>
                  <Descriptions.Item label="职位">{(form.getFieldValue('position') as string) || '—'}</Descriptions.Item>
                  <Descriptions.Item label="薪资">{form.getFieldValue('salary') != null ? `¥${form.getFieldValue('salary')}` : '—'}</Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
              <div>{step > 0 && <Button onClick={() => setStep((s) => s - 1)}>上一步</Button>}</div>
              <Space>
                {!isLast && (
                  <Button type="primary" onClick={handleNext}>下一步</Button>
                )}
              </Space>
            </div>
          </>
        )}
      </PlaygroundForm>
    </div>
  );
});
