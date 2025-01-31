import React from 'react'
import { render } from '@testing-library/react'
import Input from '../Input'

describe('<Input />', () => {
  it('should render without errors', () => {
    render(<Input name="test" />)
  })
})
