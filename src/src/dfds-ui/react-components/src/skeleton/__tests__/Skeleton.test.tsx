import React from 'react'
import { render } from '@testing-library/react'
import Skeleton from '../Skeleton'
import { css } from '@emotion/react'

describe('<Skeleton />', () => {
  it('should render without errors', () => {
    render(
      <Skeleton
        variant="text"
        css={css`
          width: 100%;
        `}
      />
    )
  })
})
