import React, { createContext, ReactNode, useContext } from 'react'
import { Index } from './Tab'

export type TabsContextProps = {
  transparent?: boolean
  onChange?: (index: any) => void
  size?: 's' | 'm'
  activeTab?: Index | undefined
  children?: React.ReactNode
}

export const TabsContext = createContext<TabsContextProps>({
  transparent: false,
  activeTab: undefined,
  size: 'm',
})

export const TabsContextProvider: React.FC<{ value: TabsContextProps; children?: ReactNode }> = ({
  children,
  value,
}) => {
  return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>
}

export const useTabsContext = () => {
  const context = useContext(TabsContext)
  if (context === undefined) {
    throw new Error('useTabsContext must be used within a AppBarProvider')
  }
  return context
}

export default useTabsContext
