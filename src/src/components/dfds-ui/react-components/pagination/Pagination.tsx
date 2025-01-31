import React from 'react'
import { useBreakpoint } from '@/components/dfds-ui/theme'
import { Text } from '@/components/dfds-ui/typography'
import ReactSelect from '../forms/reactselect/ReactSelect'
import {
  PageLimitStyles,
  PageLimitWrapperStyles,
  PageOverviewStyles,
  paginationItemStyles,
  TextStyles,
  wrapperStyles,
} from './Pagination.styles'
import { Pagination as MaterialPagination, PaginationItem as MaterialPaginationItem } from '@mui/material'
import { css } from '@emotion/react'

type Option = {
  disabled?: boolean
  label: string
  value: number
}

export type PaginationProps = {
  /**
   * The current page.
   */
  currentPage?: number
  /**
   * The current offset
   */
  offset?: number
  /**
   * Callback when the page is changed.
   */
  onChangePageLimit?: (e: any) => void
  /**
   * Callback when the page is changed.
   */
  onPageChange?: (event: React.ChangeEvent<unknown>, page: number) => void
  /**
   * Options passed to the PageLimitSelector
   */
  options?: Option[] | null
  /**
   * Number of records per page.
   */
  pageLimit: number
  /**
   * Total number of records.
   */
  totalRecords: number
  /**
   * Returns the content of the overview.
   *
   * Use this if you need to localize the overview being rendered.
   */
  renderOverview?: (rangeShown: string, totalRecords: number) => React.ReactNode
}

const defaultOverview = (rangeShown: string, totalRecords: number) => `Showing ${rangeShown} of ${totalRecords}`

const PaginationItem = ({ ...item }) => {
  return <MaterialPaginationItem css={paginationItemStyles} {...item} />
}

export const Pagination = ({
  currentPage,
  offset = 0,
  onChangePageLimit,
  onPageChange,
  options = null,
  pageLimit,
  totalRecords = 1,
  renderOverview = defaultOverview,
}: PaginationProps) => {
  const { greaterThan } = useBreakpoint()
  const totalPages = Math.ceil(totalRecords / pageLimit)
  const rangeShown =
    totalRecords === 1
      ? String(totalRecords)
      : `${totalRecords === 0 ? totalRecords : offset + 1}-${
          pageLimit + offset > totalRecords ? totalRecords : pageLimit + offset
        }`

  const currentPageLimit = () => {
    const option = options?.find((option: Option) => {
      return option.value === pageLimit
    })
    return option
  }

  const PageLimitSelector = (
    <ReactSelect
      onChange={onChangePageLimit}
      options={options}
      size="small"
      value={currentPageLimit()}
      css={PageLimitStyles}
      menuPlacement="auto"
    />
  )

  return (
    <>
      {greaterThan('l') ? (
        <>
          <div css={wrapperStyles}>
            <Text css={PageOverviewStyles} styledAs="bodyInterface">
              {renderOverview(rangeShown, totalRecords)}
            </Text>
            <MaterialPagination
              count={totalPages}
              onChange={onPageChange}
              page={currentPage}
              renderItem={PaginationItem}
              showFirstButton
              showLastButton
              size="large"
            />
            <div css={PageLimitWrapperStyles}>{PageLimitSelector}</div>
          </div>
        </>
      ) : (
        <>
          <div
            css={css`
              align-items: center;
              display: flex;
              justify-content: space-between;
              width: 100%;
            `}
          >
            <Text css={TextStyles} styledAs="bodyInterfaceSmall">
              {renderOverview(rangeShown, totalRecords)}
            </Text>
            {PageLimitSelector}
          </div>
          <div
            css={css`
              display: flex;
              justify-content: center;
              width: 100%;
            `}
          >
            <MaterialPagination
              boundaryCount={1}
              count={totalPages}
              onChange={onPageChange}
              page={currentPage}
              renderItem={PaginationItem}
              siblingCount={0}
              size="large"
            />
          </div>
        </>
      )}
    </>
  )
}

export default Pagination
