import React from 'react'
import { css } from '@emotion/react'
import MobileStepper from './MobileStepper'
import { Button } from '../button'
import { Divider } from '../divider'
import { ChevronRight, ChevronLeft } from '@dfds-ui/icons/system'
import { theme } from '@dfds-ui/theme'
import { StepperFeedbackMessage } from '../stepper-feedback-message'
export const MobileStepperDots = () => {
  const [activeStep, setActiveStep] = React.useState(0)

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }
  const backButton = (
    <Button
      variation="text"
      size="small"
      icon={<ChevronLeft />}
      iconAlign="left"
      onClick={handleBack}
      disabled={activeStep === 0}
    >
      Back
    </Button>
  )
  const nextButton = (
    <Button variation="text" size="small" icon={<ChevronRight />} onClick={handleNext} disabled={activeStep === 5}>
      Next
    </Button>
  )

  return (
    <div
      css={css`
        display: flex;
        flex-direction: row;
        justify-content: center;
      `}
    >
      <div
        css={css`
          max-width: 400px;
          flex-grow: 1;
        `}
      >
        <MobileStepper
          activeStep={activeStep}
          steps={6}
          nextButton={nextButton}
          backButton={backButton}
          variant="dots"
        />
      </div>
    </div>
  )
}
const steps = [
  {
    label: 'Select your cabin',
    description: `Choose from a range of cabins to suit your budget including standard inside or sea view cabins, economy cabins or a premium commodore cabin with breakfast & free WiFi.

    Please note the price is per cabin.

    Infants (0-3yrs) can stay in the cabin in addition to the number of beds stated if the infant doesn't need a separate bed. Contact customer service if you wish to book 9+ people or require an accessible cabin.
    `,
  },
  {
    label: 'Add your meals',
    description: `We have introduced a number of measures onboard to ensure your wellbeing. Read more here.

    Pre-book your onboard meals to secure a time to suit you, to beat the queues and to save.

    Please note: Prices shown are per person. When making table reservations, all times onboard are Central European Time, therefore 1 hour AHEAD of UK times.`,
  },
  {
    label: 'Enhance Your Trip ',
    description: `While you’ve probably got plenty planned for your time in your destination, our trip add-ons will help ensure you have an unforgettable time on your break.`,
  },
  {
    label: ' Booking and passenger details',
    description: `Fill out passenger details to finalize booking proccess`,
  },
]
export const MobileStepperText = () => {
  const [activeStep, setActiveStep] = React.useState(0)
  const maxSteps = steps.length

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }
  const backButton = (
    <Button
      variation="text"
      size="small"
      icon={<ChevronLeft />}
      iconAlign="left"
      onClick={handleBack}
      disabled={activeStep === 0}
    >
      Back
    </Button>
  )
  const nextButton = (
    <Button
      variation="text"
      size="small"
      icon={<ChevronRight />}
      onClick={handleNext}
      disabled={activeStep === maxSteps - 1}
    >
      Next
    </Button>
  )

  return (
    <div
      css={css`
        display: flex;
        flex-direction: row;
        justify-content: center;
      `}
    >
      <div
        css={css`
          padding: 0 0.75rem;
          max-width: 400px;
        `}
      >
        <div
          css={css`
            padding: 0.75rem 0;
            color: ${theme.colors.text.primary.primary};
          `}
        >
          {steps[activeStep].label}
        </div>
        <Divider />
        <div
          css={css`
            min-height: 240px;
            padding: 0.75rem 0;
          `}
        >
          {steps[activeStep].description}
        </div>
        <MobileStepper activeStep={activeStep} steps={maxSteps} nextButton={nextButton} backButton={backButton} />
      </div>
    </div>
  )
}
export const MobileStepperTextWithFeedback = () => {
  const [activeStep, setActiveStep] = React.useState(0)
  const [displayFeedback, setDisplayFeedback] = React.useState(false)

  const maxSteps = steps.length

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }
  const backButton = (
    <Button
      variation="text"
      size="small"
      icon={<ChevronLeft />}
      iconAlign="left"
      onClick={handleBack}
      disabled={activeStep === 0}
    >
      Back
    </Button>
  )
  const nextButton = (
    <Button
      variation="text"
      size="small"
      icon={<ChevronRight />}
      onClick={handleNext}
      disabled={activeStep === maxSteps - 1}
    >
      Next
    </Button>
  )

  return (
    <div
      css={css`
        display: flex;
        flex-direction: row;
        justify-content: center;
      `}
    >
      <div
        css={css`
          padding: 0 0.75rem;
          max-width: 400px;
        `}
      >
        <div
          css={css`
            padding: 0.75rem 0;
            color: ${theme.colors.text.primary.primary};
          `}
        >
          {displayFeedback ? (
            <StepperFeedbackMessage message="Feedback message if slow load..." />
          ) : (
            steps[activeStep].label
          )}
        </div>
        <Divider />
        <div
          css={css`
            min-height: 240px;
            padding: 0.75rem 0;
          `}
        >
          {steps[activeStep].description}
          <br />
          <Button variation="text" onClick={() => setDisplayFeedback((data) => !data)}>
            {displayFeedback ? 'Hide' : 'Display'} feedback
          </Button>
        </div>
        <MobileStepper activeStep={activeStep} steps={maxSteps} nextButton={nextButton} backButton={backButton} />
      </div>
    </div>
  )
}
