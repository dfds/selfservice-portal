import React from 'react'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { theme } from '@dfds-ui/theme'

type NavMenuItemProps = {
  isActive?: boolean
  leftIcon?: React.ElementType
  rightIcon?: React.ElementType
  as?: React.ElementType
  children: React.ReactNode
}

const Item = styled.li<Partial<NavMenuItemProps>>`
  display: flex;
  font-weight: bold;
  padding: 15px;
  flex: 1;
  background-color: ${({ isActive }) => (isActive ? theme.colors.secondary.light : theme.colors.surface.primary)};
`

const NavMenuItem: React.FunctionComponent<NavMenuItemProps> = ({
  isActive = false,
  leftIcon: Left,
  rightIcon: Right,
  as = 'li',
  children,
}) => {
  return (
    <Item as={as} tabIndex={0} isActive={isActive}>
      {Left && (
        <Left
          css={css`
            color: ${theme.colors.secondary.main};
            margin: 0 10px 0 5px;
          `}
        />
      )}
      <span
        css={css`
          flex: 1;
        `}
      >
        {children}
      </span>
      {Right && (
        <Right
          css={css`
            color: ${theme.colors.secondary.main};
            margin: 0 5px 0 10px;
          `}
        />
      )}
    </Item>
  )
}

export default NavMenuItem
