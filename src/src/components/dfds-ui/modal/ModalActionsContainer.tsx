import React from 'react'
import { theme } from '@/components/dfds-ui/theme'
import { css } from '@emotion/react'

export type ModalActionsProps = {
  /**
   * Actions to be displayed at the bottom of the modal
   */
  actions?: React.ReactNode
}

const ModalAction: React.FunctionComponent<{ className?: string }> = (props) => {
  return (
    <div
      css={css`
        display: flex;
        flex-wrap: nowrap;
        justify-content: flex-end;
        flex-grow: 1;
        padding-top: ${theme.spacing.s};
        padding-bottom: ${theme.spacing.s};
      `}
      {...props}
    />
  )
}

const ModalActionsContainer: React.FunctionComponent<ModalActionsProps> = ({ actions, ...rest }) => {
  return <div {...rest}>{actions && <ModalAction>{actions}</ModalAction>}</div>
}

export default ModalActionsContainer
