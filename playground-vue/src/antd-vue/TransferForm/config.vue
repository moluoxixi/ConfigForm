<template>
  <div>
    <h2>穿梭框</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">antd Transfer / 权限分配 / 搜索过滤 — ConfigForm + Schema 实现</p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <ConfigForm
        :schema="withMode(schema, mode)"
        :initial-values="initialValues"
        @submit="showResult"
        @submit-failed="(e: any) => st?.showErrors(e)"
      />
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'
import { setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { ConfigForm, registerComponent } from '@moluoxixi/vue'
/**
 * 穿梭框 — Config 模式
 *
 * 自定义 TransferPicker 组件注册后，在 schema 中通过 component: 'TransferPicker' 引用。
 */
import { defineComponent, h, ref } from 'vue'

setupAntdVue()

/** 权限项 */
interface PermissionItem { key: string; title: string }
const ACTIONS = ['查看', '编辑', '删除', '审核', '导出']
const RESOURCES = ['用户', '订单', '商品', '报表']
const PERMISSIONS: PermissionItem[] = Array.from({ length: 20 }, (_, i) => ({ key: `perm-${i + 1}`, title: `权限${String(i + 1).padStart(2, '0')} - ${ACTIONS[i % 5]}${RESOURCES[Math.floor(i / 5)]}` }))

/** 穿梭框选择器组件 */
const TransferPicker = defineComponent({
  name: 'TransferPicker',
  props: {
    value: { type: Array as PropType<string[]>, default: () => [] },
    onChange: { type: Function as PropType<(v: string[]) => void>, default: undefined },
    disabled: { type: Boolean, default: false },
    readOnly: { type: Boolean, default: false },
    dataSource: { type: Array as PropType<PermissionItem[]>, default: () => [] },
  },
  setup(props) {
    const searchLeft = ref('')
    const searchRight = ref('')
    const panelStyle = { border: '1px solid #d9d9d9', borderRadius: '8px', width: '320px', overflow: 'hidden' }
    const headerStyle = { padding: '8px 12px', borderBottom: '1px solid #d9d9d9', fontWeight: '600', fontSize: '14px', background: '#fafafa' }
    const searchStyle = { width: '100%', padding: '6px 8px', border: 'none', borderBottom: '1px solid #f0f0f0', outline: 'none', fontSize: '13px', boxSizing: 'border-box' as const }
    const listStyle = { height: '260px', overflow: 'auto', padding: '4px 0' }
    const itemStyle = { padding: '6px 12px', cursor: 'pointer', fontSize: '13px', transition: 'background .15s' }
    return (): ReturnType<typeof h> => {
      const selected = props.value ?? []
      if (props.readOnly) {
        if (selected.length === 0) return h('span', { style: { color: '#999' } }, '—')
        return h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '4px' } }, selected.map(k => { const item = props.dataSource.find(p => p.key === k); return h('span', { key: k, style: { display: 'inline-block', padding: '0 7px', fontSize: '12px', lineHeight: '20px', borderRadius: '4px', border: '1px solid #91caff', color: '#1677ff', background: '#e6f4ff' } }, item?.title ?? k) }))
      }
      const leftItems = props.dataSource.filter(p => !selected.includes(p.key))
      const rightItems = props.dataSource.filter(p => selected.includes(p.key))
      const filteredLeft = searchLeft.value ? leftItems.filter(i => i.title.includes(searchLeft.value)) : leftItems
      const filteredRight = searchRight.value ? rightItems.filter(i => i.title.includes(searchRight.value)) : rightItems
      return h('div', { style: { display: 'flex', gap: '12px', alignItems: 'flex-start', opacity: props.disabled ? 0.5 : 1, pointerEvents: props.disabled ? 'none' as const : 'auto' as const } }, [
        h('div', { style: panelStyle }, [
          h('div', { style: headerStyle }, `可选权限（${filteredLeft.length}）`),
          h('input', { placeholder: '搜索', value: searchLeft.value, style: searchStyle, onInput: (e: Event) => { searchLeft.value = (e.target as HTMLInputElement).value } }),
          h('div', { style: listStyle }, filteredLeft.map(item =>
            h('div', { key: item.key, style: itemStyle, onClick: () => props.onChange?.([...selected, item.key]), onMouseenter: (e: MouseEvent) => { (e.currentTarget as HTMLElement).style.background = '#f0f0f0' }, onMouseleave: (e: MouseEvent) => { (e.currentTarget as HTMLElement).style.background = '' } }, item.title),
          )),
        ]),
        h('div', { style: panelStyle }, [
          h('div', { style: headerStyle }, `已选权限（${filteredRight.length}）`),
          h('input', { placeholder: '搜索', value: searchRight.value, style: searchStyle, onInput: (e: Event) => { searchRight.value = (e.target as HTMLInputElement).value } }),
          h('div', { style: listStyle }, filteredRight.map(item =>
            h('div', { key: item.key, style: { ...itemStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, onClick: () => props.onChange?.(selected.filter(k => k !== item.key)), onMouseenter: (e: MouseEvent) => { (e.currentTarget as HTMLElement).style.background = '#fff1f0' }, onMouseleave: (e: MouseEvent) => { (e.currentTarget as HTMLElement).style.background = '' } }, [
              h('span', null, item.title),
              h('span', { style: { color: '#ff4d4f', fontSize: '12px' } }, '×'),
            ]),
          )),
        ]),
      ])
    }
  },
})

registerComponent('TransferPicker', TransferPicker, { defaultWrapper: 'FormItem' })

const st = ref<InstanceType<typeof StatusTabs>>()

const initialValues = { roleName: '管理员', permissions: ['perm-1', 'perm-3', 'perm-5'] }

const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
  properties: {
    roleName: { type: 'string', title: '角色名称', required: true, componentProps: { placeholder: '请输入角色名称', style: 'width: 300px' } },
    permissions: { type: 'string', title: '权限分配', required: true, component: 'TransferPicker', componentProps: { dataSource: PERMISSIONS } },
  },
}

/** 将 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}
</script>
