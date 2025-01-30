import React, { ReactNode, Fragment } from 'react'
import { css } from '@emotion/react'
import { theme } from '@dfds-ui/theme'
import Divider from '../divider/Divider'

export type ModalHeaderProps = {
  className?: string
  sticky?: boolean
  children?: ReactNode
  noDivider?: boolean
}

export const SideSheetHeader = ({ children, className, sticky, noDivider = false, ...rest }: ModalHeaderProps) => {
  return (
    <Fragment>
      <div
        className={className}
        css={css`
          min-height: 3rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-left: ${theme.spacing.s};
          background-color: ${theme.colors.surface.primary};
        `}
        {...rest}
      >
        {children}
      </div>
      {!noDivider && <Divider />}
    </Fragment>
  )
}

export default SideSheetHeader
