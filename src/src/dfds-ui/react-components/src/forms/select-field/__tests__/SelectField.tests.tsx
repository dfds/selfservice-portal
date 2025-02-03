import React from 'react'
import { render } from '@testing-library/react'
import SelectField from '../SelectField'

describe('<SelectField />', () => {
  it('should render without errors', () => {
    render(
      <SelectField name="test">
        <option value="">Pick</option>
        <option>Value</option>
      </SelectField>
    )
  })
})
