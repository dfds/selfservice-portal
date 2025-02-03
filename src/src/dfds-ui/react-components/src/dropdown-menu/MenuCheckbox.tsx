import React from 'react'
import { theme } from '@/dfds-ui/theme/src'
import { css } from '@emotion/react'
import { ListItem, ListText } from '../lists'
import { Checkbox } from '../forms/checkbox'
import useDropdownContext from './DropdownContext'
import { getListItemStyle, getListTextStyle } from './MenuItem'

export interface MenuCheckboxProps {
  /**
   * HTML tag or custom component being rendered.
   */
  as?: React.ElementType
  /**
   * Override the default color for the text.
   */
  color?: string
  /**
   * Indicates that the `MenuCheckbox` is disabled.
   */
  disabled?: boolean
  /**
   * Invoke the provided callback when the `MenuCheckbox` is clicked.
   */
  onClick?: () => void
  /**
   * Indicates that the `MenuCheckbox` is selected.
   */
  selected?: boolean
  /**
   * Add interactive styles to the `MenuCheckbox`.
   */
  clickable?: boolean
  /**
   * className to be assigned to component.
   */
  className?: string
  children?: React.ReactNode
}

const checkboxStyle = css`
  i > svg > path {
    color: ${theme.colors.surface.primary};
    fill: ${theme.colors.surface.primary};
  }
  margin-right: ${theme.spacing.xs};
`

const MenuCheckbox = ({
  color = theme.colors.text.dark.primary,
  children,
  disabled,
  as = 'span',
  onClick,
  selected,
  clickable,
  className,
}: MenuCheckboxProps) => {
  const { size } = useDropdownContext()
  const handleEvent = (): void => {
    onClick && onClick()
  }

  return (
    <ListItem
      as={as}
      className={className}
      onClick={onClick}
      selected={selected}
      clickable
      {...(!disabled && {
        clickable: clickable,
        onClick: onClick,
        onKeyPress: (event: React.KeyboardEvent) => event.key === 'Enter' && handleEvent(),
      })}
      css={css`
        ${getListItemStyle(size, disabled)}
      `}
    >
      <Checkbox
        size="small"
        tabIndex={-1}
        checked={selected}
        css={checkboxStyle}
        onChange={onClick}
        disabled={disabled}
      />
      <ListText
        styledAs="body"
        color={color}
        css={css`
          ${getListTextStyle(size)}
        `}
      >
        {children}
      </ListText>
    </ListItem>
  )
}

export default MenuCheckbox
