import type { ComponentType, FieldInstance, FormInstance, ISchema } from '@moluoxixi/core'
import type { ComputedRef, InjectionKey } from 'vue'

/** 表单注入 key（使用 Symbol.for 确保跨包可共享） */
export const FormSymbol: InjectionKey<FormInstance> = Symbol.for('ConfigForm') as unknown as InjectionKey<FormInstance>

/** 字段注入 key */
export const FieldSymbol: InjectionKey<FieldInstance<any>> = Symbol('ConfigField')

/** 组件注册表注入 key */
export interface ComponentRegistry {
  components: Map<string, ComponentType>
  decorators: Map<string, ComponentType>
  defaultDecorators: Map<string, string>
  readPrettyComponents: Map<string, ComponentType>
}

/**
 * 组件注册表注入 key
 *
 * 提供 ComputedRef 而非普通对象，确保当 FormProvider 的
 * components/decorators props 变化时，注入方能获取到最新注册表。
 */
export const ComponentRegistrySymbol: InjectionKey<ComputedRef<ComponentRegistry>> = Symbol('ConfigComponentRegistry')

/**
 * Schema 注入 key
 *
 * SchemaField 在渲染每个节点时注入该节点的 ISchema。
 * 布局组件通过 useFieldSchema() 读取。
 */
export const SchemaSymbol: InjectionKey<ISchema> = Symbol('ConfigSchema')
