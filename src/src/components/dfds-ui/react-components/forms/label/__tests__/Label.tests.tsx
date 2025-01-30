import React from 'react'
import { render } from '@testing-library/react'
import Label from '../Label'

describe('<Label />', () => {
  it('should render without errors', () => {
    render(<Label>This a label</Label>)
  })
})
