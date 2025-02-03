import React from 'react'
import { css } from '@emotion/react'
import { theme } from '@/dfds-ui/theme/src'
import { ListItem, ListText, ListIcon } from '../lists'
import useDropdownContext from './DropdownContext'
import { DropdownSize } from './Dropdown'

export interface MenuItemProps {
  /**
   * HTML tag or custom component being rendered.
   */
  as?: React.ElementType
  /**
   * Invoke the provided callback when the `MenuItem` is clicked.
   */
  onClick?: (event?: any) => void
  /**
   * Indicates that the `MenuItem` is selected.
   */
  selected?: boolean
  /**
   * Indicates that the `MenuItem` is disabled.
   */
  disabled?: boolean
  /**
   * Add interactive styles to the `MenuItem`.
   */
  clickable?: boolean
  /**
   * Override the default color for the text.
   */
  color?: string
  /**
   * Choose an icon that will be left aligned.
   */
  iconLeft?: React.ElementType
  /**
   * Choose an icon that will be right aligned.
   */
  iconRight?: React.ElementType
  /**
   * className to be assigned to component.
   */
  className?: string
  children?: React.ReactNode
}

const svgDisabled = css`
  svg > path {
    color: ${theme.colors.text.dark.disabled};
    fill: ${theme.colors.text.dark.disabled};
  }
  span {
    color: ${theme.colors.text.dark.disabled};
  }
`

const userHoverDisabled = css`
  user-select: none;
  cursor: not-allowed;
  pointer-events: none;
`

const containerStyle = css`
  max-height: ${theme.spacing.l};
  min-height: ${theme.spacing.l};
  min-width: 96px;
  max-width: 288px;
  width: auto;
  padding: ${theme.spacing.xs};
`

export const getListItemStyle = (size?: DropdownSize, disabled?: boolean) => {
  if (size === 'small' && disabled) {
    return css`
      ${containerStyle}
      ${userHoverDisabled}
      ${svgDisabled}
    `
  } else if (disabled) {
    return css`
      ${userHoverDisabled}
      ${svgDisabled}
    `
  } else if (size === 'small') {
    return css`
      ${containerStyle}
    `
  } else {
    return css``
  }
}

export const getListTextStyle = (size?: DropdownSize) => {
  if (size === 'small') {
    return css`
      font-size: 12px;
    `
  } else {
    return css``
  }
}

const getListIconStyle = (multiselect?: boolean, selected?: boolean, size?: DropdownSize) => {
  if (!selected && multiselect) {
    return css`
      display: none;
    `
  } else if (size === 'small') {
    return css`
      width: 20px;
      height: 20px;
      min-height: 20px;
      min-width: 20px;
    `
  } else {
    return css`
      display: block;
    `
  }
}

const MenuItem = ({
  as = 'span',
  clickable,
  className,
  onClick,
  selected,
  disabled,
  children,
  color = theme.colors.text.dark.primary,
  iconLeft,
  iconRight,
  ...rest
}: MenuItemProps) => {
  const { size, multiselect } = useDropdownContext()
  const [isSelected, setIsSelected] = React.useState(selected)

  const handleMultiselectEvent = (event: any) => {
    if (event.key === 'Enter') {
      onClick && setIsSelected(!isSelected)
    }
  }
  const handleEvent = (event: any) => {
    if (event.key === 'Enter') {
      onClick && onClick()
    }
  }

  return (
    <ListItem
      as={as}
      className={className}
      selected={selected}
      onClick={onClick}
      clickable
      {...((!disabled &&
        multiselect && {
          clickable: clickable,
          onClick: onClick,
          onKeyPress: (event: React.KeyboardEvent) => handleMultiselectEvent(event),
        }) ||
        (!disabled && {
          clickable: clickable,
          onClick: onClick,
          onKeyPress: (event: React.KeyboardEvent) => handleEvent(event),
        }) ||
        (disabled && {
          tabIndex: -1,
        }))}
      css={css`
        ${getListItemStyle(size, disabled)}
      `}
      {...rest}
    >
      {iconLeft && <ListIcon css={getListIconStyle(multiselect, selected, size)} icon={iconLeft} />}
      <ListText
        styledAs="body"
        color={color}
        css={css`
          ${getListTextStyle(size)}
        `}
      >
        {children}
      </ListText>
      {iconRight && <ListIcon css={getListIconStyle(multiselect, selected, size)} icon={iconRight} />}
    </ListItem>
  )
}

export default MenuItem
