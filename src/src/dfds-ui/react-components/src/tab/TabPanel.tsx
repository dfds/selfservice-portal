import React from 'react'
import styled from '@emotion/styled'
import useTabsContext from './TabsContext'

type TabPanelProps = {
  index: number | string
  children: React.ReactNode
}

const StyledTabPanel = styled.div<{ active: boolean }>`
  display: ${(p) => (p.active ? 'block' : 'none')};
`

const TabPanel: React.FC<TabPanelProps> = ({ index, children }) => {
  const { activeTab } = useTabsContext()

  return <StyledTabPanel active={index === activeTab}>{children}</StyledTabPanel>
}

export default TabPanel
