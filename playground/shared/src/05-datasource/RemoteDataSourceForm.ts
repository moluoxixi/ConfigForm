import type { DataSourceItem, ReactionContext } from '@moluoxixi/core'
import type { SceneConfig } from '../types'

/**
 * 场景：远程数据源配置
 *
 * 演示 DataSourceConfig 的 url / method / params / transform / cache 配置：
 * - 字段级远程数据源（无需 reactions，Schema 声明式）
 * - 响应转换（labelField / valueField / transform）
 * - 参数引用（$values.xxx 动态参数）
 * - 缓存策略（cache TTL）
 *
 * 注意：演示使用 jsonplaceholder API 作为公共测试接口。
 */

const config: SceneConfig = {
  title: '远程数据源配置',
  description: 'DataSourceConfig: url / params / transform / cache — 声明式远程数据源',

  initialValues: {
    userId: '',
    postId: '',
    todoStatus: '',
  },

  schema: {
    type: 'object',
    decoratorProps: { labelPosition: 'right', labelWidth: '140px', actions: { submit: '提交', reset: '重置' } },
    properties: {
      userId: {
        type: 'string',
        title: '用户（远程加载）',
        description: 'url + labelField/valueField 自动映射',
        required: true,
        dataSource: {
          url: 'https://jsonplaceholder.typicode.com/users',
          method: 'GET',
          labelField: 'name',
          valueField: 'id',
          cache: { ttl: 60000 },
        },
        componentProps: { placeholder: '从远程 API 加载用户列表', style: 'width: 400px' },
      },
      postId: {
        type: 'string',
        title: '文章（依赖用户）',
        description: 'params 引用 $values.userId，用户变化后重新加载',
        dataSource: {
          url: 'https://jsonplaceholder.typicode.com/posts',
          method: 'GET',
          params: { userId: '$values.userId' },
          transform: (response: unknown): DataSourceItem[] => {
            const posts = response as Array<{ id: number, title: string }>
            return posts.slice(0, 10).map(p => ({
              label: `#${p.id} ${p.title.slice(0, 30)}...`,
              value: p.id,
            }))
          },
          cache: { ttl: 30000 },
        },
        componentProps: { placeholder: '先选择用户，再选文章', style: 'width: 400px' },
        reactions: [
          {
            watch: 'userId',
            fulfill: {
              run: (field, ctx: ReactionContext): void => {
                const selectField = field as {
                  setDataSource: (items: DataSourceItem[]) => void
                  loadDataSource: (config: unknown) => Promise<void>
                }
                if (!ctx.values.userId) {
                  selectField.setDataSource([])
                  return
                }
                selectField.loadDataSource({
                  url: 'https://jsonplaceholder.typicode.com/posts',
                  method: 'GET' as const,
                  params: { userId: String(ctx.values.userId) },
                  transform: (response: unknown): DataSourceItem[] => {
                    const posts = response as Array<{ id: number, title: string }>
                    return posts.slice(0, 10).map(p => ({
                      label: `#${p.id} ${p.title.slice(0, 30)}...`,
                      value: p.id,
                    }))
                  },
                  cache: { ttl: 30000 },
                }).catch(() => { /* 忽略 */ })
              },
            },
          },
        ],
      },
      todoStatus: {
        type: 'string',
        title: '待办状态',
        description: 'transform 自定义响应转换',
        enum: [
          { label: '全部', value: 'all' },
          { label: '已完成', value: 'completed' },
          { label: '未完成', value: 'pending' },
        ],
        componentProps: { placeholder: '静态选项（对比远程加载）' },
      },
    },
  },
}

export default config
