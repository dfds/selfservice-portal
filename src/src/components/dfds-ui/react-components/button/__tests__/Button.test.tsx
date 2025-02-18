import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import Button from '../Button'

describe('<Button />', () => {
  it('should render without errors', () => {
    render(<Button>Click me</Button>)
  })

  it('onClick called when clicking button', () => {
    const funk = jest.fn()
    const testString = '4321test'
    const { getByText } = render(<Button onClick={funk}>{testString}</Button>)

    fireEvent.click(getByText(testString))

    expect(funk.mock.calls.length).toBe(1)
  })

  it('should render title attribute with content if it a string', () => {
    const testString = '1234test'
    const { getByText } = render(<Button>{testString}</Button>)
    expect(getByText(testString)).toBeTruthy()
  })
})
