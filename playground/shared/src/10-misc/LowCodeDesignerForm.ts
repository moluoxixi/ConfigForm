import type { ISchema } from '@moluoxixi/core'
import type { SceneConfig } from '../types'

/**
 * 场景：低代码可视化设计器
 *
 * 演示目标：
 * 1. 通过 LowCodeDesigner 拖拽构建 schema
 * 2. React/Vue Playground 分别通过各自框架包注册 LowCodeDesigner 组件
 * 3. 设计器内部实时展示画布、Schema 与预览
 */

const INITIAL_GENERATED_SCHEMA: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'top' },
  properties: {
    basicCard: {
      type: 'void',
      title: '基础资料',
      component: 'LayoutCard',
      componentProps: { title: '基础资料' },
      properties: {
        userName: {
          type: 'string',
          title: '用户名',
          required: true,
          component: 'Input',
          componentProps: { placeholder: '请输入用户名' },
        },
        budget: {
          type: 'number',
          title: '预算',
          component: 'InputNumber',
        },
      },
    },
    deliverTabs: {
      type: 'void',
      title: '投放配置',
      component: 'LayoutTabs',
      componentProps: { title: '投放配置' },
      properties: {
        base: {
          type: 'void',
          componentProps: { title: '基础选项' },
          properties: {
            region: {
              type: 'string',
              title: '地区',
              component: 'Select',
              enum: [
                { label: '华北', value: 'north' },
                { label: '华东', value: 'east' },
              ],
            },
            enabled: {
              type: 'boolean',
              title: '开启投放',
              component: 'Switch',
            },
          },
        },
        advanced: {
          type: 'void',
          componentProps: { title: '高级设置' },
          properties: {
            scheduleDate: {
              type: 'date',
              title: '执行日期',
              component: 'DatePicker',
            },
            remark: {
              type: 'string',
              title: '备注',
              component: 'Textarea',
            },
          },
        },
      },
    },
    extraCollapse: {
      type: 'void',
      title: '扩展信息',
      component: 'LayoutCollapse',
      componentProps: { title: '扩展信息' },
      properties: {
        panelA: {
          type: 'void',
          componentProps: { title: '渠道设置' },
          properties: {
            channel: {
              type: 'string',
              title: '渠道类型',
              component: 'Select',
              enum: [
                { label: '线上', value: 'online' },
                { label: '线下', value: 'offline' },
              ],
            },
          },
        },
      },
    },
  },
}

/**
 * config：定义该模块复用的常量配置。
 * 所属模块：`playground/shared/src/10-misc/LowCodeDesignerForm.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const config: SceneConfig = {
  title: '低代码可视化设计器',
  description: '拖拽搭建字段与布局容器（Card/Tabs/Collapse），通过框架侧低代码包注册的 LowCodeDesigner 组件实时设计 Schema',

  initialValues: {
    designerSchema: INITIAL_GENERATED_SCHEMA,
  },

  schema: {
    type: 'object',
    decoratorProps: {
      labelPosition: 'top',
      actions: {
        submit: '保存方案',
        reset: '重置设计',
      },
    },
    properties: {
      designerSchema: {
        type: 'object',
        title: '可视化设计器',
        component: 'LowCodeDesigner',
        decorator: '',
        description: '通过拖拽物料生成配置化表单 schema（支持实时预览）',
      },
    },
  },
}

export default config
