import type { FieldInstance } from '@moluoxixi/core'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/react'
import { setupAntd, StatusTabs } from '@moluoxixi/ui-antd'
import { observer } from 'mobx-react-lite'
/**
 * 场景 20：分页搜索数据源
 *
 * 通过 field.loadDataSource({ url: '/api/users', params, requestAdapter: 'mock' }) 加载。
 * 1000 条模拟数据，每页 20 条，搜索防抖 300ms，滚动加载更多。
 */
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { clearApiLogs, getApiLogs, setupMockAdapter } from '../../mock/dataSourceAdapter'

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
              清空
            </button>
          )
        : null}
    >
      {logs.length === 0
        ? <div style={{ color: '#aaa', fontSize: 12 }}>暂无请求</div>
        : (
            <div style={{ fontFamily: 'monospace', fontSize: 11, lineHeight: 1.8, maxHeight: 200, overflow: 'auto' }}>
              {logs.map((log, i) => <div key={i} style={{ color: '#52c41a' }}>{log}</div>)}
            </div>
          )}
    </div></div>
  )
}

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
    if (!field)
      return

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

      /* 同步 options 给 Select（因为 MobX 的 field.dataSource 可能不会触发 React 重渲染） */
      setOptions([...(fieldRef.current?.dataSource ?? [])].map(d => ({
        label: String(d.label),
        value: String(d.value),
      })))
    }
    catch {
      /* 忽略 */
    }
    finally {
      setLoading(false)
    }
  }, [])

  /** 初始加载 */
  useEffect(() => {
    const timer = setTimeout(() => loadData('', 1, false), 50)
    return () => clearTimeout(timer)
  }, [loadData])

  /** 搜索防抖 */
  const handleSearch = (value: string): void => {
    if (timerRef.current)
      clearTimeout(timerRef.current)
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
      <h2>分页搜索数据源</h2>
      <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16, fontSize: 14 }}>
        远程搜索 / 分页加载 / 防抖
        {' '}
        {DEBOUNCE_DELAY}
        ms / 走 field.loadDataSource() 管线
      </p>
      <div style={{ padding: '8px 16px', marginBottom: 16, background: '#e6f4ff', border: '1px solid #91caff', borderRadius: 6, fontSize: 13 }}>{(
          <span>
            使用
            <code>field.loadDataSource(&#123; url: '/api/users', params &#125;)</code>
            {' '}
            加载，
            共 1000 条模拟数据，每页
            {PAGE_SIZE}
            {' '}
            条
          </span>
        )}
      />

      <StatusTabs>
        {({ mode }) => {
          form.pattern = mode
          return (
            <FormProvider form={form}>
              <>
                <FormField name="userId">
                  {(field: FieldInstance) => (
                    <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>{field.label}{field.required && <span style={{ color: 'red' }}> *</span>}</label>
                    {field.errors.length > 0 && <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}>{field.errors[0].message}</div>}
                      {mode === 'readOnly'
                        ? (
                            <span>{options.find(o => o.value === field.value)?.label ?? '—'}</span>
                          )
                        : (
                            <select
                              value={(field.value as string) ?? ''}
                              onChange={e => field.setValue(e.target.value || undefined)}
                              disabled={mode === 'disabled'}
                              style={{ width: 400, padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: 6, fontSize: 14 }}
                            >
                              <option value="">输入关键词搜索（已加载 {options.length} / {total} 条）</option>
                              {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select/>
                              )}
                            />
                          )}
                    </div>
                  )}
                </FormField>
              </>
            </FormProvider>
          )
        }}
      </StatusTabs>
      <ApiLogPanel />
    </div>
  )
})
