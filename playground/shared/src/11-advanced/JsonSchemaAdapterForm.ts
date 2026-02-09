import type { SceneConfig } from '../types'
import type { StandardJsonSchema } from '@moluoxixi/plugin-json-schema'
import { fromJsonSchema } from '@moluoxixi/plugin-json-schema'

/**
 * 场景：JSON Schema 适配器
 *
 * 演示 @moluoxixi/plugin-json-schema 的标准 JSON Schema 转换能力：
 *
 * 1. 基础转换：type / title / description / default / enum
 * 2. 约束转换：minLength / maxLength / minimum / maximum / pattern / format → rules
 * 3. required 下沉：object 级 required: ['field'] → 字段级 required: true
 * 4. if/then/else → reactions 条件联动
 * 5. dependentRequired → reactions 条件必填
 * 6. allOf 合并
 * 7. oneOf + const 鉴别 → oneOf + discriminator
 * 8. $defs → definitions
 *
 * 模拟场景：从后端 OpenAPI Spec 拿到标准 JSON Schema，直接转换为可渲染的表单。
 */

/**
 * 模拟后端下发的标准 JSON Schema（OpenAPI 风格）
 *
 * 这是一个完全标准的 JSON Schema Draft-07，不含任何表单专有属性。
 */
const backendJsonSchema: StandardJsonSchema = {
  type: 'object',
  title: '员工信息表',
  description: '标准 JSON Schema 格式的员工信息收集表单',

  /* $defs（2020-12 风格，fromJsonSchema 自动转为 definitions） */
  $defs: {
    address: {
      type: 'object',
      required: ['city', 'street'],
      properties: {
        city: { type: 'string', title: '城市', minLength: 2 },
        street: { type: 'string', title: '街道地址', minLength: 5 },
        zipCode: { type: 'string', title: '邮编', pattern: '^\\d{6}$' },
      },
    },
  },

  required: ['name', 'email', 'age', 'department'],

  properties: {
    /* 基础字符串 + 约束 */
    name: {
      type: 'string',
      title: '姓名',
      description: '请输入员工全名',
      minLength: 2,
      maxLength: 50,
    },

    /* format → 验证 + 组件推断 */
    email: {
      type: 'string',
      title: '邮箱',
      format: 'email',
      description: '工作邮箱地址',
    },

    /* integer → number + 约束 */
    age: {
      type: 'integer',
      title: '年龄',
      minimum: 18,
      maximum: 65,
      default: 25,
    },

    /* enum（标准值数组）→ Select */
    department: {
      type: 'string',
      title: '部门',
      enum: ['engineering', 'product', 'design', 'marketing', 'hr', 'finance'],
    },

    /* boolean */
    isRemote: {
      type: 'boolean',
      title: '远程办公',
      default: false,
    },

    /* readOnly（JSON Schema 标准关键字，由适配器转换为表单 preview） */
    employeeId: {
      type: 'string',
      title: '工号',
      readOnly: true,
      default: 'EMP-2026-0001',
    },

    /* 嵌套对象 + $ref */
    homeAddress: {
      $ref: '#/$defs/address',
      title: '家庭住址',
    },

    /* 数组 + items + 约束 */
    skills: {
      type: 'array',
      title: '技能列表',
      minItems: 1,
      maxItems: 5,
      items: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', title: '技能名称', minLength: 1 },
          level: {
            type: 'string',
            title: '熟练度',
            enum: ['beginner', 'intermediate', 'advanced', 'expert'],
            default: 'intermediate',
          },
        },
      },
    },
  },

  /* if/then/else → reactions 条件联动 */
  if: {
    properties: {
      isRemote: { const: true },
    },
  },
  then: {
    required: ['remoteLocation'],
    properties: {
      remoteLocation: {
        type: 'string',
        title: '远程办公地点',
        description: '请填写远程办公所在城市',
      },
    },
  },

  /* dependentRequired → reactions 条件必填 */
  dependentRequired: {
    email: ['name'],
  },
}

/**
 * 转换标准 JSON Schema 为表单 ISchema
 *
 * 叠加表单级 UI 配置（decoratorProps），这部分是标准 JSON Schema 无法表达的。
 */
const formSchema = fromJsonSchema(backendJsonSchema, {
  titleStrategy: 'schema',
  descriptionAsPlaceholder: true,
})

/* 叠加表单 UI 配置 */
formSchema.decoratorProps = {
  labelPosition: 'right',
  labelWidth: '120px',
  actions: { submit: '提交', reset: '重置' },
}

/* 为数组字段补充模板（标准 JSON Schema 无此概念） */
if (formSchema.properties?.skills) {
  formSchema.properties.skills.itemTemplate = { name: '', level: 'intermediate' }
}

const config: SceneConfig = {
  title: 'JSON Schema 适配器',
  description: '从标准 JSON Schema (Draft-07/2020-12) 自动转换为表单 — 支持 if/then/else、dependentRequired、$defs、allOf 等',

  initialValues: {
    name: '',
    email: '',
    age: 25,
    department: undefined,
    isRemote: false,
    employeeId: 'EMP-2026-0001',
    remoteLocation: '',
    homeAddress: {
      city: '',
      street: '',
      zipCode: '',
    },
    skills: [
      { name: '', level: 'intermediate' },
    ],
  },

  schema: formSchema,
}

export default config
