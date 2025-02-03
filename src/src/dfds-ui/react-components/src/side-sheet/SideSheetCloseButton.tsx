import React from 'react'
import { Close } from '@/dfds-ui/icons/src/system'
import { css } from '@emotion/react'
import { theme } from '@/dfds-ui/theme/src'
import IconButton, { IconButtonSize } from '../button/IconButton'

export type SideSheetCloseButtonProps = {
  onRequestClose?: () => void
  className?: string
  icon?: React.ElementType
  size?: IconButtonSize
  tabIndex?: number
  closeLabel?: string
  children?: React.ReactNode
}

export const SideSheetCloseButton = ({
  onRequestClose,
  className,
  icon = Close,
  size = 'medium',
  closeLabel = 'Close',
  ...rest
}: SideSheetCloseButtonProps) => {
  return (
    <IconButton
      disableOverlay
      disableTooltip
      hoverColor={theme.colors.secondary.main}
      size={size}
      css={css`
        align-self: flex-start;
        color: ${theme.colors.text.primary.primary};
        height: 3rem;
        width: 3rem;
        &:active {
          color: ${theme.colors.secondary.dark};
        }
      `}
      className={className}
      onClick={onRequestClose}
      icon={icon}
      ariaLabel={closeLabel}
      data-testid="modal-close"
      type="button"
      {...rest}
    />
  )
}

export default SideSheetCloseButton
