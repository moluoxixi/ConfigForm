/**
 * 场景 41：多表单协作
 *
 * 覆盖：
 * - 两个独立表单联合提交
 * - 跨表单值联动
 * - 弹窗表单（Modal）
 * - 三种模式切换
 */
import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/react';
import { setupAntd } from '@moluoxixi/ui-antd';
import {
  Button, Typography, Alert, Segmented, Form, Input, InputNumber, Card, Row, Col, Modal, Space, Divider,
} from 'antd';
import type { FieldInstance } from '@moluoxixi/core';
import type { FieldPattern } from '@moluoxixi/shared';

const { Title, Paragraph, Text } = Typography;

setupAntd();

const MODE_OPTIONS = [
  { label: '编辑态', value: 'editable' },
  { label: '阅读态', value: 'readOnly' },
  { label: '禁用态', value: 'disabled' },
];

export const MultiFormForm = observer((): React.ReactElement => {
  const [mode, setMode] = useState<FieldPattern>('editable');
  const [result, setResult] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  /* 主表单 */
  const mainForm = useCreateForm({ initialValues: { orderName: '', customer: '', total: 0 } });

  /* 子表单（弹窗内） */
  const subForm = useCreateForm({ initialValues: { contactName: '', contactPhone: '', contactEmail: '' } });

  useEffect(() => {
    mainForm.createField({ name: 'orderName', label: '订单名称', required: true });
    mainForm.createField({ name: 'customer', label: '客户名称', required: true });
    mainForm.createField({ name: 'total', label: '订单金额', required: true });

    subForm.createField({ name: 'contactName', label: '联系人', required: true });
    subForm.createField({ name: 'contactPhone', label: '联系电话', required: true, rules: [{ format: 'phone', message: '无效手机号' }] });
    subForm.createField({ name: 'contactEmail', label: '邮箱', rules: [{ format: 'email', message: '无效邮箱' }] });
  }, []);

  const switchMode = (p: FieldPattern): void => {
    setMode(p);
    ['orderName', 'customer', 'total'].forEach((n) => { const f = mainForm.getField(n); if (f) f.pattern = p; });
    ['contactName', 'contactPhone', 'contactEmail'].forEach((n) => { const f = subForm.getField(n); if (f) f.pattern = p; });
  };

  /** 联合提交 */
  const handleJointSubmit = async (): Promise<void> => {
    const mainRes = await mainForm.submit();
    const subRes = await subForm.submit();
    const allErrors = [...mainRes.errors, ...subRes.errors];
    if (allErrors.length > 0) {
      setResult('验证失败: ' + allErrors.map((e) => e.message).join(', '));
    } else {
      setResult(JSON.stringify({ main: mainRes.values, contact: subRes.values }, null, 2));
    }
  };

  /** 弹窗确认 */
  const handleModalOk = async (): Promise<void> => {
    const res = await subForm.submit();
    if (res.errors.length > 0) return;
    /* 将联系人名同步到主表单 */
    mainForm.setFieldValue('customer', subForm.getFieldValue('contactName') as string);
    setModalOpen(false);
  };

  return (
    <div>
      <Title level={3}>多表单协作</Title>
      <Paragraph type="secondary">两个独立表单 / 联合提交 / 跨表单值联动 / 弹窗表单</Paragraph>
      <Segmented value={mode} onChange={(v) => switchMode(v as FieldPattern)} options={MODE_OPTIONS} style={{ marginBottom: 16 }} />

      <Row gutter={16}>
        <Col span={12}>
          <Card title="主表单 - 订单信息" size="small">
            <FormProvider form={mainForm}>
              {['orderName', 'customer', 'total'].map((name) => (
                <FormField key={name} name={name}>
                  {(field: FieldInstance) => (
                    <Form.Item label={field.label} required={field.required}>
                      {name === 'total' ? (
                        <InputNumber value={field.value as number} onChange={(v) => field.setValue(v)} disabled={mode === 'disabled'} readOnly={mode === 'readOnly'} style={{ width: '100%' }} min={0} />
                      ) : (
                        <Input value={(field.value as string) ?? ''} onChange={(e) => field.setValue(e.target.value)} disabled={mode === 'disabled'} readOnly={mode === 'readOnly'} />
                      )}
                    </Form.Item>
                  )}
                </FormField>
              ))}
              {mode === 'editable' && (
                <Button type="dashed" onClick={() => setModalOpen(true)}>从弹窗填写联系人</Button>
              )}
            </FormProvider>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="子表单 - 联系人信息" size="small">
            <FormProvider form={subForm}>
              {['contactName', 'contactPhone', 'contactEmail'].map((name) => (
                <FormField key={name} name={name}>
                  {(field: FieldInstance) => (
                    <Form.Item label={field.label} required={field.required} validateStatus={field.errors.length > 0 ? 'error' : undefined} help={field.errors[0]?.message}>
                      <Input value={(field.value as string) ?? ''} onChange={(e) => field.setValue(e.target.value)} onBlur={() => { field.blur(); field.validate('blur').catch(() => {}); }} disabled={mode === 'disabled'} readOnly={mode === 'readOnly'} />
                    </Form.Item>
                  )}
                </FormField>
              ))}
            </FormProvider>
          </Card>
        </Col>
      </Row>

      {mode === 'editable' && (
        <Button type="primary" onClick={handleJointSubmit} style={{ marginTop: 16 }}>联合提交（两个表单）</Button>
      )}

      {/* 弹窗表单 */}
      <Modal title="编辑联系人" open={modalOpen} onOk={handleModalOk} onCancel={() => setModalOpen(false)}>
        <FormProvider form={subForm}>
          {['contactName', 'contactPhone', 'contactEmail'].map((name) => (
            <FormField key={name} name={name}>
              {(field: FieldInstance) => (
                <Form.Item label={field.label} required={field.required}>
                  <Input value={(field.value as string) ?? ''} onChange={(e) => field.setValue(e.target.value)} />
                </Form.Item>
              )}
            </FormField>
          ))}
        </FormProvider>
      </Modal>

      {result && (<Alert style={{ marginTop: 16 }} type={result.startsWith('验证失败') ? 'error' : 'success'} message="联合提交结果" description={<pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{result}</pre>} />)}
    </div>
  );
});
