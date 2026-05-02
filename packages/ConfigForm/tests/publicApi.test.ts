import type * as PublicApi from '../index'
import { describe, expectTypeOf, it } from 'vitest'

describe('public api', () => {
  it('exports a model-bound field factory', () => {
    type HasDefineFieldFor = 'defineFieldFor' extends keyof typeof PublicApi ? true : false

    expectTypeOf<HasDefineFieldFor>().toEqualTypeOf<true>()
  })
})
