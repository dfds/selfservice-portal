import React, { Fragment } from 'react'
import { AsyncSelectField } from './AsyncSelectField'

// eslint-disable-next-line no-console
const noWarnLog = (...args: any[]) => console.log(...args)

export const BasicAsyncSelectField = () => {
  return (
    <AsyncSelectField
      name="asyncSelectField"
      label="Basic field"
      isClearable
      defaultOptions={[
        { value: '1', label: 'One' },
        { value: '2', label: 'Two' },
      ]}
      onChange={(e) => noWarnLog('Change', e)}
      onBlur={(e) => noWarnLog('Blur', e.target.value)}
    />
  )
}

export const DisabledAsyncSelectField = () => {
  return (
    <AsyncSelectField
      name="asyncSelectField"
      label="Disabled field"
      disabled
      defaultOptions={[
        { value: '1', label: 'One' },
        { value: '2', label: 'Two' },
      ]}
      onChange={(e) => noWarnLog('Change', e)}
      onBlur={(e) => noWarnLog('Blur', e.target.value)}
    />
  )
}

export const LabelAsyncSelectField = () => {
  return (
    <Fragment>
      <AsyncSelectField
        name="asyncSelectField"
        label="Basic field"
        defaultOptions={[
          { value: '1', label: 'One' },
          { value: '2', label: 'Two' },
        ]}
      />
      <AsyncSelectField
        name="asyncSelectField"
        label="Assistive text field"
        required
        assistiveText="Additional text"
        defaultOptions={[
          { value: '1', label: 'One' },
          { value: '2', label: 'Two' },
        ]}
      />
      <AsyncSelectField
        name="asyncSelectField"
        label="Required field"
        required
        errorMessage="Required field"
        defaultOptions={[
          { value: '1', label: 'One' },
          { value: '2', label: 'Two' },
        ]}
      />
    </Fragment>
  )
}

export const SizesAsyncSelectField = () => {
  return (
    <Fragment>
      <AsyncSelectField
        name="asyncSelectField"
        label="Small field"
        visualSize="small"
        defaultOptions={[
          { value: '1', label: 'One' },
          { value: '2', label: 'Two' },
        ]}
      />
      <AsyncSelectField
        name="asyncSelectField"
        label="Medium field"
        visualSize="medium"
        defaultOptions={[
          { value: '1', label: 'One' },
          { value: '2', label: 'Two' },
        ]}
      />
      <AsyncSelectField
        name="asyncSelectField"
        label="Large field"
        visualSize="large"
        defaultOptions={[
          { value: '1', label: 'One' },
          { value: '2', label: 'Two' },
        ]}
      />
    </Fragment>
  )
}

export const AssistiveAsyncSelectField = () => {
  return (
    <AsyncSelectField
      name="asyncSelectField"
      label="Assistive text field"
      required
      assistiveText="Additional text"
      defaultOptions={[
        { value: '1', label: 'One' },
        { value: '2', label: 'Two' },
      ]}
    />
  )
}

export const HelpAsyncSelectField = () => {
  return (
    <AsyncSelectField
      name="asyncSelectField"
      label="Help field"
      help="Some help text"
      defaultOptions={[
        { value: '1', label: 'One' },
        { value: '2', label: 'Two' },
      ]}
    />
  )
}

export const ClearableAsyncSelectField = () => {
  return (
    <AsyncSelectField
      name="asyncSelectField"
      label="Clearable field"
      isClearable
      defaultOptions={[
        { value: '1', label: 'One' },
        { value: '2', label: 'Two' },
      ]}
      onChange={(e) => noWarnLog('Change', e)}
      onBlur={(e) => noWarnLog('Blur', e.target.value)}
    />
  )
}
