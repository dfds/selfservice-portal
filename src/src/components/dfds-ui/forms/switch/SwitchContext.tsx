import React, { createContext, useContext } from 'react'
import { SwitchProps } from './Switch'

type SwitchContextProps = Required<Pick<SwitchProps, 'size' | 'error'>> & {
  children?: React.ReactNode
}

export const SwitchContext = createContext<SwitchContextProps | undefined>(undefined)

export const SwitchContextProvider: React.FC<{ value: SwitchContextProps }> = ({
  children,
  value = { size: 'medium', error: false },
}) => {
  return <SwitchContext.Provider value={value}>{children}</SwitchContext.Provider>
}

const useSwitchContext = () => {
  const context = useContext(SwitchContext)
  return context
}

export default useSwitchContext
