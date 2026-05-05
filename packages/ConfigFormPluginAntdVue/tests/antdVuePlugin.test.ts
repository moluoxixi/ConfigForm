import { defineField } from '@moluoxixi/config-form'
import { createFormRuntime } from '@moluoxixi/config-form/plugins'
import { describe, expect, it } from 'vitest'
import { createAntdVuePlugin } from '../src'

const AInput = { name: 'AInput' }
const ASwitch = { name: 'ASwitch' }
const ACheckbox = { name: 'ACheckbox' }
const ATextarea = { name: 'ATextarea' }
const ASelect = { name: 'ASelect' }
const ASlider = { name: 'ASlider' }
const AUnknown = { name: 'AUnknown' }
const CustomInput = { name: 'CustomInput' }

describe('antd vue plugin package', () => {
  it('maps Ant Design Vue value components to value/update:value', () => {
    const runtime = createFormRuntime({
      plugins: [createAntdVuePlugin()],
    })
    const resolveSnap = runtime.createResolveSnap()

    const input = runtime.resolveField(defineField({ component: AInput, field: 'name' }), resolveSnap)
    const textarea = runtime.resolveField(defineField({ component: ATextarea, field: 'bio' }), resolveSnap)
    const select = runtime.resolveField(defineField({ component: ASelect, field: 'role' }), resolveSnap)
    const slider = runtime.resolveField(defineField({ component: ASlider, field: 'progress' }), resolveSnap)

    expect(input.valueProp).toBe('value')
    expect(input.trigger).toBe('update:value')
    expect(textarea.valueProp).toBe('value')
    expect(select.trigger).toBe('update:value')
    expect(slider.valueProp).toBe('value')
  })

  it('supports string component names and leaves unnamed components on the core binding', () => {
    const runtime = createFormRuntime({
      components: { AInput },
      plugins: [createAntdVuePlugin()],
    })
    const resolveSnap = runtime.createResolveSnap()

    const stringComponent = runtime.resolveField(defineField({ component: 'AInput', field: 'stringName' }), resolveSnap)
    const unnamedObject = runtime.resolveField(defineField({ component: {}, field: 'unnamedObject' }), resolveSnap)
    const emptyComponent = runtime.resolveField(defineField({ component: null as never, field: 'emptyComponent' }), resolveSnap)

    expect(stringComponent.valueProp).toBe('value')
    expect(stringComponent.trigger).toBe('update:value')
    expect(unnamedObject.valueProp).toBe('modelValue')
    expect(emptyComponent.trigger).toBe('update:modelValue')
  })

  it('maps Ant Design Vue checked components to checked/update:checked', () => {
    const runtime = createFormRuntime({
      plugins: [createAntdVuePlugin()],
    })
    const resolveSnap = runtime.createResolveSnap()

    const switchField = runtime.resolveField(defineField({ component: ASwitch, field: 'enabled' }), resolveSnap)
    const checkboxField = runtime.resolveField(defineField({ component: ACheckbox, field: 'accepted' }), resolveSnap)

    expect(switchField.valueProp).toBe('checked')
    expect(switchField.trigger).toBe('update:checked')
    expect(checkboxField.valueProp).toBe('checked')
    expect(checkboxField.trigger).toBe('update:checked')
  })

  it('keeps explicit field binding contracts unchanged', () => {
    const runtime = createFormRuntime({
      plugins: [createAntdVuePlugin()],
    })
    const resolveSnap = runtime.createResolveSnap()
    const field = runtime.resolveField(defineField({
      component: AInput,
      field: 'custom',
      trigger: 'change',
      valueProp: 'customValue',
    }), resolveSnap)

    expect(field.valueProp).toBe('customValue')
    expect(field.trigger).toBe('change')
  })

  it('supports user binding overrides and additional component names', () => {
    const runtime = createFormRuntime({
      plugins: [
        createAntdVuePlugin({
          bindings: {
            AInput: { trigger: 'change', valueProp: 'text' },
            ATransfer: { trigger: 'update:targetKeys', valueProp: 'targetKeys' },
          },
        }),
      ],
    })
    const resolveSnap = runtime.createResolveSnap()

    const input = runtime.resolveField(defineField({ component: AInput, field: 'name' }), resolveSnap)
    const transfer = runtime.resolveField(defineField({ component: { name: 'ATransfer' }, field: 'targets' }), resolveSnap)

    expect(input.valueProp).toBe('text')
    expect(input.trigger).toBe('change')
    expect(transfer.valueProp).toBe('targetKeys')
    expect(transfer.trigger).toBe('update:targetKeys')
  })

  it('rejects AntD-like unknown names by default and allows explicit loose mode', () => {
    const strictRuntime = createFormRuntime({
      plugins: [createAntdVuePlugin()],
    })
    const looseRuntime = createFormRuntime({
      plugins: [createAntdVuePlugin({ strict: false })],
    })
    const resolveSnap = looseRuntime.createResolveSnap()

    const unknown = looseRuntime.resolveField(defineField({ component: AUnknown, field: 'unknown' }), resolveSnap)
    const custom = looseRuntime.resolveField(defineField({ component: CustomInput, field: 'custom' }), resolveSnap)

    expect(unknown.valueProp).toBe('modelValue')
    expect(custom.trigger).toBe('update:modelValue')
    expect(() => strictRuntime.resolveField(defineField({ component: AUnknown, field: 'unknown' }), resolveSnap))
      .toThrow(/Unknown Ant Design Vue component binding: AUnknown/)
  })

  it('injects ASwitch props style width 44px when no user style is declared', () => {
    const runtime = createFormRuntime({
      plugins: [createAntdVuePlugin()],
    })
    const resolveSnap = runtime.createResolveSnap()

    const switchField = runtime.resolveField(
      defineField({ component: ASwitch, field: 'enabled' }),
      resolveSnap,
    )

    expect((switchField.props.style as Record<string, unknown>)?.width).toBe('44px')
  })

  it('deep merges ASwitch props with user props, user values take priority', () => {
    const runtime = createFormRuntime({
      plugins: [createAntdVuePlugin()],
    })
    const resolveSnap = runtime.createResolveSnap()

    const switchField = runtime.resolveField(
      defineField({
        component: ASwitch,
        field: 'enabled',
        props: { style: { width: '60px', color: 'red' } },
      }),
      resolveSnap,
    )

    // 用户声明的 width 覆盖默认值，用户声明的 color 保留
    expect((switchField.props.style as Record<string, unknown>)?.width).toBe('60px')
    expect((switchField.props.style as Record<string, unknown>)?.color).toBe('red')
  })
})
