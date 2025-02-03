import React, { createContext, useContext } from 'react'

type DropdownSize = 'medium' | 'small'

type DropdownContextProps = {
  size?: DropdownSize
  multiselect?: boolean
}

export const DropdownContext = createContext<DropdownContextProps>({
  size: 'small',
  multiselect: true,
})

export const DropdownContextProvider: React.FC<{ value: DropdownContextProps; children?: React.ReactNode }> = ({
  children,
  value,
}) => {
  return <DropdownContext.Provider value={value}>{children}</DropdownContext.Provider>
}

const useDropdownContext = () => {
  const context = useContext(DropdownContext)

  if (context === undefined) {
    throw new Error('useDropdownContext must be used within Dropdown component.')
  }

  return context
}

export default useDropdownContext
