import React from 'react'
import { render } from '@testing-library/react'
import DataTable from '../DataTable'

describe('<Table />', () => {
  it('should render without errors', () => {
    const tableData = [
      {
        column1: 'column 1',
        column2: 'column 2',
      },
    ]
    render(<DataTable data={tableData} />)
  })
})
