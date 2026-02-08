import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/core'
import { ConfigForm } from '@moluoxixi/react'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 18：异步选项加载
 *
 * 使用核心库 field.loadDataSource() 管线 + mock 请求适配器。
 * 切换「类型」→ 品种通过 loadDataSource({ url, params, requestAdapter: 'mock' }) 远程加载。
 */
import React, { useEffect, useState } from 'react'
import { clearApiLogs, getApiLogs, setupMockAdapter } from '../../mock/dataSourceAdapter'

setupAntd()
setupMockAdapter()

/** 工具：将 StatusTabs 的 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}

const INITIAL_VALUES: Record<string, unknown> = {
  dynamicType: 'fruit',
  dynamicItem: undefined,
  country: 'china',
  remark: '',
}

const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '140px' },
  properties: {
    dynamicType: {
      type: 'string',
      title: '类型',
      default: 'fruit',
      enum: [
        { label: '水果', value: 'fruit' },
        { label: '蔬菜', value: 'vegetable' },
        { label: '肉类', value: 'meat' },
      ],
    },
    dynamicItem: {
      type: 'string',
      title: '品种（异步）',
      placeholder: '加载中...',
      reactions: [{
        watch: 'dynamicType',
        fulfill: {
          run: (f: any, ctx: any) => {
            const t = ctx.values.dynamicType as string
            if (!t) {
              f.setDataSource([])
              f.setComponentProps({ placeholder: '请先选择类型' })
              return
            }
            f.setValue(undefined)
            f.setComponentProps({ placeholder: '加载中...' })
            f.loadDataSource({
              url: '/api/models',
              params: { brand: '$values.dynamicType' },
              requestAdapter: 'mock',
              labelField: 'name',
              valueField: 'id',
            }).then(() => {
              const count = f.dataSource.length
              f.setComponentProps({ placeholder: `请选择品种（${count}项）` })
            })
          },
        },
      }],
    },
    country: {
      type: 'string',
      title: '国家',
      default: 'china',
      enum: [
        { label: '中国', value: 'china' },
        { label: '美国', value: 'usa' },
        { label: '日本', value: 'japan' },
      ],
    },
    remark: {
      type: 'string',
      title: '备注',
      component: 'Textarea',
      placeholder: '请输入',
    },
  },
}

/** API 日志面板 */
function ApiLogPanel(): React.ReactElement {
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    const timer = setInterval(() => setLogs(getApiLogs()), 500)
    return () => clearInterval(timer)
  }, [])

  return (
    <div style={{ marginTop: 16, background: '#f9f9f9', border: '1px solid #f0f0f0', borderRadius: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', borderBottom: '1px solid #f0f0f0' }}>
        <span style={{ fontSize: 13, color: '#666' }}>
          📡 Mock API 调用日志（
          {logs.length}
          {' '}
          条）
        </span>
        {logs.length > 0 && (
          <button
            style={{ padding: '2px 8px', fontSize: 12, background: '#fff', border: '1px solid #d9d9d9', borderRadius: 4, cursor: 'pointer' }}
            onClick={() => { clearApiLogs(); setLogs([]) }}
          >
            清空
          </button>
        )}
      </div>
      <div style={{ padding: '8px 16px' }}>
        {logs.length === 0
          ? <div style={{ color: '#aaa', fontSize: 12 }}>暂无请求，选择下拉触发远程加载</div>
          : (
              <div style={{ fontFamily: 'monospace', fontSize: 11, lineHeight: 1.8, maxHeight: 200, overflow: 'auto' }}>
                {logs.map((log, i) => <div key={i} style={{ color: log.includes('404') ? '#f5222d' : '#52c41a' }}>{log}</div>)}
              </div>
            )}
      </div>
    </div>
  )
}

export const AsyncOptionsForm = observer((): React.ReactElement => {
  return (
    <div>
      <h2>异步选项加载</h2>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>
        远程 dataSource / reactions 异步加载 / loading 状态 / 走 field.loadDataSource() 管线
      </p>
      <div style={{ padding: '8px 16px', marginBottom: 16, background: '#e6f4ff', border: '1px solid #91caff', borderRadius: 6, fontSize: 13 }}>
        使用核心库的
        <b>registerRequestAdapter('mock')</b>
        {' '}
        +
        <b>DataSourceConfig</b>
        ，通过
        <code>field.loadDataSource()</code>
        {' '}
        远程加载（模拟 600ms 延迟）
      </div>
      <StatusTabs>
        {({ mode, showResult, showErrors }) => (
          <ConfigForm
            schema={withMode(schema, mode)}
            initialValues={INITIAL_VALUES}
            onSubmit={showResult}
            onSubmitFailed={errors => showErrors(errors)}
          />
        )}
      </StatusTabs>
      <ApiLogPanel />
    </div>
  )
})
