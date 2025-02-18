import React from 'react'
import { render } from '@testing-library/react'
import Pagination from '../Pagination'

describe('<Pagination />', () => {
  it('should render without errors', () => {
    render(<Pagination pageLimit={15} totalRecords={30} />)
  })
})
