import React from 'react'
import { theme } from '@dfds-ui/theme'

import { render } from '@testing-library/react'
import MobileStepper from '../MobileStepper'
import { Button } from '../../button'
import { ChevronRight, ChevronLeft } from '@dfds-ui/icons/system'

describe('<Stepper />', () => {
  const defaultProps = {
    steps: 2,
    backButton: (
      <Button data-testid="mobile-stepper-back-button" icon={<ChevronLeft data-testid="mobile-stepper-back-icon" />}>
        Back
      </Button>
    ),
    nextButton: (
      <Button data-testid="mobile-stepper-next-button" icon={<ChevronRight data-testid="mobile-stepper-next-icon" />}>
        Next
      </Button>
    ),
  }

  it('should render two buttons', () => {
    const { queryAllByRole } = render(<MobileStepper {...defaultProps} />)
    expect(queryAllByRole('button').length).toBe(2)
  })

  it('should render the back button and icon', () => {
    const { queryAllByTestId } = render(<MobileStepper {...defaultProps} />)
    expect(queryAllByTestId('mobile-stepper-back-button')).not.toBe(null)
    expect(queryAllByTestId('mobile-stepper-back-icon')).not.toBe(null)
  })

  it('should render the next button and icon', () => {
    const { queryAllByTestId } = render(<MobileStepper {...defaultProps} />)
    expect(queryAllByTestId('mobile-stepper-next-button')).not.toBe(null)
    expect(queryAllByTestId('mobile-stepper-next-icon')).not.toBe(null)
  })

  it('should render two buttons and text displaying progress when supplied with variant text', () => {
    const { container } = render(<MobileStepper {...defaultProps} variant="text" activeStep={1} steps={3} />)
    expect(container.firstChild?.textContent).toBe('Back2 / 3Next')
  })

  it('should render dots when supplied with variant dots', () => {
    const { queryAllByTestId } = render(<MobileStepper {...defaultProps} variant="dots" />)
    expect(queryAllByTestId('mobile-stepper-dots').length).toBe(1)
  })

  it('should render a dot for each step when using dots variant', () => {
    const { queryAllByTestId } = render(<MobileStepper {...defaultProps} variant="dots" />)
    expect(queryAllByTestId('mobile-stepper-dot').length).toBe(2)
  })

  it('should render the first dot as active if activeStep is not set', () => {
    const { getAllByTestId } = render(<MobileStepper {...defaultProps} variant="dots" />)
    expect(getAllByTestId('mobile-stepper-dot')[0]).toHaveStyle(`background-color: ${theme.colors.secondary.main};`)
  })

  it('should honor the activeStep prop', () => {
    const { getAllByTestId } = render(<MobileStepper {...defaultProps} variant="dots" activeStep={1} />)
    expect(getAllByTestId('mobile-stepper-dot')[1]).toHaveStyle(`background-color: ${theme.colors.secondary.main};`)
  })
})
