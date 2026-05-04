import type { FormDevtoolsNode, FormNodeRenderMetric, FormNodeSyncMetric } from '../types'
import type { DevtoolsStore, StoredNode } from './types'

function assertCompatibleNode(existing: FormDevtoolsNode | undefined, next: FormDevtoolsNode) {
  if (!existing)
    return

  const keys: Array<keyof FormDevtoolsNode> = ['formId', 'kind', 'field', 'component', 'parentId']
  for (const key of keys) {
    if (existing[key] !== undefined && next[key] !== undefined && existing[key] !== next[key]) {
      throw new Error(
        `Conflicting devtools node id: ${next.id} changed ${key} from ${String(existing[key])} to ${String(next[key])}`,
      )
    }
  }

  if (existing.source && next.source && existing.source.id !== next.source.id) {
    throw new Error(
      `Conflicting devtools node id: ${next.id} changed source from ${existing.source.id} to ${next.source.id}`,
    )
  }
}

export function createStore(render: () => void): DevtoolsStore {
  const nodes = new Map<string, StoredNode>()
  const formRegistrationOrders = new Map<string, number>()
  const pendingRenderMetrics = new Map<string, FormNodeRenderMetric[]>()
  const pendingSyncMetrics = new Map<string, FormNodeSyncMetric[]>()
  let orderSeed = 0
  let formRegistrationOrderSeed = 0

  function resolveFormRegistrationOrder(formId: string): number {
    const existing = formRegistrationOrders.get(formId)
    if (existing !== undefined)
      return existing

    const next = ++formRegistrationOrderSeed
    formRegistrationOrders.set(formId, next)
    return next
  }

  function dropUnusedFormRegistrationOrder(formId: string) {
    for (const node of nodes.values()) {
      if (node.formId === formId)
        return
    }
    formRegistrationOrders.delete(formId)
  }

  function applyRenderMetric(node: StoredNode, metric: FormNodeRenderMetric) {
    const total = (node.avgRenderMs ?? 0) * node.renderSamples + metric.duration
    node.renderSamples += 1
    node.lastRenderMs = metric.duration
    node.lastRenderPhase = metric.phase
    node.maxRenderMs = Math.max(node.maxRenderMs ?? metric.duration, metric.duration)
    node.avgRenderMs = total / node.renderSamples
  }

  function applySyncMetric(node: StoredNode, metric: FormNodeSyncMetric) {
    const total = (node.avgSyncMs ?? 0) * node.syncSamples + metric.duration
    node.syncSamples += 1
    node.lastSyncMs = metric.duration
    node.maxSyncMs = Math.max(node.maxSyncMs ?? metric.duration, metric.duration)
    node.avgSyncMs = total / node.syncSamples
  }

  function pushPendingMetric<TMetric>(pending: Map<string, TMetric[]>, metric: TMetric & { id: string }) {
    const existing = pending.get(metric.id)
    if (existing) {
      existing.push(metric)
      return
    }

    pending.set(metric.id, [metric])
  }

  function flushPendingMetrics(node: StoredNode) {
    // render/sync 指标可能早于节点注册到达，注册时必须补记，避免刷新时丢样本。
    const renderMetrics = pendingRenderMetrics.get(node.id)
    if (renderMetrics) {
      for (const metric of renderMetrics)
        applyRenderMetric(node, metric)
      pendingRenderMetrics.delete(node.id)
    }

    const syncMetrics = pendingSyncMetrics.get(node.id)
    if (syncMetrics) {
      for (const metric of syncMetrics)
        applySyncMetric(node, metric)
      pendingSyncMetrics.delete(node.id)
    }
  }

  function upsertNode(node: FormDevtoolsNode, element: HTMLElement | null) {
    const existing = nodes.get(node.id)
    assertCompatibleNode(existing, node)
    const stored: StoredNode = {
      ...existing,
      ...node,
      element,
      order: node.order ?? existing?.order ?? ++orderSeed,
      registrationOrder: existing?.registrationOrder ?? resolveFormRegistrationOrder(node.formId),
      renderSamples: existing?.renderSamples ?? 0,
      syncSamples: existing?.syncSamples ?? 0,
    }
    nodes.set(node.id, stored)
    flushPendingMetrics(stored)
    render()
  }

  return {
    nodes,
    recordRender(metric: FormNodeRenderMetric) {
      const node = nodes.get(metric.id)
      if (!node) {
        pushPendingMetric(pendingRenderMetrics, metric)
        return
      }

      applyRenderMetric(node, metric)
      render()
    },
    recordSync(metric: FormNodeSyncMetric) {
      const node = nodes.get(metric.id)
      if (!node) {
        pushPendingMetric(pendingSyncMetrics, metric)
        return
      }

      applySyncMetric(node, metric)
      render()
    },
    registerField(node: FormDevtoolsNode, element: HTMLElement | null) {
      upsertNode(node, element)
    },
    unregisterField(id: string) {
      const existing = nodes.get(id)
      nodes.delete(id)
      pendingRenderMetrics.delete(id)
      pendingSyncMetrics.delete(id)
      if (existing)
        dropUnusedFormRegistrationOrder(existing.formId)
      render()
    },
    updateField(node: FormDevtoolsNode, element: HTMLElement | null) {
      upsertNode(node, element)
    },
  }
}
