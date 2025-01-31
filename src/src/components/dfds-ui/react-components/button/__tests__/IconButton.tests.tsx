import React from 'react'
import { render } from '@testing-library/react'
import IconButton from '../IconButton'
import { Settings } from '@/components/dfds-ui/icons/system'

describe('<IconButton />', () => {
  it('should render without errors', () => {
    render(<IconButton icon={Settings} ariaLabel="Settings" />)
  })

  it('aria-label has correct value', () => {
    const ariaLabel = 'aria label value'
    const { getByLabelText } = render(<IconButton icon={Settings} ariaLabel={ariaLabel} />)
    expect(getByLabelText(ariaLabel)).toBeTruthy()
  })
})
