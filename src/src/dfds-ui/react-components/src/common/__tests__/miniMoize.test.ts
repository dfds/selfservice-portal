import { miniMoize } from '../miniMoize'

describe('miniMoize', () => {
  it('calls fn only once for same parameters', () => {
    let c = 0
    const moized = miniMoize(() => c++)
    moized(1, 1)
    moized(1, 1)
    moized(1, 1)

    expect(c).toBe(1)
  })

  it('calls fn when parameters are different', () => {
    let c = 0
    const moized = miniMoize(() => c++)
    moized(1, 2)
    moized(2, 2)
    moized(3, 3)

    expect(c).toBe(3)
  })
})
