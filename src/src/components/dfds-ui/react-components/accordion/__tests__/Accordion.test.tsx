import React from 'react'
import { render, cleanup, fireEvent } from '@testing-library/react'
import Accordion from '../Accordion'

afterEach(cleanup)

describe('<Accordion />', () => {
  it('should render without errors', () => {
    render(<Accordion heading="test">Content</Accordion>)
  })

  it('should render sections when unfolded', () => {
    let isOpen1 = true
    let isOpen2 = true
    let isOpen3 = true

    const setIsOpen1 = () => (isOpen1 = !isOpen1)
    const setIsOpen2 = () => (isOpen2 = !isOpen2)
    const setIsOpen3 = () => (isOpen3 = !isOpen3)

    const { getByText } = render(
      <>
        <Accordion onToggle={setIsOpen1} isOpen={isOpen1} heading="accordion-heading1">
          <div>content-1</div>
        </Accordion>
        <Accordion onToggle={setIsOpen2} isOpen={isOpen2} heading="accordion-heading2">
          <div>content-2</div>
        </Accordion>
        <Accordion onToggle={setIsOpen3} isOpen={isOpen3} heading="accordion-heading3">
          <div>content-3</div>
        </Accordion>
      </>
    )

    let test: any = getByText('content-1')
    expect(test).toBeVisible()

    test = getByText('content-2')
    expect(test).toBeVisible()

    test = getByText('content-3')
    expect(test).toBeVisible()
  })

  it('should not render sections when folded', () => {
    let isOpen1 = false
    let isOpen2 = false
    let isOpen3 = false

    const setIsOpen1 = () => (isOpen1 = !isOpen1)
    const setIsOpen2 = () => (isOpen2 = !isOpen2)
    const setIsOpen3 = () => (isOpen3 = !isOpen3)

    const { getByText } = render(
      <>
        <Accordion onToggle={setIsOpen1} isOpen={isOpen1} heading="accordion-heading1">
          <div>content-1</div>
        </Accordion>
        <Accordion onToggle={setIsOpen2} isOpen={isOpen2} heading="accordion-heading2">
          <div>content-2</div>
        </Accordion>
        <Accordion onToggle={setIsOpen3} isOpen={isOpen3} heading="accordion-heading3">
          <div>content-3</div>
        </Accordion>
      </>
    )

    let test: any = getByText('content-1')
    expect(test).not.toBeVisible()

    test = getByText('content-2')
    expect(test).not.toBeVisible()

    test = getByText('content-3')
    expect(test).not.toBeVisible()
  })

  it('should call onToggle function when clicking header', () => {
    const funk = jest.fn()

    const { getByText } = render(
      <>
        <Accordion onToggle={funk} isOpen={false} heading="accordion-heading1" secondaryHeading="second line here">
          <div>content-1</div>
        </Accordion>
      </>
    )

    const test: any = getByText('accordion-heading1')

    fireEvent.click(test)

    expect(funk.mock.calls.length).toBe(1)
  })

  it('should render headers', () => {
    const funk = jest.fn()

    const { getByText } = render(
      <>
        <Accordion onToggle={funk} isOpen={false} heading="accordion-heading1" secondaryHeading="second line here">
          <div>content-1</div>
        </Accordion>
      </>
    )

    let test: any = getByText('accordion-heading1')

    expect(test).toBeVisible()

    test = getByText('second line here')

    expect(test).toBeVisible()
  })
  // TODO: Keyboard usability test
})
