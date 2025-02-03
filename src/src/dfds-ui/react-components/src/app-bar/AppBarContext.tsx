import * as React from 'react'

type AppBarState = {
  drawerOpen: boolean
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>
  height: number
  setHeight: React.Dispatch<React.SetStateAction<number>>
}

const AppBarContext = React.createContext<AppBarState | undefined>(undefined)

export const AppBarProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [height, setHeight] = React.useState(0)
  return (
    <AppBarContext.Provider value={{ drawerOpen, setDrawerOpen, height, setHeight }}>{children}</AppBarContext.Provider>
  )
}

export const useAppBarContext = () => {
  const context = React.useContext(AppBarContext)
  if (context === undefined) {
    throw new Error('useAppBarContext must be used within a AppBarProvider')
  }
  return context
}
