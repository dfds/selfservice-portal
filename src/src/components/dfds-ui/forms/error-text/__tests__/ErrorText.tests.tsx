import React from 'react'
import { render, screen } from '@testing-library/react'
import { theme } from '@/components/dfds-ui/theme'
import { ErrorText } from '../ErrorText'

describe('<ErrorText />', () => {
  it('should render without errors', () => {
    render(<ErrorText>Error</ErrorText>)
  })
  it('should show children', () => {
    render(<ErrorText>Error</ErrorText>)
    expect(screen.queryByText('Error')).toBeInTheDocument()
  })
  it('should render with correct color', () => {
    render(<ErrorText>Error</ErrorText>)
    expect(screen.queryByRole('alert')).toHaveStyleRule('color', theme.colors.status.alert)
  })
})
