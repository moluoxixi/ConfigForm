<template>
  <div>
    <h2>异步选项加载</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">远程 dataSource / reactions 异步加载 / loading 状态</p>
    <AAlert type="info" show-icon style="margin-bottom: 16px" message="切换「类型」下拉可看到异步加载过程（模拟 600ms 延迟）" />
    <PlaygroundForm :schema="schema" :initial-values="initialValues" />
  </div>
</template>

<script setup lang="ts">
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { Alert as AAlert } from 'ant-design-vue'
import type { FormSchema } from '@moluoxixi/schema'
import PlaygroundForm from '../../components/PlaygroundForm.vue'

setupAntdVue()

const initialValues = { dynamicType: 'fruit', dynamicItem: undefined, country: 'china', remark: '' }

const mockData: Record<string, Array<{ label: string; value: string }>> = {
  fruit: [{ label: '苹果', value: 'apple' }, { label: '香蕉', value: 'banana' }, { label: '橙子', value: 'orange' }],
  vegetable: [{ label: '白菜', value: 'cabbage' }, { label: '胡萝卜', value: 'carrot' }],
  meat: [{ label: '猪肉', value: 'pork' }, { label: '牛肉', value: 'beef' }],
}

const schema: FormSchema = {
  form: { labelPosition: 'right', labelWidth: '140px' },
  fields: {
    dynamicType: { type: 'string', label: '类型', component: 'Select', wrapper: 'FormItem', defaultValue: 'fruit', enum: [{ label: '水果', value: 'fruit' }, { label: '蔬菜', value: 'vegetable' }, { label: '肉类', value: 'meat' }] },
    dynamicItem: {
      type: 'string', label: '品种（异步）', component: 'Select', wrapper: 'FormItem', placeholder: '加载中...',
      reactions: [{
        watch: 'dynamicType',
        fulfill: {
          run: async (f: any, ctx: any) => {
            const t = ctx.values.dynamicType as string
            if (!t) {
              f.setDataSource([])
              f.setComponentProps({ placeholder: '请先选择类型' })
              return
            }
            f.loading = true
            f.setValue(undefined)
            f.setComponentProps({ placeholder: '加载中...' })
            await new Promise(r => setTimeout(r, 600))
            f.setDataSource(mockData[t] ?? [])
            f.loading = false
            const count = (mockData[t] ?? []).length
            f.setComponentProps({ placeholder: `请选择品种（${count}项）` })
          },
        },
      }],
    },
    country: { type: 'string', label: '国家', component: 'Select', wrapper: 'FormItem', defaultValue: 'china', enum: [{ label: '中国', value: 'china' }, { label: '美国', value: 'usa' }, { label: '日本', value: 'japan' }] },
    remark: { type: 'string', label: '备注', component: 'Textarea', wrapper: 'FormItem', placeholder: '请输入' },
  },
}
</script>
