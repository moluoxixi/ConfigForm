/**
 * 场景 19：依赖数据源
 *
 * 品牌→型号→配置三级远程数据源链 + 年级→班级。
 * 全部通过 field.loadDataSource({ url, params, requestAdapter: 'mock' }) 加载。
 */
import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { setupAntd } from '@moluoxixi/ui-antd';
import { Alert, Card, Button, Typography } from 'antd';
import type { ISchema } from '@moluoxixi/schema';
import { PlaygroundForm } from '../../components/PlaygroundForm';
import { setupMockAdapter, getApiLogs, clearApiLogs } from '../../mock/dataSourceAdapter';

const { Title, Paragraph } = Typography;

setupAntd();
setupMockAdapter();

const INITIAL_VALUES: Record<string, unknown> = {
  brand: undefined,
  model: undefined,
  config: undefined,
  grade: undefined,
  classNo: undefined,
};

const schema: ISchema = {
  type: 'object',
  decoratorProps: {
    labelPosition: 'right',
    labelWidth: '140px',
  },
  properties: {
    brand: {
      type: 'string',
      title: '品牌',
      required: true,
      component: 'Select',
      enum: [
        { label: 'Apple', value: 'apple' },
        { label: '华为', value: 'huawei' },
        { label: '小米', value: 'xiaomi' },
      ],
    },
    model: {
      type: 'string',
      title: '型号',
      required: true,
      component: 'Select',
      placeholder: '请先选择品牌',
      reactions: [{
        watch: 'brand',
        fulfill: {
          run: (f: any, ctx: any) => {
            const brand = ctx.values.brand;
            f.setValue(undefined);
            if (!brand) {
              f.setDataSource([]);
              f.setComponentProps({ placeholder: '请先选择品牌' });
              return;
            }
            f.setComponentProps({ placeholder: '加载中...' });
            f.loadDataSource({
              url: '/api/models',
              params: { brand: '$values.brand' },
              requestAdapter: 'mock',
              labelField: 'name',
              valueField: 'id',
            }).then(() => {
              f.setComponentProps({ placeholder: `请选择型号（${f.dataSource.length}项）` });
            });
          },
        },
      }],
    },
    config: {
      type: 'string',
      title: '配置',
      component: 'Select',
      placeholder: '请先选择型号',
      reactions: [{
        watch: 'model',
        fulfill: {
          run: (f: any, ctx: any) => {
            const model = ctx.values.model;
            f.setValue(undefined);
            if (!model) {
              f.setDataSource([]);
              f.setComponentProps({ placeholder: '请先选择型号' });
              return;
            }
            f.setComponentProps({ placeholder: '加载中...' });
            f.loadDataSource({
              url: '/api/configs',
              params: { model: '$values.model' },
              requestAdapter: 'mock',
              labelField: 'name',
              valueField: 'id',
            }).then(() => {
              f.setComponentProps({ placeholder: `请选择配置（${f.dataSource.length}项）` });
            });
          },
        },
      }],
    },
    grade: {
      type: 'string',
      title: '年级',
      required: true,
      component: 'Select',
      enum: [
        { label: '一年级', value: 'grade1' },
        { label: '二年级', value: 'grade2' },
        { label: '三年级', value: 'grade3' },
      ],
    },
    classNo: {
      type: 'string',
      title: '班级',
      required: true,
      component: 'Select',
      placeholder: '请先选择年级',
      reactions: [{
        watch: 'grade',
        fulfill: {
          run: (f: any, ctx: any) => {
            const grade = ctx.values.grade;
            f.setValue(undefined);
            if (!grade) {
              f.setDataSource([]);
              f.setComponentProps({ placeholder: '请先选择年级' });
              return;
            }
            f.setComponentProps({ placeholder: '加载中...' });
            f.loadDataSource({
              url: '/api/classes',
              params: { grade: '$values.grade' },
              requestAdapter: 'mock',
              labelField: 'name',
              valueField: 'id',
            }).then(() => {
              f.setComponentProps({ placeholder: `请选择班级（${f.dataSource.length}项）` });
            });
          },
        },
      }],
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

export const DependentDataSourceForm = observer((): React.ReactElement => {
  return (
    <div>
      <Title level={3}>依赖数据源</Title>
      <Paragraph type="secondary">
        品牌→型号→配置（三级远程数据源链） / 年级→班级 / 完整走 fetchDataSource 管线
      </Paragraph>
      <Alert
        type="info" showIcon style={{ marginBottom: 16 }}
        message={<span>使用核心库 <b>registerRequestAdapter('mock')</b> + <code>field.loadDataSource(&#123; url, params &#125;)</code> 远程加载（模拟 600ms 延迟）</span>}
      />
      <PlaygroundForm schema={schema} initialValues={INITIAL_VALUES} />
      <ApiLogPanel />
    </div>
  );
});
