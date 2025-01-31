import React from 'react'
import { render } from '@testing-library/react'
import TelField from '../TelField'

describe('<TelField />', () => {
  it('should render without errors', () => {
    render(<TelField name="test" />)
  })
})
