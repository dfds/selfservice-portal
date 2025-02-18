import React, { forwardRef, ComponentPropsWithRef, ReactNode } from 'react'
import classNames from 'classnames'
import { css } from '@emotion/react'
import { useTable } from './Table'

export type TableRowProps = {
  /**
   * Table row content
   */
  children: ReactNode

  /**
   * Classes applied on the tr tag
   */
  className?: string

  /**
   * Applies Selected state styling to the row
   */
  isSelected?: boolean
} & ComponentPropsWithRef<'tr'>

const ClassName = {
  IS_INTERACTIVE: 'is-interactive',
  IS_SELECTED: 'is-selected',
}

const tableRowStyle = css`
  height: 2.75rem;

  &.${ClassName.IS_INTERACTIVE} {
    &:hover td {
      background: rgba(73, 162, 223, 0.08);
      cursor: pointer;
    }

    &:active td {
      background: rgba(73, 162, 223, 0.16);
    }

    &:focus td {
      background: rgba(73, 162, 223, 0.16);
      outline: none;
    }

    &.${ClassName.IS_SELECTED} td {
      background: rgba(73, 162, 223, 0.12);
    }
  }
`

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ children, className, isSelected = false, ...rest }: TableRowProps, ref) => {
    const { isInteractive } = useTable()

    return (
      <tr
        className={classNames(className, {
          [ClassName.IS_SELECTED]: isSelected,
          [ClassName.IS_INTERACTIVE]: isInteractive,
        })}
        css={tableRowStyle}
        {...rest}
        ref={ref}
      >
        {children}
      </tr>
    )
  }
)

export default TableRow
