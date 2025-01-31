import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import Banner from '../Banner'

describe('<Banner />', () => {
  it('should render without errors', () => {
    render(<Banner variant="mediumEmphasis">Banner message</Banner>)
  })

  it('should not display close icon without onRequestClose callback', () => {
    const { queryByTestId } = render(<Banner variant="mediumEmphasis">Banner message</Banner>)
    expect(queryByTestId('banner-close')).toBeNull()
  })

  it('calls onRequestClose when clicking close', () => {
    const fn = jest.fn()
    const { getByTestId } = render(
      <Banner onRequestClose={fn} variant="mediumEmphasis">
        Banner message
      </Banner>
    )

    fireEvent.click(getByTestId('banner-close'))

    expect(fn.mock.calls.length).toBe(1)
  })
})
