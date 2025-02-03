import React from 'react'
import { render } from '@testing-library/react'
import TextField from '../TextField'

describe('<TextField />', () => {
  it('should render without errors', () => {
    render(<TextField name="test" />)
  })
})
