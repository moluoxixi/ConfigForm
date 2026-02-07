/**
 * 场景 18：异步选项加载 (Field 版)
 *
 * 覆盖：
 * - 远程 dataSource / reactions 异步加载
 * - loading 状态
 * - 走 field.loadDataSource() 管线
 * - 三种模式切换
 *
 * FormField + fieldProps 实现，reactions 写在 fieldProps 中。
 */
import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'
import { Alert, Button, Card, Typography } from 'antd'
import { clearApiLogs, getApiLogs, setupMockAdapter } from '../../mock/dataSourceAdapter'

const { Title, Paragraph } = Typography

setupAntd()
setupMockAdapter()

/** API 日志面板 */
function ApiLogPanel(): React.ReactElement {
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    const timer = setInterval(() => setLogs(getApiLogs()), 500)
    return () => clearInterval(timer)
  }, [])

  return (
    <Card
      size="small"
      style={{ marginTop: 16, background: '#f9f9f9' }}
      title={(
        <span style={{ fontSize: 13, color: '#666' }}>
          📡 Mock API 调用日志（
          {logs.length}
          {' '}
          条）
        </span>
      )}
      extra={logs.length > 0
        ? (
            <Button
              size="small"
              onClick={() => {
                clearApiLogs()
                setLogs([])
              }}
            >
              清空
            </Button>
          )
        : null}
    >
      {logs.length === 0
        ? <div style={{ color: '#aaa', fontSize: 12 }}>暂无请求，选择下拉触发远程加载</div>
        : (
            <div style={{ fontFamily: 'monospace', fontSize: 11, lineHeight: 1.8, maxHeight: 200, overflow: 'auto' }}>
              {logs.map((log, i) => <div key={i} style={{ color: log.includes('404') ? '#f5222d' : '#52c41a' }}>{log}</div>)}
            </div>
          )}
    </Card>
  )
}

/**
 * 异步选项加载（Field 版）
 */
export const AsyncOptionsForm = observer((): React.ReactElement => {
  const form = useCreateForm({
    initialValues: {
      dynamicType: 'fruit',
      dynamicItem: undefined,
      country: 'china',
      remark: '',
    },
  })

  return (
    <div>
      <Title level={3}>异步选项加载 (Field 版)</Title>
      <Paragraph type="secondary">
        远程 dataSource / reactions 异步加载 / loading 状态 / 走 field.loadDataSource() 管线 —— FormField + fieldProps 实现
      </Paragraph>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message={(
          <span>
            使用核心库的
            <b>registerRequestAdapter('mock')</b>
            {' '}
            +
            <b>DataSourceConfig</b>
            ，通过
            <code>field.loadDataSource()</code>
            {' '}
            远程加载（模拟 600ms 延迟）
          </span>
        )}
      />
      <StatusTabs>
        {({ mode, showResult, showErrors }) => {
          form.pattern = mode
          return (
            <FormProvider form={form}>
              <form onSubmit={async (e: React.FormEvent) => {
                e.preventDefault()
                const res = await form.submit()
                if (res.errors.length > 0) showErrors(res.errors)
                else showResult(res.values)
              }} noValidate>
                <FormField name="dynamicType" fieldProps={{
                  label: '类型',
                  component: 'Select',
                  dataSource: [
                    { label: '水果', value: 'fruit' },
                    { label: '蔬菜', value: 'vegetable' },
                    { label: '肉类', value: 'meat' },
                  ],
                }}
                />
                <FormField name="dynamicItem" fieldProps={{
                  label: '品种（异步）',
                  component: 'Select',
                  componentProps: { placeholder: '加载中...' },
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
                }}
                />
                <FormField name="country" fieldProps={{
                  label: '国家',
                  component: 'Select',
                  dataSource: [
                    { label: '中国', value: 'china' },
                    { label: '美国', value: 'usa' },
                    { label: '日本', value: 'japan' },
                  ],
                }}
                />
                <FormField name="remark" fieldProps={{
                  label: '备注',
                  component: 'Textarea',
                  componentProps: { placeholder: '请输入' },
                }}
                />
                {mode === 'editable' && <LayoutFormActions onReset={() => form.reset()} />}
              </form>
            </FormProvider>
          )
        }}
      </StatusTabs>
      <ApiLogPanel />
    </div>
  )
})
