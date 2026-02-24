"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ArrayBase: () => ArrayBase,
  ArrayField: () => ArrayField,
  ArrayItems: () => ArrayItems,
  ArrayTable: () => ArrayTable,
  ComponentRegistrySymbol: () => ComponentRegistrySymbol,
  ConfigForm: () => ConfigForm,
  DiffViewer: () => DiffViewer,
  FieldSymbol: () => FieldSymbol,
  FormArrayField: () => FormArrayField,
  FormField: () => FormField,
  FormLayout: () => FormLayout,
  FormLayoutSymbol: () => FormLayoutSymbol,
  FormObjectField: () => FormObjectField,
  FormProvider: () => FormProvider,
  FormSymbol: () => FormSymbol,
  FormVoidField: () => FormVoidField,
  ReactiveField: () => ReactiveField,
  RecursionField: () => RecursionField,
  SchemaField: () => SchemaField,
  SchemaSymbol: () => SchemaSymbol,
  createComponentScope: () => createComponentScope,
  createRegistry: () => createRegistry,
  createRegistryState: () => createRegistryState,
  getAction: () => getAction,
  getComponent: () => getComponent,
  getDecorator: () => getDecorator,
  getDefaultDecorator: () => getDefaultDecorator,
  getReadPrettyComponent: () => getReadPrettyComponent,
  registerAction: () => registerAction,
  registerActions: () => registerActions,
  registerComponent: () => registerComponent,
  registerComponents: () => registerComponents,
  registerDecorator: () => registerDecorator,
  registerFieldComponents: () => registerFieldComponents,
  resetRegistry: () => resetRegistry,
  subscribeRegistryChange: () => subscribeRegistryChange,
  useArray: () => useArray,
  useCreateForm: () => useCreateForm,
  useField: () => useField,
  useFieldByPath: () => useFieldByPath,
  useFieldSchema: () => useFieldSchema,
  useForm: () => useForm,
  useFormLayout: () => useFormLayout,
  useFormSubmitting: () => useFormSubmitting,
  useFormValid: () => useFormValid,
  useFormValues: () => useFormValues,
  useIndex: () => useIndex,
  useSchemaItems: () => useSchemaItems
});
module.exports = __toCommonJS(index_exports);

// src/components/ArrayBase.ts
var import_vue6 = require("vue");

// src/composables/useField.ts
var import_vue = require("vue");

// src/context.ts
var FormSymbol = /* @__PURE__ */ Symbol.for("ConfigForm");
var FieldSymbol = /* @__PURE__ */ Symbol("ConfigField");
var ComponentRegistrySymbol = /* @__PURE__ */ Symbol("ConfigComponentRegistry");
var SchemaSymbol = /* @__PURE__ */ Symbol("ConfigSchema");

// src/composables/useField.ts
function useField() {
  const field = (0, import_vue.inject)(FieldSymbol);
  if (!field) {
    throw new Error("[ConfigForm] useField \u5FC5\u987B\u5728 <FormField> \u5185\u90E8\u4F7F\u7528");
  }
  return field;
}
function useFieldByPath(path) {
  const form = (0, import_vue.inject)(FormSymbol);
  if (!form) {
    throw new Error("[ConfigForm] useFieldByPath \u5FC5\u987B\u5728 <FormProvider> \u5185\u90E8\u4F7F\u7528");
  }
  return form.getField(path);
}

// src/composables/useFieldSchema.ts
var import_vue2 = require("vue");
function useFieldSchema() {
  const schema = (0, import_vue2.inject)(SchemaSymbol);
  if (!schema) {
    throw new Error("[ConfigForm] useFieldSchema \u5FC5\u987B\u5728 SchemaField \u6E32\u67D3\u7684\u7EC4\u4EF6\u5185\u4F7F\u7528");
  }
  return schema;
}

// src/composables/useForm.ts
var import_core = require("@moluoxixi/core");
var import_vue3 = require("vue");
function useForm() {
  const form = (0, import_vue3.inject)(FormSymbol);
  if (!form) {
    throw new Error("[ConfigForm] useForm \u5FC5\u987B\u5728 <FormProvider> \u5185\u90E8\u4F7F\u7528");
  }
  return form;
}
function useCreateForm(config = {}) {
  const form = (0, import_core.createForm)(config);
  (0, import_vue3.onUnmounted)(() => {
    form.dispose();
  });
  return form;
}

// src/composables/useFormValues.ts
var import_vue4 = require("vue");
function useFormValues() {
  const form = (0, import_vue4.inject)(FormSymbol);
  if (!form) {
    throw new Error("[ConfigForm] useFormValues \u5FC5\u987B\u5728 <FormProvider> \u5185\u90E8\u4F7F\u7528");
  }
  return form.values;
}
function useFormValid() {
  const form = (0, import_vue4.inject)(FormSymbol);
  if (!form) {
    throw new Error("[ConfigForm] useFormValid \u5FC5\u987B\u5728 <FormProvider> \u5185\u90E8\u4F7F\u7528");
  }
  return (0, import_vue4.computed)(() => form.valid);
}
function useFormSubmitting() {
  const form = (0, import_vue4.inject)(FormSymbol);
  if (!form) {
    throw new Error("[ConfigForm] useFormSubmitting \u5FC5\u987B\u5728 <FormProvider> \u5185\u90E8\u4F7F\u7528");
  }
  return (0, import_vue4.computed)(() => form.submitting);
}

// src/composables/useSchemaItems.ts
var import_vue5 = require("vue");
function useSchemaItems() {
  const field = useField();
  const schema = useFieldSchema();
  const items = (0, import_vue5.computed)(() => {
    const result = [];
    if (!schema.properties)
      return result;
    for (const [name, childSchema] of Object.entries(schema.properties)) {
      const childField = field.form.getAllVoidFields().get(`${field.path}.${name}`);
      if (childField && !childField.visible)
        continue;
      result.push({
        name,
        title: childSchema.componentProps?.title ?? name,
        schema: childSchema
      });
    }
    return result;
  });
  return items.value;
}

// src/components/ArrayBase.ts
var ArrayBaseSymbol = /* @__PURE__ */ Symbol("ArrayBaseContext");
var ArrayBaseItemSymbol = /* @__PURE__ */ Symbol("ArrayBaseItemContext");
function useArray() {
  return (0, import_vue6.inject)(ArrayBaseSymbol, null);
}
function useIndex(defaultIndex) {
  const ctx = (0, import_vue6.inject)(ArrayBaseItemSymbol, null);
  return ctx?.index ?? (0, import_vue6.ref)(defaultIndex ?? 0);
}
var ArrayBaseInner = (0, import_vue6.defineComponent)({
  name: "ArrayBase",
  setup(_, { slots }) {
    let field;
    try {
      field = useField();
    } catch {
      return () => slots.default?.();
    }
    (0, import_vue6.provide)(ArrayBaseSymbol, {
      field: (0, import_vue6.ref)(field)
    });
    return () => slots.default?.();
  }
});
var ArrayBaseItem = (0, import_vue6.defineComponent)({
  name: "ArrayBaseItem",
  props: {
    index: { type: Number, required: true }
  },
  setup(props, { slots }) {
    const { index } = (0, import_vue6.toRefs)(props);
    (0, import_vue6.provide)(ArrayBaseItemSymbol, { index });
    return () => slots.default?.();
  }
});
var ArrayBaseIndex = (0, import_vue6.defineComponent)({
  name: "ArrayBaseIndex",
  setup() {
    const index = useIndex();
    return () => (0, import_vue6.h)("span", {
      style: { color: "#999", minWidth: "30px", flexShrink: 0 }
    }, `#${index.value + 1}`);
  }
});
function useEditable() {
  const ctx = useArray();
  return {
    isEditable: () => {
      if (!ctx)
        return false;
      return ctx.field.value.editable;
    },
    getField: () => ctx?.field.value ?? null
  };
}
var ArrayBaseAddition = (0, import_vue6.defineComponent)({
  name: "ArrayBaseAddition",
  props: {
    title: { type: String, default: "+ \u6DFB\u52A0\u6761\u76EE" },
    method: { type: String, default: "push" }
  },
  setup(props) {
    const { isEditable, getField } = useEditable();
    return () => {
      if (!isEditable())
        return null;
      const field = getField();
      if (!field)
        return null;
      return (0, import_vue6.h)("button", {
        type: "button",
        disabled: !field.canAdd,
        style: {
          width: "100%",
          padding: "8px 0",
          background: field.canAdd ? "#fff" : "#f5f5f5",
          color: field.canAdd ? "#1677ff" : "#999",
          border: `1px dashed ${field.canAdd ? "#1677ff" : "#d9d9d9"}`,
          borderRadius: "4px",
          cursor: field.canAdd ? "pointer" : "not-allowed",
          fontSize: "14px",
          lineHeight: "22px",
          transition: "all 0.2s"
        },
        onMouseenter: (e) => {
          if (field.canAdd) {
            e.currentTarget.style.background = "#e6f4ff";
          }
        },
        onMouseleave: (e) => {
          e.currentTarget.style.background = field.canAdd ? "#fff" : "#f5f5f5";
        },
        onClick: () => {
          if (props.method === "unshift") {
            field.insert(0);
          } else {
            field.push();
          }
        }
      }, props.title);
    };
  }
});
var ArrayBaseRemove = (0, import_vue6.defineComponent)({
  name: "ArrayBaseRemove",
  props: {
    title: { type: String, default: "\u5220\u9664" }
  },
  setup(props) {
    const { isEditable, getField } = useEditable();
    const index = useIndex();
    return () => {
      if (!isEditable())
        return null;
      const field = getField();
      if (!field)
        return null;
      return (0, import_vue6.h)("button", {
        type: "button",
        disabled: !field.canRemove,
        style: opBtnStyle(!field.canRemove, "#f56c6c"),
        onClick: (e) => {
          e.stopPropagation();
          field.remove(index.value);
        }
      }, props.title);
    };
  }
});
var ArrayBaseMoveUp = (0, import_vue6.defineComponent)({
  name: "ArrayBaseMoveUp",
  props: {
    title: { type: String, default: "\u2191" }
  },
  setup(props) {
    const { isEditable, getField } = useEditable();
    const index = useIndex();
    return () => {
      if (!isEditable())
        return null;
      const field = getField();
      if (!field)
        return null;
      const disabled = index.value === 0;
      return (0, import_vue6.h)("button", {
        type: "button",
        disabled,
        style: opBtnStyle(disabled),
        onClick: (e) => {
          e.stopPropagation();
          field.moveUp(index.value);
        }
      }, props.title);
    };
  }
});
var ArrayBaseMoveDown = (0, import_vue6.defineComponent)({
  name: "ArrayBaseMoveDown",
  props: {
    title: { type: String, default: "\u2193" }
  },
  setup(props) {
    const { isEditable, getField } = useEditable();
    const index = useIndex();
    return () => {
      if (!isEditable())
        return null;
      const field = getField();
      if (!field)
        return null;
      const arr = Array.isArray(field.value) ? field.value : [];
      const disabled = index.value >= arr.length - 1;
      return (0, import_vue6.h)("button", {
        type: "button",
        disabled,
        style: opBtnStyle(disabled),
        onClick: (e) => {
          e.stopPropagation();
          field.moveDown(index.value);
        }
      }, props.title);
    };
  }
});
function opBtnStyle(disabled, activeColor = "#606266") {
  return {
    padding: "4px 8px",
    background: disabled ? "#f5f5f5" : "#fff",
    color: disabled ? "#ccc" : activeColor,
    border: `1px solid ${disabled ? "#dcdfe6" : activeColor === "#606266" ? "#dcdfe6" : activeColor}`,
    borderRadius: "4px",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "12px",
    lineHeight: "1"
  };
}
var ArrayBase = ArrayBaseInner;
ArrayBase.Item = ArrayBaseItem;
ArrayBase.Index = ArrayBaseIndex;
ArrayBase.Addition = ArrayBaseAddition;
ArrayBase.Remove = ArrayBaseRemove;
ArrayBase.MoveUp = ArrayBaseMoveUp;
ArrayBase.MoveDown = ArrayBaseMoveDown;
ArrayBase.useArray = useArray;
ArrayBase.useIndex = useIndex;

// src/components/ArrayField.ts
var import_vue13 = require("vue");

// src/components/RecursionField.ts
var import_core3 = require("@moluoxixi/core");
var import_vue12 = require("vue");

// src/components/FormArrayField.ts
var import_vue8 = require("vue");

// src/components/ReactiveField.ts
var import_core2 = require("@moluoxixi/core");
var import_vue7 = require("vue");
var ReactiveField = (0, import_vue7.defineComponent)({
  name: "ReactiveField",
  props: {
    /** 字段实例（Field / VoidField / ArrayField） */
    field: {
      type: Object,
      required: true
    },
    /** 是否是 void 字段（不绑定数据） */
    isVoid: {
      type: Boolean,
      default: false
    },
    /** 是否是数组字段 */
    isArray: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { slots }) {
    const form = (0, import_vue7.inject)(FormSymbol);
    const registryRef = (0, import_vue7.inject)(ComponentRegistrySymbol);
    function resolveComp(name) {
      if (typeof name === "string") {
        return registryRef?.value.components.get(name) ?? null;
      }
      return name ?? null;
    }
    function resolveDecorator(name) {
      if (typeof name === "string") {
        return registryRef?.value.decorators.get(name) ?? null;
      }
      return name ?? null;
    }
    return () => {
      const field = props.field;
      if (!field)
        return null;
      if (!field.visible)
        return null;
      try {
        const contract = !props.isVoid ? (0, import_core2.createFieldRenderContract)(field) : null;
        const isDisabled = !props.isVoid && !!contract?.disabled;
        const isPreview = !props.isVoid && !!contract?.preview;
        if (slots.default) {
          return slots.default({ field, isPreview, isDisabled });
        }
        const componentName = field.component;
        let Comp = resolveComp(componentName);
        let fallbackComponentName = null;
        if (!Comp && !props.isVoid && !props.isArray) {
          const fallback = resolveComp("Input");
          if (fallback) {
            console.warn(`[ConfigForm] \u5B57\u6BB5 "${field.path}" \u672A\u627E\u5230\u7EC4\u4EF6 "${String(componentName)}"\uFF0C\u5DF2\u964D\u7EA7\u4E3A Input`);
            Comp = fallback;
            fallbackComponentName = "Input";
          } else {
            console.warn(`[ConfigForm] \u5B57\u6BB5 "${field.path}" \u672A\u627E\u5230\u7EC4\u4EF6 "${String(componentName)}"`);
            return (0, import_vue7.h)("div", {
              style: "color: #ff4d4f; padding: 8px 12px; border: 1px dashed #ff4d4f; border-radius: 4px; font-size: 12px; background: #fff2f0;"
            }, `\u26A0 \u7EC4\u4EF6 "${String(componentName)}" \u672A\u6CE8\u518C`);
          }
        }
        let componentNode = null;
        if (props.isVoid) {
          if (Comp) {
            componentNode = (0, import_vue7.h)(Comp, { ...field.componentProps }, () => slots.children?.());
          } else {
            componentNode = slots.children?.() ?? null;
          }
        } else if (props.isArray) {
          const arrayField = field;
          if (Comp) {
            componentNode = (0, import_vue7.h)(Comp, {
              ...arrayField.componentProps
            });
          } else {
            componentNode = slots.children?.() ?? null;
          }
        } else {
          const dataField = field;
          const dataContract = contract;
          if (dataContract.preview) {
            const rawName = typeof componentName === "string" ? componentName : "";
            const compName = fallbackComponentName ?? rawName;
            const ReadPrettyComp = compName ? registryRef?.value.readPrettyComponents.get(compName) : void 0;
            if (ReadPrettyComp) {
              const displayValue = dataField.displayFormat ? dataField.displayFormat(dataContract.value) : dataContract.value;
              const formatter = dataField.componentProps?.formatter;
              let previewValue = displayValue;
              if (typeof previewValue === "number" && Number.isFinite(previewValue)) {
                previewValue = previewValue.toFixed(2);
              }
              if (typeof formatter === "function") {
                previewValue = formatter(previewValue);
              }
              componentNode = (0, import_vue7.h)(ReadPrettyComp, {
                ...dataContract.componentProps,
                ...dataContract.ariaProps,
                modelValue: previewValue,
                dataSource: dataContract.dataSource
              });
            }
          }
          if (!componentNode) {
            const interactions = (0, import_core2.createFieldInteractionContract)(dataField);
            const displayValue = dataField.displayFormat && dataField.inputParse ? dataField.displayFormat(dataContract.value) : dataContract.value;
            componentNode = (0, import_vue7.h)(Comp, {
              ...dataContract.componentProps,
              ...dataContract.ariaProps,
              "modelValue": displayValue,
              "onUpdate:modelValue": interactions.onInput,
              "onFocus": interactions.onFocus,
              "onBlur": interactions.onBlur,
              "disabled": dataContract.disabled || dataContract.preview,
              "loading": dataContract.loading,
              "dataSource": dataContract.dataSource
            });
          }
        }
        const decoratorName = !props.isVoid ? field.decorator : void 0;
        const Decorator = decoratorName ? resolveDecorator(decoratorName) : void 0;
        if (Decorator && !props.isVoid) {
          const dataField = field;
          const decoratorContract = (0, import_core2.createDecoratorRenderContract)(dataField, form);
          return (0, import_vue7.h)(Decorator, {
            fieldPath: decoratorContract.fieldPath,
            hasErrors: decoratorContract.hasErrors,
            label: decoratorContract.label,
            required: decoratorContract.required,
            errors: decoratorContract.errors,
            warnings: decoratorContract.warnings,
            description: decoratorContract.description,
            labelPosition: decoratorContract.labelPosition,
            labelWidth: decoratorContract.labelWidth,
            pattern: decoratorContract.pattern,
            ...decoratorContract.decoratorProps
          }, () => componentNode);
        }
        return componentNode;
      } catch (err) {
        console.error(`[ConfigForm] \u5B57\u6BB5 "${field.path}" \u6E32\u67D3\u5F02\u5E38:`, err);
        return (0, import_vue7.h)("div", {
          style: "color: #ff4d4f; padding: 8px 12px; border: 1px dashed #ff4d4f; border-radius: 4px; font-size: 12px; background: #fff2f0;"
        }, `\u26A0 \u5B57\u6BB5 "${field.path}" \u6E32\u67D3\u5F02\u5E38: ${err instanceof Error ? err.message : String(err)}`);
      }
    };
  }
});

// src/components/FormArrayField.ts
var FormArrayField = (0, import_vue8.defineComponent)({
  name: "FormArrayField",
  props: {
    name: {
      type: String,
      required: true
    },
    fieldProps: {
      type: Object,
      default: void 0
    }
  },
  setup(props, { slots }) {
    const form = (0, import_vue8.inject)(FormSymbol);
    if (!form) {
      throw new Error("[ConfigForm] <FormArrayField> \u5FC5\u987B\u5728 <FormProvider> \u5185\u90E8\u4F7F\u7528");
    }
    let field = form.getArrayField(props.name);
    let createdByThis = false;
    if (!field) {
      field = form.createArrayField({ name: props.name, ...props.fieldProps });
      createdByThis = true;
    }
    (0, import_vue8.provide)(FieldSymbol, field);
    (0, import_vue8.onMounted)(() => {
      field.mount();
    });
    (0, import_vue8.onBeforeUnmount)(() => {
      field.unmount();
      if (createdByThis) {
        form.removeField(props.name);
      }
    });
    return () => {
      const hasSlot = !!slots.default;
      return (0, import_vue8.h)(ReactiveField, {
        field,
        isVoid: false,
        isArray: true
      }, {
        /* 自定义渲染：将 field 暴露给用户插槽 */
        ...hasSlot ? {
          default: (renderProps) => slots.default({
            field,
            arrayField: field,
            ...renderProps
          })
        } : {}
      });
    };
  }
});

// src/components/FormField.ts
var import_vue9 = require("vue");
var FormField = (0, import_vue9.defineComponent)({
  name: "FormField",
  props: {
    name: {
      type: String,
      required: true
    },
    fieldProps: {
      type: Object,
      default: void 0
    },
    component: {
      type: [String, Object, Function],
      default: void 0
    }
  },
  setup(props, { slots }) {
    const form = (0, import_vue9.inject)(FormSymbol);
    const registryRef = (0, import_vue9.inject)(ComponentRegistrySymbol);
    if (!form) {
      throw new Error("[ConfigForm] <FormField> \u5FC5\u987B\u5728 <FormProvider> \u5185\u90E8\u4F7F\u7528");
    }
    function resolveField(name) {
      const existing = form.getField(name);
      if (existing) {
        return { field: existing, created: false };
      }
      const mergedProps = { ...props.fieldProps, name };
      if (mergedProps.decorator === void 0 && typeof mergedProps.component === "string") {
        const defaultDecorator = registryRef?.value.defaultDecorators.get(mergedProps.component);
        if (defaultDecorator) {
          mergedProps.decorator = defaultDecorator;
        }
      }
      return { field: form.createField(mergedProps), created: true };
    }
    const { field: initialField, created: initialCreated } = resolveField(props.name);
    const fieldRef = (0, import_vue9.ref)(initialField);
    let createdByThis = initialCreated;
    let currentName = props.name;
    (0, import_vue9.provide)(FieldSymbol, fieldRef.value);
    (0, import_vue9.watch)(() => props.name, (newName, oldName) => {
      if (newName === oldName)
        return;
      if (createdByThis) {
        form.removeField(currentName);
      }
      const { field, created } = resolveField(newName);
      fieldRef.value = field;
      createdByThis = created;
      currentName = newName;
    });
    (0, import_vue9.watch)(
      () => props.fieldProps,
      (next) => {
        if (!next)
          return;
        const field = fieldRef.value;
        if (next.label !== void 0)
          field.label = next.label ?? "";
        if (next.description !== void 0)
          field.description = next.description ?? "";
        if (next.componentProps)
          field.setComponentProps(next.componentProps);
        if (next.decoratorProps)
          field.decoratorProps = next.decoratorProps;
        if (next.rules && next.rules.some((rule) => rule?.message)) {
          field.rules = [...next.rules];
        }
      },
      { deep: true }
    );
    (0, import_vue9.onMounted)(() => {
      fieldRef.value.mount();
    });
    (0, import_vue9.onBeforeUnmount)(() => {
      fieldRef.value.unmount();
      if (createdByThis) {
        form.removeField(currentName);
      }
    });
    return () => {
      return (0, import_vue9.h)(ReactiveField, {
        field: fieldRef.value,
        isVoid: false
      }, slots);
    };
  }
});

// src/components/FormObjectField.ts
var import_vue10 = require("vue");
var FormObjectField = (0, import_vue10.defineComponent)({
  name: "FormObjectField",
  props: {
    name: {
      type: String,
      required: true
    },
    fieldProps: {
      type: Object,
      default: void 0
    }
  },
  setup(props, { slots }) {
    const form = (0, import_vue10.inject)(FormSymbol);
    if (!form) {
      throw new Error("[ConfigForm] <FormObjectField> \u5FC5\u987B\u5728 <FormProvider> \u5185\u90E8\u4F7F\u7528");
    }
    let field = form.getObjectField(props.name);
    let createdByThis = false;
    if (!field) {
      const mergedProps = { ...props.fieldProps ?? {}, name: props.name };
      if (mergedProps.initialValue === void 0) {
        mergedProps.initialValue = {};
      }
      field = form.createObjectField(mergedProps);
      createdByThis = true;
    }
    (0, import_vue10.provide)(FieldSymbol, field);
    (0, import_vue10.onMounted)(() => {
      field.mount();
    });
    (0, import_vue10.onBeforeUnmount)(() => {
      field.unmount();
      if (createdByThis) {
        form.removeField(props.name);
      }
    });
    return () => {
      return (0, import_vue10.h)(ReactiveField, {
        field,
        isVoid: false
      }, {
        /* 对象字段的 children 是其 properties 子字段 */
        children: () => slots.default?.(),
        default: slots.default
      });
    };
  }
});

// src/components/FormVoidField.ts
var import_vue11 = require("vue");
var FormVoidField = (0, import_vue11.defineComponent)({
  name: "FormVoidField",
  props: {
    name: {
      type: String,
      required: true
    },
    fieldProps: {
      type: Object,
      default: void 0
    }
  },
  setup(props, { slots }) {
    const form = (0, import_vue11.inject)(FormSymbol);
    if (!form) {
      throw new Error("[ConfigForm] <FormVoidField> \u5FC5\u987B\u5728 <FormProvider> \u5185\u90E8\u4F7F\u7528");
    }
    let field = form.getAllVoidFields().get(props.name) ?? void 0;
    let createdByThis = false;
    if (!field) {
      field = form.createVoidField({
        name: props.name,
        ...props.fieldProps
      });
      createdByThis = true;
    }
    (0, import_vue11.provide)(FieldSymbol, field);
    (0, import_vue11.onMounted)(() => {
      field.mount();
    });
    (0, import_vue11.onBeforeUnmount)(() => {
      field.unmount();
      if (createdByThis) {
        form.removeField(props.name);
      }
    });
    return () => {
      return (0, import_vue11.h)(ReactiveField, {
        field,
        isVoid: true
      }, {
        /* children 插槽：传递给 ReactiveField 作为容器组件的子内容 */
        children: () => slots.default?.()
      });
    };
  }
});

// src/components/RecursionField.ts
function normalizeDataSource(schema) {
  if (schema.dataSource)
    return schema.dataSource;
  if (!schema.enum || schema.enum.length === 0)
    return void 0;
  return schema.enum.map((item) => {
    if (item && typeof item === "object")
      return item;
    return {
      label: String(item),
      value: item
    };
  });
}
var RecursionField = (0, import_vue12.defineComponent)({
  name: "RecursionField",
  props: {
    /** 要渲染的 schema 节点 */
    schema: {
      type: Object,
      required: true
    },
    /** 字段名或索引 */
    name: {
      type: [String, Number],
      default: void 0
    },
    /** 基础数据路径（拼接 name 后作为字段的完整路径） */
    basePath: {
      type: String,
      default: ""
    },
    /** 仅渲染 properties，不创建当前节点的字段 */
    onlyRenderProperties: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    function renderDataField(schema, dataPath) {
      const resolvedComp = (0, import_core3.resolveComponent)(schema, import_core3.DEFAULT_COMPONENT_MAPPING);
      const dataSource = normalizeDataSource(schema);
      return (0, import_vue12.h)(FormField, {
        key: dataPath,
        name: dataPath,
        fieldProps: {
          label: schema.title,
          description: schema.description,
          required: schema.required === true,
          component: resolvedComp,
          componentProps: schema.componentProps,
          decorator: schema.decorator,
          decoratorProps: schema.decoratorProps,
          rules: schema.rules,
          visible: schema.visible,
          disabled: schema.disabled,
          preview: schema.preview,
          pattern: schema.pattern,
          reactions: schema.reactions,
          dataSource,
          displayFormat: schema.displayFormat,
          inputParse: schema.inputParse,
          submitTransform: schema.submitTransform,
          submitPath: schema.submitPath,
          excludeWhenHidden: schema.excludeWhenHidden
        }
      });
    }
    function fullPath(suffix) {
      const parts = [];
      if (props.basePath)
        parts.push(props.basePath);
      if (props.name !== void 0)
        parts.push(String(props.name));
      if (suffix)
        parts.push(suffix);
      return parts.join(".");
    }
    function renderProperties(schema, parentPath) {
      if (!schema.properties)
        return [];
      const entries = Object.entries(schema.properties);
      entries.sort(([, a], [, b]) => (a.order ?? 0) - (b.order ?? 0));
      return entries.map(([key, childSchema]) => renderSchema(key, childSchema, parentPath));
    }
    const SchemaProviderLocal = (0, import_vue12.defineComponent)({
      name: "SchemaProviderLocal",
      props: { schema: { type: Object, required: true } },
      setup(localProps, { slots }) {
        (0, import_vue12.provide)(SchemaSymbol, localProps.schema);
        return () => slots.default?.();
      }
    });
    function renderSchema(name, schema, parentPath) {
      const dataPath = schema.type === "void" ? parentPath : parentPath ? `${parentPath}.${name}` : name;
      const address = parentPath ? `${parentPath}.${name}` : name;
      if (schema.type === "void") {
        return (0, import_vue12.h)(SchemaProviderLocal, { key: address, schema }, {
          default: () => (0, import_vue12.h)(FormVoidField, {
            name: address,
            fieldProps: {
              label: schema.title,
              component: schema.component,
              componentProps: schema.componentProps,
              visible: schema.visible,
              disabled: schema.disabled,
              preview: schema.preview,
              pattern: schema.pattern,
              reactions: schema.reactions
            }
          }, {
            default: () => renderProperties(schema, dataPath)
          })
        });
      }
      if (schema.type === "array") {
        if (!(0, import_core3.isStructuralArrayComponent)(schema.component)) {
          return renderDataField(schema, dataPath);
        }
        return (0, import_vue12.h)(FormArrayField, {
          key: dataPath,
          name: dataPath,
          fieldProps: {
            label: schema.title,
            decorator: schema.decorator,
            decoratorProps: schema.decoratorProps,
            minItems: schema.minItems,
            maxItems: schema.maxItems,
            itemTemplate: schema.itemTemplate,
            component: schema.component || "ArrayField",
            componentProps: {
              ...schema.componentProps,
              itemsSchema: schema.items
            }
          }
        });
      }
      if (schema.type === "object" && schema.properties) {
        return (0, import_vue12.h)(FormObjectField, {
          key: dataPath,
          name: dataPath,
          fieldProps: {
            label: schema.title,
            component: schema.component,
            componentProps: schema.componentProps,
            decorator: schema.decorator,
            decoratorProps: schema.decoratorProps
          }
        }, {
          default: () => renderProperties(schema, dataPath)
        });
      }
      return renderDataField(schema, dataPath);
    }
    return () => {
      const schema = props.schema;
      if (!schema)
        return null;
      if (props.onlyRenderProperties) {
        const path2 = fullPath();
        return renderProperties(schema, path2);
      }
      if (props.name === void 0) {
        return renderProperties(schema, props.basePath);
      }
      const path = fullPath();
      if (schema.type === "object") {
        if (schema.properties) {
          return (0, import_vue12.h)(FormObjectField, {
            key: path,
            name: path,
            fieldProps: {
              label: schema.title,
              component: schema.component,
              componentProps: schema.componentProps,
              decorator: schema.decorator,
              decoratorProps: schema.decoratorProps
            }
          }, {
            default: () => renderProperties(schema, path)
          });
        }
        return (0, import_vue12.h)(FormField, { key: path, name: path, fieldProps: { label: schema.title } });
      }
      if (schema.type === "array") {
        if (!(0, import_core3.isStructuralArrayComponent)(schema.component)) {
          return renderDataField(schema, path);
        }
        return (0, import_vue12.h)(FormArrayField, {
          key: path,
          name: path,
          fieldProps: {
            label: schema.title,
            decorator: schema.decorator,
            decoratorProps: schema.decoratorProps,
            minItems: schema.minItems,
            maxItems: schema.maxItems,
            itemTemplate: schema.itemTemplate,
            component: schema.component || "ArrayField",
            componentProps: {
              ...schema.componentProps,
              itemsSchema: schema.items
            }
          }
        });
      }
      return renderSchema(String(props.name), schema, props.basePath);
    };
  }
});

// src/components/ArrayField.ts
var ArrayField = (0, import_vue13.defineComponent)({
  name: "ArrayField",
  props: {
    itemsSchema: {
      type: Object,
      default: void 0
    }
  },
  setup(props) {
    let field;
    try {
      field = useField();
    } catch {
      return () => null;
    }
    return () => {
      const arrayValue = Array.isArray(field.value) ? field.value : [];
      const isEditable = field.editable;
      const maxItems = field.maxItems === Infinity ? "\u221E" : field.maxItems;
      const items = arrayValue.map((_, index) => {
        return (0, import_vue13.h)(ArrayBase.Item, { key: index, index }, {
          default: () => (0, import_vue13.h)("div", {
            style: {
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
              marginBottom: "8px",
              padding: "12px",
              background: index % 2 === 0 ? "#fafafa" : "#fff",
              borderRadius: "4px",
              border: "1px solid #ebeef5"
            }
          }, [
            (0, import_vue13.h)(ArrayBase.Index),
            (0, import_vue13.h)("div", { style: { flex: 1, display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "flex-start" } }, props.itemsSchema ? [(0, import_vue13.h)(RecursionField, { schema: props.itemsSchema, name: index, basePath: field.path })] : [(0, import_vue13.h)("span", { style: { color: "#999" } }, `Item ${index}`)]),
            (0, import_vue13.h)("div", {
              style: {
                display: "flex",
                gap: "4px",
                flexShrink: "0",
                visibility: isEditable ? "visible" : "hidden"
              }
            }, [
              (0, import_vue13.h)(ArrayBase.MoveUp),
              (0, import_vue13.h)(ArrayBase.MoveDown),
              (0, import_vue13.h)(ArrayBase.Remove)
            ])
          ])
        });
      });
      return (0, import_vue13.h)(ArrayBase, null, {
        default: () => (0, import_vue13.h)("div", { style: { width: "100%" } }, [
          (0, import_vue13.h)("div", {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px"
            }
          }, [
            (0, import_vue13.h)("span", { style: { fontWeight: 600, color: "#303133" } }, field.label || field.path),
            (0, import_vue13.h)("span", { style: { color: "#909399", fontSize: "13px" } }, `${arrayValue.length} / ${maxItems}`)
          ]),
          ...items,
          isEditable && (0, import_vue13.h)(ArrayBase.Addition)
        ])
      });
    };
  }
});
var ArrayItems = ArrayField;

// src/components/ArrayTable.ts
var import_vue14 = require("vue");
function extractColumns(itemsSchema) {
  if (!itemsSchema?.properties)
    return [];
  const entries = Object.entries(itemsSchema.properties);
  entries.sort(([, a], [, b]) => (a.order ?? 0) - (b.order ?? 0));
  return entries.map(([key, schema]) => ({
    key,
    title: schema.title ?? key,
    schema
  }));
}
var ArrayTable = (0, import_vue14.defineComponent)({
  name: "ArrayTable",
  props: {
    itemsSchema: {
      type: Object,
      default: void 0
    }
  },
  setup(props) {
    let field;
    try {
      field = useField();
    } catch {
      return () => null;
    }
    return () => {
      const arrayValue = Array.isArray(field.value) ? field.value : [];
      const columns = extractColumns(props.itemsSchema);
      const isEditable = field.editable;
      const isPreview = field.isPreview;
      const maxItems = field.maxItems === Infinity ? "\u221E" : field.maxItems;
      const thStyle = {
        padding: "8px 12px",
        textAlign: "left",
        fontWeight: 600,
        color: "#606266",
        background: "#fafafa",
        borderBottom: "2px solid #ebeef5",
        whiteSpace: "nowrap"
      };
      const tdStyle = {
        padding: "6px 8px",
        borderBottom: "1px solid #ebeef5",
        verticalAlign: "top"
      };
      const headerCells = [
        (0, import_vue14.h)("th", { style: { ...thStyle, width: "50px", textAlign: "center" } }, "#"),
        ...columns.map(
          (col) => (0, import_vue14.h)("th", { key: col.key, style: thStyle }, [
            col.schema.required ? (0, import_vue14.h)("span", { style: { color: "#ff4d4f", marginRight: "4px" } }, "*") : null,
            col.title
          ])
        )
      ];
      if (isEditable) {
        headerCells.push((0, import_vue14.h)("th", { style: { ...thStyle, width: "120px", textAlign: "center" } }, "\u64CD\u4F5C"));
      }
      const rows = arrayValue.map(
        (_, index) => (0, import_vue14.h)(ArrayBase.Item, { key: index, index }, {
          default: () => (0, import_vue14.h)("tr", { style: { background: index % 2 === 0 ? "#fff" : "#fafafa" } }, [
            (0, import_vue14.h)("td", { style: { ...tdStyle, textAlign: "center", color: "#999" } }, `${index + 1}`),
            ...columns.map(
              (col) => (0, import_vue14.h)("td", { key: col.key, style: tdStyle }, isPreview ? [(0, import_vue14.h)("span", { style: { color: "#303133" } }, `${arrayValue[index]?.[col.key] ?? "\u2014"}`)] : [(0, import_vue14.h)(RecursionField, {
                schema: {
                  type: "object",
                  properties: {
                    [col.key]: {
                      ...col.schema,
                      title: void 0,
                      decorator: ""
                    }
                  }
                },
                name: index,
                basePath: field.path,
                onlyRenderProperties: true
              })])
            ),
            isEditable ? (0, import_vue14.h)("td", { style: { ...tdStyle, textAlign: "center" } }, (0, import_vue14.h)("div", { style: { display: "flex", gap: "4px", justifyContent: "center" } }, [
              (0, import_vue14.h)(ArrayBase.MoveUp),
              (0, import_vue14.h)(ArrayBase.MoveDown),
              (0, import_vue14.h)(ArrayBase.Remove)
            ])) : null
          ])
        })
      );
      if (arrayValue.length === 0) {
        const colSpan = columns.length + (isEditable ? 2 : 1);
        rows.push(
          (0, import_vue14.h)("tr", { key: "empty" }, (0, import_vue14.h)("td", { colspan: colSpan, style: { ...tdStyle, textAlign: "center", color: "#999", padding: "24px 0" } }, "\u6682\u65E0\u6570\u636E"))
        );
      }
      return (0, import_vue14.h)(ArrayBase, null, {
        default: () => (0, import_vue14.h)("div", { style: { width: "100%" } }, [
          (0, import_vue14.h)("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" } }, [
            (0, import_vue14.h)("span", { style: { fontWeight: 600, color: "#303133" } }, field.label || field.path),
            (0, import_vue14.h)("span", { style: { color: "#909399", fontSize: "13px" } }, `${arrayValue.length} / ${maxItems}`)
          ]),
          (0, import_vue14.h)("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "14px" } }, [
            (0, import_vue14.h)("thead", null, (0, import_vue14.h)("tr", null, headerCells)),
            (0, import_vue14.h)("tbody", null, rows)
          ]),
          isEditable ? (0, import_vue14.h)("div", { style: { marginTop: "8px" } }, (0, import_vue14.h)(ArrayBase.Addition)) : null
        ])
      });
    };
  }
});

// src/components/ConfigForm.ts
var import_core5 = require("@moluoxixi/core");
var import_vue17 = require("vue");

// src/components/FormProvider.ts
var import_vue15 = require("vue");

// src/registry.ts
function createRegistryState() {
  return {
    components: /* @__PURE__ */ new Map(),
    decorators: /* @__PURE__ */ new Map(),
    actions: /* @__PURE__ */ new Map(),
    defaultDecorators: /* @__PURE__ */ new Map(),
    readPrettyComponents: /* @__PURE__ */ new Map()
  };
}
var globalRegistry = createRegistryState();
var registryListeners = /* @__PURE__ */ new WeakMap();
function getTargetRegistry(registry) {
  return registry ?? globalRegistry;
}
function notifyRegistryChange(registry) {
  const listeners = registryListeners.get(registry);
  if (!listeners) {
    return;
  }
  for (const listener of listeners) {
    listener();
  }
}
function subscribeRegistryChange(registry, listener) {
  let listeners = registryListeners.get(registry);
  if (!listeners) {
    listeners = /* @__PURE__ */ new Set();
    registryListeners.set(registry, listeners);
  }
  listeners.add(listener);
  return () => {
    listeners?.delete(listener);
  };
}
function registerComponent(name, component, options) {
  registerComponentToRegistry(getTargetRegistry(), name, component, options);
}
function registerComponentToRegistry(registry, name, component, options) {
  registry.components.set(name, component);
  if (options?.defaultDecorator) {
    registry.defaultDecorators.set(name, options.defaultDecorator);
  }
  if (options?.readPrettyComponent) {
    registry.readPrettyComponents.set(name, options.readPrettyComponent);
  }
  notifyRegistryChange(registry);
}
function registerDecorator(name, decorator) {
  registerDecoratorToRegistry(getTargetRegistry(), name, decorator);
}
function registerDecoratorToRegistry(registry, name, decorator) {
  registry.decorators.set(name, decorator);
  notifyRegistryChange(registry);
}
function registerAction(name, action) {
  registerActionToRegistry(getTargetRegistry(), name, action);
}
function registerActionToRegistry(registry, name, action) {
  registry.actions.set(name, action);
  notifyRegistryChange(registry);
}
function registerComponents(mapping, options) {
  registerComponentsToRegistry(getTargetRegistry(), mapping, options);
}
function registerComponentsToRegistry(registry, mapping, options) {
  for (const [name, component] of Object.entries(mapping)) {
    registry.components.set(name, component);
    if (options?.defaultDecorator) {
      registry.defaultDecorators.set(name, options.defaultDecorator);
    }
    if (options?.readPrettyComponent) {
      registry.readPrettyComponents.set(name, options.readPrettyComponent);
    }
  }
  notifyRegistryChange(registry);
}
function registerActions(mapping) {
  registerActionsToRegistry(getTargetRegistry(), mapping);
}
function registerActionsToRegistry(registry, mapping) {
  for (const [name, action] of Object.entries(mapping)) {
    registry.actions.set(name, action);
  }
  notifyRegistryChange(registry);
}
function registerFieldComponents(fields, decorator, layouts, readPretty) {
  registerFieldComponentsToRegistry(getTargetRegistry(), fields, decorator, layouts, readPretty);
}
function registerFieldComponentsToRegistry(registry, fields, decorator, layouts, readPretty) {
  registry.decorators.set(decorator.name, decorator.component);
  for (const [name, component] of Object.entries(fields)) {
    registry.components.set(name, component);
    registry.defaultDecorators.set(name, decorator.name);
  }
  if (layouts) {
    for (const [name, component] of Object.entries(layouts)) {
      registry.components.set(name, component);
    }
  }
  if (readPretty) {
    for (const [name, component] of Object.entries(readPretty)) {
      registry.readPrettyComponents.set(name, component);
    }
  }
  notifyRegistryChange(registry);
}
function getComponent(name) {
  return globalRegistry.components.get(name);
}
function getDecorator(name) {
  return globalRegistry.decorators.get(name);
}
function getAction(name) {
  return globalRegistry.actions.get(name);
}
function getDefaultDecorator(componentName) {
  return globalRegistry.defaultDecorators.get(componentName);
}
function getReadPrettyComponent(componentName) {
  return globalRegistry.readPrettyComponents.get(componentName);
}
function getGlobalRegistry() {
  return globalRegistry;
}
function resetRegistry() {
  globalRegistry.components.clear();
  globalRegistry.decorators.clear();
  globalRegistry.actions.clear();
  globalRegistry.defaultDecorators.clear();
  globalRegistry.readPrettyComponents.clear();
  notifyRegistryChange(globalRegistry);
}
function createRegistry(setup) {
  const registry = createRegistryState();
  setup?.({
    component: (name, comp, options) => registerComponentToRegistry(registry, name, comp, options),
    decorator: (name, dec) => registerDecoratorToRegistry(registry, name, dec),
    action: (name, action) => registerActionToRegistry(registry, name, action),
    components: (mapping, options) => registerComponentsToRegistry(registry, mapping, options),
    actions: (mapping) => registerActionsToRegistry(registry, mapping),
    fieldComponents: (fields, decorator, layouts, readPretty) => registerFieldComponentsToRegistry(registry, fields, decorator, layouts, readPretty)
  });
  return registry;
}
function createComponentScope(setup) {
  const components = {};
  const decorators = {};
  const actions = {};
  const defaultDecorators = {};
  const readPrettyComponents = {};
  setup({
    component: (name, comp, options) => {
      components[name] = comp;
      if (options?.defaultDecorator) {
        defaultDecorators[name] = options.defaultDecorator;
      }
      if (options?.readPrettyComponent) {
        readPrettyComponents[name] = options.readPrettyComponent;
      }
    },
    decorator: (name, dec) => {
      decorators[name] = dec;
    },
    action: (name, action) => {
      actions[name] = action;
    },
    defaultDecorator: (componentName, decoratorName) => {
      defaultDecorators[componentName] = decoratorName;
    },
    readPretty: (componentName, component) => {
      readPrettyComponents[componentName] = component;
    }
  });
  return { components, decorators, actions, defaultDecorators, readPrettyComponents };
}

// src/components/FormProvider.ts
var FormProvider = (0, import_vue15.defineComponent)({
  name: "FormProvider",
  props: {
    form: {
      type: Object,
      required: true
    },
    components: {
      type: Object,
      default: void 0
    },
    decorators: {
      type: Object,
      default: void 0
    },
    actions: {
      type: Object,
      default: void 0
    },
    defaultDecorators: {
      type: Object,
      default: void 0
    },
    readPrettyComponents: {
      type: Object,
      default: void 0
    },
    scope: {
      type: Object,
      default: void 0
    },
    registry: {
      type: Object,
      default: void 0
    }
  },
  setup(props, { slots }) {
    (0, import_vue15.provide)(FormSymbol, props.form);
    const registryVersion = (0, import_vue15.ref)(0);
    let disposeRegistrySubscribe;
    (0, import_vue15.watch)(
      () => props.registry,
      (nextRegistry) => {
        disposeRegistrySubscribe?.();
        const targetRegistry = nextRegistry ?? getGlobalRegistry();
        disposeRegistrySubscribe = subscribeRegistryChange(targetRegistry, () => {
          registryVersion.value += 1;
        });
      },
      { immediate: true }
    );
    const registry = (0, import_vue15.computed)(() => {
      void registryVersion.value;
      const global = props.registry ?? getGlobalRegistry();
      const components = new Map(global.components);
      const decorators = new Map(global.decorators);
      const actions = new Map(global.actions);
      const defaultDecorators = new Map(global.defaultDecorators);
      const readPrettyComponents = new Map(global.readPrettyComponents);
      if (props.scope) {
        for (const [name, comp] of Object.entries(props.scope.components)) {
          components.set(name, comp);
        }
        for (const [name, dec] of Object.entries(props.scope.decorators)) {
          decorators.set(name, dec);
        }
        for (const [name, action] of Object.entries(props.scope.actions ?? {})) {
          actions.set(name, action);
        }
        for (const [name, decoratorName] of Object.entries(props.scope.defaultDecorators ?? {})) {
          defaultDecorators.set(name, decoratorName);
        }
        for (const [name, comp] of Object.entries(props.scope.readPrettyComponents ?? {})) {
          readPrettyComponents.set(name, comp);
        }
      }
      if (props.components) {
        for (const [name, comp] of Object.entries(props.components)) {
          components.set(name, comp);
        }
      }
      if (props.decorators) {
        for (const [name, dec] of Object.entries(props.decorators)) {
          decorators.set(name, dec);
        }
      }
      if (props.actions) {
        for (const [name, action] of Object.entries(props.actions)) {
          actions.set(name, action);
        }
      }
      if (props.defaultDecorators) {
        for (const [name, decoratorName] of Object.entries(props.defaultDecorators)) {
          defaultDecorators.set(name, decoratorName);
        }
      }
      if (props.readPrettyComponents) {
        for (const [name, comp] of Object.entries(props.readPrettyComponents)) {
          readPrettyComponents.set(name, comp);
        }
      }
      return { components, decorators, actions, defaultDecorators, readPrettyComponents };
    });
    (0, import_vue15.provide)(ComponentRegistrySymbol, registry);
    (0, import_vue15.onMounted)(() => {
      props.form.mount();
    });
    (0, import_vue15.onBeforeUnmount)(() => {
      disposeRegistrySubscribe?.();
      props.form.unmount();
    });
    return () => slots.default?.();
  }
});

// src/components/SchemaField.ts
var import_core4 = require("@moluoxixi/core");
var import_vue16 = require("vue");
var SchemaProvider = (0, import_vue16.defineComponent)({
  name: "SchemaProvider",
  props: {
    schema: { type: Object, required: true }
  },
  setup(props, { slots }) {
    (0, import_vue16.provide)(SchemaSymbol, props.schema);
    return () => slots.default?.();
  }
});
var SchemaField = (0, import_vue16.defineComponent)({
  name: "SchemaField",
  props: {
    schema: {
      type: Object,
      required: true
    },
    compileOptions: {
      type: Object,
      default: void 0
    }
  },
  setup(props) {
    const form = (0, import_vue16.inject)(FormSymbol);
    if (!form) {
      throw new Error("[ConfigForm] <SchemaField> \u5FC5\u987B\u5728 <FormProvider> \u5185\u90E8\u4F7F\u7528");
    }
    const compiled = (0, import_vue16.computed)(() => (0, import_core4.compileSchema)(props.schema, props.compileOptions));
    function renderNode(cf) {
      if (cf.isVoid) {
        return renderVoidNode(cf);
      }
      if (cf.isArray) {
        const comp = cf.schema.component;
        const isStructuralArray = (0, import_core4.isStructuralArrayComponent)(comp);
        if (!isStructuralArray) {
          return (0, import_vue16.h)(FormField, {
            key: cf.address,
            name: cf.dataPath,
            fieldProps: (0, import_core4.toFieldProps)(cf)
          });
        }
        return renderArrayNode(cf);
      }
      if (cf.schema.type === "object" && cf.children.length > 0) {
        return renderObjectNode(cf);
      }
      return (0, import_vue16.h)(FormField, {
        key: cf.address,
        name: cf.dataPath,
        fieldProps: (0, import_core4.toFieldProps)(cf)
      });
    }
    function renderArrayNode(cf) {
      const arrayProps = (0, import_core4.toArrayFieldProps)(cf);
      arrayProps.componentProps = {
        ...arrayProps.componentProps,
        itemsSchema: cf.schema.items
      };
      return (0, import_vue16.h)(FormArrayField, {
        key: cf.address,
        name: cf.dataPath,
        fieldProps: arrayProps
      });
    }
    function renderVoidNode(cf) {
      const voidProps = (0, import_core4.toVoidFieldProps)(cf);
      return (0, import_vue16.h)(SchemaProvider, {
        key: cf.address,
        schema: cf.schema
      }, {
        default: () => (0, import_vue16.h)(FormVoidField, {
          name: cf.address,
          fieldProps: voidProps
        }, {
          default: () => renderChildren(cf.children)
        })
      });
    }
    function renderObjectNode(cf) {
      return (0, import_vue16.h)(SchemaProvider, {
        key: cf.address,
        schema: cf.schema
      }, {
        default: () => (0, import_vue16.h)(FormObjectField, {
          name: cf.dataPath,
          fieldProps: (0, import_core4.toFieldProps)(cf)
        }, {
          default: () => renderChildren(cf.children)
        })
      });
    }
    function renderChildren(childAddresses) {
      const allFields = compiled.value.fields;
      const result = [];
      for (const addr of childAddresses) {
        const cf = allFields.get(addr);
        if (cf) {
          const node = renderNode(cf);
          if (node)
            result.push(node);
        }
      }
      return result;
    }
    return () => {
      const rootChildren = [];
      const allFields = compiled.value.fields;
      for (const addr of compiled.value.fieldOrder) {
        if (!addr.includes(".")) {
          const cf = allFields.get(addr);
          if (cf) {
            const node = renderNode(cf);
            if (node)
              rootChildren.push(node);
          }
        }
      }
      return rootChildren;
    };
  }
});

// src/components/ConfigForm.ts
var FormActionsRenderer = (0, import_vue17.defineComponent)({
  name: "FormActionsRenderer",
  props: {
    showSubmit: Boolean,
    showReset: Boolean,
    submitLabel: { type: String, default: "\u63D0\u4EA4" },
    resetLabel: { type: String, default: "\u91CD\u7F6E" },
    align: { type: String, default: "center" },
    extraActions: { type: Object, default: () => ({}) }
  },
  emits: ["reset", "submit", "submitFailed"],
  setup(props, { emit }) {
    const registryRef = (0, import_vue17.inject)(ComponentRegistrySymbol);
    return () => {
      const LayoutActions = registryRef?.value.components.get("LayoutFormActions");
      if (LayoutActions) {
        return (0, import_vue17.h)(LayoutActions, {
          showSubmit: props.showSubmit,
          showReset: props.showReset,
          submitLabel: props.submitLabel,
          resetLabel: props.resetLabel,
          align: props.align,
          extraActions: props.extraActions
        });
      }
      const justifyContent = props.align === "left" ? "flex-start" : props.align === "right" ? "flex-end" : "center";
      const buttons = [];
      if (props.showSubmit) {
        buttons.push((0, import_vue17.h)("button", { type: "submit", style: "margin-right: 8px; padding: 4px 16px; cursor: pointer" }, props.submitLabel));
      }
      if (props.showReset) {
        buttons.push((0, import_vue17.h)("button", { type: "button", style: "padding: 4px 16px; cursor: pointer", onClick: () => emit("reset") }, props.resetLabel));
      }
      for (const [actionName, config] of Object.entries(props.extraActions)) {
        if (!isActionEnabled(config)) {
          continue;
        }
        const actionComponent = registryRef?.value.actions.get(actionName);
        if (!actionComponent) {
          continue;
        }
        buttons.push((0, import_vue17.h)(actionComponent, { key: actionName, ...resolveActionProps(config) }));
      }
      return (0, import_vue17.h)("div", { style: `margin-top: 16px; display: flex; justify-content: ${justifyContent}; gap: 8px; flex-wrap: wrap;` }, buttons);
    };
  }
});
var ConfigForm = (0, import_vue17.defineComponent)({
  name: "ConfigForm",
  props: {
    form: {
      type: Object,
      default: void 0
    },
    schema: {
      type: Object,
      default: void 0
    },
    formConfig: {
      type: Object,
      default: void 0
    },
    initialValues: {
      type: Object,
      default: void 0
    },
    components: {
      type: Object,
      default: void 0
    },
    decorators: {
      type: Object,
      default: void 0
    },
    actions: {
      type: Object,
      default: void 0
    },
    defaultDecorators: {
      type: Object,
      default: void 0
    },
    readPrettyComponents: {
      type: Object,
      default: void 0
    },
    scope: {
      type: Object,
      default: void 0
    },
    registry: {
      type: Object,
      default: void 0
    },
    effects: {
      type: Function,
      default: void 0
    },
    plugins: {
      type: Array,
      default: void 0
    },
    pattern: {
      type: String,
      default: void 0
    }
  },
  emits: ["submit", "submitFailed", "valuesChange", "reset"],
  setup(props, { slots, emit }) {
    const rawDecoratorProps = (0, import_vue17.computed)(
      () => props.schema?.decoratorProps ?? {}
    );
    const initialPattern = (0, import_vue17.computed)(
      () => props.pattern ?? props.schema?.pattern ?? rawDecoratorProps.value.pattern ?? "editable"
    );
    const resolvedEffects = props.effects ?? props.formConfig?.effects;
    const resolvedPlugins = props.plugins ?? props.formConfig?.plugins;
    const internalForm = useCreateForm({
      labelPosition: rawDecoratorProps.value.labelPosition ?? "right",
      labelWidth: rawDecoratorProps.value.labelWidth,
      pattern: initialPattern.value,
      ...props.formConfig,
      initialValues: props.initialValues ?? props.formConfig?.initialValues,
      effects: resolvedEffects,
      plugins: resolvedPlugins
    });
    const form = props.form ?? internalForm;
    const schemaTransformVersion = (0, import_vue17.ref)(0);
    const schemaTransformers = (0, import_vue17.computed)(() => collectSchemaTransformers(form));
    const schemaTransformDisposers = [];
    const bindSchemaTransformers = () => {
      while (schemaTransformDisposers.length > 0) {
        schemaTransformDisposers.pop()?.();
      }
      for (const transformer of schemaTransformers.value) {
        const subscribe = transformer.subscribeSchemaChange ?? transformer.subscribe;
        if (typeof subscribe !== "function") {
          continue;
        }
        const dispose = subscribe(() => {
          schemaTransformVersion.value += 1;
        });
        if (typeof dispose === "function") {
          schemaTransformDisposers.push(dispose);
        }
      }
    };
    const effectiveSchema = (0, import_vue17.computed)(() => {
      const schema = props.schema;
      if (!schema)
        return schema;
      if (schemaTransformers.value.length === 0)
        return schema;
      void schemaTransformVersion.value;
      return applySchemaTransforms(schema, schemaTransformers.value);
    });
    const rootDecoratorProps = (0, import_vue17.computed)(
      () => effectiveSchema.value?.decoratorProps ?? {}
    );
    const effectivePattern = (0, import_vue17.computed)(
      () => props.pattern ?? effectiveSchema.value?.pattern ?? rootDecoratorProps.value.pattern ?? "editable"
    );
    (0, import_vue17.watch)([rootDecoratorProps, effectivePattern], ([newProps, pattern]) => {
      form.batch(() => {
        if (newProps.labelPosition !== void 0) {
          form.labelPosition = newProps.labelPosition;
        }
        if (newProps.labelWidth !== void 0) {
          form.labelWidth = newProps.labelWidth;
        }
        form.pattern = pattern;
      });
    }, { immediate: true });
    (0, import_vue17.watch)(schemaTransformers, () => {
      bindSchemaTransformers();
    });
    const disposeValuesChange = form.onValuesChange((values) => {
      emit("valuesChange", values);
    });
    const disposeSubmitSuccess = form.on(import_core5.FormLifeCycle.ON_FORM_SUBMIT_SUCCESS, (event) => {
      const payload = event.payload;
      if (payload && payload.values) {
        emit("submit", payload.values);
      }
    });
    const disposeSubmitFailed = form.on(import_core5.FormLifeCycle.ON_FORM_SUBMIT_FAILED, (event) => {
      const payload = event.payload;
      const errors = payload?.errors ?? [];
      emit("submitFailed", errors);
      scrollToFirstError(errors);
    });
    const disposeReset = form.on(import_core5.FormLifeCycle.ON_FORM_RESET, () => {
      emit("reset");
    });
    const gridContainerRef = (0, import_vue17.ref)(null);
    const responsiveColumns = (0, import_vue17.ref)(null);
    let resizeObserver = null;
    const resolveBreakpointColumns = (width, breakpoints) => {
      const sortedBreakpoints = Object.entries(breakpoints).map(([w, c]) => [Number(w), c]).sort((a, b) => a[0] - b[0]);
      let cols = sortedBreakpoints[0]?.[1] ?? 1;
      for (const [minWidth, colCount] of sortedBreakpoints) {
        if (width >= minWidth)
          cols = colCount;
      }
      return cols;
    };
    (0, import_vue17.onMounted)(() => {
      bindSchemaTransformers();
      const layout = props.schema?.layout;
      if (layout?.breakpoints && gridContainerRef.value) {
        resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const width = entry.contentRect.width;
            responsiveColumns.value = resolveBreakpointColumns(width, layout.breakpoints);
          }
        });
        resizeObserver.observe(gridContainerRef.value);
      }
    });
    (0, import_vue17.onUnmounted)(() => {
      disposeValuesChange();
      disposeSubmitSuccess();
      disposeSubmitFailed();
      disposeReset();
      while (schemaTransformDisposers.length > 0) {
        schemaTransformDisposers.pop()?.();
      }
      resizeObserver?.disconnect();
      resizeObserver = null;
    });
    const handleSubmit = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await form.submit();
    };
    return () => {
      const currentDecoratorProps = rootDecoratorProps.value;
      const actions = isRecord(currentDecoratorProps.actions) ? currentDecoratorProps.actions : void 0;
      const extraActions = extractExtraActions(actions);
      const isEditable = form.pattern === "editable";
      const direction = currentDecoratorProps.direction ?? "vertical";
      const layout = effectiveSchema.value?.layout;
      let fieldContainerStyle = "";
      if (layout?.type === "grid") {
        const gap = layout.gutter ?? 16;
        const cols = layout.breakpoints && responsiveColumns.value ? responsiveColumns.value : layout.columns ?? 1;
        fieldContainerStyle = `display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: ${gap}px; align-items: start`;
      } else if (layout?.type === "inline" || direction === "inline") {
        const gap = layout?.gap ?? 16;
        fieldContainerStyle = `display: flex; flex-wrap: wrap; gap: ${gap}px; align-items: flex-start`;
      }
      const showActions = isEditable && ((actions ? actions.submit !== false || actions.reset !== false : false) || hasEnabledExtraActions(extraActions));
      const submitLabel = typeof actions?.submit === "string" ? actions.submit : "\u63D0\u4EA4";
      const resetLabel = typeof actions?.reset === "string" ? actions.reset : "\u91CD\u7F6E";
      const showSubmit = actions?.submit !== false;
      const showReset = actions?.reset !== false;
      const align = actions?.align === "left" || actions?.align === "right" || actions?.align === "center" ? actions.align : "center";
      return (0, import_vue17.h)(FormProvider, {
        form,
        components: props.components,
        decorators: props.decorators,
        actions: props.actions,
        defaultDecorators: props.defaultDecorators,
        readPrettyComponents: props.readPrettyComponents,
        scope: props.scope,
        registry: props.registry
      }, () => (0, import_vue17.h)("form", {
        onSubmit: handleSubmit,
        novalidate: true
      }, [
        /* 字段容器（始终使用 div 包裹，避免布局切换时因 DOM 结构变化导致字段树重建） */
        effectiveSchema.value ? (0, import_vue17.h)("div", {
          ref: layout?.breakpoints ? gridContainerRef : void 0,
          style: fieldContainerStyle || void 0
        }, [
          (0, import_vue17.h)(SchemaField, { schema: effectiveSchema.value })
        ]) : null,
        /* 操作按钮 */
        showActions ? (0, import_vue17.h)(FormActionsRenderer, {
          showSubmit,
          showReset,
          submitLabel,
          resetLabel,
          align,
          extraActions,
          onReset: () => {
            form.reset();
          }
        }) : null,
        slots.default?.({ form })
      ]));
    };
  }
});
function scrollToFirstError(errors) {
  if (errors.length === 0)
    return;
  setTimeout(() => {
    const errorElement = document.querySelector(
      '[data-field-error="true"], [aria-invalid="true"]'
    );
    if (errorElement) {
      errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      const input = errorElement.querySelector("input, textarea, select");
      input?.focus();
      return;
    }
    const firstPath = errors[0].path;
    const fieldElements = document.querySelectorAll(`[data-field-path="${firstPath}"], [name="${firstPath}"]`);
    if (fieldElements.length > 0) {
      fieldElements[0].scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, 100);
}
var RESERVED_FORM_ACTION_KEYS = /* @__PURE__ */ new Set(["submit", "reset", "align"]);
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function collectSchemaTransformers(form) {
  const plugins = form.getPlugins?.();
  if (!plugins) {
    return [];
  }
  const transformers = [];
  for (const pluginApi of plugins.values()) {
    if (!isRecord(pluginApi)) {
      continue;
    }
    const bridge = pluginApi;
    if (typeof bridge.translateSchema === "function" || typeof bridge.transformSchema === "function") {
      transformers.push(bridge);
    }
  }
  return transformers;
}
function applySchemaTransforms(schema, transformers) {
  let transformed = schema;
  for (const transformer of transformers) {
    const transform = transformer.transformSchema ?? transformer.translateSchema;
    if (typeof transform === "function") {
      transformed = transform(transformed);
    }
  }
  return transformed;
}
function extractExtraActions(actions) {
  if (!actions) {
    return {};
  }
  const extras = {};
  for (const [key, value] of Object.entries(actions)) {
    if (!RESERVED_FORM_ACTION_KEYS.has(key)) {
      extras[key] = value;
    }
  }
  return extras;
}
function hasEnabledExtraActions(actions) {
  return Object.values(actions).some(isActionEnabled);
}
function isActionEnabled(config) {
  return config !== false;
}
function resolveActionProps(config) {
  if (typeof config === "string") {
    return { buttonText: config };
  }
  if (isRecord(config)) {
    return config;
  }
  return {};
}

// src/components/DiffViewer.ts
var import_vue18 = require("vue");
var COLORS = {
  added: { bg: "#f6ffed", text: "#52c41a", border: "#b7eb8f" },
  removed: { bg: "#fff2f0", text: "#ff4d4f", border: "#ffccc7" },
  changed: { bg: "#fffbe6", text: "#faad14", border: "#ffe58f" },
  unchanged: { bg: "#fff", text: "#999", border: "#f0f0f0" }
};
var TYPE_LABELS = {
  added: "\u65B0\u589E",
  removed: "\u5220\u9664",
  changed: "\u53D8\u66F4",
  unchanged: "\u672A\u53D8"
};
var containerStyle = {
  border: "1px solid #e8e8e8",
  borderRadius: "8px",
  overflow: "hidden",
  fontSize: "14px"
};
var headerStyle = {
  display: "flex",
  background: "#fafafa",
  borderBottom: "1px solid #e8e8e8",
  fontWeight: "600",
  color: "#333"
};
var headerCellStyle = {
  flex: "1",
  padding: "10px 12px"
};
var rowStyle = {
  display: "flex",
  borderBottom: "1px solid #f0f0f0"
};
var cellStyle = {
  flex: "1",
  padding: "8px 12px",
  wordBreak: "break-all"
};
var emptyStyle = {
  padding: "24px",
  textAlign: "center",
  color: "#999",
  background: "#fafafa",
  borderRadius: "8px",
  border: "1px dashed #d9d9d9"
};
function formatValue(value) {
  if (value === void 0 || value === null)
    return "-";
  if (typeof value === "object")
    return JSON.stringify(value);
  return String(value);
}
var DiffViewer = (0, import_vue18.defineComponent)({
  name: "DiffViewer",
  props: {
    diffs: {
      type: Array,
      required: true
    },
    labelMap: {
      type: Object,
      default: () => ({})
    },
    onlyDirty: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    const filteredDiffs = (0, import_vue18.computed)(
      () => props.onlyDirty ? props.diffs.filter((d) => d.dirty) : props.diffs
    );
    return () => {
      if (filteredDiffs.value.length === 0) {
        return (0, import_vue18.h)("div", { style: emptyStyle }, "\u65E0\u5DEE\u5F02");
      }
      return (0, import_vue18.h)("div", { style: containerStyle }, [
        (0, import_vue18.h)("div", { style: headerStyle }, [
          (0, import_vue18.h)("div", { style: headerCellStyle }, "\u5B57\u6BB5"),
          (0, import_vue18.h)("div", { style: headerCellStyle }, "\u65E7\u503C"),
          (0, import_vue18.h)("div", { style: headerCellStyle }, "\u65B0\u503C"),
          (0, import_vue18.h)("div", { style: { ...headerCellStyle, flex: "0 0 60px" } }, "\u72B6\u6001")
        ]),
        ...filteredDiffs.value.map((entry) => {
          const color = COLORS[entry.type];
          const label = props.labelMap[entry.path] ?? entry.path;
          return (0, import_vue18.h)("div", {
            key: entry.path,
            style: {
              ...rowStyle,
              background: color.bg,
              borderLeft: `3px solid ${color.border}`
            }
          }, [
            (0, import_vue18.h)("div", { style: cellStyle }, label),
            (0, import_vue18.h)("div", { style: cellStyle }, entry.type !== "added" ? formatValue(entry.oldValue) : "-"),
            (0, import_vue18.h)("div", { style: cellStyle }, entry.type !== "removed" ? formatValue(entry.newValue) : "-"),
            (0, import_vue18.h)("div", { style: { ...cellStyle, flex: "0 0 60px" } }, [
              (0, import_vue18.h)("span", { style: { color: color.text, fontSize: "12px", fontWeight: 500 } }, TYPE_LABELS[entry.type])
            ])
          ]);
        })
      ]);
    };
  }
});

// src/components/FormLayout.ts
var import_vue19 = require("vue");
var FormLayoutSymbol = /* @__PURE__ */ Symbol("ConfigFormLayout");
function useFormLayout() {
  return (0, import_vue19.inject)(FormLayoutSymbol, null);
}
var FormLayout = (0, import_vue19.defineComponent)({
  name: "FormLayout",
  props: {
    labelPosition: String,
    labelWidth: {
      type: [String, Number],
      default: void 0
    },
    colon: {
      type: null,
      default: void 0
    }
  },
  setup(props, { slots }) {
    const parentLayout = useFormLayout();
    const mergedConfig = (0, import_vue19.computed)(() => ({
      labelPosition: props.labelPosition ?? parentLayout?.value.labelPosition,
      labelWidth: props.labelWidth ?? parentLayout?.value.labelWidth,
      colon: props.colon ?? parentLayout?.value.colon
    }));
    (0, import_vue19.provide)(FormLayoutSymbol, mergedConfig);
    return () => slots.default?.();
  }
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ArrayBase,
  ArrayField,
  ArrayItems,
  ArrayTable,
  ComponentRegistrySymbol,
  ConfigForm,
  DiffViewer,
  FieldSymbol,
  FormArrayField,
  FormField,
  FormLayout,
  FormLayoutSymbol,
  FormObjectField,
  FormProvider,
  FormSymbol,
  FormVoidField,
  ReactiveField,
  RecursionField,
  SchemaField,
  SchemaSymbol,
  createComponentScope,
  createRegistry,
  createRegistryState,
  getAction,
  getComponent,
  getDecorator,
  getDefaultDecorator,
  getReadPrettyComponent,
  registerAction,
  registerActions,
  registerComponent,
  registerComponents,
  registerDecorator,
  registerFieldComponents,
  resetRegistry,
  subscribeRegistryChange,
  useArray,
  useCreateForm,
  useField,
  useFieldByPath,
  useFieldSchema,
  useForm,
  useFormLayout,
  useFormSubmitting,
  useFormValid,
  useFormValues,
  useIndex,
  useSchemaItems
});
