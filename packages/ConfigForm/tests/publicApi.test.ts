import type * as PublicApi from '../index'
import { describe, expectTypeOf, it } from 'vitest'

describe('public api', () => {
  it('keeps defineField as the only public field factory', () => {
    type HasDefineField = 'defineField' extends keyof typeof PublicApi ? true : false
    type HasDefineFieldFor = 'defineFieldFor' extends keyof typeof PublicApi ? true : false

    expectTypeOf<HasDefineField>().toEqualTypeOf<true>()
    expectTypeOf<HasDefineFieldFor>().toEqualTypeOf<false>()
  })
})
