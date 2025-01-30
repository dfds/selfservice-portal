import React from 'react'
import { render } from '@testing-library/react'
import SiteLayout from '../SiteLayout'

describe('<SiteLayout />', () => {
  it('should render without errors', () => {
    render(
      <SiteLayout.Grid>
        <SiteLayout.Header>Header</SiteLayout.Header>
        <SiteLayout.Main>Main</SiteLayout.Main>
        <SiteLayout.Footer>Footer</SiteLayout.Footer>
      </SiteLayout.Grid>
    )
  })
})
