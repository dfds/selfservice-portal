import React, { ReactNode, memo } from 'react'
import { css } from '@emotion/react'
import StepperContext from './StepperContext'
import { StepperFeedbackMessage } from '../stepper-feedback-message'
export type StepperProps = {
  /**
   * Stepper layout orientation `'horizontal' | 'vertical'`
   */
  orientation?: 'horizontal' | 'vertical'
  /**
   * Multiple `<Step/>` components
   */
  children: ReactNode
  /**
   *  The initial step
   */
  activeStep?: number
  /**
   *  If set the component will not assist in controlling steps for sequential flow
   */
  sequential?: boolean
  /**
   * A feedback message can be passed to display a transitory feedback message as the step label
   */
  stepFeedbackMessage?: string
}

const stepperWrapperHorizontalStyles = css`
  display: flex;
  justify-content: space-between;
`

const StepperWrapperVerticalStyles = css`
  display: flex;
  flex-direction: column;
`

const StepperProvider = ({
  children,
  activeStep = 0,
  sequential = true,
  orientation = 'horizontal',
  stepFeedbackMessage,
  ...other
}: StepperProps) => {
  type CloneProp = {
    index: number
  }

  const childrenArray = React.Children.toArray(children).filter(Boolean)
  const steps = childrenArray.map((child, index) => {
    return React.cloneElement(child as React.ReactElement<CloneProp>, {
      index: index,
      ...(child as React.ReactElement<any>).props,
    })
  })

  const contextValue = React.useMemo(
    () => ({ activeStep, sequential, orientation, stepFeedbackMessage }),
    [activeStep, sequential, orientation, stepFeedbackMessage]
  )

  const displayFeedbackCondition = stepFeedbackMessage && orientation === 'horizontal'
  return (
    <StepperContext.Provider value={contextValue}>
      <div
        css={orientation === 'horizontal' ? stepperWrapperHorizontalStyles : StepperWrapperVerticalStyles}
        {...other}
      >
        {displayFeedbackCondition ? <StepperFeedbackMessage message={stepFeedbackMessage} /> : steps}
      </div>
    </StepperContext.Provider>
  )
}

export default memo(StepperProvider)
