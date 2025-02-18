import React, { ReactNode, Fragment } from 'react'
import { css } from '@emotion/react'
import { theme } from '@/components/dfds-ui/theme'

export type SideSheetFooterProps = {
  className?: string
  children?: ReactNode
}

export const SideSheetFooter = ({ children, className, ...rest }: SideSheetFooterProps) => {
  return (
    <Fragment>
      <div
        className={className}
        css={css`
          flex: 0 0 auto;
          display: flex;
          padding: ${theme.spacing.s};
        `}
        {...rest}
      >
        {children}
      </div>
    </Fragment>
  )
}

export default SideSheetFooter
