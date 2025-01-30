import React from 'react'
import { IconButton, IconButtonSize } from '@dfds-ui/react-components'
import { Close } from '@dfds-ui/icons/system'
import { css } from '@emotion/react'
import { theme } from '@/components/dfds-ui/theme'

export type ModalCloseButtonProps = {
  onRequestClose?: () => void
  className?: string
  icon?: React.ElementType
  size?: IconButtonSize
  tabIndex?: number
  closeLabel?: string
  children?: React.ReactNode
}

export const ModalCloseButton = ({
  onRequestClose,
  className,
  icon = Close,
  size = 'medium',
  closeLabel = 'Close',
  ...rest
}: ModalCloseButtonProps) => {
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

export default ModalCloseButton
