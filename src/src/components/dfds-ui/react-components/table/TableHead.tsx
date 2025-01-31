import React, { ComponentPropsWithRef, forwardRef, ReactNode } from 'react'
import classNames from 'classnames'
import { useTable } from './Table'
import { css } from '@emotion/react'

export type TableHeadProps = {
  /**
   * Table header content
   */
  children: ReactNode

  /**
   * Classes applied on the thead tag
   */
  className?: string
} & ComponentPropsWithRef<'thead'>

const ClassName = {
  IS_STICKY: 'is-sticky',
}

export const tableHeadStyle = css`
  &.${ClassName.IS_STICKY} th {
    position: sticky;
    top: 0;
  }
`

export const TableHead = forwardRef<HTMLTableSectionElement, TableHeadProps>(
  ({ children, className, ...rest }: TableHeadProps, ref) => {
    const { isHeaderSticky } = useTable()

    return (
      <thead
        className={classNames(className, {
          [ClassName.IS_STICKY]: isHeaderSticky,
        })}
        css={tableHeadStyle}
        {...rest}
        ref={ref}
      >
        {children}
      </thead>
    )
  }
)

export default TableHead
