import React, { Fragment } from 'react'
import { SelectField } from './SelectField'
import { useForm, Controller } from 'react-hook-form'
import { Button } from '@/dfds-ui/react-components/src'

// eslint-disable-next-line no-console
const noWarnLog = (...args: any[]) => console.log(...args)

export const DisabledSelectField = () => {
  return (
    <SelectField
      disabled
      name="select"
      label="Disabled field"
      assistiveText="Additional text"
      help="Some help text"
      options={[
        { value: '1', label: 'One' },
        { value: '2', label: 'Two' },
        { value: '3', label: 'Three' },
      ]}
      onChange={(e) => noWarnLog('Change', e)}
      onBlur={(e) => noWarnLog('Blur', e)}
      suffix="Suffix"
    />
  )
}

export const BasicSelectField = () => {
  return (
    <SelectField
      name="select"
      label="Basic field"
      options={[
        { value: '1', label: 'One' },
        { value: '2', label: 'Two' },
        { value: '3', label: 'Three' },
      ]}
      onChange={(e) => noWarnLog('Change', e)}
      onBlur={(e) => noWarnLog('Blur', e)}
    />
  )
}

export const MultiSelectField = () => {
  return (
    <SelectField
      isMulti
      name="select"
      label="Basic field"
      options={[
        { value: '1', label: 'One' },
        { value: '2', label: 'Two' },
        { value: '3', label: 'Three' },
        { value: '4', label: 'Four' },
        { value: '5', label: 'Five' },
        { value: '6', label: 'Six' },
        { value: '7', label: 'Seven' },
        { value: '8', label: 'Eight' },
        { value: '9', label: 'Nine' },
      ]}
      onChange={(e) => noWarnLog('Change', e)}
      onBlur={(e) => noWarnLog('Blur', e)}
    />
  )
}

export const LabelSelectField = () => {
  return (
    <Fragment>
      <SelectField
        name="select"
        label="Select field"
        options={[
          { value: '1', label: 'One' },
          { value: '2', label: 'Two' },
          { value: '3', label: 'Three' },
        ]}
      />
      <SelectField
        name="select"
        label="Select field"
        visualSize="medium"
        required
        assistiveText="Additional text"
        options={[
          { value: '1', label: 'One' },
          { value: '2', label: 'Two' },
          { value: '3', label: 'Three' },
        ]}
      />
      <SelectField
        name="select"
        label="Select field"
        visualSize="medium"
        required
        errorMessage="Required field"
        options={[
          { value: '1', label: 'One' },
          { value: '2', label: 'Two' },
          { value: '3', label: 'Three' },
        ]}
      />
    </Fragment>
  )
}

export const SizesSelectField = () => {
  return (
    <Fragment>
      <SelectField
        name="select"
        label="Small"
        visualSize="small"
        options={[
          { value: '1', label: 'One' },
          { value: '2', label: 'Two' },
          { value: '3', label: 'Three' },
        ]}
      />
      <SelectField
        name="select"
        label="Medium"
        visualSize="medium"
        options={[
          { value: '1', label: 'One' },
          { value: '2', label: 'Two' },
          { value: '3', label: 'Three' },
        ]}
      />
      <SelectField
        name="select"
        label="Large"
        visualSize="large"
        options={[
          { value: '1', label: 'One' },
          { value: '2', label: 'Two' },
          { value: '3', label: 'Three' },
        ]}
      />
    </Fragment>
  )
}

export const AssistiveTextSelectField = () => {
  return (
    <Fragment>
      <SelectField
        name="select"
        label="Label"
        visualSize="medium"
        assistiveText="Some text"
        options={[
          { value: '1', label: 'One' },
          { value: '2', label: 'Two' },
          { value: '3', label: 'Three' },
        ]}
      />
    </Fragment>
  )
}

export const ErrorMessageSelectField = () => {
  return (
    <Fragment>
      <SelectField
        name="select"
        label="Label"
        visualSize="medium"
        errorMessage="Some text"
        options={[
          { value: '1', label: 'One' },
          { value: '2', label: 'Two' },
          { value: '3', label: 'Three' },
        ]}
      />
    </Fragment>
  )
}

export const HelpSelectField = () => {
  return (
    <Fragment>
      <SelectField
        name="select"
        help="Some help text."
        label="Label"
        visualSize="medium"
        options={[
          { value: '1', label: 'One' },
          { value: '2', label: 'Two' },
          { value: '3', label: 'Three' },
        ]}
      />
    </Fragment>
  )
}

export const ClearableSelectField = () => {
  return (
    <Fragment>
      <SelectField
        name="select"
        label="Label"
        visualSize="medium"
        isClearable
        options={[
          { value: '1', label: 'One' },
          { value: '2', label: 'Two' },
          { value: '3', label: 'Three' },
        ]}
      />
    </Fragment>
  )
}

export const PrefixSuffixSelectField = () => {
  return (
    <Fragment>
      <SelectField
        name="select"
        label="Label"
        visualSize="medium"
        options={[
          { value: '1', label: 'One' },
          { value: '2', label: 'Two' },
          { value: '3', label: 'Three' },
        ]}
        prefix="Prefix"
        suffix="Suffix"
      />
    </Fragment>
  )
}

export const DefaultValueSelectField = () => {
  type Option = { value: string; label: string }
  const options: Option[] = [
    { value: '1', label: 'One' },
    { value: '2', label: 'Two' },
    { value: '3', label: 'Three' },
  ]
  return (
    <SelectField
      name="select"
      defaultValue={options[1]}
      label="Basic field"
      options={options}
      onChange={(e) => noWarnLog('Change', e)}
      onBlur={(e) => noWarnLog('Blur', e)}
    />
  )
}

export const ReactHookFormSelectField = () => {
  const form = useForm({ mode: 'onChange' })
  const addValue = () => {
    form.setValue('gender', { value: '0', label: 'Female' })
  }
  return (
    <div>
      <Button onClick={addValue}>Set value</Button>
      <Controller
        name="gender"
        control={form.control}
        render={({ field }) => {
          return (
            <SelectField
              label="Gender"
              options={[
                { value: '0', label: 'Female' },
                { value: '1', label: 'Male' },
              ]}
              {...field}
            />
          )
        }}
      />
    </div>
  )
}

export const DisableSearchSelectField = () => {
  return (
    <SelectField
      name="select"
      label="Basic field"
      isSearchable={false}
      options={[
        { value: '1', label: 'One' },
        { value: '2', label: 'Two' },
        { value: '3', label: 'Three' },
      ]}
      onChange={(e) => noWarnLog('Change', e)}
      onBlur={(e) => noWarnLog('Blur', e)}
    />
  )
}

export const MatchFromStartSelectField = () => {
  return (
    <SelectField
      name="select"
      label="matchFrom start, accent sensitive"
      filterConfig={{
        ignoreAccents: false,
        matchFrom: 'start',
      }}
      options={[
        { value: 'denmark', label: 'Denmark' },
        { value: 'equador', label: 'Equador' },
        { value: 'moldovia', label: 'Moldovia' },
        { value: 'são tomé and príncipe', label: 'São Tomé and Príncipe' },
        { value: 'south africa', label: 'South Africa' },
        { value: 'sweden', label: 'Sweden' },
      ]}
    />
  )
}

export const MatchFromAnySelectField = () => {
  return (
    <SelectField
      name="select"
      label="matchFrom start, accent sensitive"
      filterConfig={{
        ignoreAccents: false,
        matchFrom: 'start',
      }}
      options={[
        { value: 'denmark', label: 'Denmark' },
        { value: 'equador', label: 'Equador' },
        { value: 'moldovia', label: 'Moldovia' },
        { value: 'são tomé and príncipe', label: 'São Tomé and Príncipe' },
        { value: 'south africa', label: 'South Africa' },
        { value: 'sweden', label: 'Sweden' },
      ]}
    />
  )
}

export const CustomOptionSelectField = () => {
  return (
    <SelectField
      components={{
        Option: ({ innerRef, ...rest }: { [x: string]: any }) => {
          const { data } = rest
          return (
            <div style={{ padding: '1rem ' }} ref={innerRef} {...rest}>
              <div>{data.label}</div>
              <div>{data.description}</div>
            </div>
          )
        },
      }}
      name="select"
      label="Option with both label and description"
      options={[
        { value: 'denmark', label: 'Denmark', description: 'Custom prop' },
        { value: 'equador', label: 'Equador', description: 'Custom prop' },
        { value: 'moldovia', label: 'Moldovia', description: 'Custom prop' },
        { value: 'são tomé and príncipe', label: 'São Tomé and Príncipe', description: 'Custom prop' },
        { value: 'south africa', label: 'South Africa', description: 'Custom prop' },
        { value: 'sweden', label: 'Sweden', description: 'Custom prop' },
      ]}
    />
  )
}
