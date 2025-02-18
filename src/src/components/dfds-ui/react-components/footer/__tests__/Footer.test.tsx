import React from 'react'
import { render, cleanup } from '@testing-library/react'
import Footer from '../Footer'

afterEach(cleanup)

describe('<Footer />', () => {
  it('should render without errors', () => {
    render(<Footer />)
  })

  it('should render children and bottom children', () => {
    const { container, getByText } = render(
      <Footer className="footerClassName" bottomChildren={'bottom-child'}>
        <div>real-child</div>
      </Footer>
    )

    let test: any = container.querySelector('.footerClassName')

    expect(test).toBeTruthy()

    test = getByText('real-child')

    expect(test).toBeTruthy()

    test = getByText('bottom-child')

    expect(test).toBeTruthy()
  })
})
