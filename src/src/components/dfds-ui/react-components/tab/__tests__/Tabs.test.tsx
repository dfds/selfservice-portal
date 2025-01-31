import React from 'react'

import { render } from '@testing-library/react'
import Tab from '../Tab'
import Tabs from '../Tabs'
import { TabsContextProvider } from '../TabsContext'

declare global {
  interface Window {
    ResizeObserver: any
  }
}

window.ResizeObserver = jest.fn(function (this: any) {
  this.observe = jest.fn()
})

describe('<Tabs />', () => {
  it('should render without errors', () => {
    render(
      <TabsContextProvider
        value={{
          onChange: () => {
            return ''
          },
        }}
      >
        <Tabs>
          <Tab index={0}>Tab one</Tab>
        </Tabs>
      </TabsContextProvider>
    )
  })
})
