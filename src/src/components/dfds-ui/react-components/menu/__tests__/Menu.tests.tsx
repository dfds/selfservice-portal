import React from 'react'
import { render } from '@testing-library/react'
import { queryByText } from '@testing-library/dom'
import Menu from '../Menu'

describe('<Menu />', () => {
  it('should render without errors', () => {
    render(<Menu />)
  })

  it('should have correct url', () => {
    const { container } = render(
      <Menu>
        <Menu.Link url="testurl">Test link!</Menu.Link>
      </Menu>
    )
    const testLink: any = queryByText(container, 'Test link!')
    expect(testLink).toBeTruthy()
    if (testLink != null) {
      // will never be null as above expect statement will throw an error if it is
      expect(/.+\/testurl/.test(testLink.href)).toBe(true)
      // expects that the end of the url is .../testurl
    }
  })
})
