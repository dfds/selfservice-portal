import React, { ReactNode, useState } from 'react'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { theme } from '@/components/dfds-ui/theme'
import { typography } from '@/components/dfds-ui/typography'
import { Clear } from '@/components/dfds-ui/icons/system'

type InteractionEvent = React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>

export type ChipProps = {
  children: ReactNode
  dismissable?: boolean
  disabled?: boolean
  selectable?: boolean
  selected?: boolean
  onToggle?: (event: InteractionEvent) => void
  onDismiss?: (event: InteractionEvent) => void
  tabIndex?: number
  className?: string
}

const Text = styled.span<{ dismissable?: boolean }>`
  ${typography.action};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  padding: 0 0.5rem;
  line-height: normal;
`

const DismissIcon = styled.div<{ selected?: boolean }>`
  min-width: 32px;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  height: 2rem;
  position: relative;
  overflow: hidden;
  color: ${theme.colors.text.light.secondary};
  border-radius: 0 ${theme.radii.m} ${theme.radii.m} 0;

  ${(props) => theme.states.overlay(props.selected)};

  & > svg {
    position: relative;
    z-index: 5;
    &:hover,
    &:active {
      color: ${theme.colors.text.light.primary};
      cursor: pointer;
    }
  }
`

const transitionProps = ['background', 'color', 'border']

const Chip = styled.div<{
  dismissable?: boolean
  disabled?: boolean
  selectable?: boolean
  selected?: boolean
}>`
  display: inline-flex;
  align-items: center;
  position: relative;
  max-width: 100%;
  height: 2rem;
  background: ${theme.colors.primary.main};
  color: ${theme.colors.text.light.primary};
  border-radius: ${theme.radii.m};
  position: relative;
  outline: none;
  transition: ${transitionProps.map((prop) => `${prop} 0.05s ease-in`).join(',')};
  margin: ${theme.spacing.xxs};

  ${(p) =>
    p.disabled &&
    css`
      background: ${theme.colors.text.primary.disabled};
      cursor: not-allowed;
    `}

  ${({ selected, selectable }) =>
    selectable &&
    css`
      border: ${theme.borders.widths.s} solid ${theme.colors.secondary.main};
      background: transparent;
      color: ${theme.colors.secondary.main};
      cursor: pointer;

      ${theme.states.overlay(selected)};

      ${selected &&
      css`
        background: ${theme.colors.secondary.main};
        color: ${theme.colors.text.light.primary};
        border-color: transparent;

        &:hover,
        &:focus {
          color: ${theme.colors.text.light.primary};
          border-color: transparent;
        }
      `}
    `}

  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 0.3;
      cursor: not-allowed;
    `}
`

export const ChipContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`

export default ({
  children,
  dismissable = false,
  disabled = false,
  selectable = false,
  selected = false,
  onToggle,
  onDismiss,
  className,
  ...rest
}: ChipProps) => {
  const [isSelected, setIsSelected] = useState(selected)
  if (selected !== isSelected) setIsSelected(selected)

  const toggleSelected = (event: InteractionEvent) => {
    if (!disabled) {
      if (onToggle !== undefined) {
        onToggle(event)
      }
      setIsSelected(!isSelected)
    }
  }

  const handleDismiss = (event: InteractionEvent) => {
    if (dismissable && onDismiss !== undefined) {
      onDismiss(event)
    }
  }

  const handleKeyPress = (event: InteractionEvent): void => {
    toggleSelected(event)
    handleDismiss(event)
  }

  return (
    <Chip
      className={className}
      tabIndex={0}
      disabled={disabled}
      selectable={selectable}
      {...(!disabled && {
        onClick: (event) => selectable && toggleSelected(event),
        onKeyPress: (event) => event.key === 'Enter' && handleKeyPress(event),
      })}
      selected={selectable && isSelected}
      {...rest}
    >
      <Text dismissable={dismissable}>{children}</Text>
      {dismissable && <DismissIcon onClick={handleDismiss}>{<Clear />}</DismissIcon>}
    </Chip>
  )
}
