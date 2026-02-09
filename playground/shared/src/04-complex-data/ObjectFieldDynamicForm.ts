import type { SceneConfig } from '../types'
import type { FormInstance } from '@moluoxixi/core'
import { FormLifeCycle } from '@moluoxixi/core'

/**
 * 场景：ObjectField 动态属性
 *
 * 演示 ObjectField 的 addProperty / removeProperty / existProperty / getPropertyNames：
 * - 表单挂载后通过 effects 动态为对象字段添加属性
 * - 用户交互触发 addProperty / removeProperty
 * - 日志实时展示当前对象的属性列表
 */

const config: SceneConfig = {
  title: 'ObjectField 动态属性',
  description: 'addProperty / removeProperty / existProperty / getPropertyNames',

  initialValues: {
    config: {
      host: 'localhost',
      port: 8080,
    },
    log: '',
  },

  effects: (form: FormInstance): void => {
    const logs: string[] = []

    function writeLog(msg: string): void {
      logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`)
      const logField = form.getField('log')
      if (logField) {
        logField.setValue(logs.join('\n'))
      }
    }

    form.on(FormLifeCycle.ON_FORM_MOUNT, () => {
      /**
       * 表单挂载后，读取 ObjectField 的属性列表，
       * 并动态添加一个新属性 'debug'。
       */
      setTimeout(() => {
        const objField = form.getObjectField('config')
        if (objField) {
          const names = objField.getPropertyNames()
          writeLog(`初始属性: [${names.join(', ')}]`)

          /* 动态添加 debug 属性 */
          objField.addProperty('debug', true)
          writeLog('addProperty("debug", true) — 动态添加')

          const updatedNames = objField.getPropertyNames()
          writeLog(`当前属性: [${updatedNames.join(', ')}]`)

          writeLog(`existProperty("host") = ${objField.existProperty('host')}`)
          writeLog(`existProperty("notExist") = ${objField.existProperty('notExist')}`)
        }
      }, 200)
    })

    /**
     * 延迟后演示 removeProperty：移除之前添加的 debug 属性。
     */
    form.on(FormLifeCycle.ON_FORM_MOUNT, () => {
      setTimeout(() => {
        const objField = form.getObjectField('config')
        if (objField && objField.existProperty('debug')) {
          objField.removeProperty('debug')
          writeLog('removeProperty("debug") — 动态移除')

          const finalNames = objField.getPropertyNames()
          writeLog(`最终属性: [${finalNames.join(', ')}]`)
        }
      }, 1500)
    })
  },

  schema: {
    type: 'object',
    decoratorProps: { labelPosition: 'right', labelWidth: '160px', actions: { submit: '提交（查看嵌套结构）', reset: '重置' } },
    properties: {
      config: {
        type: 'object',
        title: '配置对象 (ObjectField)',
        component: 'LayoutCard',
        componentProps: { title: '配置对象 — type: object' },
        properties: {
          host: {
            type: 'string',
            title: '主机地址',
            required: true,
            description: '数据路径: config.host',
          },
          port: {
            type: 'number',
            title: '端口号',
            required: true,
            description: '数据路径: config.port',
            componentProps: { min: 1, max: 65535, style: 'width: 200px' },
          },
        },
      },
      log: {
        type: 'string',
        title: '动态属性操作日志',
        component: 'Textarea',
        preview: true,
        componentProps: { rows: 10, style: 'font-family: monospace; font-size: 12px' },
        description: '展示 addProperty / existProperty / getPropertyNames 的实时调用结果',
      },
    },
  },
}

export default config
