import type * as PluginApi from '../src/plugins'
import { describe, expectTypeOf, it } from 'vitest'

describe('plugin api', () => {
  it('keeps plugin and low-level helpers behind the plugins subpath', () => {
    type HasNormalizeField = 'normalizeField' extends keyof typeof PluginApi ? true : false
    type HasCollectFieldConfigs = 'collectFieldConfigs' extends keyof typeof PluginApi ? true : false
    type HasCreateFormRuntime = 'createFormRuntime' extends keyof typeof PluginApi ? true : false
    type HasCreateRuntimeToken = 'createRuntimeToken' extends keyof typeof PluginApi ? true : false
    type HasIsRuntimeToken = 'isRuntimeToken' extends keyof typeof PluginApi ? true : false

    type HasFormRuntimeOptions = 'plugins' extends keyof PluginApi.FormRuntimeOptions ? true : false
    type HasRuntimeResolveSnap = 'values' extends keyof PluginApi.FormRuntimeResolveSnap ? true : false
    type HasRuntimeTokenType = PluginApi.RuntimeToken<string> extends { readonly __configFormToken: string } ? true : false
    type HasRuntimeCreateResolveSnap = 'createResolveSnap' extends keyof PluginApi.FormRuntime ? true : false
    type HasRuntimeTransformField = 'transformField' extends keyof PluginApi.FormRuntime ? true : false
    type HasRuntimeResolveSnapPlugins = 'plugins' extends keyof PluginApi.FormRuntimeResolveSnap ? true : false
    type TransformHookHasContext = Parameters<PluginApi.FormFieldTransform> extends [unknown, unknown, ...unknown[]] ? true : false
    type RuntimeTransformHasContext = Parameters<PluginApi.FormRuntime['transformField']> extends [unknown, unknown, ...unknown[]] ? true : false

    expectTypeOf<HasNormalizeField>().toEqualTypeOf<true>()
    expectTypeOf<HasCollectFieldConfigs>().toEqualTypeOf<true>()
    expectTypeOf<HasCreateFormRuntime>().toEqualTypeOf<true>()
    expectTypeOf<HasCreateRuntimeToken>().toEqualTypeOf<true>()
    expectTypeOf<HasIsRuntimeToken>().toEqualTypeOf<true>()
    expectTypeOf<HasFormRuntimeOptions>().toEqualTypeOf<true>()
    expectTypeOf<HasRuntimeResolveSnap>().toEqualTypeOf<true>()
    expectTypeOf<HasRuntimeTokenType>().toEqualTypeOf<true>()
    expectTypeOf<HasRuntimeCreateResolveSnap>().toEqualTypeOf<true>()
    expectTypeOf<HasRuntimeTransformField>().toEqualTypeOf<true>()
    expectTypeOf<HasRuntimeResolveSnapPlugins>().toEqualTypeOf<false>()
    expectTypeOf<TransformHookHasContext>().toEqualTypeOf<false>()
    expectTypeOf<RuntimeTransformHasContext>().toEqualTypeOf<false>()
  })
})
