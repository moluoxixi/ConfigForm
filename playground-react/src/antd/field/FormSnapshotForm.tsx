/**
 * 场景 42：表单快照
 *
 * 覆盖：
 * - 暂存草稿（localStorage）
 * - 恢复草稿
 * - 多版本草稿列表
 * - 三种模式切换
 */
import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { FormField, useCreateForm } from '@moluoxixi/react';
import { setupAntd } from '@moluoxixi/ui-antd';
import {
  Button, Typography, Form, Input, Card, Tag, List, message,
} from 'antd';
import { SaveOutlined, UndoOutlined, DeleteOutlined } from '@ant-design/icons';
import type { FieldInstance } from '@moluoxixi/core';
import { PlaygroundForm } from '../../components/PlaygroundForm';

const { Title, Paragraph, Text } = Typography;

setupAntd();

const STORAGE_KEY = 'configform-snapshot-drafts';

interface DraftItem {
  id: string;
  timestamp: number;
  label: string;
  values: Record<string, unknown>;
}

/** 读取草稿列表 */
function loadDrafts(): DraftItem[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

/** 保存草稿列表 */
function saveDrafts(drafts: DraftItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
}

const FIELDS = ['title', 'description', 'category', 'priority'];

export const FormSnapshotForm = observer((): React.ReactElement => {
  const [drafts, setDrafts] = useState<DraftItem[]>(loadDrafts);

  const form = useCreateForm({
    initialValues: { title: '', description: '', category: '', priority: '' },
  });

  useEffect(() => {
    form.createField({ name: 'title', label: '标题', required: true });
    form.createField({ name: 'description', label: '描述' });
    form.createField({ name: 'category', label: '分类' });
    form.createField({ name: 'priority', label: '优先级' });
  }, []);

  /** 暂存草稿 */
  const saveDraft = (): void => {
    const values = { ...form.values } as Record<string, unknown>;
    const draft: DraftItem = {
      id: String(Date.now()),
      timestamp: Date.now(),
      label: (values.title as string) || '未命名草稿',
      values,
    };
    const newDrafts = [draft, ...drafts].slice(0, 10);
    setDrafts(newDrafts);
    saveDrafts(newDrafts);
    message.success('草稿已暂存');
  };

  /** 恢复草稿 */
  const restoreDraft = (draft: DraftItem): void => {
    form.setValues(draft.values);
    message.success(`已恢复草稿：${draft.label}`);
  };

  /** 删除草稿 */
  const deleteDraft = (id: string): void => {
    const newDrafts = drafts.filter((d) => d.id !== id);
    setDrafts(newDrafts);
    saveDrafts(newDrafts);
  };

  return (
    <div>
      <Title level={3}>表单快照</Title>
      <Paragraph type="secondary">暂存草稿（localStorage） / 恢复草稿 / 多版本管理</Paragraph>

      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <PlaygroundForm form={form}>
            {({ mode }) => (
              <>
                {FIELDS.map((name) => (
                  <FormField key={name} name={name}>
                    {(field: FieldInstance) => (
                      <Form.Item label={field.label} required={field.required}>
                        {name === 'description' ? (
                          <Input.TextArea value={(field.value as string) ?? ''} onChange={(e) => field.setValue(e.target.value)} disabled={mode === 'disabled'} readOnly={mode === 'readOnly'} rows={3} />
                        ) : (
                          <Input value={(field.value as string) ?? ''} onChange={(e) => field.setValue(e.target.value)} disabled={mode === 'disabled'} readOnly={mode === 'readOnly'} />
                        )}
                      </Form.Item>
                    )}
                  </FormField>
                ))}
                {mode === 'editable' && (
                  <Button icon={<SaveOutlined />} onClick={saveDraft}>暂存草稿</Button>
                )}
              </>
            )}
          </PlaygroundForm>
        </div>

        {/* 草稿列表 */}
        <Card title={<span>草稿列表 <Tag>{drafts.length}</Tag></span>} size="small" style={{ width: 280 }}>
          {drafts.length === 0 ? (
            <Text type="secondary">暂无草稿</Text>
          ) : (
            <List
              size="small"
              dataSource={drafts}
              renderItem={(draft) => (
                <List.Item
                  actions={[
                    <Button key="restore" size="small" icon={<UndoOutlined />} onClick={() => restoreDraft(draft)} />,
                    <Button key="delete" size="small" danger icon={<DeleteOutlined />} onClick={() => deleteDraft(draft.id)} />,
                  ]}
                >
                  <div>
                    <Text ellipsis style={{ maxWidth: 120 }}>{draft.label}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 11 }}>{new Date(draft.timestamp).toLocaleString()}</Text>
                  </div>
                </List.Item>
              )}
            />
          )}
        </Card>
      </div>
    </div>
  );
});
