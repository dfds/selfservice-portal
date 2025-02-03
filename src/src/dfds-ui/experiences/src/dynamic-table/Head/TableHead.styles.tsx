import { theme } from '@/dfds-ui/theme/src'
import { css } from '@emotion/react'

import {
  ChevronProps,
  GenericTableHeadCellProps,
  TableHeadCellCheckboxProps,
  TableHeadCellProps,
} from './TableHead.types'

import { genericTableCellStyles } from '../Body/TableCell.styles'

const genericTableHeadCellStyles = ({ sortable, sortByKey, stickyHeader }: GenericTableHeadCellProps) => css`
  ${{ ...genericTableCellStyles }}

  box-shadow: 0 1px ${theme.colors.surface.secondary},
    inset 0 1px ${theme.colors.surface.secondary};
  color: ${theme.colors.text.primary.primary};
  font-family: ${theme.fontFamilies.display};
  top: 0;
  transition-duration: 250ms;
  transition-property: background-color;

  ${stickyHeader &&
  `
    background-color: ${theme.colors.surface.primary};
    position: sticky;
    z-index: 10;
  `};

  &:hover {
    ${sortByKey &&
    sortable &&
    `
      background-color: ${theme.colors.surface.secondary};
      cursor: pointer;
    `};
  }
`

export const tableHeadCellStyles = ({
  align,
  customWidth,
  sortable,
  sortByKey,
  stickyHeader,
}: TableHeadCellProps) => css`
  ${{ ...genericTableHeadCellStyles({ sortable, sortByKey, stickyHeader }) }}

  min-width: ${customWidth || 'auto'};
  text-align: ${align || 'left'};
  width: ${customWidth || 'auto'};

  div {
    align-items: center;
    display: flex;
    flex-direction: ${align === 'right' ? 'row-reverse' : 'row'};
    justify-content: ${align === 'center' ? 'center' : 'space-between'};
  }
`

export const tableHeadCellCheckboxStyles = ({ stickyHeader }: TableHeadCellCheckboxProps) => css`
  ${{ ...genericTableHeadCellStyles({ sortable: undefined, sortByKey: undefined, stickyHeader }) }}

  max-width: 40px;
  width: 40px;

  ${stickyHeader &&
  `
    background-color: ${theme.colors.surface.primary};
    position: sticky;
    z-index: 10;
  `};
`

export const chevronStyles = ({ descending, show }: ChevronProps) => css`
  color: ${theme.colors.primary.dark};
  font-size: 1.5rem;
  opacity: ${show === 'true' ? '1' : '0'};
  transform: ${descending === 'true' && 'rotate(180deg)'};
  transition-duration: 250ms;
  transition-property: opacity, transform;
`
