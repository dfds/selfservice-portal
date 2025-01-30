import React from 'react'
import { render } from '@testing-library/react'
import AsyncSelectField from '../AsyncSelectField'

describe('<AsyncSelectField />', () => {
  it('should render without errors', () => {
    render(<AsyncSelectField name="field" />)
  })
})
