import { defineComponent, inject, h, computed } from 'vue';
import type { PropType } from 'vue';
import type { FormSchema, CompileOptions } from '@moluoxixi/schema';
import { compileSchema, toFieldProps, toArrayFieldProps } from '@moluoxixi/schema';
import { FormSymbol } from '../context';
import { FormField } from './FormField';
import { FormArrayField } from './FormArrayField';

/**
 * Schema 驱动的字段渲染器
 */
export const SchemaField = defineComponent({
  name: 'SchemaField',
  props: {
    schema: {
      type: Object as PropType<FormSchema>,
      required: true,
    },
    compileOptions: {
      type: Object as PropType<CompileOptions>,
      default: undefined,
    },
  },
  setup(props) {
    const form = inject(FormSymbol);
    if (!form) {
      throw new Error('[ConfigForm] <SchemaField> 必须在 <FormProvider> 内部使用');
    }

    const compiled = computed(() => compileSchema(props.schema, props.compileOptions));

    return () => {
      const topLevelFields = Array.from(compiled.value.fields.entries()).filter(
        ([path]) => !path.includes('.'),
      );

      return topLevelFields.map(([path, compiledField]) => {
        if (compiledField.isVoid) {
          return null;
        }

        if (compiledField.isArray) {
          const fieldProps = toArrayFieldProps(compiledField);
          return h(FormArrayField, {
            key: path,
            name: path,
            fieldProps,
          });
        }

        const fieldProps = toFieldProps(compiledField);
        return h(FormField, {
          key: path,
          name: path,
          fieldProps,
        });
      });
    };
  },
});
