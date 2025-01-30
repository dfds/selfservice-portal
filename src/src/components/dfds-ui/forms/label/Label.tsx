import React, { ReactNode } from 'react'
import { css } from '@emotion/react'
import { typography } from '@/components/dfds-ui/typography'
import { theme } from '@/components/dfds-ui/theme'
import { Size } from '../types'
import { Asterisk } from '../asterisk/Asterisk'

export type LabelProps = {
  children: ReactNode
  className?: string
  hideAsterisk?: boolean
  required?: boolean
  visualSize?: Size
  disabled?: boolean
} & React.DetailedHTMLProps<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>

export const Label = ({
  visualSize = 'medium',
  required = false,
  hideAsterisk = false,
  disabled = false,
  className,
  children,
  ...rest
}: LabelProps) => {
  return (
    <label
      className={className}
      css={css`
        color: ${theme.colors.text.primary.primary};
        text-align: left;
        ${visualSize === 'small' ? typography.labelSmall : typography.label};
        ${disabled &&
        css`
          color: ${theme.colors.text.primary.disabled};
        `};
      `}
      {...rest}
    >
      {children}
      {required && !hideAsterisk && <Asterisk />}
    </label>
  )
}
