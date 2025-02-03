import React from 'react'
import { css } from '@emotion/react'
import { theme } from '@/dfds-ui/theme/src'
import { ie11MinHeightFix } from '../common/utils'
import { FlexBoxProps, flexBoxStyles } from '../flexbox/FlexBox'
import { dividerBorder } from '../divider'
import { PolymorphicComponentProps } from '../common/polymorphic'

export type ListItemProps = {
  /**
   * Will render the `ListItem` with a greater `min-height` and should be used when displaying multiple lines of text.
   */
  multiline?: boolean
  /**
   * Indicates that the `ListItem` is selected.
   */
  selected?: boolean
  /**
   * Render the 'ListItem` without min-height.
   */
  condensed?: boolean
  /**
   * Indicates that the `ListItem` can be focused.
   */
  tabIndex?: number
  /**
   * Add interactive styles to the `ListItem`.
   */
  clickable?: boolean
  /**
   * Add a divider to the `ListItem`. This will apply a border on the the `ListItem` only. If you need the indent/margin variants use
   * the `ListDivider` component instead.
   */
  divider?: boolean
  /**
   * Invoke the provided callback when the `ListItem` is clicked.
   */
  onClick?: () => void
  /**
   * Props controlling the flexbox.
   */
  flexBoxProps?: FlexBoxProps
  /**
   * className to be assigned to component.
   */
  className?: string
  children?: React.ReactNode
} & PolymorphicComponentProps

export const listItemStyles = ({
  multiline,
  selected,
  clickable,
  condensed,
  flexBoxProps,
  divider,
}: Partial<ListItemProps>) => {
  return css`
    ${flexBoxStyles(flexBoxProps)}
    text-decoration: none;
    text-align: left;
    /* button acts as an 'replace element' so we need additional styles to render it correctly */
    button& {
      width: 100%;
      box-sizing: border-box;
    }
    box-sizing: border-box;
    position: relative;
    padding: 0 ${condensed ? 0 : theme.spacing.s};
    padding-top: ${multiline ? theme.spacing.xs : 0};
    padding-bottom: ${multiline ? theme.spacing.xs : 0};
    border: none;
    min-height: ${condensed ? undefined : multiline ? '4.5rem' : theme.spacing.xl};
    ${ie11MinHeightFix(condensed ? undefined : multiline ? '3.5rem' : theme.spacing.xl)}

    background-color: ${theme.colors.surface.primary};
    color: ${theme.colors.secondary.main};

    ${divider && dividerBorder(false, 'bottom')}

    ${clickable &&
    css`
      ${theme.states.overlay(selected, { color: theme.colors.secondary.main, ignoreFocusVisibility: true })}
      &:hover svg {
        color: ${theme.colors.secondary.main};
        fill: ${theme.colors.secondary.main};
      }
    `}

    ${selected &&
    css`
      svg {
        color: ${theme.colors.secondary.main};
        fill: ${theme.colors.secondary.main};
      }
    `}
  `
}

const ListItem = ({
  children,
  multiline = false,
  condensed = false,
  selected = false,
  tabIndex,
  clickable = false,
  divider = false,
  onClick,
  as = 'span',
  flexBoxProps = { itemsCenter: true },
  ...rest
}: ListItemProps) => {
  const Component = as
  return (
    <Component
      onClick={onClick}
      tabIndex={clickable ? tabIndex || 0 : tabIndex}
      css={listItemStyles({ multiline, selected, clickable, condensed, flexBoxProps, divider })}
      {...rest}
    >
      {children}
    </Component>
  )
}

export default ListItem
