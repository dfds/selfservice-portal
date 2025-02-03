import React from 'react'
import { render, screen } from '@testing-library/react'
import { theme } from '@/dfds-ui/theme/src'
import { AssistiveText } from '../AssistiveText'

describe('<AssistiveText />', () => {
  it('should render without errors', () => {
    render(<AssistiveText>assistive text</AssistiveText>)
  })
  it('should show children', () => {
    render(<AssistiveText>assistive text</AssistiveText>)
    expect(screen.queryByText('assistive text')).toBeInTheDocument()
  })
  it('should render with correct color', () => {
    render(<AssistiveText>assistive text</AssistiveText>)
    expect(screen.queryByText('assistive text')).toHaveStyleRule('color', theme.colors.text.primary.secondary)
  })
})
