import type { FormConfig, FormInstance, FormPlugin } from './types'
import { Form } from './models/Form'
import { getReactiveAdapter } from './reactive'

/**
 * 对插件列表进行拓扑排序
 *
 * 规则：
 * 1. 先按 dependencies 做拓扑排序（确保依赖先安装）
 * 2. 无依赖关系的插件按 priority 升序排列（数字越小越先安装）
 * 3. 同 priority 保持原始数组顺序（稳定排序）
 *
 * @param plugins - 原始插件列表
 * @returns 排序后的插件列表
 * @throws 循环依赖或缺失依赖时抛出错误
 */
function sortPlugins(plugins: FormPlugin[]): FormPlugin[] {
  const nameMap = new Map<string, FormPlugin>()
  for (const plugin of plugins) {
    nameMap.set(plugin.name, plugin)
  }

  /* Kahn 拓扑排序 */
  const inDegree = new Map<string, number>()
  const graph = new Map<string, string[]>()

  for (const plugin of plugins) {
    if (!inDegree.has(plugin.name))
      inDegree.set(plugin.name, 0)
    if (!graph.has(plugin.name))
      graph.set(plugin.name, [])

    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (!nameMap.has(dep)) {
          throw new Error(
            `[ConfigForm] 插件 "${plugin.name}" 依赖 "${dep}"，但该插件未在 plugins 列表中。`,
          )
        }
        if (!graph.has(dep))
          graph.set(dep, [])
        graph.get(dep)!.push(plugin.name)
        inDegree.set(plugin.name, (inDegree.get(plugin.name) ?? 0) + 1)
      }
    }
  }

  /* 按 priority 排序入度为 0 的节点（数字越小越先安装） */
  const queue = plugins
    .filter(p => (inDegree.get(p.name) ?? 0) === 0)
    .sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100))
    .map(p => p.name)

  const sorted: FormPlugin[] = []
  const visited = new Set<string>()

  while (queue.length > 0) {
    const name = queue.shift()!
    if (visited.has(name))
      continue
    visited.add(name)

    const plugin = nameMap.get(name)!
    sorted.push(plugin)

    const neighbors = graph.get(name) ?? []
    /* 按 priority 排序新解锁的节点 */
    const unlocked: FormPlugin[] = []
    for (const neighbor of neighbors) {
      const degree = (inDegree.get(neighbor) ?? 1) - 1
      inDegree.set(neighbor, degree)
      if (degree === 0 && !visited.has(neighbor)) {
        unlocked.push(nameMap.get(neighbor)!)
      }
    }
    unlocked.sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100))
    for (const u of unlocked) {
      queue.push(u.name)
    }
  }

  if (sorted.length !== plugins.length) {
    const missing = plugins.filter(p => !visited.has(p.name)).map(p => p.name)
    throw new Error(
      `[ConfigForm] 插件存在循环依赖，无法安装：${missing.join(', ')}`,
    )
  }

  return sorted
}

/**
 * 创建表单实例
 *
 * 核心流程：
 * 1. 创建 Form 原始实例
 * 2. 使 values / initialValues 成为深度响应式
 * 3. 使整个 Form 实例成为响应式（makeObservable）
 * 4. 对 plugins 做拓扑排序（dependencies + priority）
 * 5. 自动安装排序后的插件
 * 6. 返回响应式代理
 *
 * @example
 * ```ts
 * const form = createForm({
 *   initialValues: { name: '', age: 0 },
 *   plugins: [historyPlugin(), draftPlugin({ key: 'my-form' })],
 * });
 * ```
 */
export function createForm<
  Values extends Record<string, unknown> = Record<string, unknown>,
>(config: FormConfig<Values> = {}): FormInstance<Values> {
  const adapter = getReactiveAdapter()
  const form = new Form<Values>(config)

  /* 先让数据对象变为深度响应式 */
  form.values = adapter.observable(form.values)

  /* 让整个 Form 实例变为响应式，返回代理 */
  const reactiveForm = adapter.makeObservable(form)
  const formInstance = reactiveForm as unknown as FormInstance<Values>

  /* 自动安装插件（排序后安装，确保依赖顺序正确） */
  if (config.plugins && config.plugins.length > 0) {
    const sorted = sortPlugins(config.plugins)
    for (const plugin of sorted) {
      formInstance.use(plugin)
    }
  }

  return formInstance
}
