import React from 'react'
import { css } from '@emotion/react'
import { theme } from '@dfds-ui/theme'

export type BadgeIconProps = {
  letter: string
  className?: string
}

export const BadgeIcon = ({ letter, className }: BadgeIconProps) => {
  return (
    <svg
      css={css`
        font-family: ${theme.fontFamilies.display};
      `}
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      focusable={false}
      className={className}
    >
      <circle cx="50%" cy="50%" r="50%" />
      <text textAnchor="middle" x="50%" y="50%" dy="0.325em" fontSize="0.875rem" fontWeight={200} fill="#fff">
        {letter.toUpperCase()}
      </text>
    </svg>
  )
}

export default BadgeIcon
