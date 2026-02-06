import type { FieldInstance, FormInstance } from '@moluoxixi/core'
import type { ComponentType } from '@moluoxixi/shared'
import type { InjectionKey } from 'vue'

/** 表单注入 key */
export const FormSymbol: InjectionKey<FormInstance> = Symbol('ConfigForm')

/** 字段注入 key */
export const FieldSymbol: InjectionKey<FieldInstance> = Symbol('ConfigField')

/** 组件注册表注入 key */
export interface ComponentRegistry {
  components: Map<string, ComponentType>
  wrappers: Map<string, ComponentType>
}

export const ComponentRegistrySymbol: InjectionKey<ComponentRegistry> = Symbol('ConfigComponentRegistry')
