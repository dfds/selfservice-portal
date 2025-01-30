import React, { ComponentPropsWithRef, createContext, forwardRef, ReactNode, useContext } from 'react'
import { css } from '@emotion/react'
import { theme } from '@dfds-ui/theme'

export type TableProps = {
  /**
   * Table content
   */
  children?: ReactNode

  /**
   * Enables interaction effect on table rows
   */
  isInteractive?: boolean

  /**
   * Makes table header sticky when scrolling (no IE 11 support)
   */
  isHeaderSticky?: boolean
} & ComponentPropsWithRef<'table'>

export type TableContextProps = {
  isInteractive: boolean
  isHeaderSticky: boolean
}

const TableContext = createContext<TableContextProps>({
  isInteractive: false,
  isHeaderSticky: false,
})

export const useTable = () => {
  const context = useContext(TableContext)

  if (context === undefined) {
    throw new Error('TableContext must be used inside of a TableContext provider')
  }

  return context
}

const tableStyle = css`
  background: ${theme.colors.surface.primary};
  position: relative;
`

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ children, isHeaderSticky = false, isInteractive = false, ...rest }: TableProps, ref) => {
    return (
      <table css={tableStyle} {...rest} ref={ref}>
        <TableContext.Provider value={{ isInteractive, isHeaderSticky }}>{children}</TableContext.Provider>
      </table>
    )
  }
)

export default Table
