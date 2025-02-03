import React from 'react'
import { render /*, screen*/ } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Counter } from '..'

describe('<Counter/>', () => {
  it('should render Counter without errors', () => {
    render(<Counter minValue={0} maxValue={10} />)
  })
  it('should have minValue as defaultValue if not provided', () => {
    const minValue = -3
    const { getByDisplayValue } = render(<Counter minValue={minValue} maxValue={10} />)
    expect(parseInt((getByDisplayValue(/\d+/) as HTMLInputElement).value)).toBe(minValue)
  })
  it(`shouldn't allow going to smaller values than minValue`, async () => {
    const user = userEvent.setup()
    const minValue = 5
    const maxValue = 10
    const { findAllByRole, getByDisplayValue } = render(<Counter minValue={minValue} maxValue={maxValue} />)
    const [minusButton] = await findAllByRole('button')
    for (let i = 0; i < 2 * (maxValue - minValue); i++) {
      await user.click(minusButton)
    }
    expect(parseInt((getByDisplayValue(/\d+/) as HTMLInputElement).value)).toBe(minValue)
  })
  it(`shouldn't allow going to larger values than maxValue`, async () => {
    const user = userEvent.setup()
    const minValue = 0
    const maxValue = 5
    const { findAllByRole, getByDisplayValue } = render(<Counter minValue={minValue} maxValue={maxValue} />)
    const [_, plusButton] = await findAllByRole('button')
    for (let i = 0; i < (maxValue - minValue) * 2; i++) {
      await user.click(plusButton)
    }
    expect(parseInt((getByDisplayValue(/\d+/) as HTMLInputElement).value)).toBe(maxValue)
  })
})
