import { defineComponent, provide, inject, h } from 'vue';
import type { PropType, Component } from 'vue';
import type { FieldProps } from '@moluoxixi/core';
import { FormSymbol, FieldSymbol, ComponentRegistrySymbol } from '../context';

/**
 * 表单字段组件
 *
 * 自动从 Form 中获取/创建 Field，注入 FieldContext。
 * Vue 模板中直接使用 field 的响应式属性即可自动更新。
 */
export const FormField = defineComponent({
  name: 'FormField',
  props: {
    name: {
      type: String,
      required: true,
    },
    fieldProps: {
      type: Object as PropType<Partial<FieldProps>>,
      default: undefined,
    },
    component: {
      type: [String, Object, Function] as PropType<string | Component>,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    const form = inject(FormSymbol);
    const registry = inject(ComponentRegistrySymbol);

    if (!form) {
      throw new Error('[ConfigForm] <FormField> 必须在 <FormProvider> 内部使用');
    }

    /* 获取或创建字段 */
    let field = form.getField(props.name);
    if (!field) {
      field = form.createField({ name: props.name, ...props.fieldProps });
    }

    provide(FieldSymbol, field);

    return () => {
      if (!field!.visible) return null;

      /* 自定义插槽渲染 */
      if (slots.default) {
        return slots.default({ field });
      }

      /* 自动组件渲染 */
      const componentName = props.component ?? field!.component;
      let Component: Component | undefined;

      if (typeof componentName === 'string') {
        Component = registry?.components.get(componentName) as Component | undefined;
      } else {
        Component = componentName as Component;
      }

      if (!Component) {
        console.warn(`[ConfigForm] 字段 "${props.name}" 未找到组件 "${String(componentName)}"`);
        return null;
      }

      const wrapperName = field!.wrapper;
      let Wrapper: Component | undefined;
      if (typeof wrapperName === 'string' && wrapperName) {
        Wrapper = registry?.wrappers.get(wrapperName) as Component | undefined;
      }

      const fieldElement = h(Component as Component, {
        modelValue: field!.value,
        'onUpdate:modelValue': (val: unknown) => field!.setValue(val),
        onFocus: () => field!.focus(),
        onBlur: () => {
          field!.blur();
          field!.validate('blur').catch(() => {});
        },
        disabled: field!.disabled,
        readonly: field!.readOnly,
        loading: field!.loading,
        dataSource: field!.dataSource,
        ...field!.componentProps,
      });

      if (Wrapper) {
        return h(Wrapper as Component, {
          label: field!.label,
          required: field!.required,
          errors: field!.errors,
          warnings: field!.warnings,
          description: field!.description,
          ...field!.wrapperProps,
        }, () => fieldElement);
      }

      return fieldElement;
    };
  },
});
