import React from 'react'
import { render } from '@testing-library/react'
import NumberField from '../NumberField'

describe('<NumberField />', () => {
  it('should render without errors', () => {
    render(<NumberField name="test" />)
  })
})
