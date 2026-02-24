import * as vue from 'vue';
import { PropType, Ref, VNode, Component, InjectionKey, ComputedRef } from 'vue';
import { ArrayFieldInstance, ISchema, FormInstance, FormConfig, ComponentType, FormPlugin, FieldPattern, DiffFieldView, ArrayFieldProps, FieldProps, ObjectFieldProps, VoidFieldProps, FieldInstance, VoidFieldInstance, CompileOptions } from '@moluoxixi/core';
export { FieldPattern } from '@moluoxixi/core';

interface IArrayBaseContext {
    field: Ref<ArrayFieldInstance>;
}
interface IArrayBaseItemContext {
    index: Ref<number>;
}
declare function useArray(): IArrayBaseContext | null;
declare function useIndex(defaultIndex?: number): Ref<number>;
declare const ArrayBaseInner: vue.DefineComponent<{}, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>[] | undefined, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<{}> & Readonly<{}>, {}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const ArrayBaseItem: vue.DefineComponent<vue.ExtractPropTypes<{
    index: {
        type: NumberConstructor;
        required: true;
    };
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>[] | undefined, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    index: {
        type: NumberConstructor;
        required: true;
    };
}>> & Readonly<{}>, {}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const ArrayBaseIndex: vue.DefineComponent<{}, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<{}> & Readonly<{}>, {}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const ArrayBaseAddition: vue.DefineComponent<vue.ExtractPropTypes<{
    title: {
        type: StringConstructor;
        default: string;
    };
    method: {
        type: PropType<"push" | "unshift">;
        default: string;
    };
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}> | null, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    title: {
        type: StringConstructor;
        default: string;
    };
    method: {
        type: PropType<"push" | "unshift">;
        default: string;
    };
}>> & Readonly<{}>, {
    method: "push" | "unshift";
    title: string;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const ArrayBaseRemove: vue.DefineComponent<vue.ExtractPropTypes<{
    title: {
        type: StringConstructor;
        default: string;
    };
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}> | null, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    title: {
        type: StringConstructor;
        default: string;
    };
}>> & Readonly<{}>, {
    title: string;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const ArrayBaseMoveUp: vue.DefineComponent<vue.ExtractPropTypes<{
    title: {
        type: StringConstructor;
        default: string;
    };
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}> | null, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    title: {
        type: StringConstructor;
        default: string;
    };
}>> & Readonly<{}>, {
    title: string;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const ArrayBaseMoveDown: vue.DefineComponent<vue.ExtractPropTypes<{
    title: {
        type: StringConstructor;
        default: string;
    };
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}> | null, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    title: {
        type: StringConstructor;
        default: string;
    };
}>> & Readonly<{}>, {
    title: string;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
type ComposedArrayBase = typeof ArrayBaseInner & {
    Item: typeof ArrayBaseItem;
    Index: typeof ArrayBaseIndex;
    Addition: typeof ArrayBaseAddition;
    Remove: typeof ArrayBaseRemove;
    MoveUp: typeof ArrayBaseMoveUp;
    MoveDown: typeof ArrayBaseMoveDown;
    useArray: typeof useArray;
    useIndex: typeof useIndex;
};
declare const ArrayBase: ComposedArrayBase;

declare const ArrayField: vue.DefineComponent<vue.ExtractPropTypes<{
    itemsSchema: {
        type: PropType<ISchema>;
        default: undefined;
    };
}>, (() => null) | (() => VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>), {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    itemsSchema: {
        type: PropType<ISchema>;
        default: undefined;
    };
}>> & Readonly<{}>, {
    itemsSchema: ISchema;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const ArrayItems: vue.DefineComponent<vue.ExtractPropTypes<{
    itemsSchema: {
        type: PropType<ISchema>;
        default: undefined;
    };
}>, (() => null) | (() => VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>), {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    itemsSchema: {
        type: PropType<ISchema>;
        default: undefined;
    };
}>> & Readonly<{}>, {
    itemsSchema: ISchema;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;

declare const ArrayTable: vue.DefineComponent<vue.ExtractPropTypes<{
    itemsSchema: {
        type: PropType<ISchema>;
        default: undefined;
    };
}>, (() => null) | (() => VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>), {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    itemsSchema: {
        type: PropType<ISchema>;
        default: undefined;
    };
}>> & Readonly<{}>, {
    itemsSchema: ISchema;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;

/** 组件注册选项 */
interface RegisterComponentOptions {
    /** 该组件的默认装饰器名称，字段未显式指定 decorator 时自动使用 */
    defaultDecorator?: string;
    /** 阅读态替代组件（readPretty），isPreview 时自动替换 */
    readPrettyComponent?: Component;
}
/** 组件作用域（可传给 FormProvider 的 components/decorators） */
interface ComponentScope {
    components: Record<string, Component>;
    decorators: Record<string, Component>;
    actions?: Record<string, Component>;
    defaultDecorators?: Record<string, string>;
    readPrettyComponents?: Record<string, Component>;
}
/** 组件注册表（Map 结构，适合注入 FormProvider） */
interface RegistryState {
    components: Map<string, Component>;
    decorators: Map<string, Component>;
    actions: Map<string, Component>;
    defaultDecorators: Map<string, string>;
    readPrettyComponents: Map<string, Component>;
}
/** 创建一个空注册表（实例级隔离） */
declare function createRegistryState(): RegistryState;
declare function subscribeRegistryChange(registry: RegistryState, listener: () => void): () => void;
/**
 * 注册全局组件
 *
 * @param name - 组件名称
 * @param component - Vue 组件
 * @param options - 注册选项，可指定 defaultWrapper
 */
declare function registerComponent(name: string, component: Component, options?: RegisterComponentOptions): void;
/**
 * 注册全局装饰器
 */
declare function registerDecorator(name: string, decorator: Component): void;
/**
 * 注册全局 action 组件
 */
declare function registerAction(name: string, action: Component): void;
/**
 * 批量注册组件
 */
declare function registerComponents(mapping: Record<string, Component>, options?: RegisterComponentOptions): void;
/**
 * 批量注册 action 组件
 */
declare function registerActions(mapping: Record<string, Component>): void;
/**
 * 批量注册字段组件 + 装饰器，所有字段组件共享同一个默认 decorator
 *
 * UI 适配层的一站式注册方法，避免重复为每个组件指定 defaultWrapper。
 *
 * @param fields - 字段组件映射（name → Component）
 * @param decorator - 装饰器配置
 * @param decorator.name - 装饰器注册名
 * @param decorator.component - 装饰器组件
 * @param layouts - 可选的布局组件映射（无默认 decorator）
 *
 * @example
 * ```ts
 * registerFieldComponents(
 *   { Input, Password, Select, Switch, DatePicker },
 *   { name: 'FormItem', component: FormItem },
 *   { LayoutTabs, LayoutCard, LayoutSteps },
 * )
 * ```
 */
declare function registerFieldComponents(fields: Record<string, Component>, decorator: {
    name: string;
    component: Component;
}, layouts?: Record<string, Component>, readPretty?: Record<string, Component>): void;
/** 获取组件 */
declare function getComponent(name: string): Component | undefined;
/** 获取装饰器 */
declare function getDecorator(name: string): Component | undefined;
/** 获取 action 组件 */
declare function getAction(name: string): Component | undefined;
/** 获取组件的默认装饰器名称 */
declare function getDefaultDecorator(componentName: string): string | undefined;
/** 获取组件的 readPretty 替代组件 */
declare function getReadPrettyComponent(componentName: string): Component | undefined;
/** 清空全局注册表（测试/隔离场景使用） */
declare function resetRegistry(): void;
/**
 * 创建隔离注册表并通过 setup 填充（不写入全局）
 *
 * 适用于 SSR / 多租户 / 测试用例隔离场景。
 */
declare function createRegistry(setup?: (register: {
    component: (name: string, comp: Component, options?: RegisterComponentOptions) => void;
    decorator: (name: string, decorator: Component) => void;
    action: (name: string, action: Component) => void;
    components: (mapping: Record<string, Component>, options?: RegisterComponentOptions) => void;
    actions: (mapping: Record<string, Component>) => void;
    fieldComponents: (fields: Record<string, Component>, decorator: {
        name: string;
        component: Component;
    }, layouts?: Record<string, Component>, readPretty?: Record<string, Component>) => void;
}) => void): RegistryState;
/**
 * 创建组件作用域（不写入全局注册表）
 *
 * 用于同一页面需要使用多套 UI 库的场景，
 * 将返回值传给 `<FormProvider :components="scope.components" :decorators="scope.decorators">`
 * 或 `<ConfigForm :components="scope.components" :decorators="scope.decorators">`
 * 实现实例级隔离，避免全局注册表冲突。
 *
 * @example
 * ```ts
 * const antdScope = createComponentScope((register) => {
 *   register.component('Input', AntdInput)
 *   register.component('Select', AntdSelect)
 *   register.decorator('FormItem', AntdFormItem)
 * })
 * ```
 */
declare function createComponentScope(setup: (register: {
    component: (name: string, comp: Component, options?: RegisterComponentOptions) => void;
    decorator: (name: string, decorator: Component) => void;
    action: (name: string, action: Component) => void;
    defaultDecorator: (componentName: string, decoratorName: string) => void;
    readPretty: (componentName: string, component: Component) => void;
}) => void): ComponentScope;

/**
 * 开箱即用的配置化表单组件
 *
 * 从 schema 根节点的 decoratorProps 读取表单级配置（labelWidth、actions 等）。
 * 操作按钮（提交/重置）通过 schema.decoratorProps.actions 配置，编辑态自动渲染，
 * preview/disabled 模式自动隐藏。
 *
 * @example
 * ```vue
 * <ConfigForm
 *   :schema="{
 *     type: 'object',
 *     decoratorProps: { labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
 *     properties: {
 *       name: { type: 'string', title: '姓名', required: true },
 *     }
 *   }"
 *   @submit="handleSubmit"
 * />
 * ```
 */
declare const ConfigForm: vue.DefineComponent<vue.ExtractPropTypes<{
    form: {
        type: PropType<FormInstance>;
        default: undefined;
    };
    schema: {
        type: PropType<ISchema>;
        default: undefined;
    };
    formConfig: {
        type: PropType<FormConfig>;
        default: undefined;
    };
    initialValues: {
        type: PropType<Record<string, unknown>>;
        default: undefined;
    };
    components: {
        type: PropType<Record<string, ComponentType>>;
        default: undefined;
    };
    decorators: {
        type: PropType<Record<string, ComponentType>>;
        default: undefined;
    };
    actions: {
        type: PropType<Record<string, ComponentType>>;
        default: undefined;
    };
    defaultDecorators: {
        type: PropType<Record<string, string>>;
        default: undefined;
    };
    readPrettyComponents: {
        type: PropType<Record<string, ComponentType>>;
        default: undefined;
    };
    scope: {
        type: PropType<ComponentScope>;
        default: undefined;
    };
    registry: {
        type: PropType<RegistryState>;
        default: undefined;
    };
    effects: {
        type: PropType<(form: FormInstance) => void>;
        default: undefined;
    };
    plugins: {
        type: PropType<FormPlugin[]>;
        default: undefined;
    };
    pattern: {
        type: PropType<FieldPattern>;
        default: undefined;
    };
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, ("submit" | "reset" | "submitFailed" | "valuesChange")[], "submit" | "reset" | "submitFailed" | "valuesChange", vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    form: {
        type: PropType<FormInstance>;
        default: undefined;
    };
    schema: {
        type: PropType<ISchema>;
        default: undefined;
    };
    formConfig: {
        type: PropType<FormConfig>;
        default: undefined;
    };
    initialValues: {
        type: PropType<Record<string, unknown>>;
        default: undefined;
    };
    components: {
        type: PropType<Record<string, ComponentType>>;
        default: undefined;
    };
    decorators: {
        type: PropType<Record<string, ComponentType>>;
        default: undefined;
    };
    actions: {
        type: PropType<Record<string, ComponentType>>;
        default: undefined;
    };
    defaultDecorators: {
        type: PropType<Record<string, string>>;
        default: undefined;
    };
    readPrettyComponents: {
        type: PropType<Record<string, ComponentType>>;
        default: undefined;
    };
    scope: {
        type: PropType<ComponentScope>;
        default: undefined;
    };
    registry: {
        type: PropType<RegistryState>;
        default: undefined;
    };
    effects: {
        type: PropType<(form: FormInstance) => void>;
        default: undefined;
    };
    plugins: {
        type: PropType<FormPlugin[]>;
        default: undefined;
    };
    pattern: {
        type: PropType<FieldPattern>;
        default: undefined;
    };
}>> & Readonly<{
    onValuesChange?: ((...args: any[]) => any) | undefined;
    onSubmit?: ((...args: any[]) => any) | undefined;
    onReset?: ((...args: any[]) => any) | undefined;
    onSubmitFailed?: ((...args: any[]) => any) | undefined;
}>, {
    pattern: FieldPattern;
    initialValues: Record<string, unknown>;
    form: FormInstance<Record<string, unknown>>;
    schema: ISchema;
    components: Record<string, ComponentType>;
    decorators: Record<string, ComponentType>;
    actions: Record<string, ComponentType>;
    defaultDecorators: Record<string, string>;
    readPrettyComponents: Record<string, ComponentType>;
    scope: ComponentScope;
    registry: RegistryState;
    formConfig: FormConfig<Record<string, unknown>>;
    effects: (form: FormInstance) => void;
    plugins: FormPlugin<unknown>[];
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;

declare const DiffViewer: vue.DefineComponent<vue.ExtractPropTypes<{
    diffs: {
        type: PropType<DiffFieldView[]>;
        required: true;
    };
    labelMap: {
        type: PropType<Record<string, string>>;
        default: () => {};
    };
    onlyDirty: {
        type: BooleanConstructor;
        default: boolean;
    };
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    diffs: {
        type: PropType<DiffFieldView[]>;
        required: true;
    };
    labelMap: {
        type: PropType<Record<string, string>>;
        default: () => {};
    };
    onlyDirty: {
        type: BooleanConstructor;
        default: boolean;
    };
}>> & Readonly<{}>, {
    labelMap: Record<string, string>;
    onlyDirty: boolean;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;

/**
 * 数组字段组件（参考 Formily ArrayField）
 *
 * 创建 ArrayField 实例并通过 ReactiveField 桥接渲染。
 *
 * 渲染策略：
 * 1. **有 component（schema 模式）**：ReactiveField 解析 component（如 ArrayField）
 *    并渲染，组件内部通过 inject(FieldSymbol) 访问数组字段实例。
 * 2. **有 slot（自定义渲染）**：将 field 实例暴露给用户插槽。
 * 3. **无 slot 无 component**：保持空渲染（由 UI 层决定默认数组呈现方式）。
 *
 * @example schema 模式（由 SchemaField 调用）
 * ```vue
 * <FormArrayField name="contacts" :field-props="{
 *   component: 'ArrayField',
 *   componentProps: { itemsSchema: { type: 'object', properties: { ... } } },
 * }" />
 * ```
 */
declare const FormArrayField: vue.DefineComponent<vue.ExtractPropTypes<{
    name: {
        type: StringConstructor;
        required: true;
    };
    fieldProps: {
        type: PropType<Partial<ArrayFieldProps>>;
        default: undefined;
    };
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    name: {
        type: StringConstructor;
        required: true;
    };
    fieldProps: {
        type: PropType<Partial<ArrayFieldProps>>;
        default: undefined;
    };
}>> & Readonly<{}>, {
    fieldProps: Partial<ArrayFieldProps<unknown[]>>;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;

/**
 * 表单字段组件
 *
 * 自动从 Form 中获取/创建 Field，通过 ReactiveField 桥接渲染。
 * 当 name prop 变化时（如数组项重排序），自动销毁旧字段并创建新字段。
 *
 * 支持两种渲染模式：
 * 1. 自定义插槽：`v-slot="{ field, isPreview, isDisabled }"`
 * 2. 自动渲染：根据 field.component + field.decorator 从 registry 查找组件
 */
declare const FormField: vue.DefineComponent<vue.ExtractPropTypes<{
    name: {
        type: StringConstructor;
        required: true;
    };
    fieldProps: {
        type: PropType<Partial<FieldProps>>;
        default: undefined;
    };
    component: {
        type: PropType<string | Component>;
        default: undefined;
    };
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    name: {
        type: StringConstructor;
        required: true;
    };
    fieldProps: {
        type: PropType<Partial<FieldProps>>;
        default: undefined;
    };
    component: {
        type: PropType<string | Component>;
        default: undefined;
    };
}>> & Readonly<{}>, {
    component: string | Component;
    fieldProps: Partial<FieldProps<unknown>>;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;

interface FormLayoutConfig {
    labelPosition?: 'top' | 'left' | 'right';
    labelWidth?: string | number;
    colon?: boolean;
}
type FormLayoutContext = Readonly<Ref<FormLayoutConfig>>;
declare const FormLayoutSymbol: InjectionKey<FormLayoutContext>;
declare function useFormLayout(): FormLayoutContext | null;
declare const FormLayout: vue.DefineComponent<vue.ExtractPropTypes<{
    labelPosition: PropType<"top" | "left" | "right">;
    labelWidth: {
        type: PropType<string | number>;
        default: undefined;
    };
    colon: {
        type: PropType<boolean | undefined>;
        default: undefined;
    };
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>[] | undefined, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    labelPosition: PropType<"top" | "left" | "right">;
    labelWidth: {
        type: PropType<string | number>;
        default: undefined;
    };
    colon: {
        type: PropType<boolean | undefined>;
        default: undefined;
    };
}>> & Readonly<{}>, {
    labelWidth: string | number;
    colon: boolean | undefined;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;

/**
 * 对象字段组件
 *
 * 与普通 FormField 类似，但允许嵌套子字段。
 * 用于 type='object' 的 schema 节点。
 *
 * @example
 * ```vue
 * <FormObjectField name="profile" :field-props="{ label: '个人信息' }">
 *   <template #default>
 *     <FormField name="profile.name" />
 *     <FormField name="profile.age" />
 *   </template>
 * </FormObjectField>
 * ```
 */
declare const FormObjectField: vue.DefineComponent<vue.ExtractPropTypes<{
    name: {
        type: StringConstructor;
        required: true;
    };
    fieldProps: {
        type: PropType<Partial<ObjectFieldProps>>;
        default: undefined;
    };
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    name: {
        type: StringConstructor;
        required: true;
    };
    fieldProps: {
        type: PropType<Partial<ObjectFieldProps>>;
        default: undefined;
    };
}>> & Readonly<{}>, {
    fieldProps: Partial<ObjectFieldProps<Record<string, unknown>>>;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;

/**
 * 表单提供者组件
 *
 * 将 Form 实例注入 Vue 上下文。
 * 由于使用了 @vue/reactivity，form.values 天然是响应式的。
 */
declare const FormProvider: vue.DefineComponent<vue.ExtractPropTypes<{
    form: {
        type: PropType<FormInstance>;
        required: true;
    };
    components: {
        type: PropType<Record<string, ComponentType>>;
        default: undefined;
    };
    decorators: {
        type: PropType<Record<string, ComponentType>>;
        default: undefined;
    };
    actions: {
        type: PropType<Record<string, ComponentType>>;
        default: undefined;
    };
    defaultDecorators: {
        type: PropType<Record<string, string>>;
        default: undefined;
    };
    readPrettyComponents: {
        type: PropType<Record<string, ComponentType>>;
        default: undefined;
    };
    scope: {
        type: PropType<ComponentScope>;
        default: undefined;
    };
    registry: {
        type: PropType<RegistryState>;
        default: undefined;
    };
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>[] | undefined, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    form: {
        type: PropType<FormInstance>;
        required: true;
    };
    components: {
        type: PropType<Record<string, ComponentType>>;
        default: undefined;
    };
    decorators: {
        type: PropType<Record<string, ComponentType>>;
        default: undefined;
    };
    actions: {
        type: PropType<Record<string, ComponentType>>;
        default: undefined;
    };
    defaultDecorators: {
        type: PropType<Record<string, string>>;
        default: undefined;
    };
    readPrettyComponents: {
        type: PropType<Record<string, ComponentType>>;
        default: undefined;
    };
    scope: {
        type: PropType<ComponentScope>;
        default: undefined;
    };
    registry: {
        type: PropType<RegistryState>;
        default: undefined;
    };
}>> & Readonly<{}>, {
    components: Record<string, ComponentType>;
    decorators: Record<string, ComponentType>;
    actions: Record<string, ComponentType>;
    defaultDecorators: Record<string, string>;
    readPrettyComponents: Record<string, ComponentType>;
    scope: ComponentScope;
    registry: RegistryState;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;

/**
 * 虚拟字段组件（参考 Formily VoidField）
 *
 * 创建 VoidField 实例但不参与数据收集。
 * 用于布局容器（Card / Collapse / Tabs 等），通过 component 属性指定渲染的容器组件。
 *
 * @example
 * ```vue
 * <FormVoidField name="cardGroup" :field-props="{ component: 'Card', componentProps: { title: '分组' } }">
 *   <template #children>
 *     <FormField name="username" />
 *   </template>
 * </FormVoidField>
 * ```
 */
declare const FormVoidField: vue.DefineComponent<vue.ExtractPropTypes<{
    name: {
        type: StringConstructor;
        required: true;
    };
    fieldProps: {
        type: PropType<Partial<VoidFieldProps>>;
        default: undefined;
    };
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    name: {
        type: StringConstructor;
        required: true;
    };
    fieldProps: {
        type: PropType<Partial<VoidFieldProps>>;
        default: undefined;
    };
}>> & Readonly<{}>, {
    fieldProps: Partial<VoidFieldProps>;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;

/**
 * 响应式字段渲染桥接（参考 Formily ReactiveField）
 *
 * 统一处理所有字段类型的渲染管线：
 * - 判断 visible（不可见则不渲染）
 * - 渲染 decorator（FormItem 等包装器）
 * - 渲染 component（Input / Card / ArrayField 等业务组件）
 * - 注入字段属性（value / disabled / loading / dataSource 等）
 *
 * 对于数组字段（isArray=true），不传 modelValue/onUpdate:modelValue，
 * 而是将组件作为容器渲染（如 ArrayField），由组件内部通过 inject 访问字段实例。
 *
 * 由 FormField / FormVoidField / FormArrayField 调用，不直接在模板中使用。
 */
declare const ReactiveField: vue.DefineComponent<vue.ExtractPropTypes<{
    /** 字段实例（Field / VoidField / ArrayField） */
    field: {
        type: PropType<FieldInstance | VoidFieldInstance>;
        required: true;
    };
    /** 是否是 void 字段（不绑定数据） */
    isVoid: {
        type: BooleanConstructor;
        default: boolean;
    };
    /** 是否是数组字段 */
    isArray: {
        type: BooleanConstructor;
        default: boolean;
    };
}>, () => VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}> | VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>[] | null, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    /** 字段实例（Field / VoidField / ArrayField） */
    field: {
        type: PropType<FieldInstance | VoidFieldInstance>;
        required: true;
    };
    /** 是否是 void 字段（不绑定数据） */
    isVoid: {
        type: BooleanConstructor;
        default: boolean;
    };
    /** 是否是数组字段 */
    isArray: {
        type: BooleanConstructor;
        default: boolean;
    };
}>> & Readonly<{}>, {
    isVoid: boolean;
    isArray: boolean;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;

/**
 * RecursionField — 递归 Schema 渲染器（参考 Formily RecursionField）
 *
 * 根据 schema 定义递归渲染字段组件。
 * 主要用于 ArrayField 内部渲染每个数组项的子字段。
 *
 * 与 SchemaField 的区别：
 * - SchemaField 是顶层渲染器，编译整个 schema 树
 * - RecursionField 是局部渲染器，渲染指定 schema 节点及其子节点
 *
 * @example
 * ```vue
 * <!-- 渲染数组项（索引为 name） -->
 * <RecursionField :schema="itemsSchema" :name="index" :base-path="'contacts'" />
 * ```
 */
declare const RecursionField: vue.DefineComponent<vue.ExtractPropTypes<{
    /** 要渲染的 schema 节点 */
    schema: {
        type: PropType<ISchema>;
        required: true;
    };
    /** 字段名或索引 */
    name: {
        type: PropType<string | number>;
        default: undefined;
    };
    /** 基础数据路径（拼接 name 后作为字段的完整路径） */
    basePath: {
        type: StringConstructor;
        default: string;
    };
    /** 仅渲染 properties，不创建当前节点的字段 */
    onlyRenderProperties: {
        type: BooleanConstructor;
        default: boolean;
    };
}>, () => VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}> | null, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    /** 要渲染的 schema 节点 */
    schema: {
        type: PropType<ISchema>;
        required: true;
    };
    /** 字段名或索引 */
    name: {
        type: PropType<string | number>;
        default: undefined;
    };
    /** 基础数据路径（拼接 name 后作为字段的完整路径） */
    basePath: {
        type: StringConstructor;
        default: string;
    };
    /** 仅渲染 properties，不创建当前节点的字段 */
    onlyRenderProperties: {
        type: BooleanConstructor;
        default: boolean;
    };
}>> & Readonly<{}>, {
    name: string | number;
    basePath: string;
    onlyRenderProperties: boolean;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;

/**
 * Schema 驱动的递归渲染器（参考 Formily RecursionField）
 *
 * 根据编译后的 schema 树递归渲染，每种 type 对应一个 Field 组件：
 * - void   → FormVoidField（创建 VoidField 实例，渲染布局容器）
 * - string/number/boolean/date → FormField（创建 Field 实例）
 * - array  → FormArrayField（创建 ArrayField 实例）
 * - object → FormObjectField（创建 Field 实例，递归子节点）
 *
 * 所有 Field 组件通过 ReactiveField 桥接渲染 decorator(component(children))。
 */
declare const SchemaField: vue.DefineComponent<vue.ExtractPropTypes<{
    schema: {
        type: PropType<ISchema>;
        required: true;
    };
    compileOptions: {
        type: PropType<CompileOptions>;
        default: undefined;
    };
}>, () => VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>[], {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    schema: {
        type: PropType<ISchema>;
        required: true;
    };
    compileOptions: {
        type: PropType<CompileOptions>;
        default: undefined;
    };
}>> & Readonly<{}>, {
    compileOptions: CompileOptions;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;

/**
 * 获取当前字段上下文
 */
declare function useField<Value = unknown>(): FieldInstance<Value>;
/**
 * 通过路径获取指定字段
 */
declare function useFieldByPath<Value = unknown>(path: string): FieldInstance<Value> | undefined;

/**
 * 获取当前字段的 Schema 定义
 *
 * 由 SchemaField 在渲染每个节点时注入。
 * 布局组件（LayoutTabs/LayoutCollapse/LayoutSteps）通过此 composable
 * 读取自身 Schema，遍历 properties 发现子面板。
 */
declare function useFieldSchema(): ISchema;

/**
 * 获取当前表单上下文
 */
declare function useForm<Values extends Record<string, unknown> = Record<string, unknown>>(): FormInstance<Values>;
/**
 * 创建表单实例
 *
 * 在 setup 中调用，组件卸载时自动销毁。
 */
declare function useCreateForm<Values extends Record<string, unknown> = Record<string, unknown>>(config?: FormConfig<Values>): FormInstance<Values>;

/**
 * 获取表单值（响应式）
 *
 * 由于 form.values 本身就是 Vue reactive 对象，
 * 直接在模板中使用就能自动追踪依赖。
 */
declare function useFormValues<Values extends Record<string, unknown> = Record<string, unknown>>(): Values;
/**
 * 获取表单是否有效（响应式 computed ref）
 *
 * 返回 ComputedRef<boolean>，在模板中使用 `.value` 访问，
 * 当字段验证状态变化时自动更新。
 */
declare function useFormValid(): ComputedRef<boolean>;
/**
 * 获取表单提交状态（响应式 computed ref）
 *
 * 返回 ComputedRef<boolean>，在模板中使用 `.value` 访问，
 * 当提交状态变化时自动更新。
 */
declare function useFormSubmitting(): ComputedRef<boolean>;

/** Schema 面板项 */
interface SchemaItem {
    name: string;
    title: string;
    schema: ISchema;
}
/**
 * 从当前字段的 Schema properties 中发现子面板
 *
 * 跨 UI 库通用的布局逻辑，Vue composable 版本。
 */
declare function useSchemaItems(): SchemaItem[];

/** 表单注入 key（使用 Symbol.for 确保跨包可共享） */
declare const FormSymbol: InjectionKey<FormInstance>;
/** 字段注入 key */
declare const FieldSymbol: InjectionKey<FieldInstance<any>>;
/** 组件注册表注入 key */
interface ComponentRegistry {
    components: Map<string, ComponentType>;
    decorators: Map<string, ComponentType>;
    actions: Map<string, ComponentType>;
    defaultDecorators: Map<string, string>;
    readPrettyComponents: Map<string, ComponentType>;
}
/**
 * 组件注册表注入 key
 *
 * 提供 ComputedRef 而非普通对象，确保当 FormProvider 的
 * components/decorators props 变化时，注入方能获取到最新注册表。
 */
declare const ComponentRegistrySymbol: InjectionKey<ComputedRef<ComponentRegistry>>;
/**
 * Schema 注入 key
 *
 * SchemaField 在渲染每个节点时注入该节点的 ISchema。
 * 布局组件通过 useFieldSchema() 读取。
 */
declare const SchemaSymbol: InjectionKey<ISchema>;

export { ArrayBase, ArrayField, ArrayItems, ArrayTable, ComponentRegistrySymbol, type ComponentScope, ConfigForm, DiffViewer, FieldSymbol, FormArrayField, FormField, FormLayout, FormLayoutSymbol, FormObjectField, FormProvider, FormSymbol, FormVoidField, type IArrayBaseContext, type IArrayBaseItemContext, ReactiveField, RecursionField, type RegisterComponentOptions, type RegistryState, SchemaField, type SchemaItem, SchemaSymbol, createComponentScope, createRegistry, createRegistryState, getAction, getComponent, getDecorator, getDefaultDecorator, getReadPrettyComponent, registerAction, registerActions, registerComponent, registerComponents, registerDecorator, registerFieldComponents, resetRegistry, subscribeRegistryChange, useArray, useCreateForm, useField, useFieldByPath, useFieldSchema, useForm, useFormLayout, useFormSubmitting, useFormValid, useFormValues, useIndex, useSchemaItems };
