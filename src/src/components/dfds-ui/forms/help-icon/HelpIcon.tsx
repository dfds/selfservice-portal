import React from 'react'
import { css } from '@emotion/react'
import { Help } from '@dfds-ui/icons/system'
import { theme } from '@/components/dfds-ui/theme'
import { UnstableWithTooltip } from '@/components/dfds-ui/react-components/tooltip'

export type HelpIconProps = {
  content: string
  className?: string
  disabled?: boolean
}

export const HelpIcon = ({ content, className, disabled }: HelpIconProps) => {
  return (
    <UnstableWithTooltip content={content}>
      <Help
        css={css`
          font-size: 1.25rem;
          color: ${disabled ? theme.colors.text.primary.disabled : theme.colors.text.dark.secondary};
        `}
        className={className}
      />
    </UnstableWithTooltip>
  )
}

export default HelpIcon
