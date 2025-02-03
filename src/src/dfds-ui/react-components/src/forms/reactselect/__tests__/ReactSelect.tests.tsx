import React from 'react'
import { cleanup, render, fireEvent } from '@testing-library/react'
import { waitFor } from '@testing-library/dom'
import ReactSelect from '../ReactSelect'

afterEach(cleanup)

describe('<Select />', () => {
  it('should render without errors', () => {
    render(
      <ReactSelect name="test">
        <option>Value</option>
      </ReactSelect>
    )
  })

  it('should render correct amount of options', async () => {
    const options = [
      { value: '1', label: 'Menu item 1' },
      { value: '2', label: 'Menu item 2' },
      { value: '3', label: 'Menu item 3', disabled: 'yes' },
    ]

    const { container, getByText } = render(<ReactSelect name="test" options={options} />)

    let test: any = ''

    await waitFor(() => (test = container.querySelector('input')))
    fireEvent.focus(test)

    await waitFor(() => (test = container.querySelector('.react-select__control')))
    fireEvent.mouseDown(test)

    let option: any = getByText('Menu item 1')
    expect(option).toBeTruthy()

    option = getByText('Menu item 2')
    expect(option).toBeTruthy()

    option = getByText('Menu item 3')
    expect(option).toBeTruthy()
  })

  it('should not be possible to select disabled item', async () => {
    const options = [
      { value: '1', label: 'Menu item 1' },
      { value: '2', label: 'Menu item 2' },
      { value: '3', label: 'Menu item 3', disabled: 'yes' },
    ]

    const { container, getByText } = render(<ReactSelect name="test" options={options} />)

    let test: any = ''
    await waitFor(() => (test = container.querySelector('input')))
    fireEvent.focus(test)

    await waitFor(() => (test = container.querySelector('.react-select__control')))
    fireEvent.mouseDown(test)
    const option = getByText('Menu item 3')
    fireEvent.click(option)

    test = container.querySelector('react-select__single-value')

    expect(test).toBeFalsy()
  })

  it('should be possible to select item', async () => {
    const options = [
      { value: '1', label: 'Menu item 1' },
      { value: '2', label: 'Menu item 2' },
      { value: '3', label: 'Menu item 3' },
    ]

    const { container, getAllByText } = render(<ReactSelect name="test" options={options} />)

    let test: any = ''
    await waitFor(() => (test = container.querySelector('input')))
    fireEvent.focus(test)

    await waitFor(() => (test = container.querySelector('.react-select__control')))
    fireEvent.mouseDown(test)
    const option = getAllByText('Menu item 2')
    fireEvent.click(option[0])

    test = container.querySelector('.react-select__single-value')
    expect(test.innerHTML).toBe('Menu item 2')
  })

  it('should render with icon', () => {
    const options = [
      { value: '1', label: 'Menu item 1' },
      { value: '2', label: 'Menu item 2' },
      { value: '3', label: 'Menu item 3' },
    ]

    const { getByText } = render(<ReactSelect name="test" icon={<div>icon</div>} options={options} />)

    const test: any = getByText('icon')
    expect(test).toBeTruthy()
  })
})
