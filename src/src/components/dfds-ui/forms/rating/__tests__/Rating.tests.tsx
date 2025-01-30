import React from 'react'
import { render } from '@testing-library/react'
import { RatingField } from '../Rating'

describe('<RatingField/>', () => {
  it('should render without errors', () => {
    render(<RatingField name="test1" rangeCardinality={5} size="medium" />)
  })
  it('should render the given number of selectors', () => {
    const nSelectors = 10
    const { getAllByRole } = render(<RatingField name="test2" rangeCardinality={nSelectors} size="medium" />)
    const rs = getAllByRole('radio')
    expect(rs.length).toBe(nSelectors)
  })
})
