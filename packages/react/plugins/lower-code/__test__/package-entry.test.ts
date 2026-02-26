import { beforeEach, describe, expect, it, vi } from 'vitest'

import { setupLowerCodeDesigner } from '../src/setup.ts'

const { registerComponent, LowCodeDesigner } = vi.hoisted(() => ({
  registerComponent: vi.fn(),
  LowCodeDesigner: vi.fn(() => null),
}))

vi.mock('@moluoxixi/react', () => ({
  registerComponent,
}))

vi.mock('../src/LowCodeDesigner', () => ({
  LowCodeDesigner,
}))

describe('plugin-lower-code-react setup', () => {
  beforeEach(() => {
    registerComponent.mockReset()
  })

  it('registers designer component with default name', () => {
    setupLowerCodeDesigner()

    expect(registerComponent).toHaveBeenCalledWith(
      'LowCodeDesigner',
      expect.any(Function),
      undefined,
    )
  })

  it('registers custom name and merges default designer props', () => {
    setupLowerCodeDesigner({
      name: 'CustomDesigner',
      registerOptions: { defaultDecorator: 'FormItem' },
      designerProps: {
        mode: 'simple',
      } as any,
    })

    expect(registerComponent).toHaveBeenCalledTimes(1)
    const [name, component, options] = registerComponent.mock.calls[0]
    expect(name).toBe('CustomDesigner')
    expect(options).toEqual({ defaultDecorator: 'FormItem' })

    const element = component({
      value: [],
      onChange: vi.fn(),
      mode: 'advanced',
    })
    expect(element.type).toBe(LowCodeDesigner)
    expect(element.props.mode).toBe('advanced')
    expect(Array.isArray(element.props.value)).toBe(true)
  })
})
