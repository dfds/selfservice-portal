/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import PasswordField from '../PasswordField'

describe('<TextField />', () => {
  it('should render without errors', () => {
    render(<PasswordField />)
  })

  it('should toggle the input type when clicking the icon', () => {
    const { container } = render(<PasswordField />)
    const icon = container.querySelector('span svg')
    const input = container.querySelector('input')
    expect(input!.getAttribute('type')).toBe('password')
    fireEvent.click(icon!)
    expect(input!.getAttribute('type')).toBe('text')
  })
})
