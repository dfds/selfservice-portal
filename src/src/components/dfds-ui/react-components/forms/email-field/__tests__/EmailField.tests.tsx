import React from 'react'
import { render } from '@testing-library/react'
import EmailField from '../EmailField'

describe('<EmailField />', () => {
  it('should render without errors', () => {
    render(<EmailField name="test" />)
  })
})
