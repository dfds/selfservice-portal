import React, { Fragment } from 'react'
import NativeSelectField from './NativeSelectField'

export const BasicNativeSelectField = () => {
  return (
    <NativeSelectField name="basic" label="Field label">
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </NativeSelectField>
  )
}

export const SizesNativeSelectField = () => {
  return (
    <Fragment>
      <NativeSelectField name="example1" visualSize="small" label="Small SelectField" placeholder="Hint text">
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
        <option value="3">Option 3</option>
      </NativeSelectField>
      <NativeSelectField name="example2" visualSize="medium" label="Medium SelectField" placeholder="Hint text">
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
        <option value="3">Option 3</option>
      </NativeSelectField>
      <NativeSelectField name="example3" visualSize="large" label="Large SelectField" placeholder="Hint text">
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
        <option value="3">Option 3</option>
      </NativeSelectField>
    </Fragment>
  )
}
