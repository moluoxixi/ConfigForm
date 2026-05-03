import type * as PublicApi from '../index'
import { describe, expectTypeOf, it } from 'vitest'

describe('public api', () => {
  it('keeps defineField as the only public field factory', () => {
    type HasDefineField = 'defineField' extends keyof typeof PublicApi ? true : false
    type HasDefineFieldFor = 'defineFieldFor' extends keyof typeof PublicApi ? true : false
    type HasFormRuntimeLocale = 'FormRuntimeLocale' extends keyof typeof PublicApi ? true : false
    type HasFormRuntimeDebugEvent = 'FormRuntimeDebugEvent' extends keyof typeof PublicApi ? true : false
    type HasFormRuntimeConflictStrategy = 'FormRuntimeConflictStrategy' extends keyof typeof PublicApi ? true : false
    type HasFormRuntimePluginContext = 'FormRuntimePluginContext' extends keyof typeof PublicApi ? true : false
    type HasFormDevtoolsBridge = 'FormDevtoolsBridge' extends keyof typeof PublicApi ? true : false
    type HasFormRuntimeContext = 'FormRuntimeContext' extends keyof typeof PublicApi ? true : false
    type HasCreateRuntimeContextInput = 'CreateRuntimeContextInput' extends keyof typeof PublicApi ? true : false
    type HasFormRuntimeTransformContext = 'FormRuntimeTransformContext' extends keyof typeof PublicApi ? true : false
    type HasFormRuntimeTransformContextInput = 'FormRuntimeTransformContextInput' extends keyof typeof PublicApi ? true : false
    type HasRuntimeCreateContext = 'createContext' extends keyof PublicApi.FormRuntime ? true : false
    type HasRuntimeCreateResolveSnap = 'createResolveSnap' extends keyof PublicApi.FormRuntime ? true : false
    type HasRuntimeTransformField = 'transformField' extends keyof PublicApi.FormRuntime ? true : false
    type HasRuntimeComponents = 'components' extends keyof PublicApi.FormRuntime ? true : false
    type HasRuntimeExtensions = 'extensions' extends keyof PublicApi.FormRuntime ? true : false
    type HasRuntimeEmitDebug = 'emitDebug' extends keyof PublicApi.FormRuntime ? true : false
    type HasRuntimeResolveSnapPlugins = 'plugins' extends keyof PublicApi.FormRuntimeResolveSnap ? true : false
    type HasRuntimeOptionsExtensions = 'extensions' extends keyof PublicApi.FormRuntimeOptions ? true : false
    type HasRuntimeOptionsPlugins = 'plugins' extends keyof PublicApi.FormRuntimeOptions ? true : false
    type HasRuntimeOptionsExpression = 'expression' extends keyof PublicApi.FormRuntimeOptions ? true : false
    type HasFieldConfigPlugins = 'plugins' extends keyof PublicApi.FieldConfig ? true : false
    type HasExpr = 'expr' extends keyof typeof PublicApi ? true : false
    type HasIsExpressionToken = 'isExpressionToken' extends keyof typeof PublicApi ? true : false
    type HasIsFormRuntime = 'isFormRuntime' extends keyof typeof PublicApi ? true : false
    type HasNormalizeFormRuntime = 'normalizeFormRuntime' extends keyof typeof PublicApi ? true : false
    type HasProvideRuntime = 'provideRuntime' extends keyof typeof PublicApi ? true : false
    type HasUseRuntime = 'useRuntime' extends keyof typeof PublicApi ? true : false
    type HasRuntimeBrand = '__configFormRuntime' extends keyof PublicApi.FormRuntime ? true : false
    type RuntimeProp = NonNullable<PublicApi.ConfigFormProps['runtime']>
    type RuntimePropAcceptsRuntime = PublicApi.FormRuntime extends RuntimeProp ? true : false
    type RuntimePropAcceptsOptions = PublicApi.FormRuntimeOptions extends RuntimeProp ? true : false
    type UseFormRuntimeInput = NonNullable<PublicApi.UseFormOptions['runtime']>
    type UseFormRuntimeAcceptsRuntime = PublicApi.FormRuntime extends UseFormRuntimeInput ? true : false
    type UseFormRuntimeAcceptsOptions = PublicApi.FormRuntimeOptions extends UseFormRuntimeInput ? true : false
    type RuntimeTokenConditionAllowed = PublicApi.RuntimeToken<boolean> extends PublicApi.FieldCondition ? true : false
    type TransformHookHasContext = Parameters<PublicApi.FormFieldTransform> extends [unknown, unknown, ...unknown[]] ? true : false
    type RuntimeTransformHasContext = Parameters<PublicApi.FormRuntime['transformField']> extends [unknown, unknown, ...unknown[]] ? true : false

    expectTypeOf<HasDefineField>().toEqualTypeOf<true>()
    expectTypeOf<HasDefineFieldFor>().toEqualTypeOf<false>()
    expectTypeOf<HasFormRuntimeLocale>().toEqualTypeOf<false>()
    expectTypeOf<HasFormRuntimeDebugEvent>().toEqualTypeOf<false>()
    expectTypeOf<HasFormRuntimeConflictStrategy>().toEqualTypeOf<false>()
    expectTypeOf<HasFormRuntimePluginContext>().toEqualTypeOf<false>()
    expectTypeOf<HasFormDevtoolsBridge>().toEqualTypeOf<false>()
    expectTypeOf<HasFormRuntimeContext>().toEqualTypeOf<false>()
    expectTypeOf<HasCreateRuntimeContextInput>().toEqualTypeOf<false>()
    expectTypeOf<HasFormRuntimeTransformContext>().toEqualTypeOf<false>()
    expectTypeOf<HasFormRuntimeTransformContextInput>().toEqualTypeOf<false>()
    expectTypeOf<HasRuntimeCreateContext>().toEqualTypeOf<false>()
    expectTypeOf<HasRuntimeCreateResolveSnap>().toEqualTypeOf<true>()
    expectTypeOf<HasRuntimeTransformField>().toEqualTypeOf<true>()
    expectTypeOf<HasRuntimeComponents>().toEqualTypeOf<false>()
    expectTypeOf<HasRuntimeExtensions>().toEqualTypeOf<false>()
    expectTypeOf<HasRuntimeEmitDebug>().toEqualTypeOf<false>()
    expectTypeOf<HasRuntimeResolveSnapPlugins>().toEqualTypeOf<false>()
    expectTypeOf<HasRuntimeOptionsExtensions>().toEqualTypeOf<false>()
    expectTypeOf<HasRuntimeOptionsPlugins>().toEqualTypeOf<true>()
    expectTypeOf<HasRuntimeOptionsExpression>().toEqualTypeOf<false>()
    expectTypeOf<HasFieldConfigPlugins>().toEqualTypeOf<false>()
    expectTypeOf<HasExpr>().toEqualTypeOf<false>()
    expectTypeOf<HasIsExpressionToken>().toEqualTypeOf<false>()
    expectTypeOf<HasIsFormRuntime>().toEqualTypeOf<false>()
    expectTypeOf<HasNormalizeFormRuntime>().toEqualTypeOf<false>()
    expectTypeOf<HasProvideRuntime>().toEqualTypeOf<false>()
    expectTypeOf<HasUseRuntime>().toEqualTypeOf<false>()
    expectTypeOf<HasRuntimeBrand>().toEqualTypeOf<false>()
    expectTypeOf<RuntimePropAcceptsRuntime>().toEqualTypeOf<false>()
    expectTypeOf<RuntimePropAcceptsOptions>().toEqualTypeOf<true>()
    expectTypeOf<UseFormRuntimeAcceptsRuntime>().toEqualTypeOf<false>()
    expectTypeOf<UseFormRuntimeAcceptsOptions>().toEqualTypeOf<true>()
    expectTypeOf<RuntimeTokenConditionAllowed>().toEqualTypeOf<true>()
    expectTypeOf<TransformHookHasContext>().toEqualTypeOf<false>()
    expectTypeOf<RuntimeTransformHasContext>().toEqualTypeOf<false>()
  })
})
