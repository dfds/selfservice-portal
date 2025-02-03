import React, { ReactNode } from 'react'
import { SmallHeadline } from '@/dfds-ui/react-components/src'
import { css } from '@emotion/react'
import { theme } from '@/dfds-ui/theme/src'

export type ModalHeadlineProps = {
  className?: string
  children?: ReactNode
}

export const ModalHeadline = ({ className, children }: ModalHeadlineProps) => {
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

export default ModalHeadline
