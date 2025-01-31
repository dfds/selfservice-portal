import React, { ComponentPropsWithRef, forwardRef, ReactNode } from 'react'

export type TableBodyProps = {
  /**
   * Table body content
   */
  children: ReactNode
} & ComponentPropsWithRef<'tbody'>

export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ children, ...rest }: TableBodyProps, ref) => {
    return (
      <tbody {...rest} ref={ref}>
        {children}
      </tbody>
    )
  }
)

export default TableBody
