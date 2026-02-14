import type { SceneConfig } from '../types'

/**
 * 场景：Schema $ref 复用
 *
 * 演示 JSON Schema 标准的 $ref + definitions 机制，实现 Schema 片段复用。
 *
 * 演示能力：
 * 1. definitions 定义可复用的 Schema 片段
 * 2. $ref 引用定义（格式：#/definitions/<name>）
 * 3. $ref + 本地属性覆盖（如覆盖 title）
 * 4. 嵌套 $ref（被引用的 Schema 内部也可以 $ref）
 */

const config: SceneConfig = {
  title: 'Schema $ref 复用',
  description: '使用 $ref + definitions 实现 Schema 片段复用（JSON Schema 标准）',

  initialValues: {
    name: '',
    homeAddress: {
      province: '',
      city: '',
      detail: '',
      postcode: '',
    },
    workAddress: {
      province: '',
      city: '',
      detail: '',
      postcode: '',
    },
    emergencyContact: {
      contactName: '',
      phone: '',
      address: {
        province: '',
        city: '',
        detail: '',
        postcode: '',
      },
    },
  },

  schema: {
    type: 'object',
    decoratorProps: {
      labelPosition: 'right',
      labelWidth: '120px',
      actions: { submit: '提交', reset: '重置' },
    },

    /*
     * definitions：定义可复用的 Schema 片段。
     * 类似 JSON Schema 的 definitions / $defs。
     */
    definitions: {
      /* 地址 Schema 片段 */
      address: {
        type: 'object',
        properties: {
          province: {
            type: 'string',
            title: '省份',
            required: true,
            enum: [
              { label: '北京', value: 'beijing' },
              { label: '上海', value: 'shanghai' },
              { label: '广东', value: 'guangdong' },
              { label: '浙江', value: 'zhejiang' },
            ],
          },
          city: {
            type: 'string',
            title: '城市',
            required: true,
          },
          detail: {
            type: 'string',
            title: '详细地址',
            required: true,
            component: 'Textarea',
            componentProps: { rows: 2, placeholder: '请输入详细地址' },
          },
          postcode: {
            type: 'string',
            title: '邮编',
            rules: [{ pattern: '^\\d{6}$', message: '邮编为 6 位数字' }],
          },
        },
      },

      /* 联系人 Schema 片段 */
      contactInfo: {
        type: 'object',
        properties: {
          contactName: {
            type: 'string',
            title: '联系人姓名',
            required: true,
          },
          phone: {
            type: 'string',
            title: '联系电话',
            required: true,
            rules: [{ format: 'phone' }],
          },
        },
      },
    },

    properties: {
      name: {
        type: 'string',
        title: '姓名',
        required: true,
      },

      /* ✅ $ref 引用 address 定义 + title 覆盖 */
      homeAddress: {
        $ref: '#/definitions/address',
        title: '家庭地址',
      },

      /* ✅ 同一个 address 定义复用，不同 title */
      workAddress: {
        $ref: '#/definitions/address',
        title: '工作地址',
      },

      /* ✅ 嵌套 $ref：contactInfo 引用 + 追加 address 子字段 */
      emergencyContact: {
        $ref: '#/definitions/contactInfo',
        title: '紧急联系人',
        properties: {
          /* 在 contactInfo 基础上追加地址 */
          address: {
            $ref: '#/definitions/address',
            title: '联系人地址',
          },
        },
      },
    },
  },
}

export default config
