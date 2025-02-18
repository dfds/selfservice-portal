import React from 'react'
import { css } from '@emotion/react'
import { render, screen } from '@testing-library/react'
import { LocaleFlag } from '../LocaleFlag'

describe('<LocaleFlag />', () => {
  it('should render without errors', () => {
    render(<LocaleFlag locale="en" />)
  })
  it('should have aria role img', () => {
    render(<LocaleFlag locale="en" />)
    expect(screen.queryByRole('img')).toBeTruthy()
  })
  it('should support custom styles', () => {
    render(
      <LocaleFlag
        locale="en"
        css={css`
          margin: 10px;
        `}
      />
    )
    expect(screen.queryByRole('img')).toHaveStyleRule('margin', '10px')
  })
})
