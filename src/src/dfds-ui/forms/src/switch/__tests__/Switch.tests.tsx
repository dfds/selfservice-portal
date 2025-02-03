import React from 'react'
import { render, cleanup, fireEvent } from '@testing-library/react'
import { Switch } from '../Switch'

afterEach(cleanup)

describe('<Switch />', () => {
  it('should render without errors', () => {
    render(<Switch>This a switch</Switch>)
  })

  it('should render with text', () => {
    const text = 'This is a switch'
    const { getByText } = render(<Switch>{text}</Switch>)

    expect(getByText(text)).toBeTruthy()
  })

  it('should call onChange on click event', () => {
    const props = {
      onChange: jest.fn(),
    }

    const { container } = render(<Switch {...props} />)

    const label = container.firstChild as HTMLElement

    if (!label) {
      throw new Error('label not found')
    }

    fireEvent.click(label)

    expect(props.onChange.mock.calls.length).toBe(1)
  })

  it('should be disabled when passing disabled prop', () => {
    const props = {
      disabled: true,
    }

    const { container } = render(<Switch {...props} />)
    const input = container.querySelector('input')

    if (!input) {
      throw new Error('input not found')
    }

    expect(input.disabled).toBe(true)
  })

  it('should be unchecked when NOT passing checked prop', () => {
    const props = {}

    const { container } = render(<Switch {...props} />)
    const input = container.querySelector('input')

    if (!input) {
      throw new Error('input not found')
    }

    expect(input.checked).toBe(false)
  })

  it('should be checked when passing checked prop', () => {
    const props = {
      checked: true,
    }

    const { container } = render(<Switch {...props} />)
    const input = container.querySelector('input')

    if (!input) {
      throw new Error('input not found')
    }

    expect(input.checked).toBe(true)
  })

  it('should be readonly if there are NO onChange callback', () => {
    const props = {}

    const { container } = render(<Switch {...props} />)
    const input = container.querySelector('input')

    if (!input) {
      throw new Error('input not found')
    }

    expect(input.readOnly).toBe(true)
  })
})
