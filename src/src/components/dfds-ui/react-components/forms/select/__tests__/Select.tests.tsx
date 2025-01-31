import React from 'react'
import { render } from '@testing-library/react'
import Select from '../Select'

describe('<Select />', () => {
  it('should render without errors', () => {
    render(
      <Select name="test">
        <option>Value</option>
      </Select>
    )
  })
})
