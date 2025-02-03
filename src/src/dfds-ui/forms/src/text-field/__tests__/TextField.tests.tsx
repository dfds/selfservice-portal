import React from 'react'
import { render, screen } from '@testing-library/react'
import { TextField } from '../TextField'

describe('<TextField />', () => {
  it('should render without errors', () => {
    render(<TextField name="text-field" />)
  })

  it('should be able to set value', () => {
    render(<TextField name="text-field" value="something" />)
    screen.getByDisplayValue('something')
  })
})
