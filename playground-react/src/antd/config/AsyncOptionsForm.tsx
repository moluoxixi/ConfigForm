/**
 * 场景 18：异步选项加载
 *
 * 使用核心库 field.loadDataSource() 管线 + mock 请求适配器。
 * 切换「类型」→ 品种通过 loadDataSource({ url, params, requestAdapter: 'mock' }) 远程加载。
 */
import React, { useState, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { setupAntd } from '@moluoxixi/ui-antd';
import { Alert, Card, Button, Typography } from 'antd';
import type { FormSchema } from '@moluoxixi/schema';
import { PlaygroundForm } from '../../components/PlaygroundForm';
import { setupMockAdapter, getApiLogs, clearApiLogs } from '../../mock/dataSourceAdapter';

const { Title, Paragraph } = Typography;

setupAntd();
setupMockAdapter();

const INITIAL_VALUES: Record<string, unknown> = {
  dynamicType: 'fruit',
  dynamicItem: undefined,
  country: 'china',
  remark: '',
};

const schema: FormSchema = {
  form: { labelPosition: 'right', labelWidth: '140px' },
  fields: {
    dynamicType: {
      type: 'string',
      label: '类型',
      component: 'Select',
      wrapper: 'FormItem',
      defaultValue: 'fruit',
      enum: [
        { label: '水果', value: 'fruit' },
        { label: '蔬菜', value: 'vegetable' },
        { label: '肉类', value: 'meat' },
      ],
    },
    dynamicItem: {
      type: 'string',
      label: '品种（异步）',
      component: 'Select',
      wrapper: 'FormItem',
      placeholder: '加载中...',
      reactions: [{
        watch: 'dynamicType',
        fulfill: {
          run: (f: any, ctx: any) => {
            const t = ctx.values.dynamicType as string;
            if (!t) {
              f.setDataSource([]);
              f.setComponentProps({ placeholder: '请先选择类型' });
              return;
            }
            f.setValue(undefined);
            f.setComponentProps({ placeholder: '加载中...' });
            f.loadDataSource({
              url: '/api/models',
              params: { brand: '$values.dynamicType' },
              requestAdapter: 'mock',
              labelField: 'name',
              valueField: 'id',
            }).then(() => {
              const count = f.dataSource.length;
              f.setComponentProps({ placeholder: `请选择品种（${count}项）` });
            });
          },
        },
      }],
    },
    country: {
      type: 'string',
      label: '国家',
      component: 'Select',
      wrapper: 'FormItem',
      defaultValue: 'china',
      enum: [
        { label: '中国', value: 'china' },
        { label: '美国', value: 'usa' },
        { label: '日本', value: 'japan' },
      ],
    },
    remark: {
      type: 'string',
      label: '备注',
      component: 'Textarea',
      wrapper: 'FormItem',
      placeholder: '请输入',
    },
  },
};

/** API 日志面板 */
function ApiLogPanel(): React.ReactElement {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const timer = setInterval(() => setLogs(getApiLogs()), 500);
    return () => clearInterval(timer);
  }, []);

  return (
    <Card size="small" style={{ marginTop: 16, background: '#f9f9f9' }}
      title={<span style={{ fontSize: 13, color: '#666' }}>📡 Mock API 调用日志（{logs.length} 条）</span>}
      extra={logs.length > 0 ? <Button size="small" onClick={() => { clearApiLogs(); setLogs([]); }}>清空</Button> : null}
    >
      {logs.length === 0
        ? <div style={{ color: '#aaa', fontSize: 12 }}>暂无请求，选择下拉触发远程加载</div>
        : <div style={{ fontFamily: 'monospace', fontSize: 11, lineHeight: 1.8, maxHeight: 200, overflow: 'auto' }}>
            {logs.map((log, i) => <div key={i} style={{ color: log.includes('404') ? '#f5222d' : '#52c41a' }}>{log}</div>)}
          </div>
      }
    </Card>
  );
}

export const AsyncOptionsForm = observer((): React.ReactElement => {
  return (
    <div>
      <Title level={3}>异步选项加载</Title>
      <Paragraph type="secondary">
        远程 dataSource / reactions 异步加载 / loading 状态 / 走 field.loadDataSource() 管线
      </Paragraph>
      <Alert
        type="info" showIcon style={{ marginBottom: 16 }}
        message={<span>使用核心库的 <b>registerRequestAdapter('mock')</b> + <b>DataSourceConfig</b>，
          通过 <code>field.loadDataSource()</code> 远程加载（模拟 600ms 延迟）</span>}
      />
      <PlaygroundForm schema={schema} initialValues={INITIAL_VALUES} />
      <ApiLogPanel />
    </div>
  );
});
