import type * as PublicApi from '../index'
import { describe, expectTypeOf, it } from 'vitest'

describe('public api', () => {
  it('does not export model-bound field factories', () => {
    type HasDefineFieldFor = 'defineFieldFor' extends keyof typeof PublicApi ? true : false

    expectTypeOf<HasDefineFieldFor>().toEqualTypeOf<false>()
  })
})
