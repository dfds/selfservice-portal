import React from 'react'
import { render } from '@testing-library/react'
import Spinner from '../Spinner'

describe('<Spinner />', () => {
  it('should render without errors', () => {
    render(<Spinner />)
  })
})
