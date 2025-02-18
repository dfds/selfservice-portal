import React, { memo, useContext, ReactNode } from 'react'
import StepLabel from './StepLabel'
import StepButton from './StepButton'
import StepContent from './StepContent'
import StepContext from './StepContext'
import StepperContext from '../stepper/StepperContext'
import {
  stepWrapperHorizontalStyles,
  stepWrapperVerticalStyles,
  stepContentStyles,
  stepHeaderStyles,
} from './Step.styles'
import { StepperFeedbackMessage } from '../stepper-feedback-message'
export type StepProps = {
  /**
   * 	The position of the step
   */
  index: number
  /**
   * Step label
   */
  label?: string
  /**
   * 	Sets the step as active
   */
  active?: boolean
  /**
   * 	Sets the step as completed
   */
  completed?: boolean
  /**
   * If `true`, the step button will be disabled
   */
  disabled?: boolean
  /**
   * Should be Step sub-components, such as `StepContent` for the vertical variant
   */
  children?: ReactNode
  /**
   * Optional label. Is shown below the step label
   */
  optionalStepText?: string
  /**
   * Error step. Error icon will be showen in the step button
   */
  hasError?: boolean
  /**
   * Editing step. Editing icon wil be showen in the step button
   */
  isEditing?: boolean
  /**
   * The function is triggered when step button is clicked
   */
  handleStepClick?: () => void
}

const Step = ({
  index,
  label = '',
  active: activeProp,
  completed: completedProp,
  disabled = false,
  children,
  hasError = false,
  optionalStepText,
  isEditing = false,
  handleStepClick,
  ...props
}: StepProps) => {
  const { activeStep, orientation, sequential, stepFeedbackMessage } = useContext(StepperContext)
  let [active = false, completed = false] = [activeProp, completedProp]

  if (activeStep === index) active = activeProp !== undefined ? activeProp : true
  else if (sequential && activeStep > index) completed = completedProp !== undefined ? completedProp : true

  const contextValue = React.useMemo(
    () => ({ index, active, completed, disabled, hasError, isEditing }),
    [index, active, completed, disabled, hasError, isEditing]
  )

  const displayFeedbackCondition = orientation === 'vertical' && stepFeedbackMessage && activeStep === index

  return (
    <StepContext.Provider value={contextValue}>
      <div
        css={orientation === 'horizontal' ? stepWrapperHorizontalStyles : stepWrapperVerticalStyles}
        {...props}
        data-testid="step"
      >
        <div css={stepHeaderStyles} onClick={handleStepClick}>
          {displayFeedbackCondition ? (
            <StepperFeedbackMessage message={stepFeedbackMessage} />
          ) : (
            <>
              <StepButton {...props} />
              {label ? <StepLabel optionalStepText={optionalStepText}>{label}</StepLabel> : null}
            </>
          )}
        </div>
        {orientation === 'vertical' ? (
          <div css={stepContentStyles}>
            <StepContent>{children}</StepContent>
          </div>
        ) : null}
      </div>
    </StepContext.Provider>
  )
}

export default memo(Step)
