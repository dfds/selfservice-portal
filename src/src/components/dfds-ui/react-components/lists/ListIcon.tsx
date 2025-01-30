import React from 'react'
import { css } from '@emotion/react'
import { theme } from '@dfds-ui/theme'

type Size = 'small' | 'medium' | 'large' | 'xl'

const { xs, s, m, l } = theme.spacing

const sizes = {
  small: xs,
  medium: s,
  large: m,
  xl: l,
}

type ListIconProps = {
  /**
   * Choose the needed icon.
   */
  icon: React.ElementType
  /**
   * Choose the size of the icon.
   */
  size?: Size
  /**
   * Choose the color of the icon.
   */
  color?: string
}

function getSize(size: Size = 'medium') {
  return sizes[size]
}

const listIconStyles = ({ size, color }: Partial<ListIconProps>) => css`
  width: auto;
  height: ${getSize(size)};
  min-width: ${getSize(size)};
  object-fit: contain;
  flex-shrink: 0;
  color: ${color};
  flex: 0;
  fill: ${color};
  margin: 0;
  &:not(:last-child) {
    margin-right: ${theme.spacing.xs};
  }
`

const ListIcon = ({ icon: Icon, size = 'large', color = theme.colors.text.dark.primary, ...rest }: ListIconProps) => {
  return <Icon css={listIconStyles({ size, color })} {...rest} />
}

export default ListIcon
