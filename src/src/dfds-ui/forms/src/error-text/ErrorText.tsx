import React from 'react'
import { css } from '@emotion/react'
import { typography } from '@/dfds-ui/typography/src'
import { theme } from '@/dfds-ui/theme/src'

export type ErrorTextProps = {
  id?: string
  children: React.ReactNode
  className?: string
}

export const ErrorText = ({ id, className, children }: ErrorTextProps) => {
  return (
    <span
      id={id}
      className={className}
      css={css`
        ${typography.caption};
        color: ${theme.colors.status.alert};
      `}
      role="alert"
    >
      {children}
    </span>
  )
}

export default ErrorText
