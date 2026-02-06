/**
 * 有向图，用于字段联动的依赖分析和循环检测
 */
export class DependencyGraph {
  /** 邻接表 */
  private adjacency = new Map<string, Set<string>>()

  /** 添加有向边：from 依赖 to */
  addEdge(from: string, to: string): void {
    if (!this.adjacency.has(from)) {
      this.adjacency.set(from, new Set())
    }
    this.adjacency.get(from)!.add(to)
  }

  /** 移除有向边 */
  removeEdge(from: string, to: string): void {
    this.adjacency.get(from)?.delete(to)
  }

  /** 移除节点及其所有关联边 */
  removeNode(node: string): void {
    this.adjacency.delete(node)
    for (const edges of this.adjacency.values()) {
      edges.delete(node)
    }
  }

  /** 获取节点的所有直接依赖 */
  getDependencies(node: string): string[] {
    return Array.from(this.adjacency.get(node) ?? [])
  }

  /** 获取所有依赖 node 的节点（反向查找） */
  getDependents(node: string): string[] {
    const result: string[] = []
    for (const [from, edges] of this.adjacency) {
      if (edges.has(node)) {
        result.push(from)
      }
    }
    return result
  }

  /**
   * 检测循环依赖
   * @returns 返回第一个发现的环路径，没有循环返回 null
   */
  detectCycle(): string[] | null {
    const visited = new Set<string>()
    const recursionStack = new Set<string>()
    const path: string[] = []

    for (const node of this.adjacency.keys()) {
      const cycle = this.dfs(node, visited, recursionStack, path)
      if (cycle)
        return cycle
    }
    return null
  }

  /**
   * 拓扑排序
   * @returns 排序后的节点数组（依赖在前），有环则抛出错误
   */
  topologicalSort(): string[] {
    const inDegree = new Map<string, number>()
    const allNodes = new Set<string>()

    /* 收集所有节点 */
    for (const [from, edges] of this.adjacency) {
      allNodes.add(from)
      for (const to of edges) {
        allNodes.add(to)
      }
    }

    /* 计算入度 */
    for (const node of allNodes) {
      inDegree.set(node, 0)
    }
    for (const edges of this.adjacency.values()) {
      for (const to of edges) {
        inDegree.set(to, (inDegree.get(to) ?? 0) + 1)
      }
    }

    /* Kahn 算法 */
    const queue: string[] = []
    for (const [node, degree] of inDegree) {
      if (degree === 0)
        queue.push(node)
    }

    const result: string[] = []
    while (queue.length > 0) {
      const node = queue.shift()!
      result.push(node)
      const edges = this.adjacency.get(node)
      if (edges) {
        for (const to of edges) {
          const newDegree = (inDegree.get(to) ?? 1) - 1
          inDegree.set(to, newDegree)
          if (newDegree === 0)
            queue.push(to)
        }
      }
    }

    if (result.length !== allNodes.size) {
      throw new Error('[ConfigForm] 联动存在循环依赖，无法拓扑排序')
    }

    return result
  }

  /** 清空图 */
  clear(): void {
    this.adjacency.clear()
  }

  /** 获取所有节点 */
  getNodes(): string[] {
    const nodes = new Set<string>()
    for (const [from, edges] of this.adjacency) {
      nodes.add(from)
      for (const to of edges) {
        nodes.add(to)
      }
    }
    return Array.from(nodes)
  }

  private dfs(
    node: string,
    visited: Set<string>,
    recursionStack: Set<string>,
    path: string[],
  ): string[] | null {
    if (recursionStack.has(node)) {
      const cycleStart = path.indexOf(node)
      return [...path.slice(cycleStart), node]
    }
    if (visited.has(node))
      return null

    visited.add(node)
    recursionStack.add(node)
    path.push(node)

    const edges = this.adjacency.get(node)
    if (edges) {
      for (const neighbor of edges) {
        const cycle = this.dfs(neighbor, visited, recursionStack, path)
        if (cycle)
          return cycle
      }
    }

    path.pop()
    recursionStack.delete(node)
    return null
  }
}
