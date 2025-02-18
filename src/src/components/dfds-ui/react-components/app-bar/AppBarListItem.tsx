import styled from '@emotion/styled'
import { css } from '@emotion/react'
import ListItem from '../lists/ListItem'
import { theme } from '@/components/dfds-ui/theme'

const AppBarListItem = styled(ListItem)`
  &:active {
    color: ${theme.colors.secondary.main};
  }

  ${(p) =>
    p.selected &&
    css`
      background: ${theme.colors.surface.primary};
      color: ${theme.colors.secondary.main};
    `}

  ${(p) =>
    theme.states.overlay(p.selected, {
      color: theme.colors.secondary.main,
    })}
`

export default AppBarListItem
