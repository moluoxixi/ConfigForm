import { beforeEach, describe, expect, it, vi } from 'vitest'

const { registerComponent, LowCodeDesigner } = vi.hoisted(() => ({
  registerComponent: vi.fn(),
  LowCodeDesigner: { name: 'LowCodeDesigner' },
}))

vi.mock('@moluoxixi/vue', () => ({
  registerComponent,
}))

vi.mock('../src/LowCodeDesigner', () => ({
  LowCodeDesigner,
}))

import { setupLowerCodeDesigner } from '../src/setup.ts'

describe('plugin-lower-code-vue setup', () => {
  beforeEach(() => {
    registerComponent.mockReset()
  })

  it('registers designer component with default name', () => {
    setupLowerCodeDesigner()

    expect(registerComponent).toHaveBeenCalledWith(
      'LowCodeDesigner',
      expect.anything(),
      undefined,
    )
  })

  it('registers designer component with custom name and options', () => {
    setupLowerCodeDesigner({
      name: 'CustomDesigner',
      registerOptions: {
        defaultDecorator: 'FormItem',
      },
    })

    expect(registerComponent).toHaveBeenCalledWith(
      'CustomDesigner',
      LowCodeDesigner,
      { defaultDecorator: 'FormItem' },
    )
  })
})
