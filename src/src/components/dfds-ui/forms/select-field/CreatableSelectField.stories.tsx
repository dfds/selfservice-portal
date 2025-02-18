import React from 'react'
import { CreatableSelectField } from './CreatableSelectField'

// eslint-disable-next-line no-console
const noWarnLog = (...args: any[]) => console.log(...args)

export const BasicCreatableSelectField = () => {
  return (
    <CreatableSelectField
      label="Basic field"
      name="select"
      onBlur={(e) => noWarnLog('Blur', e)}
      onChange={(e) => noWarnLog('Change', e)}
      options={[
        { value: '1', label: 'One' },
        { value: '2', label: 'Two' },
        { value: '3', label: 'Three' },
      ]}
    />
  )
}

export const CustomLabelCreatableSelectField = () => {
  return (
    <CreatableSelectField
      formatCreateLabel={(inputValue: string) => `Custom create label: ${inputValue}`}
      label="Custom create label field"
      name="select"
      onBlur={(e) => noWarnLog('Blur', e)}
      onChange={(e) => noWarnLog('Change', e)}
      onCreateOption={(e) => noWarnLog('Create', e)}
      options={[
        { value: '1', label: 'One' },
        { value: '2', label: 'Two' },
        { value: '3', label: 'Three' },
      ]}
    />
  )
}
