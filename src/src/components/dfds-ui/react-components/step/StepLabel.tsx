import React, { FC, ReactNode } from 'react'
import { css } from '@emotion/react'
import StepContext from './StepContext'
import { theme } from '@/components/dfds-ui/theme'

type StepLableTypes = {
  children: ReactNode
  optionalStepText?: ReactNode
}

const StepLabel: FC<StepLableTypes> = ({ children, optionalStepText }) => {
  const { completed, active } = React.useContext(StepContext)

  return (
    <div
      data-testid="step-label"
      css={css`
        display: flex;
        flex-direction: column;
        font-size: 16px;
        color: ${completed || active ? theme.colors.text.primary.primary : theme.colors.text.primary.secondary};
      `}
    >
      {children}
      <span
        css={css`
          font-size: 12px;
        `}
      >
        {optionalStepText ? optionalStepText : null}
      </span>
    </div>
  )
}

export default StepLabel
