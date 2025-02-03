import React from 'react'
import { render } from '@testing-library/react'
import Checkbox from '../Checkbox'

describe('<Checkbox />', () => {
  it('should render without errors', () => {
    render(<Checkbox>Checkbox label</Checkbox>)
  })

  it('passes a ref to the input element', () => {
    const ref = React.createRef<HTMLInputElement>()

    const { container } = render(<Checkbox ref={ref}>checkbox</Checkbox>)
    const input = container.querySelector('input')

    expect(ref.current).toEqual(input)
  })
})
