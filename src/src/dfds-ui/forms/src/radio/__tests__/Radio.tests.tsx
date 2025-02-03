import React from 'react'
import { render } from '@testing-library/react'
import { Radio, RadioGroup } from '..'

describe('<Label />', () => {
  it('should render RadioField without errors', () => {
    render(<Radio name="example" />)
  })
  it('should render RadioGroup without errors', () => {
    render(
      <RadioGroup>
        <Radio name="example" />
        <Radio name="example" />
      </RadioGroup>
    )
  })
})
