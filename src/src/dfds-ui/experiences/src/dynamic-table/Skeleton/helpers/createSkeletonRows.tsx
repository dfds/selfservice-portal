import React from 'react'
import { Skeleton } from '@/dfds-ui/react-components/src'
import { css } from '@emotion/react'

import { Header, Row } from '../../DynamicTable.types'

const createSkeletonRows = (headerRow: Header[] | undefined) =>
  [...Array(7)].map(() => {
    const row: Row = {}

    headerRow?.forEach((cell) => {
      row[cell.key] = (
        <Skeleton
          css={css`
            height: 12px;
            width: 100%;
            text-align: left;
          `}
          variant="text"
        />
      )
    })

    return row
  })

export default createSkeletonRows
