import React from 'react'
import { css } from '@emotion/react'
import { theme } from '@/components/dfds-ui/theme'

export type AsteriskProps = {
  /**
   * Class name to be assigned to the component
   */
  className?: string
}

export const Asterisk = ({ ...props }) => {
  return (
    <span
      css={css`
        color: ${theme.colors.text.secondary.primary};
        padding-left: 0.25rem;
      `}
      {...props}
    >
      *
    </span>
  )
}

export default Asterisk
