import React, { createContext, useContext } from 'react'
import { RadioProps } from './Radio'

type RadioContextProps = {
  children?: React.ReactNode
  visualSize: NonNullable<RadioProps['visualSize']>
  error: RadioProps['error']
}

export const RadioContext = createContext<RadioContextProps | undefined>(undefined)

export const RadioContextProvider: React.FC<{ value: RadioContextProps }> = ({
  children,
  value = { visualSize: 'medium', error: false },
}) => {
  return <RadioContext.Provider value={value}>{children}</RadioContext.Provider>
}

const useRadioContext = () => {
  const context = useContext(RadioContext)
  return context
}

export default useRadioContext
