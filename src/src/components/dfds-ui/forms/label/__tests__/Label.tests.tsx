import React from 'react'
import { render, screen } from '@testing-library/react'
import { Label } from '../Label'
import { css } from '@emotion/react'

describe('<Label />', () => {
  it('should render without errors', () => {
    render(<Label>My label</Label>)
  })
  it('should support htmlFor prop', () => {
    render(<Label htmlFor="input">My label</Label>)
  })
  it('should render an asterisk', () => {
    render(<Label required>My label with asterisk</Label>)
    expect(screen.queryByText('*')).toBeInTheDocument()
  })
  it('should be able to hide asterisk', () => {
    render(
      <Label required hideAsterisk>
        My label without asterisk
      </Label>
    )
    expect(screen.queryByText('*')).not.toBeInTheDocument()
  })
  it('should support custom styles', () => {
    render(
      <Label
        css={css`
          color: red;
        `}
      >
        My label
      </Label>
    )
    expect(screen.queryByText('My label')).toHaveStyleRule('color', 'red')
  })
})
