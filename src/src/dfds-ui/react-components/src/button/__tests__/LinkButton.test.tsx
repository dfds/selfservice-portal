import React from 'react'
import { render, cleanup } from '@testing-library/react'
import LinkButton from '../LinkButton'

afterEach(cleanup)

describe('<LinkButton />', () => {
  it('should render without errors', () => {
    render(<LinkButton>Click me</LinkButton>)
  })
  it('should render title attribute with content if it a string', () => {
    const testString = '1234test'
    const { getByTitle } = render(<LinkButton>{testString}</LinkButton>)
    expect(getByTitle(testString)).toBeTruthy()
  })
  it('should render with correct url', () => {
    const { getByTitle } = render(<LinkButton href="ClickyclickyURL">Clickyclicky</LinkButton>)

    const test: any = getByTitle('Clickyclicky')

    expect(/.+\/ClickyclickyURL/.test(test.href)).toBe(true)
  })
})
