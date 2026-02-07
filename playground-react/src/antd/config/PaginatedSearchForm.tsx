/**
 * 场景 20：分页搜索数据源
 *
 * 覆盖：
 * - 大数据量远程搜索（输入关键词搜索选项）
 * - 分页加载更多
 * - 搜索防抖
 * - 三种模式切换
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { FormField, useCreateForm } from '@moluoxixi/react';
import { setupAntd } from '@moluoxixi/ui-antd';
import {
  Typography, Select, Form, Spin,
} from 'antd';
import type { FieldInstance } from '@moluoxixi/core';
import { PlaygroundForm } from '../../components/PlaygroundForm';

const { Title, Paragraph } = Typography;

setupAntd();

/** 模拟 1000 条用户数据 */
const MOCK_USERS = Array.from({ length: 1000 }, (_, i) => ({
  id: `user-${i + 1}`,
  name: `用户${String(i + 1).padStart(4, '0')}`,
  department: ['技术部', '产品部', '设计部', '运营部'][i % 4],
}));

/** 每页条数 */
const PAGE_SIZE = 20;

/** 搜索防抖延迟 */
const DEBOUNCE_DELAY = 300;

/**
 * 模拟分页搜索接口
 *
 * @param keyword - 搜索关键词
 * @param page - 页码
 */
async function fetchUsers(keyword: string, page: number): Promise<{ data: typeof MOCK_USERS; total: number }> {
  await new Promise((r) => setTimeout(r, 400));
  const filtered = keyword
    ? MOCK_USERS.filter((u) => u.name.includes(keyword) || u.department.includes(keyword))
    : MOCK_USERS;
  const start = (page - 1) * PAGE_SIZE;
  return {
    data: filtered.slice(start, start + PAGE_SIZE),
    total: filtered.length,
  };
}

/**
 * 分页搜索数据源示例
 */
export const PaginatedSearchForm = observer((): React.ReactElement => {
  const form = useCreateForm({
    initialValues: { userId: undefined, remark: '' },
  });

  useEffect(() => {
    form.createField({ name: 'userId', label: '选择用户', required: true });
    form.createField({ name: 'remark', label: '备注' });
  }, []);

  /* 搜索状态 */
  const [options, setOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** 加载数据 */
  const loadData = useCallback(async (kw: string, pg: number, append: boolean): Promise<void> => {
    setLoading(true);
    try {
      const res = await fetchUsers(kw, pg);
      const newOptions = res.data.map((u) => ({
        label: `${u.name}（${u.department}）`,
        value: u.id,
      }));
      setOptions((prev) => (append ? [...prev, ...newOptions] : newOptions));
      setTotal(res.total);
      setHasMore(pg * PAGE_SIZE < res.total);
    } catch {
      /* 忽略搜索错误 */
    } finally {
      setLoading(false);
    }
  }, []);

  /** 初始加载 */
  useEffect(() => {
    loadData('', 1, false);
  }, [loadData]);

  /** 搜索（防抖） */
  const handleSearch = (value: string): void => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setKeyword(value);
      setPage(1);
      loadData(value, 1, false);
    }, DEBOUNCE_DELAY);
  };

  /** 滚动加载更多 */
  const handlePopupScroll = (e: React.UIEvent<HTMLDivElement>): void => {
    const target = e.target as HTMLDivElement;
    if (target.scrollTop + target.offsetHeight >= target.scrollHeight - 10 && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadData(keyword, nextPage, true);
    }
  };

  return (
    <div>
      <Title level={3}>分页搜索数据源</Title>
      <Paragraph type="secondary">
        大数据量远程搜索 / 分页加载更多 / 搜索防抖（{DEBOUNCE_DELAY}ms） / 共 {MOCK_USERS.length} 条模拟数据
      </Paragraph>

      <PlaygroundForm form={form}>
        {({ mode }) => (
          <>
            <FormField name="userId">
              {(field: FieldInstance) => (
                <Form.Item
                  label={field.label}
                  required={field.required}
                  validateStatus={field.errors.length > 0 ? 'error' : undefined}
                  help={field.errors.length > 0 ? field.errors[0].message : undefined}
                >
                  <Select
                    value={(field.value as string) ?? undefined}
                    onChange={(val) => field.setValue(val)}
                    showSearch
                    filterOption={false}
                    onSearch={handleSearch}
                    onPopupScroll={handlePopupScroll}
                    placeholder="输入关键词搜索用户"
                    options={options}
                    loading={loading}
                    disabled={mode === 'disabled'}
                    style={{ width: 400 }}
                    notFoundContent={loading ? <Spin size="small" /> : '无匹配结果'}
                    dropdownRender={(menu) => (
                      <>
                        {menu}
                        <div style={{ padding: '4px 8px', textAlign: 'center', color: '#999', fontSize: 12 }}>
                          {loading ? '加载中...' : `已加载 ${options.length} / ${total} 条`}
                        </div>
                      </>
                    )}
                  />
                </Form.Item>
              )}
            </FormField>

            <FormField name="remark">
              {(field: FieldInstance) => (
                <Form.Item label={field.label}>
                  <Select
                    mode="tags"
                    value={field.value as string[] ?? []}
                    onChange={(val) => field.setValue(val)}
                    placeholder="输入标签"
                    style={{ width: 400 }}
                    disabled={mode === 'disabled'}
                  />
                </Form.Item>
              )}
            </FormField>
          </>
        )}
      </PlaygroundForm>
    </div>
  );
});
