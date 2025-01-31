import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import Toast from '../Toast'

describe('<Toast />', () => {
  it('should render without errors', () => {
    render(<Toast>Toast message</Toast>)
  })

  it('should not display close icon without onRequestClose callback', () => {
    const { queryByTestId } = render(<Toast>Toast message</Toast>)
    expect(queryByTestId('toast-close')).toBeNull()
  })

  it('calls onRequestClose when clicking close', () => {
    const fn = jest.fn()
    const { getByTestId } = render(<Toast onRequestClose={fn}>Toast message</Toast>)

    fireEvent.click(getByTestId('toast-close'))

    expect(fn.mock.calls.length).toBe(1)
  })
})
