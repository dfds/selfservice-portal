import React from 'react'
import { render } from '@testing-library/react'
import Hero from '../Hero'

describe('<Hero />', () => {
  it('should render without errors', () => {
    render(<Hero title="DFDS" headline="Test" imageSrc="#" />)
  })
})
