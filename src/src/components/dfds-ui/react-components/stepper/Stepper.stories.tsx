import React from 'react'
import { css } from '@emotion/react'
import Stepper from './Stepper'
import { Step } from '../step'
import { Button } from '../button'
export const VerticalStepperWithFeedback = () => {
  const [activeStep, setActiveStep] = React.useState(0)
  const [displayFeedback, setDisplayFeedback] = React.useState(false)
  const steps = ['Your details', 'Confirmation', 'Payment']

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }
  const handleReset = () => {
    setActiveStep(0)
  }

  return (
    <div>
      <Stepper
        activeStep={activeStep}
        stepFeedbackMessage={displayFeedback ? 'Feedback message if slow load...' : ''}
        orientation="vertical"
      >
        {steps.map((step, index) => (
          <Step index={index} label={step} key={index} />
        ))}
      </Stepper>
      <div
        css={css`
          margin: 2em 0;
        `}
      >
        {steps[activeStep]}
      </div>
      <div>
        {activeStep === steps.length ? (
          <>
            <Button variation="link" onClick={handleReset}>
              Reset
            </Button>
          </>
        ) : (
          <>
            <Button type="submit" variation="text" onClick={handleBack} disabled={activeStep === 0}>
              Back
            </Button>
            <Button variation="text" onClick={handleNext}>
              {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
            </Button>
            <Button variation="text" onClick={() => setDisplayFeedback((data) => !data)}>
              {displayFeedback ? 'Hide' : 'Display'} feedback
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
export const HorizontalStepperWithFeedback = () => {
  const [activeStep, setActiveStep] = React.useState(0)
  const [displayFeedback, setDisplayFeedback] = React.useState(false)
  const steps = ['Your details', 'Confirmation', 'Payment']

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }
  const handleReset = () => {
    setActiveStep(0)
  }

  return (
    <div>
      <Stepper activeStep={activeStep} stepFeedbackMessage={displayFeedback ? 'Feedback message if slow load...' : ''}>
        {steps.map((step, index) => (
          <Step index={index} label={step} key={index} />
        ))}
      </Stepper>
      <div
        css={css`
          margin: 2em 0;
        `}
      >
        {steps[activeStep]}
      </div>
      <div>
        {activeStep === steps.length ? (
          <>
            <Button variation="link" onClick={handleReset}>
              Reset
            </Button>
          </>
        ) : (
          <>
            <Button type="submit" variation="text" onClick={handleBack} disabled={activeStep === 0}>
              Back
            </Button>
            <Button variation="text" onClick={handleNext}>
              {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
            </Button>
            <Button variation="text" onClick={() => setDisplayFeedback((data) => !data)}>
              {displayFeedback ? 'Hide' : 'Display'} feedback
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
export const HorizontalStepper = () => {
  const [activeStep, setActiveStep] = React.useState(0)

  const steps = ['Your details', 'Confirmation', 'Payment']

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }
  const handleReset = () => {
    setActiveStep(0)
  }

  return (
    <div>
      <Stepper activeStep={activeStep}>
        {steps.map((step, index) => (
          <Step index={index} label={step} key={index} />
        ))}
      </Stepper>
      <div
        css={css`
          margin: 2em 0;
        `}
      >
        {steps[activeStep]}
      </div>
      <div>
        {activeStep === steps.length ? (
          <>
            <Button variation="link" onClick={handleReset}>
              Reset
            </Button>
          </>
        ) : (
          <>
            <Button type="submit" variation="text" onClick={handleBack} disabled={activeStep === 0}>
              Back
            </Button>
            <Button variation="text" onClick={handleNext}>
              {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
export const VerticalStepper = () => {
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
  const [activeStep, setActiveStep] = React.useState(0)

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }
  const handleReset = () => {
    setActiveStep(0)
  }
  return (
    <div>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step index={index} label={step.label} key={index}>
            {step.description}
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length ? (
        <Button onClick={handleReset} variation="text">
          Reset
        </Button>
      ) : (
        <>
          {activeStep === steps.length ? (
            <Button onClick={handleReset} variation="text">
              Reset
            </Button>
          ) : (
            <>
              <Button type="submit" variation="secondary" onClick={handleNext}>
                {activeStep === steps.length - 1 ? 'Finish' : 'Continue'}
              </Button>
              <Button variation="text" onClick={handleBack} disabled={activeStep === 0}>
                Back
              </Button>
              <Button variation="link" size="small" onClick={handleReset} disabled={activeStep === 0}>
                cancel
              </Button>
            </>
          )}
        </>
      )}
    </div>
  )
}

export const SequentialStepper = () => {
  const [activeStep, setActiveStep] = React.useState(0)
  const [skipped, setSkipped] = React.useState(new Set<number>())

  const isStepOptional = (step: number) => {
    return step === 1
  }

  const isStepSkipped = (step: number) => {
    return skipped.has(step)
  }

  const handleNext = () => {
    let newSkipped = skipped
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values())
      newSkipped.delete(activeStep)
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1)
    setSkipped(newSkipped)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.")
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1)
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values())
      newSkipped.add(activeStep)
      return newSkipped
    })
  }

  const handleReset = () => {
    setActiveStep(0)
  }
  const steps = ['Your details', 'Confirmation', 'Payment']

  return (
    <div>
      <Stepper activeStep={activeStep}>
        {steps.map((step, index) => {
          const stepProps: { completed?: boolean; optionalStepText?: string } = {}

          if (isStepOptional(index)) {
            stepProps.optionalStepText = 'optional'
          }
          if (isStepSkipped(index)) {
            stepProps.completed = false
          }
          return <Step index={index} label={step} key={index} {...stepProps} />
        })}
      </Stepper>
      <p>{activeStep === steps.length ? 'All steps completed - you are finished' : steps[activeStep]}</p>
      {activeStep === steps.length ? (
        <Button variation="link" onClick={handleReset}>
          Reset
        </Button>
      ) : (
        <>
          <Button type="submit" variation="text" onClick={handleBack} disabled={activeStep === 0}>
            Back
          </Button>
          <Button variation="text" onClick={handleNext}>
            {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
          </Button>
          {isStepOptional(activeStep) && (
            <Button type="submit" size="small" variation="text" onClick={handleSkip}>
              Skip
            </Button>
          )}
        </>
      )}
    </div>
  )
}

export const NonSequentialStepper = () => {
  const [activeStep, setActiveStep] = React.useState(0)
  const [completed, setCompleted] = React.useState<{
    [k: number]: boolean
  }>({})
  const handleComplete = () => {
    const newCompleted = completed
    newCompleted[activeStep] = true
    setCompleted(newCompleted)
    handleNext()
  }
  const steps = ['Your details', 'Confirmation', 'Payment']
  const isLastStep = () => {
    return activeStep === totalSteps() - 1
  }
  const completedSteps = (): number => {
    return Object.keys(completed).length
  }
  const totalSteps = (): number => {
    return steps.length
  }
  const allStepsCompleted = (): boolean => {
    return completedSteps() === totalSteps()
  }
  const handleNext = () => {
    const newActiveStep =
      isLastStep() && !allStepsCompleted() ? steps.findIndex((_, i) => !(i in completed)) : activeStep + 1
    setActiveStep(newActiveStep)
  }
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }
  const handleReset = () => {
    setActiveStep(0)
    setCompleted({})
  }
  const handleStep = (step: number) => {
    setActiveStep(step)
  }
  return (
    <div>
      <Stepper activeStep={activeStep} sequential={false}>
        {steps.map((step, index) => (
          <Step
            index={index}
            label={step}
            key={index}
            completed={completed[index]}
            handleStepClick={() => handleStep(index)}
          />
        ))}
      </Stepper>
      <div
        css={css`
          margin-top: 24px;
        `}
      >
        <p>{allStepsCompleted() ? 'All steps completed - you are finished' : steps[activeStep]}</p>
        {activeStep === steps.length || allStepsCompleted() ? (
          <Button onClick={handleReset} variation="text">
            Reset
          </Button>
        ) : (
          <>
            {activeStep !== steps.length &&
              (completed[activeStep] ? (
                <span>Step {activeStep + 1} already completed</span>
              ) : (
                <Button variation="secondary" onClick={handleComplete}>
                  {allStepsCompleted() ? 'Finish' : 'Complete'}
                </Button>
              ))}
            <Button variation="text" onClick={handleBack} disabled={activeStep === 0}>
              Back
            </Button>
            <Button variation="link" size="small" onClick={handleNext} disabled={activeStep === steps.length - 1}>
              Skip
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

export const StepStates = () => {
  const [activeStep] = React.useState(0)

  const isStepCompleted = (step: number) => {
    return step === 0
  }
  const isStepActive = (step: number) => {
    return step === 1
  }
  const isStepError = (step: number) => {
    return step === 3
  }
  const isStepEditing = (step: number) => {
    return step === 4
  }
  const steps = ['Completed', 'Active', 'Index', 'hasError', 'isEditing']

  return (
    <div>
      <Stepper activeStep={activeStep}>
        {steps.map((step, index) => {
          const stepProps: {
            completed?: boolean
            hasError?: boolean
            active?: boolean
            isEditing?: boolean
          } = {}
          if (isStepError(index)) {
            stepProps.hasError = true
          }
          if (isStepCompleted(index)) {
            stepProps.completed = true
          }
          if (isStepEditing(index)) {
            stepProps.isEditing = true
          }
          if (isStepActive(index)) {
            stepProps.active = true
          }
          return <Step index={index} label={step} key={index} {...stepProps} />
        })}
      </Stepper>
    </div>
  )
}
