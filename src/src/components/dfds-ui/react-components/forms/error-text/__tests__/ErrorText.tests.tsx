import React from 'react'
import { render } from '@testing-library/react'
import ErrorText from '../ErrorText'

describe('<ErrorText />', () => {
  it('should render without errors', () => {
    render(<ErrorText />)
  })
})
