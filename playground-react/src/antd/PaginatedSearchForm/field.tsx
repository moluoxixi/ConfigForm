/**
 * 场景 20：分页搜索数据源 (Field 版)
 *
 * 覆盖：
 * - 远程搜索 / 分页加载 / 防抖
 * - 走 field.loadDataSource() 管线
 * - 三种模式切换
 *
 * FormField + fieldProps 实现。分页搜索 Select 通过 fieldProps.componentProps
 * 传递 showSearch / onPopupScroll / dropdownRender 等自定义交互属性。
 */
import type { FieldInstance } from '@moluoxixi/core'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { LayoutFormActions, StatusTabs, setupAntd } from '@moluoxixi/ui-antd'
import { Alert, Button, Card, Spin, Typography } from 'antd'
import { clearApiLogs, getApiLogs, setupMockAdapter } from '../../mock/dataSourceAdapter'

const { Title, Paragraph } = Typography

setupAntd()
setupMockAdapter()

const PAGE_SIZE = 20
const DEBOUNCE_DELAY = 300

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
      title={<span style={{ fontSize: 13, color: '#666' }}>📡 Mock API 调用日志（{logs.length} 条）</span>}
      extra={logs.length > 0 ? <Button size="small" onClick={() => { clearApiLogs(); setLogs([]) }}>清空</Button> : null}
    >
      {logs.length === 0
        ? <div style={{ color: '#aaa', fontSize: 12 }}>暂无请求</div>
        : (
            <div style={{ fontFamily: 'monospace', fontSize: 11, lineHeight: 1.8, maxHeight: 200, overflow: 'auto' }}>
              {logs.map((log, i) => <div key={i} style={{ color: '#52c41a' }}>{log}</div>)}
            </div>
          )}
    </Card>
  )
}

/**
 * 分页搜索数据源（Field 版）
 */
export const PaginatedSearchForm = observer((): React.ReactElement => {
  const form = useCreateForm({ initialValues: { userId: undefined } })

  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [options, setOptions] = useState<Array<{ label: string, value: string }>>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fieldRef = useRef<FieldInstance | null>(null)

  useEffect(() => {
    fieldRef.current = form.createField({ name: 'userId', label: '选择用户', required: true })
  }, [])

  /** 通过核心库 loadDataSource 加载 */
  const loadData = useCallback(async (kw: string, pg: number, append: boolean): Promise<void> => {
    const field = fieldRef.current
    if (!field) return

    setLoading(true)
    const existingItems = append ? [...field.dataSource] : []

    try {
      await field.loadDataSource({
        url: '/api/users',
        params: { keyword: kw, page: String(pg), pageSize: String(PAGE_SIZE) },
        requestAdapter: 'mock',
        transform: (resp: any) => {
          setTotal(resp.total ?? 0)
          setPage(resp.page ?? 1)
          setHasMore(pg * PAGE_SIZE < (resp.total ?? 0))
          const items = (resp.items ?? []).map((u: any) => ({
            label: `${u.name}（${u.dept}）`,
            value: u.id,
          }))
          return [...existingItems, ...items]
        },
      })
      setOptions([...(fieldRef.current?.dataSource ?? [])].map(d => ({
        label: String(d.label),
        value: String(d.value),
      })))
    }
    catch { /* 忽略 */ }
    finally { setLoading(false) }
  }, [])

  /** 初始加载 */
  useEffect(() => {
    const timer = setTimeout(() => loadData('', 1, false), 50)
    return () => clearTimeout(timer)
  }, [loadData])

  /** 搜索防抖 */
  const handleSearch = (value: string): void => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setKeyword(value)
      loadData(value, 1, false)
    }, DEBOUNCE_DELAY)
  }

  /** 滚动加载更多 */
  const handlePopupScroll = (e: React.UIEvent<HTMLDivElement>): void => {
    const target = e.target as HTMLDivElement
    if (target.scrollTop + target.offsetHeight >= target.scrollHeight - 10 && hasMore && !loading) {
      loadData(keyword, page + 1, true)
    }
  }

  return (
    <div>
      <Title level={3}>分页搜索数据源 (Field 版)</Title>
      <Paragraph type="secondary">
        远程搜索 / 分页加载 / 防抖 {DEBOUNCE_DELAY}ms / 走 field.loadDataSource() 管线 —— FormField + fieldProps 实现
      </Paragraph>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message={<span>使用 <code>field.loadDataSource(&#123; url: '/api/users', params &#125;)</code> 加载，共 1000 条模拟数据，每页 {PAGE_SIZE} 条</span>}
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
                {/* 分页搜索 Select — 通过 fieldProps.componentProps 传递自定义交互 */}
                <FormField
                  name="userId"
                  fieldProps={{
                    label: '选择用户',
                    required: true,
                    component: 'Select',
                    componentProps: {
                      showSearch: true,
                      filterOption: false,
                      onSearch: handleSearch,
                      onPopupScroll: handlePopupScroll,
                      placeholder: loading ? '加载中...' : `输入关键词搜索（已加载 ${options.length} / ${total} 条）`,
                      options,
                      loading,
                      style: { width: 400 },
                      notFoundContent: loading ? <Spin size="small" /> : '无匹配结果',
                      dropdownRender: (menu: React.ReactNode) => (
                        <>
                          {menu}
                          <div style={{ padding: '4px 8px', textAlign: 'center', color: '#999', fontSize: 12 }}>
                            {loading ? '加载中...' : `已加载 ${options.length} / ${total} 条`}
                          </div>
                        </>
                      ),
                    },
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
