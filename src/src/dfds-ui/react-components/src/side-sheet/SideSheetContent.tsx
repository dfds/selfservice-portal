import React, { ReactNode, Fragment } from 'react'
import { css } from '@emotion/react'
import { theme } from '@/dfds-ui/theme/src'

export type SideSheetFooterProps = {
  className?: string
  children?: ReactNode
}

export const SideSheetContent = ({ children, className, ...rest }: SideSheetFooterProps) => {
  return (
    <Fragment>
      <div
        className={className}
        css={css`
          padding: ${theme.spacing.s};
          overflow: auto;
          flex: 1 1 auto;
        `}
        {...rest}
      >
        {children}
      </div>
    </Fragment>
  )
}

export default SideSheetContent
