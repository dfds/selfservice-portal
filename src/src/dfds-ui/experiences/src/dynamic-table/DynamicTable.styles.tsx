import { theme } from '@/dfds-ui/theme/src'
import { css } from '@emotion/react'

type TableWrapperProps = {
  height?: string
}

export const tableWrapperStyles = ({ height }: TableWrapperProps) => css`
  color: ${theme.colors.text.primary};
  display: flex;
  flex-direction: column;
  overflow-x: auto;
  width: 100%;

  ${height &&
  `
    height: ${height};
    overflow-y: auto;
  `};
`

export const tableStyles = css`
  background-color: ${theme.colors.surface.primary};
  font-family: Verdana, sans-serif;
  font-size: 12px;
  line-height: 16px;
  width: 100%;
`
