import React, { createContext, useContext } from 'react'
import { CheckboxProps } from './Checkbox'

type CheckboxContextProps = {
  children?: React.ReactNode
  visualSize: NonNullable<CheckboxProps['visualSize']>
  error: CheckboxProps['error']
}

export const CheckboxContext = createContext<CheckboxContextProps | undefined>(undefined)

export const CheckboxContextProvider: React.FC<{ value: CheckboxContextProps }> = ({
  children,
  value = { visualSize: 'medium', error: false },
}) => {
  return <CheckboxContext.Provider value={value}>{children}</CheckboxContext.Provider>
}

const useCheckboxContext = () => {
  const context = useContext(CheckboxContext)
  return context
}

export default useCheckboxContext
