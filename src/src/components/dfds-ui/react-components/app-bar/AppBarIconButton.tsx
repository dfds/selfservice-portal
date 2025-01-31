import React from 'react'
import { IconButton } from '../button'
import { theme } from '@/components/dfds-ui/theme'
import { css } from '@emotion/react'

type AppBarIconButtonProps = {
  isActive?: boolean
  ariaLabel: string
  icon: React.ElementType
  showTooltip?: boolean
  onClick?: (event: React.MouseEvent) => void
}

function iconButtonStyles({ isActive }: { isActive?: boolean }) {
  return css`
    height: 100%;
    font-size: 1.5rem;
    position: relative;
    color: ${theme.colors.primary.main};
    padding: 0 0.75rem;

    &:hover {
      color: ${theme.colors.primary.main};
    }

    &:active,
    &:hover,
    &:focus {
      outline: none;
      border: none;
      padding: 0 0.75rem;
    }

    &:active {
      color: ${theme.colors.secondary.main};
    }

    ${theme.states.overlay(isActive, {
      color: theme.colors.secondary.main,
    })}
  `
}

const AppBarIconButton: React.FC<AppBarIconButtonProps> = ({ isActive, ariaLabel, showTooltip = true, ...rest }) => {
  return (
    <IconButton
      css={iconButtonStyles({ isActive: isActive })}
      ariaLabel={ariaLabel}
      disableTooltip={!showTooltip}
      {...rest}
    />
  )
}

export default AppBarIconButton
