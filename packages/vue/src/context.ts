import type { InjectionKey, Ref } from 'vue';
import type { FormInstance, FieldInstance } from '@moluoxixi/core';
import type { ComponentType } from '@moluoxixi/shared';

/** 表单注入 key */
export const FormSymbol: InjectionKey<FormInstance> = Symbol('ConfigForm');

/** 字段注入 key */
export const FieldSymbol: InjectionKey<FieldInstance> = Symbol('ConfigField');

/** 组件注册表注入 key */
export interface ComponentRegistry {
  components: Map<string, ComponentType>;
  wrappers: Map<string, ComponentType>;
}

export const ComponentRegistrySymbol: InjectionKey<ComponentRegistry> = Symbol('ConfigComponentRegistry');
