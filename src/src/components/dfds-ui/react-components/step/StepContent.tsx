import React, { ReactNode } from 'react'
import { css } from '@emotion/react'
import { Accordion } from '../accordion'
import StepContext from '../step/StepContext'

type StepContentProps = {
  /*
   * 	The content of the component
   */
  children: ReactNode
}

const StepContent = ({ children }: StepContentProps) => {
  const { active } = React.useContext(StepContext)
  return (
    <div
      data-testid="step-content"
      css={css`
        padding-top: 8px;
      `}
    >
      <Accordion
        isOpen={active}
        css={css`
          & .accordion__content {
            padding: 0;
            background-color: inherit;
          }
        `}
        header={<div></div>}
        type="small"
      >
        {children}
      </Accordion>
    </div>
  )
}

export default StepContent
