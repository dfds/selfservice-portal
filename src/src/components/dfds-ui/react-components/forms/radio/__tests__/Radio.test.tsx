import React from 'react'
import { render, fireEvent, cleanup } from '@testing-library/react'
import Radio from '../Radio'

afterEach(cleanup)

describe('<Radio />', () => {
  it('should render without errors', () => {
    render(
      <Radio name="name-of-radio-1" value="1">
        Normal radio button
      </Radio>
    )
  })

  it('should render with text', () => {
    const { getByText } = render(
      <Radio name="name-of-radio-1" value="1">
        test-button
      </Radio>
    )

    expect(getByText('test-button')).toBeTruthy()
  })

  it('should render radio buttons disabled', () => {
    const but1 = <Radio name="test" value="1" disabled />
    const but2 = <Radio name="test" value="1" disabled checked />

    const { container } = render(
      <div>
        {but1}
        {but2}
      </div>
    )

    const test = container.querySelectorAll('input')

    expect(test[0].disabled).toBe(true)
    expect(test[1].disabled).toBe(true)

    expect(test[0].checked).toBe(false)
    expect(test[1].checked).toBe(true)

    expect(test.length).toBe(2)
  })

  it('radio buttons are clickable', () => {
    const but1 = <Radio name="test1" value="1" />
    const but2 = <Radio name="test1" value="1" checked />

    const { container } = render(
      <div>
        {but1}
        {but2}
      </div>
    )

    let inputs = container.querySelectorAll('input')

    fireEvent.change(inputs[0], { target: { checked: 'checked' } })

    inputs = container.querySelectorAll('input')

    expect(inputs[0].checked).toBe(true)
    expect(inputs[1].checked).toBe(false)
  })

  it('disabled radio buttons are read only', () => {
    const but1 = <Radio name="test1" value="1" disabled />
    const but2 = <Radio name="test1" value="1" disabled checked />

    const { container } = render(
      <div>
        {but1}
        {but2}
      </div>
    )

    const inputs = container.querySelectorAll('input')

    expect(inputs[0].readOnly).toBe(true)
    expect(inputs[1].readOnly).toBe(true)
  })
})
