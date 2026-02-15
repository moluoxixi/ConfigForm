import type { SceneConfig } from '../types'

/**
 * 场景：display 三态展示
 *
 * 演示 visible / hidden / none 三种展示状态的差异：
 * - visible：正常显示
 * - hidden：隐藏 UI 但**保留数据**（提交时仍包含）
 * - none：隐藏 UI 且**排除数据**（提交时不包含）
 *
 * 用户可切换每个字段的 display 状态，提交后观察提交数据的差异。
 */

const DISPLAY_OPTIONS = [
  { label: 'visible（显示）', value: 'visible' },
  { label: 'hidden（隐藏但保留数据）', value: 'hidden' },
  { label: 'none（隐藏且排除数据）', value: 'none' },
]

const config: SceneConfig = {
  title: 'display 三态',
  description: 'visible / hidden / none — 隐藏 vs 排除数据的差异',

  initialValues: {
    displayMode: 'visible',
    secretField: '这是一个敏感值',
    normalField: '这是正常值',
    computedField: '保留数据',
  },

  schema: {
    type: 'object',
    decoratorProps: { labelPosition: 'right', labelWidth: '160px', actions: { submit: '提交（观察数据差异）', reset: '重置' } },
    properties: {
      displayMode: {
        type: 'string',
        title: '切换 display 模式',
        component: 'RadioGroup',
        enum: DISPLAY_OPTIONS,
        description: '切换后观察下方字段的显隐和提交数据变化',
      },
      secretField: {
        type: 'string',
        title: '敏感字段',
        description: 'display=hidden 时隐藏但保留数据，display=none 时隐藏且排除数据',
        componentProps: { placeholder: '敏感信息' },
        excludeWhenHidden: false,
        reactions: [
          {
            watch: 'displayMode',
            fulfill: {
              run: (field: { display: string }, ctx: { values: Record<string, unknown> }): void => {
                const mode = ctx.values.displayMode as string
                field.display = mode
              },
            },
          },
        ],
      },
      normalField: {
        type: 'string',
        title: '普通字段',
        description: '跟随 display 模式变化',
        componentProps: { placeholder: '普通数据' },
        excludeWhenHidden: false,
        reactions: [
          {
            watch: 'displayMode',
            fulfill: {
              run: (field: { display: string }, ctx: { values: Record<string, unknown> }): void => {
                const mode = ctx.values.displayMode as string
                field.display = mode
              },
            },
          },
        ],
      },
      computedField: {
        type: 'string',
        title: '计算字段',
        description: 'hidden 模式适用于需要隐藏 UI 但保留计算结果的场景',
        preview: true,
        componentProps: { placeholder: '自动计算的值' },
        excludeWhenHidden: false,
        reactions: [
          {
            watch: 'displayMode',
            fulfill: {
              run: (field: { display: string }, ctx: { values: Record<string, unknown> }): void => {
                const mode = ctx.values.displayMode as string
                field.display = mode
              },
            },
          },
        ],
      },
    },
  },
}

export default config
