import { Search } from '@dfds-ui/icons/system'
import React, { Fragment } from 'react'
import TextField from './TextField'
import { Button } from '@/components/dfds-ui/react-components'
import { css } from '@emotion/react'

export const BasicTextField = () => {
  return (
    <TextField
      name="basic"
      label="Field label"
      prefix="Test"
      placeholder="Hint text"
      icon={Search}
      help="I need some more help"
    />
  )
}

export const ExamplesTextField = () => {
  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        gap: 1rem;
      `}
    >
      <TextField name="example1" label="With prefix" placeholder="Hint text" prefix="Prefix" />
      <TextField name="example2" label="With suffix" placeholder="Hint text" suffix="Suffix" />
      <TextField name="example3" label="With icon" placeholder="Hint text" icon={Search} />
      <TextField name="example4" label="With prefix and icon" placeholder="Hint text" prefix="Prefix" icon={Search} />
      <TextField name="example5" label="With assistive text" placeholder="Hint text" assistiveText="Additional text" />
      <TextField name="example6" label="Without autoComplete" autoComplete="off" />
      <TextField name="example7" label="Required" placeholder="This field is required" required />
      <TextField name="example8" help="Some help text" label="Disabled" placeholder="Hint text" disabled />
      <TextField name="example9" label="Read only" placeholder="Hint text" readOnly />
      <TextField
        required
        name="example10"
        label="With help top (experimental)"
        placeholder="Hint text"
        help="Additional help text"
      />
      <TextField
        name="example11"
        label="With help right (experimental)"
        placeholder="Hint text"
        help="Additional help text"
        helpPlacement="right"
      />
    </div>
  )
}

export const SizesTextField = () => {
  return (
    <Fragment>
      <TextField name="example1" visualSize="small" label="Small TextField" placeholder="Hint text" icon={Search} />
      <TextField name="example2" visualSize="medium" label="Medium TextField" placeholder="Hint text" icon={Search} />
      <TextField name="example3" visualSize="large" label="Large TextField" placeholder="Hint text" icon={Search} />
    </Fragment>
  )
}

export const ErrorMessageTextField = () => {
  return <TextField name="error" label="Field label" errorMessage="Value required" />
}

export const AdornmentTextField = () => {
  return (
    <TextField
      name="error"
      label="With adornment"
      placeholder="Search and go..."
      adornment={
        <Button
          css={css`
            height: 40px;
            margin-left: 4px;
          `}
        >
          GO
        </Button>
      }
    />
  )
}

export const InputTypeTextField = () => {
  return (
    <Fragment>
      <TextField name="date" label="With date type" inputType="date" />
      <TextField name="time" label="With time type" inputType="time" />
      <TextField name="number" label="With number type" inputType="number" />
      <TextField name="file" label="With file type" inputType="file" />
    </Fragment>
  )
}
