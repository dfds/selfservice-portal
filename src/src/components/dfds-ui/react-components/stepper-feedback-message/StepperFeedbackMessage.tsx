import { css } from '@emotion/react'
import React from 'react'
import Spinner from '../spinner/Spinner'

const StepperFeedbackMessage = ({ message }: { message: string }) => {
  return (
    <div
      data-testid="stepper-feedback-message"
      css={css`
        display: flex;
        align-items: center;
        gap: 8px;
      `}
    >
      <Spinner color="secondary" />
      <span>{message}</span>
    </div>
  )
}

export default StepperFeedbackMessage
