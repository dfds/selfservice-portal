import React from 'react'
import { render, screen } from '@testing-library/react'
import Toaster from './../Toaster'

describe('<Toaster />', () => {
  it('should render without errors', () => {
    render(<Toaster>toaster text</Toaster>)
  })
  it('should show children', () => {
    render(<Toaster>toaster text</Toaster>)
    expect(screen.queryByText('toaster text')).toBeInTheDocument()
  })
})
