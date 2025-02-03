import React from 'react'
import { css } from '@emotion/react'
import { theme } from '@/dfds-ui/theme/src'
import { ListItem, ListText } from '../lists'
import useDropdownContext from './DropdownContext'
import { getListItemStyle } from './MenuItem'
import { DropdownSize } from './Dropdown'

export interface MenuTitleProps {
  /**
   * Change the color of the text.
   */
  color?: string
  /**
   * className to be assigned to component.
   */
  className?: string
  children?: React.ReactNode
}

const getTextStyle = (size?: DropdownSize) => {
  if (size === 'small') {
    return css`
      font-size: 12px;
    `
  } else {
    return css`
      font-size: ${theme.spacing.s};
    `
  }
}

const MenuTitle = ({ color = theme.colors.primary.main, children, className }: MenuTitleProps) => {
  const { size } = useDropdownContext()

  return (
    <span tabIndex={-1}>
      <ListItem
        className={className}
        css={css`
          ${getListItemStyle(size)}
        `}
      >
        <ListText
          styledAs="smallHeadline"
          css={css`
            ${getTextStyle(size)}
          `}
          color={color}
        >
          {children}
        </ListText>
      </ListItem>
    </span>
  )
}

export default MenuTitle
