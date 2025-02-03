import React, { ReactNode } from 'react'
import { css } from '@emotion/react'
import { theme } from '@/dfds-ui/theme/src'

type MobileStepperProps = {
  /**
   *   Total steps
   */
  steps: number
  /**
   *   Active step
   */
  activeStep?: number
  /**
   * A back button element. For instance, it can be a `Button` or an `IconButton`.
   */
  backButton?: ReactNode
  /**
   * A next button element. For instance, it can be a `Button` or an `IconButton`.
   */
  nextButton?: ReactNode
  /**
   * 	The variant to use `'text' | 'dots'`
   */
  variant?: 'text' | 'dots'
}

const MobileStepperWrapperStyles = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`
const MobileStepperDot = ({ active }: { active: boolean }) => {
  return (
    <div
      data-testid="mobile-stepper-dot"
      css={css`
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: ${active ? theme.colors.secondary.main : theme.colors.text.primary.disabled};
      `}
    ></div>
  )
}
const MobileStepperDots = ({ children }: { children: ReactNode }) => {
  return (
    <div
      data-testid="mobile-stepper-dots"
      css={css`
        display: flex;
        gap: 4px;
      `}
    >
      {children}
    </div>
  )
}
const MobileStepper = ({
  steps,
  activeStep = 0,
  backButton,
  nextButton,
  variant = 'text',
  ...props
}: MobileStepperProps) => {
  return (
    <div css={MobileStepperWrapperStyles} {...props} data-testid="mobile-stepper">
      {backButton}
      {variant === 'text' ? (
        `${activeStep + 1} / ${steps}`
      ) : (
        <MobileStepperDots>
          {[...new Array(steps)].map((_, index) => (
            <MobileStepperDot key={index} active={activeStep === index} />
          ))}
        </MobileStepperDots>
      )}
      {nextButton}
    </div>
  )
}

export default MobileStepper
