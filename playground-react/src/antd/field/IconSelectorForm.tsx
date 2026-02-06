/**
 * 场景 38：图标选择器
 *
 * 覆盖：
 * - 图标网格选择
 * - 搜索过滤
 * - 选中高亮
 * - 三种模式切换
 */
import React, { useState, useEffect, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { FormProvider, FormField, useCreateForm } from '@moluoxixi/react';
import { setupAntd } from '@moluoxixi/ui-antd';
import { Button, Typography, Alert, Segmented, Form, Input, Tag } from 'antd';
import * as Icons from '@ant-design/icons';
import type { FieldInstance } from '@moluoxixi/core';
import type { FieldPattern } from '@moluoxixi/shared';

const { Title, Paragraph, Text } = Typography;

setupAntd();

const MODE_OPTIONS = [
  { label: '编辑态', value: 'editable' },
  { label: '阅读态', value: 'readOnly' },
  { label: '禁用态', value: 'disabled' },
];

/** 常用图标列表 */
const ICON_LIST = [
  'HomeOutlined', 'UserOutlined', 'SettingOutlined', 'SearchOutlined', 'BellOutlined',
  'HeartOutlined', 'StarOutlined', 'CheckCircleOutlined', 'CloseCircleOutlined', 'InfoCircleOutlined',
  'WarningOutlined', 'EditOutlined', 'DeleteOutlined', 'PlusOutlined', 'MinusOutlined',
  'MailOutlined', 'PhoneOutlined', 'LockOutlined', 'UnlockOutlined', 'CloudOutlined',
  'DownloadOutlined', 'UploadOutlined', 'FileOutlined', 'FolderOutlined', 'CopyOutlined',
  'ShareAltOutlined', 'LinkOutlined', 'TeamOutlined', 'CalendarOutlined', 'ClockCircleOutlined',
  'DatabaseOutlined', 'ApiOutlined', 'CodeOutlined', 'BugOutlined', 'RocketOutlined',
  'ThunderboltOutlined', 'FireOutlined', 'CrownOutlined', 'GiftOutlined', 'TrophyOutlined',
];

/** 渲染图标 */
function renderIcon(name: string, style?: React.CSSProperties): React.ReactElement | null {
  const IconComp = (Icons as Record<string, React.ComponentType<{ style?: React.CSSProperties }>>)[name];
  return IconComp ? <IconComp style={style} /> : null;
}

export const IconSelectorForm = observer((): React.ReactElement => {
  const [mode, setMode] = useState<FieldPattern>('editable');
  const [result, setResult] = useState('');
  const [search, setSearch] = useState('');

  const form = useCreateForm({ initialValues: { menuName: '首页', icon: 'HomeOutlined' } });

  useEffect(() => {
    form.createField({ name: 'menuName', label: '菜单名称', required: true });
    form.createField({ name: 'icon', label: '图标', required: true });
  }, []);

  const switchMode = (p: FieldPattern): void => {
    setMode(p);
    ['menuName', 'icon'].forEach((n) => { const f = form.getField(n); if (f) f.pattern = p; });
  };

  const filteredIcons = useMemo(
    () => search ? ICON_LIST.filter((name) => name.toLowerCase().includes(search.toLowerCase())) : ICON_LIST,
    [search],
  );

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const res = await form.submit();
    if (res.errors.length > 0) { setResult('验证失败: ' + res.errors.map((err) => err.message).join(', ')); }
    else { setResult(JSON.stringify(res.values, null, 2)); }
  };

  return (
    <div>
      <Title level={3}>图标选择器</Title>
      <Paragraph type="secondary">@ant-design/icons 图标网格 / 搜索过滤 / 选中高亮</Paragraph>
      <Segmented value={mode} onChange={(v) => switchMode(v as FieldPattern)} options={MODE_OPTIONS} style={{ marginBottom: 16 }} />

      <FormProvider form={form}>
        <form onSubmit={handleSubmit} noValidate>
          <FormField name="menuName">
            {(field: FieldInstance) => (
              <Form.Item label={field.label} required={field.required}>
                <Input value={(field.value as string) ?? ''} onChange={(e) => field.setValue(e.target.value)} disabled={mode === 'disabled'} readOnly={mode === 'readOnly'} style={{ width: 300 }} />
              </Form.Item>
            )}
          </FormField>

          <FormField name="icon">
            {(field: FieldInstance) => (
              <Form.Item label={field.label} required={field.required}>
                {/* 当前选中 */}
                <div style={{ marginBottom: 8 }}>
                  <Text>当前选中：</Text>
                  {(field.value as string) ? (
                    <Tag icon={renderIcon(field.value as string)} color="blue" style={{ fontSize: 14 }}>
                      {field.value as string}
                    </Tag>
                  ) : (
                    <Text type="secondary">未选择</Text>
                  )}
                </div>

                {mode === 'editable' && (
                  <>
                    <Input
                      placeholder="搜索图标名称"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{ width: 300, marginBottom: 8 }}
                      allowClear
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 4, maxHeight: 300, overflow: 'auto', border: '1px solid #d9d9d9', borderRadius: 6, padding: 8 }}>
                      {filteredIcons.map((name) => (
                        <div
                          key={name}
                          onClick={() => field.setValue(name)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: 8,
                            borderRadius: 4,
                            cursor: 'pointer',
                            background: field.value === name ? '#e6f4ff' : 'transparent',
                            border: field.value === name ? '1px solid #1677ff' : '1px solid transparent',
                          }}
                        >
                          {renderIcon(name, { fontSize: 24 })}
                          <Text style={{ fontSize: 10, marginTop: 4, textAlign: 'center', wordBreak: 'break-all' }}>
                            {name.replace('Outlined', '')}
                          </Text>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </Form.Item>
            )}
          </FormField>

          {mode === 'editable' && <Button type="primary" htmlType="submit">提交</Button>}
        </form>
      </FormProvider>

      {result && (<Alert style={{ marginTop: 16 }} type={result.startsWith('验证失败') ? 'error' : 'success'} message="提交结果" description={<pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{result}</pre>} />)}
    </div>
  );
});
