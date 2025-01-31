import React, { ReactNode } from 'react'
import { css } from '@emotion/react'
import { theme } from '@/components/dfds-ui/theme'
import { SmallHeadline } from '../typography/Headlines'

export type SideSheetHeadlineProps = {
  className?: string
  children?: ReactNode
}

export const SideSheetHeadline = ({ className, children }: SideSheetHeadlineProps) => {
  return (
    <SmallHeadline
      css={css`
        color: ${theme.colors.primary.dark};
        margin: 0.625rem 0;
      `}
      className={className}
    >
      {children}
    </SmallHeadline>
  )
}

export default SideSheetHeadline
