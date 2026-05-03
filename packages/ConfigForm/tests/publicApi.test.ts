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
    type HasFormRuntimeTransformContext = 'FormRuntimeTransformContext' extends keyof typeof PublicApi ? true : false
    type HasFormRuntimeTransformContextInput = 'FormRuntimeTransformContextInput' extends keyof typeof PublicApi ? true : false
    type HasRuntimeTransformField = 'transformField' extends keyof PublicApi.FormRuntime ? true : false
    type HasRuntimeComponents = 'components' extends keyof PublicApi.FormRuntime ? true : false
    type HasRuntimeExtensions = 'extensions' extends keyof PublicApi.FormRuntime ? true : false
    type HasRuntimeEmitDebug = 'emitDebug' extends keyof PublicApi.FormRuntime ? true : false
    type HasRuntimeContextPlugins = 'plugins' extends keyof PublicApi.FormRuntimeContext ? true : false
    type HasRuntimeOptionsExtensions = 'extensions' extends keyof PublicApi.FormRuntimeOptions ? true : false
    type HasRuntimeOptionsPlugins = 'plugins' extends keyof PublicApi.FormRuntimeOptions ? true : false
    type HasRuntimeOptionsExpression = 'expression' extends keyof PublicApi.FormRuntimeOptions ? true : false
    type HasFieldConfigPlugins = 'plugins' extends keyof PublicApi.FieldConfig ? true : false
    type HasExpr = 'expr' extends keyof typeof PublicApi ? true : false
    type HasIsExpressionToken = 'isExpressionToken' extends keyof typeof PublicApi ? true : false
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
    expectTypeOf<HasFormRuntimeTransformContext>().toEqualTypeOf<false>()
    expectTypeOf<HasFormRuntimeTransformContextInput>().toEqualTypeOf<false>()
    expectTypeOf<HasRuntimeTransformField>().toEqualTypeOf<true>()
    expectTypeOf<HasRuntimeComponents>().toEqualTypeOf<false>()
    expectTypeOf<HasRuntimeExtensions>().toEqualTypeOf<false>()
    expectTypeOf<HasRuntimeEmitDebug>().toEqualTypeOf<false>()
    expectTypeOf<HasRuntimeContextPlugins>().toEqualTypeOf<false>()
    expectTypeOf<HasRuntimeOptionsExtensions>().toEqualTypeOf<false>()
    expectTypeOf<HasRuntimeOptionsPlugins>().toEqualTypeOf<true>()
    expectTypeOf<HasRuntimeOptionsExpression>().toEqualTypeOf<false>()
    expectTypeOf<HasFieldConfigPlugins>().toEqualTypeOf<false>()
    expectTypeOf<HasExpr>().toEqualTypeOf<false>()
    expectTypeOf<HasIsExpressionToken>().toEqualTypeOf<false>()
    expectTypeOf<RuntimeTokenConditionAllowed>().toEqualTypeOf<true>()
    expectTypeOf<TransformHookHasContext>().toEqualTypeOf<false>()
    expectTypeOf<RuntimeTransformHasContext>().toEqualTypeOf<false>()
  })
})
