/**
 * 场景 19：依赖数据源 (Field 版)
 *
 * 覆盖：
 * - 品牌→型号→配置三级远程数据源链
 * - 年级→班级
 * - 全部通过 field.loadDataSource() 加载
 * - 三种模式切换
 *
 * FormField + fieldProps 实现，reactions 写在 fieldProps 中。
 */
import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'
import { clearApiLogs, getApiLogs, setupMockAdapter } from '../../../mock/dataSourceAdapter'

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
    <div style={{ marginTop: 16, background: '#f9f9f9', border: '1px solid #f0f0f0', borderRadius: 8, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: '#666' }}>
          📡 Mock API 调用日志（
          {logs.length}
          {' '}
          条）
        </span>
        {logs.length > 0
          ? (
              <button
                type="button"
                onClick={() => {
                  clearApiLogs()
                  setLogs([])
                }}
                style={{ padding: '2px 8px', background: '#fff', border: '1px solid #d9d9d9', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
              >
                清空
              </button>
            )
          : null}
      </div>
      {logs.length === 0
        ? <div style={{ color: '#aaa', fontSize: 12 }}>暂无请求，选择下拉触发远程加载</div>
        : (
            <div style={{ fontFamily: 'monospace', fontSize: 11, lineHeight: 1.8, maxHeight: 200, overflow: 'auto' }}>
              {logs.map((log, i) => <div key={i} style={{ color: log.includes('404') ? '#f5222d' : '#52c41a' }}>{log}</div>)}
            </div>
          )}
    </div>
  )
}

/**
 * 依赖数据源（Field 版）
 */
export const DependentDataSourceForm = observer((): React.ReactElement => {
  const form = useCreateForm({
    initialValues: {
      brand: undefined,
      model: undefined,
      config: undefined,
      grade: undefined,
      classNo: undefined,
    },
  })

  return (
    <div>
      <h3>依赖数据源 (Field 版)</h3>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>
        品牌→型号→配置（三级远程数据源链） / 年级→班级 / 完整走 fetchDataSource 管线 —— FormField + fieldProps 实现
      </p>
      <div style={{ padding: '8px 16px', marginBottom: 16, background: '#e6f4ff', border: '1px solid #91caff', borderRadius: 6, fontSize: 13 }}>
        <span>
          使用核心库
          <b>registerRequestAdapter('mock')</b>
          {' '}
          +
          <code>field.loadDataSource(&#123; url, params &#125;)</code>
          {' '}
          远程加载（模拟 600ms 延迟）
        </span>
      </div>
      <StatusTabs>
        {({ mode, showResult, showErrors }) => {
          form.pattern = mode
          return (
            <FormProvider form={form}>
                <FormField name="brand" fieldProps={{
                  label: '品牌',
                  required: true,
                  component: 'Select',
                  dataSource: [
                    { label: 'Apple', value: 'apple' },
                    { label: '华为', value: 'huawei' },
                    { label: '小米', value: 'xiaomi' },
                  ],
                }}
                />
                <FormField name="model" fieldProps={{
                  label: '型号',
                  required: true,
                  component: 'Select',
                  componentProps: { placeholder: '请先选择品牌' },
                  reactions: [{
                    watch: 'brand',
                    fulfill: {
                      run: (f: any, ctx: any) => {
                        const brand = ctx.values.brand
                        f.setValue(undefined)
                        if (!brand) {
                          f.setDataSource([])
                          f.setComponentProps({ placeholder: '请先选择品牌' })
                          return
                        }
                        f.setComponentProps({ placeholder: '加载中...' })
                        f.loadDataSource({
                          url: '/api/models',
                          params: { brand: '$values.brand' },
                          requestAdapter: 'mock',
                          labelField: 'name',
                          valueField: 'id',
                        }).then(() => {
                          f.setComponentProps({ placeholder: `请选择型号（${f.dataSource.length}项）` })
                        })
                      },
                    },
                  }],
                }}
                />
                <FormField name="config" fieldProps={{
                  label: '配置',
                  component: 'Select',
                  componentProps: { placeholder: '请先选择型号' },
                  reactions: [{
                    watch: 'model',
                    fulfill: {
                      run: (f: any, ctx: any) => {
                        const model = ctx.values.model
                        f.setValue(undefined)
                        if (!model) {
                          f.setDataSource([])
                          f.setComponentProps({ placeholder: '请先选择型号' })
                          return
                        }
                        f.setComponentProps({ placeholder: '加载中...' })
                        f.loadDataSource({
                          url: '/api/configs',
                          params: { model: '$values.model' },
                          requestAdapter: 'mock',
                          labelField: 'name',
                          valueField: 'id',
                        }).then(() => {
                          f.setComponentProps({ placeholder: `请选择配置（${f.dataSource.length}项）` })
                        })
                      },
                    },
                  }],
                }}
                />
                <FormField name="grade" fieldProps={{
                  label: '年级',
                  required: true,
                  component: 'Select',
                  dataSource: [
                    { label: '一年级', value: 'grade1' },
                    { label: '二年级', value: 'grade2' },
                    { label: '三年级', value: 'grade3' },
                  ],
                }}
                />
                <FormField name="classNo" fieldProps={{
                  label: '班级',
                  required: true,
                  component: 'Select',
                  componentProps: { placeholder: '请先选择年级' },
                  reactions: [{
                    watch: 'grade',
                    fulfill: {
                      run: (f: any, ctx: any) => {
                        const grade = ctx.values.grade
                        f.setValue(undefined)
                        if (!grade) {
                          f.setDataSource([])
                          f.setComponentProps({ placeholder: '请先选择年级' })
                          return
                        }
                        f.setComponentProps({ placeholder: '加载中...' })
                        f.loadDataSource({
                          url: '/api/classes',
                          params: { grade: '$values.grade' },
                          requestAdapter: 'mock',
                          labelField: 'name',
                          valueField: 'id',
                        }).then(() => {
                          f.setComponentProps({ placeholder: `请选择班级（${f.dataSource.length}项）` })
                        })
                      },
                    },
                  }],
                }}
                />
                <LayoutFormActions onSubmit={showResult} onSubmitFailed={showErrors} />
            </FormProvider>
          )
        }}
      </StatusTabs>
      <ApiLogPanel />
    </div>
  )
})
