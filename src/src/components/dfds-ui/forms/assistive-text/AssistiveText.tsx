import React from 'react'
import { css } from '@emotion/react'
import { typography } from '@/components/dfds-ui/typography'
import { theme } from '@/components/dfds-ui/theme'

export type AssistiveTextProps = {
  id?: string
  disabled?: boolean
  children: React.ReactNode
  className?: string
}

export const AssistiveText = ({ id, disabled = false, className, children }: AssistiveTextProps) => {
  return (
    <span
      id={id}
      className={className}
      css={css`
        ${typography.caption};
        color: ${theme.colors.text.primary.secondary};
        ${disabled &&
        css`
          color: ${theme.colors.text.primary.disabled};
        `}
      `}
    >
      {children}
    </span>
  )
}

export default AssistiveText
